/*
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
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
 * @param {string} url
 * @return {?WebInspector.Resource}
 */
WebInspector.resourceForURL = function(url)
{
    return WebInspector.resourceTreeModel.resourceForURL(url);
}

/**
 * @param {function(WebInspector.Resource)} callback
 */
WebInspector.forAllResources = function(callback)
{
     WebInspector.resourceTreeModel.forAllResources(callback);
}

/**
 * @param {string} url
 * @return {string}
 */
WebInspector.displayNameForURL = function(url)
{
    if (!url)
        return "";

    var resource = WebInspector.resourceForURL(url);
    if (resource)
        return resource.displayName;

    if (!WebInspector.inspectedPageURL)
        return url.trimURL("");

    var parsedURL = WebInspector.inspectedPageURL.asParsedURL();
    var lastPathComponent = parsedURL.lastPathComponent;
    var index = WebInspector.inspectedPageURL.indexOf(lastPathComponent);
    if (index !== -1 && index + lastPathComponent.length === WebInspector.inspectedPageURL.length) {
        var baseURL = WebInspector.inspectedPageURL.substring(0, index);
        if (url.indexOf(baseURL) === 0)
            return url.substring(index);
    }

    return url.trimURL(parsedURL.host);
}

/**
 * @param {string} string
 * @param {function(string,string,string=):Node} linkifier
 * @return {DocumentFragment}
 */
WebInspector.linkifyStringAsFragmentWithCustomLinkifier = function(string, linkifier)
{
    var container = document.createDocumentFragment();
    var linkStringRegEx = /(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\/\/|www\.)[\w$\-_+*'=\|\/\\(){}[\]%@&#~,:;.!?]{2,}[\w$\-_+*=\|\/\\({%@&#~]/;
    var lineColumnRegEx = /:(\d+)(:(\d+))?$/;

    while (string) {
        var linkString = linkStringRegEx.exec(string);
        if (!linkString)
            break;

        linkString = linkString[0];
        var linkIndex = string.indexOf(linkString);
        var nonLink = string.substring(0, linkIndex);
        container.appendChild(document.createTextNode(nonLink));

        var title = linkString;
        var realURL = (linkString.indexOf("www.") === 0 ? "http://" + linkString : linkString);
        var lineColumnMatch = lineColumnRegEx.exec(realURL);
        if (lineColumnMatch)
            realURL = realURL.substring(0, realURL.length - lineColumnMatch[0].length);

        var linkNode = linkifier(title, realURL, lineColumnMatch ? lineColumnMatch[1] : undefined);
        container.appendChild(linkNode);
        string = string.substring(linkIndex + linkString.length, string.length);
    }

    if (string)
        container.appendChild(document.createTextNode(string));

    return container;
}

WebInspector._linkifierPlugins = [];

/**
 * @param {function(string):string} plugin
 */
WebInspector.registerLinkifierPlugin = function(plugin)
{
    WebInspector._linkifierPlugins.push(plugin);
}

/**
 * @param {string} string
 * @return {DocumentFragment}
 */
WebInspector.linkifyStringAsFragment = function(string)
{
    function linkifier(title, url, lineNumber)
    {
        for (var i = 0; i < WebInspector._linkifierPlugins.length; ++i)
            title = WebInspector._linkifierPlugins[i](title);

        var isExternal = !WebInspector.resourceForURL(url);
        var urlNode = WebInspector.linkifyURLAsNode(url, title, undefined, isExternal);
        if (typeof(lineNumber) !== "undefined") {
            urlNode.lineNumber = lineNumber;
            urlNode.preferredPanel = "scripts";
        }
        
        return urlNode; 
    }
    
    return WebInspector.linkifyStringAsFragmentWithCustomLinkifier(string, linkifier);
}

/**
 * @param {string} url
 * @param {string=} linkText
 * @param {string=} classes
 * @param {boolean=} isExternal
 * @param {string=} tooltipText
 * @return {Element}
 */
WebInspector.linkifyURLAsNode = function(url, linkText, classes, isExternal, tooltipText)
{
    if (!linkText)
        linkText = url;
    classes = (classes ? classes + " " : "");
    classes += isExternal ? "webkit-html-external-link" : "webkit-html-resource-link";

    var a = document.createElement("a");
    a.href = url;
    a.className = classes;
    if (typeof tooltipText === "undefined")
        a.title = url;
    else if (typeof tooltipText !== "string" || tooltipText.length)
        a.title = tooltipText;
    a.textContent = linkText;
    a.style.maxWidth = "100%";
    if (isExternal)
        a.setAttribute("target", "_blank");

    return a;
}

/**
 * @param {string} url
 * @param {number=} lineNumber
 * @return {string}
 */
WebInspector.formatLinkText = function(url, lineNumber)
{
    var text = WebInspector.displayNameForURL(url);
    if (typeof lineNumber === "number")
        text += ":" + (lineNumber + 1);
    return text;
}

/**
 * @param {string} url
 * @param {number=} lineNumber
 * @param {string=} classes
 * @param {string=} tooltipText
 * @return {Element}
 */
WebInspector.linkifyResourceAsNode = function(url, lineNumber, classes, tooltipText)
{
    var linkText = WebInspector.formatLinkText(url, lineNumber);
    var anchor = WebInspector.linkifyURLAsNode(url, linkText, classes, false, tooltipText);
    anchor.preferredPanel = "resources";
    anchor.lineNumber = lineNumber;
    return anchor;
}

/**
 * @param {WebInspector.Resource} request
 * @param {string=} classes
 * @return {Element}
 */
WebInspector.linkifyRequestAsNode = function(request, classes)
{
    var anchor = WebInspector.linkifyURLAsNode(request.url);
    anchor.preferredPanel = "network";
    anchor.requestId  = request.requestId;
    return anchor;
}

/**
 * @return {?string} null if the specified resource MUST NOT have a URL (e.g. "javascript:...")
 */
WebInspector.resourceURLForRelatedNode = function(node, url)
{
    if (!url || url.indexOf("://") > 0)
        return url;

    if (url.trim().indexOf("javascript:") === 0)
        return null; // Do not provide a resource URL for security.

    for (var frameOwnerCandidate = node; frameOwnerCandidate; frameOwnerCandidate = frameOwnerCandidate.parentNode) {
        if (frameOwnerCandidate.documentURL) {
            var result = WebInspector.completeURL(frameOwnerCandidate.documentURL, url);
            if (result)
                return result;
            break;
        }
    }

    // documentURL not found or has bad value
    var resourceURL = url;
    function callback(resource)
    {
        if (resource.path === url) {
            resourceURL = resource.url;
            return true;
        }
    }
    WebInspector.forAllResources(callback);
    return resourceURL;
}

/**
 * @param {string} baseURL
 * @param {string} href
 * @return {?string}
 */
WebInspector.completeURL = function(baseURL, href)
{
    if (href) {
        // Return absolute URLs as-is.
        var parsedHref = href.asParsedURL();
        if (parsedHref && parsedHref.scheme)
            return href;

        // Return special URLs as-is.
        var trimmedHref = href.trim();
        if (trimmedHref.indexOf("data:") === 0 || trimmedHref.indexOf("javascript:") === 0)
            return href;
    }

    var parsedURL = baseURL.asParsedURL();
    if (parsedURL) {
        var path = href;
        if (path.charAt(0) !== "/") {
            var basePath = parsedURL.path;

            // Trim off the query part of the basePath.
            var questionMarkIndex = basePath.indexOf("?");
            if (questionMarkIndex > 0)
                basePath = basePath.substring(0, questionMarkIndex);
            // A href of "?foo=bar" implies "basePath?foo=bar".
            // With "basePath?a=b" and "?foo=bar" we should get "basePath?foo=bar".
            var prefix;
            if (path.charAt(0) === "?") {
                var basePathCutIndex = basePath.indexOf("?");
                if (basePathCutIndex !== -1)
                    prefix = basePath.substring(0, basePathCutIndex);
                else
                    prefix = basePath;
            } else
                prefix = basePath.substring(0, basePath.lastIndexOf("/")) + "/";

            path = prefix + path;
        } else if (path.length > 1 && path.charAt(1) === "/") {
            // href starts with "//" which is a full URL with the protocol dropped (use the baseURL protocol).
            return parsedURL.scheme + ":" + path;
        }
        return parsedURL.scheme + "://" + parsedURL.host + (parsedURL.port ? (":" + parsedURL.port) : "") + path;
    }
    return null;
}
