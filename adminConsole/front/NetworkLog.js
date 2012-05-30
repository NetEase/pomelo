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
WebInspector.NetworkLog = function()
{
    this._resources = [];
    WebInspector.networkManager.addEventListener(WebInspector.NetworkManager.EventTypes.ResourceStarted, this._onResourceStarted, this);
    WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.MainFrameNavigated, this._onMainFrameNavigated, this);
    WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.OnLoad, this._onLoad, this);
    WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.DOMContentLoaded, this._onDOMContentLoaded, this);
}

WebInspector.NetworkLog.prototype = {
    /**
     * @return {Array.<WebInspector.Resource>}
     */
    get resources()
    {
        return this._resources;
    },

    /**
     * @param {WebInspector.Resource} resource
     * @return {WebInspector.PageLoad}
     */
    pageLoadForResource: function(resource)
    {
        return resource.__page;
    },

    /**
     * @param {WebInspector.Event} event
     */
    _onMainFrameNavigated: function(event)
    {
        var mainFrame = /** type {WebInspector.ResourceTreeFrame} */ event.data;
        // Preserve resources from the new session.
        this._currentPageLoad = null;
        var oldResources = this._resources.splice(0, this._resources.length);
        for (var i = 0; i < oldResources.length; ++i) {
            var resource = oldResources[i];
            if (resource.loaderId === mainFrame.loaderId) {
                if (!this._currentPageLoad)
                    this._currentPageLoad = new WebInspector.PageLoad(resource);
                this._resources.push(resource);
                resource.__page = this._currentPageLoad;
            }
        }
    },

    /**
     * @param {WebInspector.Event} event
     */
    _onResourceStarted: function(event)
    {
        var resource = /** @type {WebInspector.Resource} */ event.data;
        this._resources.push(resource);
        resource.__page = this._currentPageLoad;
    },

    /**
     * @param {WebInspector.Event} event
     */
    _onDOMContentLoaded: function(event)
    {
        if (this._currentPageLoad)
            this._currentPageLoad.contentLoadTime = event.data;
    },

    /**
     * @param {WebInspector.Event} event
     */
    _onLoad: function(event)
    {
        if (this._currentPageLoad)
            this._currentPageLoad.loadTime = event.data;
    },

}

/**
 * @type {WebInspector.NetworkLog}
 */
WebInspector.networkLog = null;

/**
 * @constructor
 * @param {WebInspector.Resource} mainResource
 */
WebInspector.PageLoad = function(mainResource)
{
    this.id = ++WebInspector.PageLoad._lastIdentifier;
    this.url = mainResource.url;
    this.startTime = mainResource.startTime;
}

WebInspector.PageLoad._lastIdentifier = 0;
