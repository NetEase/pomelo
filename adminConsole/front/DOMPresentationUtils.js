/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
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

WebInspector.DOMPresentationUtils = {}

WebInspector.DOMPresentationUtils.decorateNodeLabel = function(node, parentElement)
{
    var title = node.nodeNameInCorrectCase();

    var nameElement = document.createElement("span");
    nameElement.textContent = title;
    parentElement.appendChild(nameElement);

    var idAttribute = node.getAttribute("id");
    if (idAttribute) {
        var idElement = document.createElement("span");
        parentElement.appendChild(idElement);

        var part = "#" + idAttribute;
        title += part;
        idElement.appendChild(document.createTextNode(part));

        // Mark the name as extra, since the ID is more important.
        nameElement.className = "extra";
    }

    var classAttribute = node.getAttribute("class");
    if (classAttribute) {
        var classes = classAttribute.split(/\s+/);
        var foundClasses = {};

        if (classes.length) {
            var classesElement = document.createElement("span");
            classesElement.className = "extra";
            parentElement.appendChild(classesElement);

            for (var i = 0; i < classes.length; ++i) {
                var className = classes[i];
                if (className && !(className in foundClasses)) {
                    var part = "." + className;
                    title += part;
                    classesElement.appendChild(document.createTextNode(part));
                    foundClasses[className] = true;
                }
            }
        }
    }
    parentElement.title = title;
}

WebInspector.DOMPresentationUtils.linkifyNodeReference = function(node)
{
    var link = document.createElement("span");
    link.className = "node-link";
    WebInspector.DOMPresentationUtils.decorateNodeLabel(node, link);

    link.addEventListener("click", WebInspector.domAgent.inspectElement.bind(WebInspector.domAgent, node.id), false);
    link.addEventListener("mouseover", WebInspector.domAgent.highlightDOMNode.bind(WebInspector.domAgent, node.id, ""), false);
    link.addEventListener("mouseout", WebInspector.domAgent.hideDOMNodeHighlight.bind(WebInspector.domAgent), false);

    return link;
}

WebInspector.DOMPresentationUtils.linkifyNodeById = function(nodeId)
{
    var node = WebInspector.domAgent.nodeForId(nodeId);
    if (!node)
        return document.createTextNode(WebInspector.UIString("<node>"));
    return WebInspector.DOMPresentationUtils.linkifyNodeReference(node);
}
