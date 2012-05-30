/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
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

/**
 * @constructor
 * @extends {WebInspector.View}
 */
WebInspector.CookieItemsView = function(treeElement, cookieDomain)
{
    WebInspector.View.call(this);

    this.element.addStyleClass("storage-view");

    this._deleteButton = new WebInspector.StatusBarButton(WebInspector.UIString("Delete"), "delete-storage-status-bar-item");
    this._deleteButton.visible = false;
    this._deleteButton.addEventListener("click", this._deleteButtonClicked, this);

    this._refreshButton = new WebInspector.StatusBarButton(WebInspector.UIString("Refresh"), "refresh-storage-status-bar-item");
    this._refreshButton.addEventListener("click", this._refreshButtonClicked, this);

    this._treeElement = treeElement;
    this._cookieDomain = cookieDomain;

    this._emptyView = new WebInspector.EmptyView(WebInspector.UIString("This site has no cookies."));
    this._emptyView.show(this.element);

    this.element.addEventListener("contextmenu", this._contextMenu.bind(this), true);
}

WebInspector.CookieItemsView.prototype = {
    get statusBarItems()
    {
        return [this._refreshButton.element, this._deleteButton.element];
    },

    wasShown: function()
    {
        this._update();
    },

    willHide: function()
    {
        this._deleteButton.visible = false;
    },

    _update: function()
    {
        WebInspector.Cookies.getCookiesAsync(this._updateWithCookies.bind(this));
    },

    _updateWithCookies: function(allCookies, isAdvanced)
    {
        this._cookies = isAdvanced ? this._filterCookiesForDomain(allCookies) : allCookies;

        if (!this._cookies.length) {
            // Nothing to show.
            this._emptyView.show(this.element);
            this._deleteButton.visible = false;
            if (this._cookiesTable)
                this._cookiesTable.detach();
            return;
        }

        if (!this._cookiesTable)
            this._cookiesTable = isAdvanced ? new WebInspector.CookiesTable(this._cookieDomain, false, this._deleteCookie.bind(this), this._update.bind(this)) : new WebInspector.SimpleCookiesTable();

        this._cookiesTable.setCookies(this._cookies);
        this._emptyView.detach();
        this._cookiesTable.show(this.element);
        if (isAdvanced) {
            this._treeElement.subtitle = String.sprintf(WebInspector.UIString("%d cookies (%s)"), this._cookies.length,
                Number.bytesToString(this._totalSize));
            this._deleteButton.visible = true;
        }
    },

    _filterCookiesForDomain: function(allCookies)
    {
        var cookies = [];
        var resourceURLsForDocumentURL = [];
        this._totalSize = 0;

        function populateResourcesForDocuments(resource)
        {
            var url = resource.documentURL.asParsedURL();
            if (url && url.host == this._cookieDomain)
                resourceURLsForDocumentURL.push(resource.url);
        }
        WebInspector.forAllResources(populateResourcesForDocuments.bind(this));

        for (var i = 0; i < allCookies.length; ++i) {
            var pushed = false;
            var size = allCookies[i].size;
            for (var j = 0; j < resourceURLsForDocumentURL.length; ++j) {
                var resourceURL = resourceURLsForDocumentURL[j];
                if (WebInspector.Cookies.cookieMatchesResourceURL(allCookies[i], resourceURL)) {
                    this._totalSize += size;
                    if (!pushed) {
                        pushed = true;
                        cookies.push(allCookies[i]);
                    }
                }
            }
        }
        return cookies;
    },

    _deleteCookie: function(cookie)
    {
        PageAgent.deleteCookie(cookie.name, this._cookieDomain);
        this._update();
    },

    _deleteButtonClicked: function()
    {
        if (this._cookiesTable.selectedCookie)
            this._deleteCookie(this._cookiesTable.selectedCookie);
    },

    _refreshButtonClicked: function(event)
    {
        this._update();
    },

    _contextMenu: function(event)
    {
        if (!this._cookies.length) {
            var contextMenu = new WebInspector.ContextMenu();
            contextMenu.appendItem(WebInspector.UIString("Refresh"), this._update.bind(this));
            contextMenu.show(event);
        }
    }
}

WebInspector.CookieItemsView.prototype.__proto__ = WebInspector.View.prototype;

/**
 * @constructor
 * @extends {WebInspector.View}
 */
WebInspector.SimpleCookiesTable = function()
{
    WebInspector.View.call(this);

    var columns = {};
    columns[0] = {};
    columns[1] = {};
    columns[0].title = WebInspector.UIString("Name");
    columns[1].title = WebInspector.UIString("Value");

    this._dataGrid = new WebInspector.DataGrid(columns);
    this._dataGrid.autoSizeColumns(20, 80);
    this._dataGrid.show(this.element);
}

WebInspector.SimpleCookiesTable.prototype = {
    setCookies: function(cookies)
    {
        this._dataGrid.removeChildren();
        var addedCookies = {};
        for (var i = 0; i < cookies.length; ++i) {
            if (addedCookies[cookies[i].name])
                continue;
            addedCookies[cookies[i].name] = true;
            var data = {};
            data[0] = cookies[i].name;
            data[1] = cookies[i].value;

            var node = new WebInspector.DataGridNode(data, false);
            node.selectable = true;
            this._dataGrid.appendChild(node);
        }
        this._dataGrid.children[0].selected = true;
    }
}

WebInspector.SimpleCookiesTable.prototype.__proto__ = WebInspector.View.prototype;

WebInspector.Cookies = {}

WebInspector.Cookies.getCookiesAsync = function(callback)
{
    function mycallback(error, cookies, cookiesString)
    {
        if (error)
            return;
        if (cookiesString)
            callback(WebInspector.Cookies.buildCookiesFromString(cookiesString), false);
        else
            callback(cookies, true);
    }

    PageAgent.getCookies(mycallback);
}

WebInspector.Cookies.buildCookiesFromString = function(rawCookieString)
{
    var rawCookies = rawCookieString.split(/;\s*/);
    var cookies = [];

    if (!(/^\s*$/.test(rawCookieString))) {
        for (var i = 0; i < rawCookies.length; ++i) {
            var cookie = rawCookies[i];
            var delimIndex = cookie.indexOf("=");
            var name = cookie.substring(0, delimIndex);
            var value = cookie.substring(delimIndex + 1);
            var size = name.length + value.length;
            cookies.push({ name: name, value: value, size: size });
        }
    }

    return cookies;
}

WebInspector.Cookies.cookieMatchesResourceURL = function(cookie, resourceURL)
{
    var url = resourceURL.asParsedURL();
    if (!url || !WebInspector.Cookies.cookieDomainMatchesResourceDomain(cookie.domain, url.host))
        return false;
    return (url.path.indexOf(cookie.path) === 0
        && (!cookie.port || url.port == cookie.port)
        && (!cookie.secure || url.scheme === "https"));
}

WebInspector.Cookies.cookieDomainMatchesResourceDomain = function(cookieDomain, resourceDomain)
{
    if (cookieDomain.charAt(0) !== '.')
        return resourceDomain === cookieDomain;
    return !!resourceDomain.match(new RegExp("^([^\\.]+\\.)?" + cookieDomain.substring(1).escapeForRegExp() + "$"), "i");
}
