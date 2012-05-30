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
 * @extends {WebInspector.Object}
 */
WebInspector.NetworkManager = function()
{
    WebInspector.Object.call(this);
    this._dispatcher = new WebInspector.NetworkDispatcher(this);
    if (WebInspector.settings.cacheDisabled.get())
        NetworkAgent.setCacheDisabled(true);

    NetworkAgent.enable();

    WebInspector.settings.cacheDisabled.addChangeListener(this._cacheDisabledSettingChanged, this);

    if (WebInspector.settings.userAgent.get())
        this._userAgentSettingChanged();
    WebInspector.settings.userAgent.addChangeListener(this._userAgentSettingChanged, this);
}

WebInspector.NetworkManager.EventTypes = {
    ResourceTrackingEnabled: "ResourceTrackingEnabled",
    ResourceTrackingDisabled: "ResourceTrackingDisabled",
    ResourceStarted: "ResourceStarted",
    ResourceUpdated: "ResourceUpdated",
    ResourceFinished: "ResourceFinished",
    ResourceUpdateDropped: "ResourceUpdateDropped"
}

WebInspector.NetworkManager.prototype = {
    /**
     * @param {WebInspector.Resource} resource
     * @param {function(?string, boolean)} callback
     */
    requestContent: function(resource, callback)
    {
        function callbackWrapper(error, content, contentEncoded)
        {
            if (error)
                callback(null, false);
            else
                callback(content, content && contentEncoded);
        }
        // FIXME: https://bugs.webkit.org/show_bug.cgi?id=61363 We should separate NetworkResource (NetworkPanel resource)
        // from ResourceRevision (ResourcesPanel/ScriptsPanel resource) and request content accordingly.
        if (resource.requestId)
            NetworkAgent.getResponseBody(resource.requestId, callbackWrapper);
        else
            PageAgent.getResourceContent(resource.frameId, resource.url, callbackWrapper);
    },

    enableResourceTracking: function()
    {
        function callback(error)
        {
            this.dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceTrackingEnabled);
        }
        NetworkAgent.enable(callback.bind(this));
    },

    disableResourceTracking: function()
    {
        function callback(error)
        {
            this.dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceTrackingDisabled);
        }
        NetworkAgent.disable(callback.bind(this));
    },

    /**
     * @param {string} url
     * @return {WebInspector.Resource}
     */
    inflightResourceForURL: function(url)
    {
        return this._dispatcher._inflightResourcesByURL[url];
    },

    /**
     * @param {WebInspector.Event} event
     */
    _cacheDisabledSettingChanged: function(event)
    {
        var enabled = /** @type {boolean} */ event.data;
        NetworkAgent.setCacheDisabled(enabled);
    },

    _userAgentSettingChanged: function()
    {
        NetworkAgent.setUserAgentOverride(WebInspector.settings.userAgent.get());
    }
}

WebInspector.NetworkManager.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @implements {NetworkAgent.Dispatcher}
 */
WebInspector.NetworkDispatcher = function(manager)
{
    this._manager = manager;
    this._inflightResourcesById = {};
    this._inflightResourcesByURL = {};
    InspectorBackend.registerNetworkDispatcher(this);
}

WebInspector.NetworkDispatcher.prototype = {
    /**
     * @param {WebInspector.Resource} resource
     * @param {NetworkAgent.Request} request
     */
    _updateResourceWithRequest: function(resource, request)
    {
        resource.requestMethod = request.method;
        resource.requestHeaders = request.headers;
        resource.requestFormData = request.postData;
    },

    /**
     * @param {WebInspector.Resource} resource
     * @param {NetworkAgent.Response=} response
     */
    _updateResourceWithResponse: function(resource, response)
    {
        if (!response)
            return;

        if (response.url && resource.url !== response.url)
            resource.url = response.url;
        resource.mimeType = response.mimeType;
        resource.statusCode = response.status;
        resource.statusText = response.statusText;
        resource.responseHeaders = response.headers;
        if (response.headersText)
            resource.responseHeadersText = response.headersText;
        if (response.requestHeaders)
            resource.requestHeaders = response.requestHeaders;
        if (response.requestHeadersText)
            resource.requestHeadersText = response.requestHeadersText;

        resource.connectionReused = response.connectionReused;
        resource.connectionId = response.connectionId;

        if (response.fromDiskCache)
            resource.cached = true;
        else
            resource.timing = response.timing;

        if (!this._mimeTypeIsConsistentWithType(resource)) {
            WebInspector.console.addMessage(WebInspector.ConsoleMessage.create(WebInspector.ConsoleMessage.MessageSource.Network,
                WebInspector.ConsoleMessage.MessageLevel.Warning,
                WebInspector.UIString("Resource interpreted as %s but transferred with MIME type %s: \"%s\".", WebInspector.Resource.Type.toUIString(resource.type), resource.mimeType, resource.url),
                WebInspector.ConsoleMessage.MessageType.Log,
                "",
                0,
                1,
                [],
                null,
                resource));
        }
    },

    /**
     * @param {WebInspector.Resource} resource
     * @return {boolean}
     */
    _mimeTypeIsConsistentWithType: function(resource)
    {
        // If status is an error, content is likely to be of an inconsistent type,
        // as it's going to be an error message. We do not want to emit a warning
        // for this, though, as this will already be reported as resource loading failure.
        // Also, if a URL like http://localhost/wiki/load.php?debug=true&lang=en produces text/css and gets reloaded,
        // it is 304 Not Modified and its guessed mime-type is text/php, which is wrong.
        // Don't check for mime-types in 304-resources.
        if (resource.hasErrorStatusCode() || resource.statusCode === 304)
            return true;

        if (typeof resource.type === "undefined"
            || resource.type === WebInspector.Resource.Type.Other
            || resource.type === WebInspector.Resource.Type.XHR
            || resource.type === WebInspector.Resource.Type.WebSocket)
            return true;

        if (!resource.mimeType)
            return true; // Might be not known for cached resources with null responses.

        if (resource.mimeType in WebInspector.MIMETypes)
            return resource.type in WebInspector.MIMETypes[resource.mimeType];

        return false;
    },

    /**
     * @param {WebInspector.Resource} resource
     * @param {?NetworkAgent.CachedResource} cachedResource
     */
    _updateResourceWithCachedResource: function(resource, cachedResource)
    {
        resource.type = WebInspector.Resource.Type[cachedResource.type];
        resource.resourceSize = cachedResource.bodySize;
        this._updateResourceWithResponse(resource, cachedResource.response);
    },

    /**
     * @param {NetworkAgent.Response} response
     * @return {boolean}
     */
    _isNull: function(response)
    {
        if (!response)
            return true;
        return !response.status && !response.mimeType && (!response.headers || !Object.keys(response.headers).length);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.FrameId} frameId
     * @param {NetworkAgent.LoaderId} loaderId
     * @param {string} documentURL
     * @param {NetworkAgent.Request} request
     * @param {NetworkAgent.Timestamp} time
     * @param {NetworkAgent.Initiator} initiator
     * @param {ConsoleAgent.StackTrace=} stackTrace
     * @param {NetworkAgent.Response=} redirectResponse
     */
    requestWillBeSent: function(requestId, frameId, loaderId, documentURL, request, time, initiator, stackTrace, redirectResponse)
    {
        var resource = this._inflightResourcesById[requestId];
        if (resource) {
            // FIXME: move this check to the backend.
            if (!redirectResponse)
                return;
            this.responseReceived(requestId, frameId, loaderId, time, "Other", redirectResponse);
            resource = this._appendRedirect(requestId, time, request.url);
        } else
            resource = this._createResource(requestId, frameId, loaderId, request.url, documentURL, initiator, stackTrace);
        resource.hasNetworkData = true;
        this._updateResourceWithRequest(resource, request);
        resource.startTime = time;

        this._startResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     */
    requestServedFromCache: function(requestId)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;

        resource.cached = true;
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.FrameId} frameId
     * @param {NetworkAgent.LoaderId} loaderId
     * @param {NetworkAgent.Timestamp} time
     * @param {PageAgent.ResourceType} resourceType
     * @param {NetworkAgent.Response} response
     */
    responseReceived: function(requestId, frameId, loaderId, time, resourceType, response)
    {
        // FIXME: move this check to the backend.
        if (this._isNull(response))
            return;

        var resource = this._inflightResourcesById[requestId];
        if (!resource) {
            // We missed the requestWillBeSent.
            var eventData = {};
            eventData.url = response.url;
            eventData.frameId = frameId;
            eventData.loaderId = loaderId;
            eventData.resourceType = resourceType;
            eventData.mimeType = response.mimeType;
            this._manager.dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceUpdateDropped, eventData);
            return;
        }

        resource.responseReceivedTime = time;
        resource.type = WebInspector.Resource.Type[resourceType];

        this._updateResourceWithResponse(resource, response);

        this._updateResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     * @param {number} dataLength
     * @param {number} encodedDataLength
     */
    dataReceived: function(requestId, time, dataLength, encodedDataLength)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;

        resource.resourceSize += dataLength;
        if (encodedDataLength != -1)
            resource.increaseTransferSize(encodedDataLength);
        resource.endTime = time;

        this._updateResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} finishTime
     */
    loadingFinished: function(requestId, finishTime)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;
        this._finishResource(resource, finishTime);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     * @param {string} localizedDescription
     * @param {boolean=} canceled
     */
    loadingFailed: function(requestId, time, localizedDescription, canceled)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;

        resource.failed = true;
        resource.canceled = canceled;
        resource.localizedFailDescription = localizedDescription;
        this._finishResource(resource, time);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.FrameId} frameId
     * @param {NetworkAgent.LoaderId} loaderId
     * @param {string} documentURL
     * @param {NetworkAgent.Timestamp} time
     * @param {NetworkAgent.Initiator} initiator
     * @param {NetworkAgent.CachedResource} cachedResource
     */
    requestServedFromMemoryCache: function(requestId, frameId, loaderId, documentURL, time, initiator, cachedResource)
    {
        var resource = this._createResource(requestId, frameId, loaderId, cachedResource.url, documentURL, initiator, null);
        this._updateResourceWithCachedResource(resource, cachedResource);
        resource.cached = true;
        resource.requestMethod = "GET";
        this._startResource(resource);
        resource.startTime = resource.responseReceivedTime = time;
        this._finishResource(resource, time);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {string} requestURL
     */
    webSocketCreated: function(requestId, requestURL)
    {
        var resource = new WebInspector.Resource(requestId, requestURL, "", null);
        resource.type = WebInspector.Resource.Type.WebSocket;
        this._startResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     * @param {NetworkAgent.WebSocketRequest} request
     */
    webSocketWillSendHandshakeRequest: function(requestId, time, request)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;

        resource.requestMethod = "GET";
        resource.requestHeaders = request.headers;
        resource.webSocketRequestKey3 = request.requestKey3;
        resource.startTime = time;

        this._updateResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     * @param {NetworkAgent.WebSocketResponse} response
     */
    webSocketHandshakeResponseReceived: function(requestId, time, response)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;

        resource.statusCode = response.status;
        resource.statusText = response.statusText;
        resource.responseHeaders = response.headers;
        resource.webSocketChallengeResponse = response.challengeResponse;
        resource.responseReceivedTime = time;

        this._updateResource(resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     */
    webSocketClosed: function(requestId, time)
    {
        var resource = this._inflightResourcesById[requestId];
        if (!resource)
            return;
        this._finishResource(resource, time);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {NetworkAgent.Timestamp} time
     * @param {string} redirectURL
     */
    _appendRedirect: function(requestId, time, redirectURL)
    {
        var originalResource = this._inflightResourcesById[requestId];
        var previousRedirects = originalResource.redirects || [];
        originalResource.requestId = "redirected:" + requestId + "." + previousRedirects.length;
        delete originalResource.redirects;
        if (previousRedirects.length > 0)
            originalResource.redirectSource = previousRedirects[previousRedirects.length - 1];
        this._finishResource(originalResource, time);
        var newResource = this._createResource(requestId, originalResource.frameId, originalResource.loaderId,
             redirectURL, originalResource.documentURL, originalResource.initiator, originalResource.stackTrace);
        newResource.redirects = previousRedirects.concat(originalResource);
        return newResource;
    },

    /**
     * @param {WebInspector.Resource} resource
     */
    _startResource: function(resource)
    {
        this._inflightResourcesById[resource.requestId] = resource;
        this._inflightResourcesByURL[resource.url] = resource;
        this._dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceStarted, resource);
    },

    /**
     * @param {WebInspector.Resource} resource
     */
    _updateResource: function(resource)
    {
        this._dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceUpdated, resource);
    },

    /**
     * @param {WebInspector.Resource} resource
     * @param {NetworkAgent.Timestamp} finishTime
     */
    _finishResource: function(resource, finishTime)
    {
        resource.endTime = finishTime;
        resource.finished = true;
        this._dispatchEventToListeners(WebInspector.NetworkManager.EventTypes.ResourceFinished, resource);
        delete this._inflightResourcesById[resource.requestId];
        delete this._inflightResourcesByURL[resource.url];
    },

    /**
     * @param {string} eventType
     * @param {WebInspector.Resource} resource
     */
    _dispatchEventToListeners: function(eventType, resource)
    {
        this._manager.dispatchEventToListeners(eventType, resource);
    },

    /**
     * @param {NetworkAgent.RequestId} requestId
     * @param {string} frameId
     * @param {NetworkAgent.LoaderId} loaderId
     * @param {string} url
     * @param {string} documentURL
     * @param {NetworkAgent.Initiator} initiator
     * @param {ConsoleAgent.StackTrace=} stackTrace
     */
    _createResource: function(requestId, frameId, loaderId, url, documentURL, initiator, stackTrace)
    {
        var resource = new WebInspector.Resource(requestId, url, frameId, loaderId);
        resource.documentURL = documentURL;
        resource.initiator = initiator;
        resource.stackTrace = stackTrace;
        return resource;
    }
}

/**
 * @type {?WebInspector.NetworkManager}
 */
WebInspector.networkManager = null;
