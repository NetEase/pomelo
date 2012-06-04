/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 */
WebInspector.ExtensionServer = function()
{
    this._clientObjects = {};
    this._handlers = {};
    this._subscribers = {};
    this._subscriptionStartHandlers = {};
    this._subscriptionStopHandlers = {};
    this._extraHeaders = {};
    this._requests = {};
    this._lastRequestId = 0;
    this._registeredExtensions = {};
    this._status = new WebInspector.ExtensionStatus();

    var commands = WebInspector.extensionAPI.Commands;

    this._registerHandler(commands.AddAuditCategory, this._onAddAuditCategory.bind(this));
    this._registerHandler(commands.AddAuditResult, this._onAddAuditResult.bind(this));
    this._registerHandler(commands.AddConsoleMessage, this._onAddConsoleMessage.bind(this));
    this._registerHandler(commands.AddRequestHeaders, this._onAddRequestHeaders.bind(this));
    this._registerHandler(commands.CreatePanel, this._onCreatePanel.bind(this));
    this._registerHandler(commands.CreateSidebarPane, this._onCreateSidebarPane.bind(this));
    this._registerHandler(commands.CreateStatusBarButton, this._onCreateStatusBarButton.bind(this));
    this._registerHandler(commands.EvaluateOnInspectedPage, this._onEvaluateOnInspectedPage.bind(this));
    this._registerHandler(commands.GetHAR, this._onGetHAR.bind(this));
    this._registerHandler(commands.GetConsoleMessages, this._onGetConsoleMessages.bind(this));
    this._registerHandler(commands.GetPageResources, this._onGetPageResources.bind(this));
    this._registerHandler(commands.GetRequestContent, this._onGetRequestContent.bind(this));
    this._registerHandler(commands.GetResourceContent, this._onGetResourceContent.bind(this));
    this._registerHandler(commands.Log, this._onLog.bind(this));
    this._registerHandler(commands.Reload, this._onReload.bind(this));
    this._registerHandler(commands.SetOpenResourceHandler, this._onSetOpenResourceHandler.bind(this));
    this._registerHandler(commands.SetResourceContent, this._onSetResourceContent.bind(this));
    this._registerHandler(commands.SetSidebarHeight, this._onSetSidebarHeight.bind(this));
    this._registerHandler(commands.SetSidebarContent, this._onSetSidebarContent.bind(this));
    this._registerHandler(commands.SetSidebarPage, this._onSetSidebarPage.bind(this));
    this._registerHandler(commands.StopAuditCategoryRun, this._onStopAuditCategoryRun.bind(this));
    this._registerHandler(commands.Subscribe, this._onSubscribe.bind(this));
    this._registerHandler(commands.Unsubscribe, this._onUnsubscribe.bind(this));
    this._registerHandler(commands.UpdateButton, this._onUpdateButton.bind(this));

    window.addEventListener("message", this._onWindowMessage.bind(this), false);
}

WebInspector.ExtensionServer.prototype = {
    hasExtensions: function()
    {
        return !!Object.keys(this._registeredExtensions).length;
    },

    notifySearchAction: function(panelId, action, searchString)
    {
        this._postNotification(WebInspector.extensionAPI.Events.PanelSearch + panelId, action, searchString);
    },

    notifyViewShown: function(identifier, frameIndex)
    {
        this._postNotification(WebInspector.extensionAPI.Events.ViewShown + identifier, frameIndex);
    },

    notifyViewHidden: function(identifier)
    {
        this._postNotification(WebInspector.extensionAPI.Events.ViewHidden + identifier);
    },

    notifyButtonClicked: function(identifier)
    {
        this._postNotification(WebInspector.extensionAPI.Events.ButtonClicked + identifier);
    },

    _inspectedURLChanged: function(event)
    {
        this._requests = {};
        var url = event.data;
        this._postNotification(WebInspector.extensionAPI.Events.InspectedURLChanged, url);
    },

    _mainFrameNavigated: function(event)
    {
        this._postNotification(WebInspector.extensionAPI.Events.Reset);
    },

    startAuditRun: function(category, auditRun)
    {
        this._clientObjects[auditRun.id] = auditRun;
        this._postNotification("audit-started-" + category.id, auditRun.id);
    },

    stopAuditRun: function(auditRun)
    {
        delete this._clientObjects[auditRun.id];
    },

    /**
     * @param {...*} vararg
     */
    _postNotification: function(type, vararg)
    {
        var subscribers = this._subscribers[type];
        if (!subscribers)
            return;
        var message = {
            command: "notify-" + type,
            arguments: Array.prototype.slice.call(arguments, 1)
        };
        for (var i = 0; i < subscribers.length; ++i)
            subscribers[i].postMessage(message);
    },

    _onSubscribe: function(message, port)
    {
        var subscribers = this._subscribers[message.type];
        if (subscribers)
            subscribers.push(port);
        else {
            this._subscribers[message.type] = [ port ];
            if (this._subscriptionStartHandlers[message.type])
                this._subscriptionStartHandlers[message.type]();
        }
    },

    _onUnsubscribe: function(message, port)
    {
        var subscribers = this._subscribers[message.type];
        if (!subscribers)
            return;
        subscribers.remove(port);
        if (!subscribers.length) {
            delete this._subscribers[message.type];
            if (this._subscriptionStopHandlers[message.type])
                this._subscriptionStopHandlers[message.type]();
        }
    },

    _onAddRequestHeaders: function(message)
    {
        var id = message.extensionId;
        if (typeof id !== "string")
            return this._status.E_BADARGTYPE("extensionId", typeof id, "string");
        var extensionHeaders = this._extraHeaders[id];
        if (!extensionHeaders) {
            extensionHeaders = {};
            this._extraHeaders[id] = extensionHeaders;
        }
        for (var name in message.headers)
            extensionHeaders[name] = message.headers[name];
        var allHeaders = /** @type NetworkAgent.Headers */ {};
        for (var extension in this._extraHeaders) {
            var headers = this._extraHeaders[extension];
            for (name in headers) {
                if (typeof headers[name] === "string")
                    allHeaders[name] = headers[name];
            }
        }
        NetworkAgent.setExtraHTTPHeaders(allHeaders);
    },

    _onCreatePanel: function(message, port)
    {
        var id = message.id;
        // The ids are generated on the client API side and must be unique, so the check below
        // shouldn't be hit unless someone is bypassing the API.
        if (id in this._clientObjects || id in WebInspector.panels)
            return this._status.E_EXISTS(id);

        var page = this._expandResourcePath(port._extensionOrigin, message.page);
        var icon = this._expandResourcePath(port._extensionOrigin, message.icon)
        var panel = new WebInspector.ExtensionPanel(id, message.title, page, icon);
        this._clientObjects[id] = panel;
        WebInspector.panels[id] = panel;
        WebInspector.addPanel(panel);
        return this._status.OK();
    },

    _onCreateStatusBarButton: function(message, port)
    {
        var panel = this._clientObjects[message.panel];
        if (!panel || !(panel instanceof WebInspector.ExtensionPanel))
            return this._status.E_NOTFOUND(message.panel);
        var button = new WebInspector.ExtensionButton(message.id, this._expandResourcePath(port._extensionOrigin, message.icon), message.tooltip, message.disabled);
        this._clientObjects[message.id] = button;
        panel.addStatusBarItem(button.element);
        return this._status.OK();
    },

    _onUpdateButton: function(message, port)
    {
        var button = this._clientObjects[message.id];
        if (!button || !(button instanceof WebInspector.ExtensionButton))
            return this._status.E_NOTFOUND(message.id);
        button.update(this._expandResourcePath(port._extensionOrigin, message.icon), message.tooltip, message.disabled);
        return this._status.OK();
    },

    _onCreateSidebarPane: function(message)
    {
        var panel = WebInspector.panels[message.panel];
        if (!panel)
            return this._status.E_NOTFOUND(message.panel);
        if (!panel.sidebarElement || !panel.sidebarPanes)
            return this._status.E_NOTSUPPORTED();
        var id = message.id;
        var sidebar = new WebInspector.ExtensionSidebarPane(message.title, message.id);
        this._clientObjects[id] = sidebar;
        panel.sidebarPanes[id] = sidebar;
        panel.sidebarElement.appendChild(sidebar.element);

        return this._status.OK();
    },

    _onSetSidebarHeight: function(message)
    {
        var sidebar = this._clientObjects[message.id];
        if (!sidebar)
            return this._status.E_NOTFOUND(message.id);
        sidebar.setHeight(message.height);
        return this._status.OK();
    },

    _onSetSidebarContent: function(message, port)
    {
        var sidebar = this._clientObjects[message.id];
        if (!sidebar)
            return this._status.E_NOTFOUND(message.id);
        function callback(error)
        {
            var result = error ? this._status.E_FAILED(error) : this._status.OK();
            this._dispatchCallback(message.requestId, port, result);
        }
        if (message.evaluateOnPage)
            sidebar.setExpression(message.expression, message.rootTitle, callback.bind(this));
        else
            sidebar.setObject(message.expression, message.rootTitle, callback.bind(this));
    },

    _onSetSidebarPage: function(message, port)
    {
        var sidebar = this._clientObjects[message.id];
        if (!sidebar)
            return this._status.E_NOTFOUND(message.id);
        sidebar.setPage(this._expandResourcePath(port._extensionOrigin, message.page));
    },

    _onSetOpenResourceHandler: function(message, port)
    {
        var name = this._registeredExtensions[port._extensionOrigin].name || ("Extension " + port._extensionOrigin);
        if (message.handlerPresent)
            WebInspector.openAnchorLocationRegistry.registerHandler(name, this._handleOpenURL.bind(this, port));
        else
            WebInspector.openAnchorLocationRegistry.unregisterHandler(name);
    },

    _handleOpenURL: function(port, details)
    {
        var resource = WebInspector.resourceForURL(details.url);
        if (!resource)
            return false;
        var lineNumber = details.lineNumber;
        if (typeof lineNumber === "number")
            lineNumber += 1;
        port.postMessage({
            command: "open-resource",
            resource: this._makeResource(resource),
            lineNumber: lineNumber
        });
        return true;
    },

    _onLog: function(message)
    {
        WebInspector.log(message.message);
    },

    _onReload: function(message)
    {
        var options = /** @type ExtensionReloadOptions */ (message.options || {});
        NetworkAgent.setUserAgentOverride(typeof options.userAgent === "string" ? options.userAgent : "");
        var injectedScript;
        if (options.injectedScript) {
            // Wrap client script into anonymous function, return another anonymous function that
            // returns empty object for compatibility with InjectedScriptManager on the backend.
            injectedScript = "((function(){" + options.injectedScript + "})(),function(){return {}})";
        }
        PageAgent.reload(!!options.ignoreCache, injectedScript);
        return this._status.OK();
    },

    _onEvaluateOnInspectedPage: function(message, port)
    {
        function callback(error, resultPayload, wasThrown)
        {
            var result = {};
            if (error) {
                result.isException = true;
                result.value = error.message;
            }  else
                result.value = resultPayload.value;

            if (wasThrown)
                result.isException = true;
      
            this._dispatchCallback(message.requestId, port, result);
        }
        RuntimeAgent.evaluate(message.expression, "", true, undefined, undefined, true, callback.bind(this));
    },

    _onGetConsoleMessages: function()
    {
        return WebInspector.console.messages.map(this._makeConsoleMessage);
    },

    _onAddConsoleMessage: function(message)
    {
        function convertSeverity(level)
        {
            switch (level) {
                case WebInspector.extensionAPI.console.Severity.Tip:
                    return WebInspector.ConsoleMessage.MessageLevel.Tip;
                case WebInspector.extensionAPI.console.Severity.Log:
                    return WebInspector.ConsoleMessage.MessageLevel.Log;
                case WebInspector.extensionAPI.console.Severity.Warning:
                    return WebInspector.ConsoleMessage.MessageLevel.Warning;
                case WebInspector.extensionAPI.console.Severity.Error:
                    return WebInspector.ConsoleMessage.MessageLevel.Error;
                case WebInspector.extensionAPI.console.Severity.Debug:
                    return WebInspector.ConsoleMessage.MessageLevel.Debug;
            }
        }
        var level = convertSeverity(message.severity);
        if (!level)
            return this._status.E_BADARG("message.severity", message.severity);

        var consoleMessage = WebInspector.ConsoleMessage.create(
            WebInspector.ConsoleMessage.MessageSource.JS,
            level,
            message.text,
            WebInspector.ConsoleMessage.MessageType.Log,
            message.url,
            message.line);
        WebInspector.console.addMessage(consoleMessage);
    },

    _makeConsoleMessage: function(message)
    {
        function convertLevel(level)
        {
            if (!level)
                return;
            switch (level) {
                case WebInspector.ConsoleMessage.MessageLevel.Tip:
                    return WebInspector.extensionAPI.console.Severity.Tip;
                case WebInspector.ConsoleMessage.MessageLevel.Log:
                    return WebInspector.extensionAPI.console.Severity.Log;
                case WebInspector.ConsoleMessage.MessageLevel.Warning:
                    return WebInspector.extensionAPI.console.Severity.Warning;
                case WebInspector.ConsoleMessage.MessageLevel.Error:
                    return WebInspector.extensionAPI.console.Severity.Error;
                case WebInspector.ConsoleMessage.MessageLevel.Debug:
                    return WebInspector.extensionAPI.console.Severity.Debug;
                default:
                    return WebInspector.extensionAPI.console.Severity.Log;
            }
        }
        var result = {
            severity: convertLevel(message.level),
            text: message.text,
        };
        if (message.url)
            result.url = message.url;
        if (message.line)
            result.line = message.line;
        return result;
    },

    _onGetHAR: function()
    {
        var requests = WebInspector.networkLog.resources;
        var harLog = (new WebInspector.HARLog(requests)).build();
        for (var i = 0; i < harLog.entries.length; ++i)
            harLog.entries[i]._requestId = this._requestId(requests[i]);
        return harLog;
    },

    _makeResource: function(resource)
    {
        return {
            url: resource.url,
            type: WebInspector.Resource.Type.toString(resource.type)
        };
    },

    _onGetPageResources: function()
    {
        var resources = [];
        function pushResourceData(resource)
        {
            resources.push(this._makeResource(resource));
        }
        WebInspector.resourceTreeModel.forAllResources(pushResourceData.bind(this));
        return resources;
    },

    _getResourceContent: function(resource, message, port)
    {
        function onContentAvailable(content, encoded)
        {
            var response = {
                encoding: encoded ? "base64" : "",
                content: content
            };
            this._dispatchCallback(message.requestId, port, response);
        }
        resource.requestContent(onContentAvailable.bind(this));
    },

    _onGetRequestContent: function(message, port)
    {
        var request = this._requestById(message.id);
        if (!request)
            return this._status.E_NOTFOUND(message.id);
        this._getResourceContent(request, message, port);
    },

    _onGetResourceContent: function(message, port)
    {
        var resource = WebInspector.resourceTreeModel.resourceForURL(message.url);
        if (!resource)
            return this._status.E_NOTFOUND(message.url);
        this._getResourceContent(resource, message, port);
    },

    _onSetResourceContent: function(message, port)
    {
        function callbackWrapper(error)
        {
            var response = error ? this._status.E_FAILED(error) : this._status.OK();
            this._dispatchCallback(message.requestId, port, response);
        }
        var resource = WebInspector.resourceTreeModel.resourceForURL(message.url);
        if (!resource)
            return this._status.E_NOTFOUND(message.url);
        resource.setContent(message.content, message.commit, callbackWrapper.bind(this));
    },

    _requestId: function(request)
    {
        if (!request._extensionRequestId) {
            request._extensionRequestId = ++this._lastRequestId;
            this._requests[request._extensionRequestId] = request;
        }
        return request._extensionRequestId;
    },

    _requestById: function(id)
    {
        return this._requests[id];
    },

    _onAddAuditCategory: function(message)
    {
        var category = new WebInspector.ExtensionAuditCategory(message.id, message.displayName, message.resultCount);
        if (WebInspector.panels.audits.getCategory(category.id))
            return this._status.E_EXISTS(category.id);
        this._clientObjects[message.id] = category;
        WebInspector.panels.audits.addCategory(category);
    },

    _onAddAuditResult: function(message)
    {
        var auditResult = this._clientObjects[message.resultId];
        if (!auditResult)
            return this._status.E_NOTFOUND(message.resultId);
        try {
            auditResult.addResult(message.displayName, message.description, message.severity, message.details);
        } catch (e) {
            return e;
        }
        return this._status.OK();
    },

    _onStopAuditCategoryRun: function(message)
    {
        var auditRun = this._clientObjects[message.resultId];
        if (!auditRun)
            return this._status.E_NOTFOUND(message.resultId);
        auditRun.cancel();
    },

    _dispatchCallback: function(requestId, port, result)
    {
        if (requestId)
            port.postMessage({ command: "callback", requestId: requestId, result: result });
    },

    initExtensions: function()
    {
        this._registerAutosubscriptionHandler(WebInspector.extensionAPI.Events.ConsoleMessageAdded,
            WebInspector.console, WebInspector.ConsoleModel.Events.MessageAdded, this._notifyConsoleMessageAdded);
        this._registerAutosubscriptionHandler(WebInspector.extensionAPI.Events.NetworkRequestFinished,
            WebInspector.networkManager, WebInspector.NetworkManager.EventTypes.ResourceFinished, this._notifyRequestFinished);
        this._registerAutosubscriptionHandler(WebInspector.extensionAPI.Events.ResourceAdded,
            WebInspector.resourceTreeModel,
            WebInspector.ResourceTreeModel.EventTypes.ResourceAdded,
            this._notifyResourceAdded);
        if (WebInspector.panels.elements) {
            this._registerAutosubscriptionHandler(WebInspector.extensionAPI.Events.ElementsPanelObjectSelected,
                WebInspector.panels.elements.treeOutline,
                WebInspector.ElementsTreeOutline.Events.SelectedNodeChanged,
                this._notifyElementsSelectionChanged);
        }
        this._registerAutosubscriptionHandler(WebInspector.extensionAPI.Events.ResourceContentCommitted,
            WebInspector.resourceTreeModel,
            WebInspector.ResourceTreeModel.EventTypes.ResourceContentCommitted,
            this._notifyResourceContentCommitted);

        function onTimelineSubscriptionStarted()
        {
            WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineEventRecorded,
                this._notifyTimelineEventRecorded, this);
            WebInspector.timelineManager.start();
        }
        function onTimelineSubscriptionStopped()
        {
            WebInspector.timelineManager.stop();
            WebInspector.timelineManager.removeEventListener(WebInspector.TimelineManager.EventTypes.TimelineEventRecorded,
                this._notifyTimelineEventRecorded, this);
        }
        this._registerSubscriptionHandler(WebInspector.extensionAPI.Events.TimelineEventRecorded,
            onTimelineSubscriptionStarted.bind(this), onTimelineSubscriptionStopped.bind(this));

        WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.InspectedURLChanged,
            this._inspectedURLChanged, this);
        WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.MainFrameNavigated, this._mainFrameNavigated, this);
        InspectorExtensionRegistry.getExtensionsAsync();
    },

    _notifyConsoleMessageAdded: function(event)
    {
        this._postNotification(WebInspector.extensionAPI.Events.ConsoleMessageAdded, this._makeConsoleMessage(event.data));
    },

    _notifyResourceAdded: function(event)
    {
        var resource = event.data;
        this._postNotification(WebInspector.extensionAPI.Events.ResourceAdded, this._makeResource(resource));
    },

    _notifyResourceContentCommitted: function(event)
    {
        this._postNotification(WebInspector.extensionAPI.Events.ResourceContentCommitted, this._makeResource(event.data.resource), event.data.content);
    },

    _notifyRequestFinished: function(event)
    {
        var request = event.data;
        this._postNotification(WebInspector.extensionAPI.Events.NetworkRequestFinished, this._requestId(request), (new WebInspector.HAREntry(request)).build());
    },

    _notifyElementsSelectionChanged: function()
    {
        this._postNotification(WebInspector.extensionAPI.Events.ElementsPanelObjectSelected);
    },

    _notifyTimelineEventRecorded: function(event)
    {
        this._postNotification(WebInspector.extensionAPI.Events.TimelineEventRecorded, event.data);
    },

    /**
     * @param {Array.<ExtensionDescriptor>} extensions
     */
    _addExtensions: function(extensions)
    {
        for (var i = 0; i < extensions.length; ++i)
            this._addExtension(extensions[i]);
    },

    _addExtension: function(extensionInfo)
    {
        const urlOriginRegExp = new RegExp("([^:]+:\/\/[^/]*)\/"); // Can't use regexp literal here, MinJS chokes on it.
        var startPage = extensionInfo.startPage;
        var name = extensionInfo.name;

        try {
            var originMatch = urlOriginRegExp.exec(startPage);
            if (!originMatch) {
                console.error("Skipping extension with invalid URL: " + startPage);
                return false;
            }
            var extensionOrigin = originMatch[1];
            if (!this._registeredExtensions[extensionOrigin]) {
                // See ExtensionAPI.js and ExtensionCommon.js for details.
                InspectorFrontendHost.setInjectedScriptForOrigin(extensionOrigin, buildExtensionAPIInjectedScript(extensionInfo));
                this._registeredExtensions[extensionOrigin] = { name: name };
            }
            var iframe = document.createElement("iframe");
            iframe.src = startPage;
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        } catch (e) {
            console.error("Failed to initialize extension " + startPage + ":" + e);
            return false;
        }
        return true;
    },

    _onWindowMessage: function(event)
    {
        if (event.data === "registerExtension")
            this._registerExtension(event.origin, event.ports[0]);
    },

    _registerExtension: function(origin, port)
    {
        if (!this._registeredExtensions.hasOwnProperty(origin)) {
            if (origin !== window.location.origin) // Just ignore inspector frames.
                console.error("Ignoring unauthorized client request from " + origin);
            return;
        }
        port._extensionOrigin = origin;
        port.addEventListener("message", this._onmessage.bind(this), false);
        port.start();
    },

    _onmessage: function(event)
    {
        var message = event.data;
        var result;

        if (message.command in this._handlers)
            result = this._handlers[message.command](message, event.target);
        else
            result = this._status.E_NOTSUPPORTED(message.command);

        if (result && message.requestId)
            this._dispatchCallback(message.requestId, event.target, result);
    },

    _registerHandler: function(command, callback)
    {
        this._handlers[command] = callback;
    },

    _registerSubscriptionHandler: function(eventTopic, onSubscribeFirst, onUnsubscribeLast)
    {
        this._subscriptionStartHandlers[eventTopic] =  onSubscribeFirst;
        this._subscriptionStopHandlers[eventTopic] =  onUnsubscribeLast;
    },

    _registerAutosubscriptionHandler: function(eventTopic, eventTarget, frontendEventType, handler)
    {
        this._registerSubscriptionHandler(eventTopic,
            eventTarget.addEventListener.bind(eventTarget, frontendEventType, handler, this),
            eventTarget.removeEventListener.bind(eventTarget, frontendEventType, handler, this));
    },

    _expandResourcePath: function(extensionPath, resourcePath)
    {
        if (!resourcePath)
            return;
        return extensionPath + this._normalizePath(resourcePath);
    },

    _normalizePath: function(path)
    {
        var source = path.split("/");
        var result = [];

        for (var i = 0; i < source.length; ++i) {
            if (source[i] === ".")
                continue;
            // Ignore empty path components resulting from //, as well as a leading and traling slashes.
            if (source[i] === "")
                continue;
            if (source[i] === "..")
                result.pop();
            else
                result.push(source[i]);
        }
        return "/" + result.join("/");
    }
}

/**
 * @constructor
 */
WebInspector.ExtensionStatus = function()
{
    function makeStatus(code, description)
    {
        var details = Array.prototype.slice.call(arguments, 2);
        var status = { code: code, description: description, details: details };
        if (code !== "OK") {
            status.isError = true;
            console.log("Extension server error: " + String.vsprintf(description, details));
        }
        return status;
    }

    this.OK = makeStatus.bind(null, "OK", "OK");
    this.E_EXISTS = makeStatus.bind(null, "E_EXISTS", "Object already exists: %s");
    this.E_BADARG = makeStatus.bind(null, "E_BADARG", "Invalid argument %s: %s");
    this.E_BADARGTYPE = makeStatus.bind(null, "E_BADARGTYPE", "Invalid type for argument %s: got %s, expected %s");
    this.E_NOTFOUND = makeStatus.bind(null, "E_NOTFOUND", "Object not found: %s");
    this.E_NOTSUPPORTED = makeStatus.bind(null, "E_NOTSUPPORTED", "Object does not support requested operation: %s");
    this.E_FAILED = makeStatus.bind(null, "E_FAILED", "Operation failed: %s");
}

WebInspector.addExtensions = function(extensions)
{
    WebInspector.extensionServer._addExtensions(extensions);
}

WebInspector.extensionAPI = {};
defineCommonExtensionSymbols(WebInspector.extensionAPI);

WebInspector.extensionServer = new WebInspector.ExtensionServer();

window.addExtension = function(page, name)
{
    WebInspector.extensionServer._addExtension({
        startPage: page,
        name: name,
    });
}
