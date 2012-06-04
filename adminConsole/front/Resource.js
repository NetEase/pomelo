/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// This table maps MIME types to the Resource.Types which are valid for them.
// The following line:
//    "text/html":                {0: 1},
// means that text/html is a valid MIME type for resources that have type
// WebInspector.Resource.Type.Document (which has a value of 0).
WebInspector.MIMETypes = {
    "text/html":                   {0: true},
    "text/xml":                    {0: true},
    "text/plain":                  {0: true},
    "application/xhtml+xml":       {0: true},
    "text/css":                    {1: true},
    "text/xsl":                    {1: true},
    "image/jpeg":                  {2: true},
    "image/png":                   {2: true},
    "image/gif":                   {2: true},
    "image/bmp":                   {2: true},
    "image/svg+xml":               {2: true},
    "image/vnd.microsoft.icon":    {2: true},
    "image/webp":                  {2: true},
    "image/x-icon":                {2: true},
    "image/x-xbitmap":             {2: true},
    "font/ttf":                    {3: true},
    "font/opentype":               {3: true},
    "font/woff":                   {3: true},
    "application/x-font-type1":    {3: true},
    "application/x-font-ttf":      {3: true},
    "application/x-font-woff":     {3: true},
    "application/x-truetype-font": {3: true},
    "text/javascript":             {4: true},
    "text/ecmascript":             {4: true},
    "application/javascript":      {4: true},
    "application/ecmascript":      {4: true},
    "application/x-javascript":    {4: true},
    "application/json":            {4: true},
    "text/javascript1.1":          {4: true},
    "text/javascript1.2":          {4: true},
    "text/javascript1.3":          {4: true},
    "text/jscript":                {4: true},
    "text/livescript":             {4: true},
}

/**
 * @constructor
 * @extends {WebInspector.Object}
 *
 * @param {NetworkAgent.RequestId} requestId
 * @param {string} url
 * @param {string} frameId
 * @param {?NetworkAgent.LoaderId} loaderId
 */
WebInspector.Resource = function(requestId, url, frameId, loaderId)
{
    this.requestId = requestId;
    this.url = url;
    this.frameId = frameId;
    this.loaderId = loaderId;
    this._startTime = -1;
    this._endTime = -1;
    this._category = WebInspector.resourceCategories.other;
    this._pendingContentCallbacks = [];
    this.history = [];
    /** @type {number} */
    this.statusCode = 0;
    this.statusText = "";
    this.requestMethod = "";
    this.requestTime = 0;
    this.receiveHeadersEnd = 0;
}

/**
 * @param {string} url
 * @return {string}
 */
WebInspector.Resource.displayName = function(url)
{
    return new WebInspector.Resource("fake-transient-resource", url, "", null).displayName;
}

// Keep these in sync with WebCore::InspectorResource::Type
WebInspector.Resource.Type = {
    Document:   0,
    Stylesheet: 1,
    Image:      2,
    Font:       3,
    Script:     4,
    XHR:        5,
    WebSocket:  7,
    Other:      8,

    /**
     * @param {number} type
     * @return {boolean}
     */
    isTextType: function(type)
    {
        return (type === WebInspector.Resource.Type.Document) || (type === WebInspector.Resource.Type.Stylesheet) || (type === WebInspector.Resource.Type.Script) || (type === WebInspector.Resource.Type.XHR);
    },

    /**
     * @param {number} type
     * @return {string}
     */
    toUIString: function(type)
    {
        switch (type) {
            case WebInspector.Resource.Type.Document:
                return WebInspector.UIString("Document");
            case WebInspector.Resource.Type.Stylesheet:
                return WebInspector.UIString("Stylesheet");
            case WebInspector.Resource.Type.Image:
                return WebInspector.UIString("Image");
            case WebInspector.Resource.Type.Font:
                return WebInspector.UIString("Font");
            case WebInspector.Resource.Type.Script:
                return WebInspector.UIString("Script");
            case WebInspector.Resource.Type.XHR:
                return WebInspector.UIString("XHR");
            case WebInspector.Resource.Type.WebSocket:
                return WebInspector.UIString("WebSocket");
            case WebInspector.Resource.Type.Other:
            default:
                return WebInspector.UIString("Other");
        }
    },

    /**
     * Returns locale-independent string identifier of resource type (primarily for use in extension API).
     * The IDs need to be kept in sync with webInspector.resoureces.Types object in ExtensionAPI.js.
     * @param {number} type
     * @return {string}
     */
    toString: function(type)
    {
        switch (type) {
            case WebInspector.Resource.Type.Document:
                return "document";
            case WebInspector.Resource.Type.Stylesheet:
                return "stylesheet";
            case WebInspector.Resource.Type.Image:
                return "image";
            case WebInspector.Resource.Type.Font:
                return "font";
            case WebInspector.Resource.Type.Script:
                return "script";
            case WebInspector.Resource.Type.XHR:
                return "xhr";
            case WebInspector.Resource.Type.WebSocket:
                return "websocket";
            case WebInspector.Resource.Type.Other:
            default:
                return "other";
        }
    }
}

WebInspector.Resource._domainModelBindings = [];

/**
 * @param {number} type
 * @param {WebInspector.ResourceDomainModelBinding} binding
 */
WebInspector.Resource.registerDomainModelBinding = function(type, binding)
{
    WebInspector.Resource._domainModelBindings[type] = binding;
}

WebInspector.Resource._resourceRevisionRegistry = function()
{
    if (!WebInspector.Resource._resourceRevisionRegistryObject) {
        if (window.localStorage) {
            var resourceHistory = window.localStorage["resource-history"];
            try {
                WebInspector.Resource._resourceRevisionRegistryObject = resourceHistory ? JSON.parse(resourceHistory) : {};
            } catch (e) {
                WebInspector.Resource._resourceRevisionRegistryObject = {};
            }
        } else
            WebInspector.Resource._resourceRevisionRegistryObject = {};
    }
    return WebInspector.Resource._resourceRevisionRegistryObject;
}

WebInspector.Resource.restoreRevisions = function()
{
    var registry = WebInspector.Resource._resourceRevisionRegistry();
    var filteredRegistry = {};
    for (var url in registry) {
        var historyItems = registry[url];
        var resource = WebInspector.resourceForURL(url);

        var filteredHistoryItems = [];
        for (var i = 0; historyItems && i < historyItems.length; ++i) {
            var historyItem = historyItems[i];
            if (resource && historyItem.loaderId === resource.loaderId) {
                resource.addRevision(window.localStorage[historyItem.key], new Date(historyItem.timestamp), true);
                filteredHistoryItems.push(historyItem);
                filteredRegistry[url] = filteredHistoryItems;
            } else
                delete window.localStorage[historyItem.key];
        }
    }
    WebInspector.Resource._resourceRevisionRegistryObject = filteredRegistry;

    function persist()
    {
        window.localStorage["resource-history"] = JSON.stringify(filteredRegistry);
    }

    // Schedule async storage.
    setTimeout(persist, 0);
}

/**
 * @param {WebInspector.Resource} resource
 */
WebInspector.Resource.persistRevision = function(resource)
{
    if (!window.localStorage)
        return;

    var url = resource.url;
    var loaderId = resource.loaderId;
    var timestamp = resource._contentTimestamp.getTime();
    var key = "resource-history|" + url + "|" + loaderId + "|" + timestamp;
    var content = resource._content;

    var registry = WebInspector.Resource._resourceRevisionRegistry();

    var historyItems = registry[resource.url];
    if (!historyItems) {
        historyItems = [];
        registry[resource.url] = historyItems;
    }
    historyItems.push({url: url, loaderId: loaderId, timestamp: timestamp, key: key});

    function persist()
    {
        window.localStorage[key] = content;
        window.localStorage["resource-history"] = JSON.stringify(registry);
    }

    // Schedule async storage.
    setTimeout(persist, 0);
}

WebInspector.Resource.Events = {
    RevisionAdded: "revision-added",
    MessageAdded: "message-added",
    MessagesCleared: "messages-cleared",
}

WebInspector.Resource.prototype = {
    /**
     * @return {string}
     */
    get url()
    {
        return this._url;
    },

    set url(x)
    {
        if (this._url === x)
            return;

        this._url = x;
        delete this._parsedQueryParameters;

        var parsedURL = x.asParsedURL();
        this.domain = parsedURL ? parsedURL.host : "";
        this.path = parsedURL ? parsedURL.path : "";
        this.urlFragment = parsedURL ? parsedURL.fragment : "";
        this.lastPathComponent = parsedURL ? parsedURL.lastPathComponent : "";
        this.lastPathComponentLowerCase = this.lastPathComponent.toLowerCase();
    },

    /**
     * @return {string}
     */
    get documentURL()
    {
        return this._documentURL;
    },

    set documentURL(x)
    {
        this._documentURL = x;
    },

    /**
     * @return {string}
     */
    get displayName()
    {
        if (this._displayName)
            return this._displayName;
        this._displayName = this.lastPathComponent;
        if (!this._displayName)
            this._displayName = this.displayDomain;
        if (!this._displayName && this.url)
            this._displayName = this.url.trimURL(WebInspector.inspectedPageDomain ? WebInspector.inspectedPageDomain : "");
        if (this._displayName === "/")
            this._displayName = this.url;
        return this._displayName;
    },

    /**
     * @return {string}
     */
    get folder()
    {
        var path = this.path;
        var indexOfQuery = path.indexOf("?");
        if (indexOfQuery !== -1)
            path = path.substring(0, indexOfQuery);
        var lastSlashIndex = path.lastIndexOf("/");
        return lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : "";
    },

    /**
     * @return {string}
     */
    get displayDomain()
    {
        // WebInspector.Database calls this, so don't access more than this.domain.
        if (this.domain && (!WebInspector.inspectedPageDomain || (WebInspector.inspectedPageDomain && this.domain !== WebInspector.inspectedPageDomain)))
            return this.domain;
        return "";
    },

    /**
     * @return {number}
     */
    get startTime()
    {
        return this._startTime || -1;
    },

    set startTime(x)
    {
        this._startTime = x;
    },

    /**
     * @return {number}
     */
    get responseReceivedTime()
    {
        return this._responseReceivedTime || -1;
    },

    set responseReceivedTime(x)
    {
        this._responseReceivedTime = x;
    },

    /**
     * @return {number}
     */
    get endTime()
    {
        return this._endTime || -1;
    },

    set endTime(x)
    {
        if (this.timing && this.timing.requestTime) {
            // Check against accurate responseReceivedTime.
            this._endTime = Math.max(x, this.responseReceivedTime);
        } else {
            // Prefer endTime since it might be from the network stack.
            this._endTime = x;
            if (this._responseReceivedTime > x)
                this._responseReceivedTime = x;
        }
    },

    /**
     * @return {number}
     */
    get duration()
    {
        if (this._endTime === -1 || this._startTime === -1)
            return -1;
        return this._endTime - this._startTime;
    },

    /**
     * @return {number}
     */
    get latency()
    {
        if (this._responseReceivedTime === -1 || this._startTime === -1)
            return -1;
        return this._responseReceivedTime - this._startTime;
    },

    /**
     * @return {number}
     */
    get receiveDuration()
    {
        if (this._endTime === -1 || this._responseReceivedTime === -1)
            return -1;
        return this._endTime - this._responseReceivedTime;
    },

    /**
     * @return {number}
     */
    get resourceSize()
    {
        return this._resourceSize || 0;
    },

    set resourceSize(x)
    {
        this._resourceSize = x;
    },

    /**
     * @return {number}
     */
    get transferSize()
    {
        if (this.cached)
            return 0;
        if (this.statusCode === 304) // Not modified
            return this.responseHeadersSize;
        if (this._transferSize !== undefined)
            return this._transferSize;
        // If we did not receive actual transfer size from network
        // stack, we prefer using Content-Length over resourceSize as
        // resourceSize may differ from actual transfer size if platform's
        // network stack performed decoding (e.g. gzip decompression).
        // The Content-Length, though, is expected to come from raw
        // response headers and will reflect actual transfer length.
        // This won't work for chunked content encoding, so fall back to
        // resourceSize when we don't have Content-Length. This still won't
        // work for chunks with non-trivial encodings. We need a way to
        // get actual transfer size from the network stack.
        var bodySize = Number(this.responseHeaders["Content-Length"] || this.resourceSize);
        return this.responseHeadersSize + bodySize;
    },

    /**
     * @param {number} x
     */
    increaseTransferSize: function(x)
    {
        this._transferSize = (this._transferSize || 0) + x;
    },

    /**
     * @return {boolean}
     */
    get finished()
    {
        return this._finished;
    },

    set finished(x)
    {
        if (this._finished === x)
            return;

        this._finished = x;

        if (x) {
            this.dispatchEventToListeners("finished");
            if (this._pendingContentCallbacks.length)
                this._innerRequestContent();
        }
    },

    /**
     * @return {boolean}
     */
    get failed()
    {
        return this._failed;
    },

    set failed(x)
    {
        this._failed = x;
    },

    /**
     * @return {boolean}
     */
    get canceled()
    {
        return this._canceled;
    },

    set canceled(x)
    {
        this._canceled = x;
    },

    /**
     * @return {WebInspector.ResourceCategory}
     */
    get category()
    {
        return this._category;
    },

    set category(x)
    {
        this._category = x;
    },

    /**
     * @return {boolean}
     */
    get cached()
    {
        return this._cached;
    },

    set cached(x)
    {
        this._cached = x;
        if (x)
            delete this._timing;
    },

    /**
     * @return {NetworkAgent.ResourceTiming|undefined}
     */
    get timing()
    {
        return this._timing;
    },

    set timing(x)
    {
        if (x && !this._cached) {
            // Take startTime and responseReceivedTime from timing data for better accuracy.
            // Timing's requestTime is a baseline in seconds, rest of the numbers there are ticks in millis.
            this._startTime = x.requestTime;
            this._responseReceivedTime = x.requestTime + x.receiveHeadersEnd / 1000.0;

            this._timing = x;
            this.dispatchEventToListeners("timing changed");
        }
    },

    /**
     * @return {string}
     */
    get mimeType()
    {
        return this._mimeType;
    },

    set mimeType(x)
    {
        this._mimeType = x;
    },

    /**
     * @return {number}
     */
    get type()
    {
        return this._type;
    },

    set type(x)
    {
        if (this._type === x)
            return;

        this._type = x;

        switch (x) {
            case WebInspector.Resource.Type.Document:
                this.category = WebInspector.resourceCategories.documents;
                break;
            case WebInspector.Resource.Type.Stylesheet:
                this.category = WebInspector.resourceCategories.stylesheets;
                break;
            case WebInspector.Resource.Type.Script:
                this.category = WebInspector.resourceCategories.scripts;
                break;
            case WebInspector.Resource.Type.Image:
                this.category = WebInspector.resourceCategories.images;
                break;
            case WebInspector.Resource.Type.Font:
                this.category = WebInspector.resourceCategories.fonts;
                break;
            case WebInspector.Resource.Type.XHR:
                this.category = WebInspector.resourceCategories.xhr;
                break;
            case WebInspector.Resource.Type.WebSocket:
                this.category = WebInspector.resourceCategories.websockets;
                break;
            case WebInspector.Resource.Type.Other:
            default:
                this.category = WebInspector.resourceCategories.other;
                break;
        }
    },

    /**
     * @return {WebInspector.Resource|undefined}
     */
    get redirectSource()
    {
        if (this.redirects && this.redirects.length > 0)
            return this.redirects[this.redirects.length - 1];
        return this._redirectSource;
    },

    set redirectSource(x)
    {
        this._redirectSource = x;
    },

    /**
     * @return {Object}
     */
    get requestHeaders()
    {
        return this._requestHeaders || {};
    },

    set requestHeaders(x)
    {
        this._requestHeaders = x;
        delete this._sortedRequestHeaders;
        delete this._requestCookies;

        this.dispatchEventToListeners("requestHeaders changed");
    },

    /**
     * @return {string}
     */
    get requestHeadersText()
    {
        if (this._requestHeadersText === undefined) {
            this._requestHeadersText = this.requestMethod + " " + this.url + " HTTP/1.1\r\n";
            for (var key in this.requestHeaders)
                this._requestHeadersText += key + ": " + this.requestHeaders[key] + "\r\n";
        }
        return this._requestHeadersText;
    },

    set requestHeadersText(x)
    {
        this._requestHeadersText = x;

        this.dispatchEventToListeners("requestHeaders changed");
    },

    /**
     * @return {number}
     */
    get requestHeadersSize()
    {
        return this.requestHeadersText.length;
    },

    /**
     * @return {Array.<Object>}
     */
    get sortedRequestHeaders()
    {
        if (this._sortedRequestHeaders !== undefined)
            return this._sortedRequestHeaders;

        this._sortedRequestHeaders = [];
        for (var key in this.requestHeaders)
            this._sortedRequestHeaders.push({header: key, value: this.requestHeaders[key]});
        this._sortedRequestHeaders.sort(function(a,b) { return a.header.localeCompare(b.header) });

        return this._sortedRequestHeaders;
    },

    /**
     * @param {string} headerName
     * @return {string|undefined}
     */
    requestHeaderValue: function(headerName)
    {
        return this._headerValue(this.requestHeaders, headerName);
    },

    /**
     * @type {Array.<WebInspector.Cookie>}
     */
    get requestCookies()
    {
        if (!this._requestCookies)
            this._requestCookies = WebInspector.CookieParser.parseCookie(this.requestHeaderValue("Cookie"));
        return this._requestCookies;
    },

    /**
     * @type {string|undefined}
     */
    get requestFormData()
    {
        return this._requestFormData;
    },

    set requestFormData(x)
    {
        this._requestFormData = x;
        delete this._parsedFormParameters;
    },

    /**
     * @type {string|undefined}
     */
    get requestHttpVersion()
    {
        var firstLine = this.requestHeadersText.split(/\r\n/)[0];
        var match = firstLine.match(/(HTTP\/\d+\.\d+)$/);
        return match ? match[1] : undefined;
    },

    /**
     * @type {Object}
     */
    get responseHeaders()
    {
        return this._responseHeaders || {};
    },

    set responseHeaders(x)
    {
        this._responseHeaders = x;
        delete this._sortedResponseHeaders;
        delete this._responseCookies;

        this.dispatchEventToListeners("responseHeaders changed");
    },

    /**
     * @type {string}
     */
    get responseHeadersText()
    {
        if (this._responseHeadersText === undefined) {
            this._responseHeadersText = "HTTP/1.1 " + this.statusCode + " " + this.statusText + "\r\n";
            for (var key in this.responseHeaders)
                this._responseHeadersText += key + ": " + this.responseHeaders[key] + "\r\n";
        }
        return this._responseHeadersText;
    },

    set responseHeadersText(x)
    {
        this._responseHeadersText = x;

        this.dispatchEventToListeners("responseHeaders changed");
    },

    /**
     * @type {number}
     */
    get responseHeadersSize()
    {
        return this.responseHeadersText.length;
    },

    /**
     * @type {Array.<Object>}
     */
    get sortedResponseHeaders()
    {
        if (this._sortedResponseHeaders !== undefined)
            return this._sortedResponseHeaders;

        this._sortedResponseHeaders = [];
        for (var key in this.responseHeaders)
            this._sortedResponseHeaders.push({header: key, value: this.responseHeaders[key]});
        this._sortedResponseHeaders.sort(function(a,b) { return a.header.localeCompare(b.header) });

        return this._sortedResponseHeaders;
    },

    /**
     * @param {string} headerName
     * @return {string|undefined}
     */
    responseHeaderValue: function(headerName)
    {
        return this._headerValue(this.responseHeaders, headerName);
    },

    /**
     * @type {Array.<WebInspector.Cookie>}
     */
    get responseCookies()
    {
        if (!this._responseCookies)
            this._responseCookies = WebInspector.CookieParser.parseSetCookie(this.responseHeaderValue("Set-Cookie"));
        return this._responseCookies;
    },

    /**
     * @type {?Array.<Object>}
     */
    get queryParameters()
    {
        if (this._parsedQueryParameters)
            return this._parsedQueryParameters;
        var queryString = this.url.split("?", 2)[1];
        if (!queryString)
            return null;
        queryString = queryString.split("#", 2)[0];
        this._parsedQueryParameters = this._parseParameters(queryString);
        return this._parsedQueryParameters;
    },

    /**
     * @type {?Array.<Object>}
     */
    get formParameters()
    {
        if (this._parsedFormParameters)
            return this._parsedFormParameters;
        if (!this.requestFormData)
            return null;
        var requestContentType = this.requestContentType();
        if (!requestContentType || !requestContentType.match(/^application\/x-www-form-urlencoded\s*(;.*)?$/i))
            return null;
        this._parsedFormParameters = this._parseParameters(this.requestFormData);
        return this._parsedFormParameters;
    },

    /**
     * @type {string|undefined}
     */
    get responseHttpVersion()
    {
        var match = this.responseHeadersText.match(/^(HTTP\/\d+\.\d+)/);
        return match ? match[1] : undefined;
    },

    /**
     * @param {string} queryString
     * @return {Array.<Object>}
     */
    _parseParameters: function(queryString)
    {
        function parseNameValue(pair)
        {
            var parameter = {};
            var splitPair = pair.split("=", 2);

            parameter.name = splitPair[0];
            if (splitPair.length === 1)
                parameter.value = "";
            else
                parameter.value = splitPair[1];
            return parameter;
        }
        return queryString.split("&").map(parseNameValue);
    },

    /**
     * @param {Object} headers
     * @param {string} headerName
     * @return {string|undefined}
     */
    _headerValue: function(headers, headerName)
    {
        headerName = headerName.toLowerCase();
        for (var header in headers) {
            if (header.toLowerCase() === headerName)
                return headers[header];
        }
    },

    /**
     * @type {Array.<WebInspector.ConsoleMessage>}
     */
    get messages()
    {
        return this._messages || [];
    },

    /**
     * @param {WebInspector.ConsoleMessage} msg
     */
    addMessage: function(msg)
    {
        if (!msg.isErrorOrWarning() || !msg.message)
            return;

        if (!this._messages)
            this._messages = [];
        this._messages.push(msg);
        this.dispatchEventToListeners(WebInspector.Resource.Events.MessageAdded, msg);
    },

    /**
     * @type {number}
     */
    get errors()
    {
        return this._errors || 0;
    },

    set errors(x)
    {
        this._errors = x;
    },

    /**
     * @type {number}
     */
    get warnings()
    {
        return this._warnings || 0;
    },

    set warnings(x)
    {
        this._warnings = x;
    },

    clearErrorsAndWarnings: function()
    {
        this._messages = [];
        this._warnings = 0;
        this._errors = 0;
        this.dispatchEventToListeners(WebInspector.Resource.Events.MessagesCleared);
    },

    /**
     * @type {string}
     */
    get content()
    {
        return this._content;
    },

    /**
     * @type {string}
     */
    get contentEncoded()
    {
        return this._contentEncoded;
    },

    /**
     * @type {number}
     */
    get contentTimestamp()
    {
        return this._contentTimestamp;
    },

    /**
     * @return {boolean}
     */
    isEditable: function()
    {
        if (this._actualResource)
            return false;
        var binding = WebInspector.Resource._domainModelBindings[this.type];
        return binding && binding.canSetContent(this);
    },

    /**
     * @param {string} newContent
     * @param {boolean} majorChange
     * @param {function(string=)} callback
     */
    setContent: function(newContent, majorChange, callback)
    {
        if (!this.isEditable()) {
            if (callback)
                callback("Resource is not editable");
            return;
        }
        var binding = WebInspector.Resource._domainModelBindings[this.type];
        binding.setContent(this, newContent, majorChange, callback);
    },

    /**
     * @param {string} newContent
     * @param {Date=} timestamp
     * @param {boolean=} restoringHistory
     */
    addRevision: function(newContent, timestamp, restoringHistory)
    {
        var revision = new WebInspector.ResourceRevision(this, this._content, this._contentTimestamp);
        this.history.push(revision);

        this._content = newContent;
        this._contentTimestamp = timestamp || new Date();

        this.dispatchEventToListeners(WebInspector.Resource.Events.RevisionAdded, revision);
        if (!restoringHistory)
            this._persistRevision();
        WebInspector.resourceTreeModel.dispatchEventToListeners(WebInspector.ResourceTreeModel.EventTypes.ResourceContentCommitted, { resource: this, content: newContent });
    },

    _persistRevision: function()
    {
        WebInspector.Resource.persistRevision(this);
    },

    /**
     * @param {function(?string, ?string)} callback
     */
    requestContent: function(callback)
    {
        // We do not support content retrieval for WebSockets at the moment.
        // Since WebSockets are potentially long-living, fail requests immediately
        // to prevent caller blocking until resource is marked as finished.
        if (this.type === WebInspector.Resource.Type.WebSocket) {
            callback(null, null);
            return;
        }
        if (typeof this._content !== "undefined") {
            callback(this.content, this._contentEncoded);
            return;
        }
        this._pendingContentCallbacks.push(callback);
        if (this.finished)
            this._innerRequestContent();
    },

    /**
     * @param {string} query
     * @param {boolean} caseSensitive
     * @param {boolean} isRegex
     * @param {function(Array.<PageAgent.SearchMatch>)} callback
     */
    searchInContent: function(query, caseSensitive, isRegex, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @param {Array.<PageAgent.SearchMatch>} searchMatches
         */
        function callbackWrapper(error, searchMatches)
        {
            callback(searchMatches || []);
        }

        if (this.frameId)
            PageAgent.searchInResource(this.frameId, this.url, query, caseSensitive, isRegex, callbackWrapper);
        else
            callback([]);
    },

    /**
     * @param {Element} image
     */
    populateImageSource: function(image)
    {
        function onResourceContent()
        {
            image.src = this._contentURL();
        }

        this.requestContent(onResourceContent.bind(this));
    },

    /**
     * @return {boolean}
     */
    isHttpFamily: function()
    {
        return !!this.url.match(/^https?:/i);
    },

    /**
     * @return {string|undefined}
     */
    requestContentType: function()
    {
        return this.requestHeaderValue("Content-Type");
    },

    /**
     * @return {boolean}
     */
    isPingRequest: function()
    {
        return "text/ping" === this.requestContentType();
    },

    /**
     * @return {boolean}
     */
    hasErrorStatusCode: function()
    {
        return this.statusCode >= 400;
    },

    /**
     * @return {string}
     */
    _contentURL: function()
    {
        const maxDataUrlSize = 1024 * 1024;
        // If resource content is not available or won't fit a data URL, fall back to using original URL.
        if (this._content == null || this._content.length > maxDataUrlSize)
            return this.url;

        return "data:" + this.mimeType + (this._contentEncoded ? ";base64," : ",") + this._content;
    },

    _innerRequestContent: function()
    {
        if (this._contentRequested)
            return;
        this._contentRequested = true;

        function onResourceContent(data, contentEncoded)
        {
            this._contentEncoded = contentEncoded;
            this._content = data;
            this._originalContent = data;
            var callbacks = this._pendingContentCallbacks.slice();
            for (var i = 0; i < callbacks.length; ++i)
                callbacks[i](this._content, this._contentEncoded);
            this._pendingContentCallbacks.length = 0;
            delete this._contentRequested;
        }
        WebInspector.networkManager.requestContent(this, onResourceContent.bind(this));
    }
}

WebInspector.Resource.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @param {WebInspector.Resource} resource
 * @param {string} content
 * @param {number} timestamp
 */
WebInspector.ResourceRevision = function(resource, content, timestamp)
{
    this._resource = resource;
    this._content = content;
    this._timestamp = timestamp;
}

WebInspector.ResourceRevision.prototype = {
    /**
     * @type {WebInspector.Resource}
     */
    get resource()
    {
        return this._resource;
    },

    /**
     * @type {number}
     */
    get timestamp()
    {
        return this._timestamp;
    },

    /**
     * @type {string}
     */
    get content()
    {
        return this._content;
    },

    revertToThis: function()
    {
        function revert(content)
        {
            this._resource.setContent(content, true);
        }
        this.requestContent(revert.bind(this));
    },

    /**
     * @param {function(string)} callback
     */
    requestContent: function(callback)
    {
        if (typeof this._content === "string") {
            callback(this._content);
            return;
        }

        // If we are here, this is initial revision. First, look up content fetched over the wire.
        if (typeof this.resource._originalContent === "string") {
            this._content = this._resource._originalContent;
            callback(this._content);
            return;
        }

        // If unsuccessful, request the content.
        function mycallback(content)
        {
            this._content = content;
            callback(content);
        }
        WebInspector.networkManager.requestContent(this._resource, mycallback.bind(this));
    }
}

/**
 * @interface
 */
WebInspector.ResourceDomainModelBinding = function() { }

WebInspector.ResourceDomainModelBinding.prototype = {
    /**
     * @return {boolean}
     */
    canSetContent: function() { return true; },

    /**
     * @param {WebInspector.Resource} resource
     * @param {string} content
     * @param {boolean} majorChange
     * @param {function(?string)} callback
     */
    setContent: function(resource, content, majorChange, callback) { }
}
