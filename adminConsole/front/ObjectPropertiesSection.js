/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.PropertiesSection}
 * @param {WebInspector.RemoteObject=} object
 * @param {string=} title
 * @param {string=} subtitle
 * @param {string=} emptyPlaceholder
 * @param {boolean=} ignoreHasOwnProperty
 * @param {Array.<WebInspector.RemoteObjectProperty>=} extraProperties
 * @param {function()=} treeElementConstructor
 */
WebInspector.ObjectPropertiesSection = function(object, title, subtitle, emptyPlaceholder, ignoreHasOwnProperty, extraProperties, treeElementConstructor)
{
    this.emptyPlaceholder = (emptyPlaceholder || WebInspector.UIString("No Properties"));
    this.object = object;
    this.ignoreHasOwnProperty = ignoreHasOwnProperty;
    this.extraProperties = extraProperties;
    this.treeElementConstructor = treeElementConstructor || WebInspector.ObjectPropertyTreeElement;
    this.editable = true;
    this.skipProto = false;

    WebInspector.PropertiesSection.call(this, title, subtitle);
}

WebInspector.ObjectPropertiesSection._arrayLoadThreshold = 100;

WebInspector.ObjectPropertiesSection.prototype = {
    onpopulate: function()
    {
        this.update();
    },

    update: function()
    {
        if (this.object.arrayLength() > WebInspector.ObjectPropertiesSection._arrayLoadThreshold) {
            this.propertiesTreeOutline.removeChildren();
            WebInspector.ArrayGroupingTreeElement._populateArray(this.propertiesTreeOutline, this.object, 0, this.object.arrayLength() - 1);
            return;
        }

        function callback(properties)
        {
            if (!properties)
                return;
            this.updateProperties(properties);
        }

        if (this.ignoreHasOwnProperty)
            this.object.getAllProperties(callback.bind(this));
        else
            this.object.getOwnProperties(callback.bind(this));
    },

    updateProperties: function(properties, rootTreeElementConstructor, rootPropertyComparer)
    {
        if (!rootTreeElementConstructor)
            rootTreeElementConstructor = this.treeElementConstructor;

        if (!rootPropertyComparer)
            rootPropertyComparer = WebInspector.ObjectPropertiesSection.CompareProperties;

        if (this.extraProperties)
            for (var i = 0; i < this.extraProperties.length; ++i)
                properties.push(this.extraProperties[i]);

        properties.sort(rootPropertyComparer);

        this.propertiesTreeOutline.removeChildren();

        for (var i = 0; i < properties.length; ++i) {
            if (this.skipProto && properties[i].name === "__proto__")
                continue;
            properties[i].parentObject = this.object;
        }

        this.propertiesForTest = properties;

        for (var i = 0; i < properties.length; ++i)
            this.propertiesTreeOutline.appendChild(new rootTreeElementConstructor(properties[i]));

        if (!this.propertiesTreeOutline.children.length) {
            var title = document.createElement("div");
            title.className = "info";
            title.textContent = this.emptyPlaceholder;
            var infoElement = new TreeElement(title, null, false);
            this.propertiesTreeOutline.appendChild(infoElement);
        }
    }
}

WebInspector.ObjectPropertiesSection.prototype.__proto__ = WebInspector.PropertiesSection.prototype;

WebInspector.ObjectPropertiesSection.CompareProperties = function(propertyA, propertyB)
{
    var a = propertyA.name;
    var b = propertyB.name;
    if (a === "__proto__")
        return 1;
    if (b === "__proto__")
        return -1;

    // if used elsewhere make sure to
    //  - convert a and b to strings (not needed here, properties are all strings)
    //  - check if a == b (not needed here, no two properties can be the same)

    var diff = 0;
    var chunk = /^\d+|^\D+/;
    var chunka, chunkb, anum, bnum;
    while (diff === 0) {
        if (!a && b)
            return -1;
        if (!b && a)
            return 1;
        chunka = a.match(chunk)[0];
        chunkb = b.match(chunk)[0];
        anum = !isNaN(chunka);
        bnum = !isNaN(chunkb);
        if (anum && !bnum)
            return -1;
        if (bnum && !anum)
            return 1;
        if (anum && bnum) {
            diff = chunka - chunkb;
            if (diff === 0 && chunka.length !== chunkb.length) {
                if (!+chunka && !+chunkb) // chunks are strings of all 0s (special case)
                    return chunka.length - chunkb.length;
                else
                    return chunkb.length - chunka.length;
            }
        } else if (chunka !== chunkb)
            return (chunka < chunkb) ? -1 : 1;
        a = a.substring(chunka.length);
        b = b.substring(chunkb.length);
    }
    return diff;
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {WebInspector.RemoteObjectProperty} property
 */
WebInspector.ObjectPropertyTreeElement = function(property)
{
    this.property = property;

    // Pass an empty title, the title gets made later in onattach.
    TreeElement.call(this, "", null, false);
    this.toggleOnClick = true;
    this.selectable = false;
}

WebInspector.ObjectPropertyTreeElement.prototype = {
    onpopulate: function()
    {
        if (this.children.length && !this.shouldRefreshChildren)
            return;

        if (this.property.value.arrayLength() > WebInspector.ObjectPropertiesSection._arrayLoadThreshold) {
            this.removeChildren();
            WebInspector.ArrayGroupingTreeElement._populateArray(this, this.property.value, 0, this.property.value.arrayLength() - 1);
            return;
        }

        function callback(properties)
        {
            this.removeChildren();
            if (!properties)
                return;

            properties.sort(WebInspector.ObjectPropertiesSection.CompareProperties);
            for (var i = 0; i < properties.length; ++i) {
                if (this.treeOutline.section.skipProto && properties[i].name === "__proto__")
                    continue;
                properties[i].parentObject = this.property.value;
                this.appendChild(new this.treeOutline.section.treeElementConstructor(properties[i]));
            }
        }

        this.property.value.getOwnProperties(callback.bind(this));
    },

    ondblclick: function(event)
    {
        if (this.property.writable)
            this.startEditing(event);
    },

    onattach: function()
    {
        this.update();
    },

    update: function()
    {
        this.nameElement = document.createElement("span");
        this.nameElement.className = "name";
        this.nameElement.textContent = this.property.name;
        if (!this.property.enumerable)
            this.nameElement.addStyleClass("dimmed");

        var separatorElement = document.createElement("span");
        separatorElement.className = "separator";
        separatorElement.textContent = ": ";

        this.valueElement = document.createElement("span");
        this.valueElement.className = "value";

        var description = this.property.value.description;
        // Render \n as a nice unicode cr symbol.
        if (this.property.wasThrown)
            this.valueElement.textContent = "[Exception: " + description + "]";
        else if (this.property.value.type === "string" && typeof description === "string") {
            this.valueElement.textContent = "\"" + description.replace(/\n/g, "\u21B5") + "\"";
            this.valueElement._originalTextContent = "\"" + description + "\"";
        } else if (this.property.value.type === "function" && typeof description === "string") {
            this.valueElement.textContent = /.*/.exec(description)[0].replace(/ +$/g, "");
            this.valueElement._originalTextContent = description;
        } else
            this.valueElement.textContent = description;

        if (this.property.value.type === "function")
            this.valueElement.addEventListener("contextmenu", this._functionContextMenuEventFired.bind(this), false);

        if (this.property.wasThrown)
            this.valueElement.addStyleClass("error");
        if (this.property.value.subtype)
            this.valueElement.addStyleClass("console-formatted-" + this.property.value.subtype);
        else if (this.property.value.type)
            this.valueElement.addStyleClass("console-formatted-" + this.property.value.type);
        if (this.property.value.subtype === "node")
            this.valueElement.addEventListener("contextmenu", this._contextMenuEventFired.bind(this), false);

        this.listItemElement.removeChildren();

        this.listItemElement.appendChild(this.nameElement);
        this.listItemElement.appendChild(separatorElement);
        this.listItemElement.appendChild(this.valueElement);
        this.hasChildren = this.property.value.hasChildren && !this.property.wasThrown;
    },

    _contextMenuEventFired: function(event)
    {
        function selectNode(nodeId)
        {
            if (nodeId)
                WebInspector.domAgent.inspectElement(nodeId);
        }

        function revealElement()
        {
            this.property.value.pushNodeToFrontend(selectNode);
        }

        var contextMenu = new WebInspector.ContextMenu();
        contextMenu.appendItem(WebInspector.UIString("Reveal in Elements Panel"), revealElement.bind(this));
        contextMenu.show(event);
    },

    _functionContextMenuEventFired: function(event)
    {
        function didGetDetails(error, response)
        {
            if (error) {
                console.error(error);
                return;
            }
            WebInspector.panels.scripts.showFunctionDefinition(response.location);
        }

        function revealFunction()
        {
            DebuggerAgent.getFunctionDetails(this.property.value.objectId, didGetDetails.bind(this));
        }

        var contextMenu = new WebInspector.ContextMenu();
        contextMenu.appendItem(WebInspector.UIString("Show function definition"), revealFunction.bind(this));
        contextMenu.show(event);
    },

    updateSiblings: function()
    {
        if (this.parent.root)
            this.treeOutline.section.update();
        else
            this.parent.shouldRefreshChildren = true;
    },

    renderPromptAsBlock: function()
    {
        return false;
    },

    /**
     * @param {Event=} event
     */
    elementAndValueToEdit: function(event)
    {
        return [this.valueElement, (typeof this.valueElement._originalTextContent === "string") ? this.valueElement._originalTextContent : undefined];
    },

    startEditing: function(event)
    {
        var elementAndValueToEdit = this.elementAndValueToEdit(event);
        var elementToEdit = elementAndValueToEdit[0];
        var valueToEdit = elementAndValueToEdit[1];

        if (WebInspector.isBeingEdited(elementToEdit) || !this.treeOutline.section.editable || this._readOnly)
            return;

        // Edit original source.
        if (typeof valueToEdit !== "undefined")
            elementToEdit.textContent = valueToEdit;

        var context = { expanded: this.expanded, elementToEdit: elementToEdit, previousContent: elementToEdit.textContent };

        // Lie about our children to prevent expanding on double click and to collapse subproperties.
        this.hasChildren = false;

        this.listItemElement.addStyleClass("editing-sub-part");

        this._prompt = new WebInspector.ObjectPropertyPrompt(this.editingCommitted.bind(this, null, elementToEdit.textContent, context.previousContent, context), this.editingCancelled.bind(this, null, context), this.renderPromptAsBlock());

        function blurListener()
        {
            this.editingCommitted(null, elementToEdit.textContent, context.previousContent, context);
        }

        var proxyElement = this._prompt.attachAndStartEditing(elementToEdit, blurListener.bind(this));
        window.getSelection().setBaseAndExtent(elementToEdit, 0, elementToEdit, 1);
        proxyElement.addEventListener("keydown", this._promptKeyDown.bind(this, context), false);
    },

    editingEnded: function(context)
    {
        this._prompt.detach();
        delete this._prompt;

        this.listItemElement.scrollLeft = 0;
        this.listItemElement.removeStyleClass("editing-sub-part");
        if (context.expanded)
            this.expand();
    },

    editingCancelled: function(element, context)
    {
        this.editingEnded(context);
        this.update();
    },

    editingCommitted: function(element, userInput, previousContent, context)
    {
        if (userInput === previousContent)
            return this.editingCancelled(element, context); // nothing changed, so cancel

        this.editingEnded(context);
        this.applyExpression(userInput, true);
    },

    _promptKeyDown: function(context, event)
    {
        if (isEnterKey(event)) {
            event.consume(true);
            return this.editingCommitted(null, context.elementToEdit.textContent, context.previousContent, context);
        }
        if (event.keyIdentifier === "U+001B") { // Esc
            event.consume();
            return this.editingCancelled(null, context);
        }
    },

    applyExpression: function(expression, updateInterface)
    {
        expression = expression.trim();
        var expressionLength = expression.length;
        function callback(error)
        {
            if (!updateInterface)
                return;

            if (error)
                this.update();

            if (!expressionLength) {
                // The property was deleted, so remove this tree element.
                this.parent.removeChild(this);
            } else {
                // Call updateSiblings since their value might be based on the value that just changed.
                this.updateSiblings();
            }
        };
        this.property.parentObject.setPropertyValue(this.property.name, expression.trim(), callback.bind(this));
    }
}

WebInspector.ObjectPropertyTreeElement.prototype.__proto__ = TreeElement.prototype;

/**
 * @constructor
 * @extends {TreeElement}
 * @param {WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {number} propertyCount
 */
WebInspector.ArrayGroupingTreeElement = function(object, fromIndex, toIndex, propertyCount)
{
    TreeElement.call(this, String.sprintf("[%d \u2026 %d]", fromIndex, toIndex), undefined, true);
    this._fromIndex = fromIndex;
    this._toIndex = toIndex;
    this._object = object;
    this._readOnly = true;
    this._propertyCount = propertyCount;
    this._populated = false;
}

WebInspector.ArrayGroupingTreeElement._bucketThreshold = 20;

/**
 * @param {TreeElement|TreeOutline} treeElement
 * @param {WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 */
WebInspector.ArrayGroupingTreeElement._populateArray = function(treeElement, object, fromIndex, toIndex)
{
    WebInspector.ArrayGroupingTreeElement._populateRanges(treeElement, object, fromIndex, toIndex, true);
}

/**
 * @param {TreeElement|TreeOutline} treeElement
 * @param {WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {boolean} topLevel
 */
WebInspector.ArrayGroupingTreeElement._populateRanges = function(treeElement, object, fromIndex, toIndex, topLevel)
{
    object.callFunctionJSON(packRanges, [{value: fromIndex}, {value: toIndex}, {value: WebInspector.ArrayGroupingTreeElement._bucketThreshold}], callback.bind(this));

    /** @this {Object} */
    function packRanges(fromIndex, toIndex, bucketThreshold)
    {
        var count = 0;
        for (var i = fromIndex; i <= toIndex; ++i) {
            var value = this[i];
            if (typeof value !== "undefined")
                ++count;
        }

        var bucketSize;
        if (count < bucketThreshold)
            bucketSize = count;
        else {
            bucketSize = Math.ceil(count / bucketThreshold);
            if (bucketSize < bucketThreshold)
                bucketSize = Math.floor(Math.sqrt(count));
        }

        var ranges = [];
        count = 0;
        var groupStart = -1;
        var groupEnd = 0;
        for (var i = fromIndex; i <= toIndex; ++i) {
            var value = this[i];
            if (typeof value === "undefined")
                continue;

            if (groupStart === -1)
                groupStart = i;

            groupEnd = i;
            if (++count === bucketSize) {
                ranges.push([groupStart, groupEnd, count]);
                count = 0;
                groupStart = -1;
            }
        }

        if (count > 0)
            ranges.push([groupStart, groupEnd, count]);
        return ranges;
    }

    function callback(ranges)
    {
        if (ranges.length == 1)
            WebInspector.ArrayGroupingTreeElement._populateAsFragment(treeElement, object, ranges[0][0], ranges[0][1]);
        else {
            for (var i = 0; i < ranges.length; ++i) {
                var fromIndex = ranges[i][0];
                var toIndex = ranges[i][1];
                var count = ranges[i][2];
                if (fromIndex == toIndex)
                    WebInspector.ArrayGroupingTreeElement._populateAsFragment(treeElement, object, fromIndex, toIndex);
                else
                    treeElement.appendChild(new WebInspector.ArrayGroupingTreeElement(object, fromIndex, toIndex, count));
            }
        }
        if (topLevel)
            WebInspector.ArrayGroupingTreeElement._populateNonIndexProperties(treeElement, object);
    }
}

/**
 * @param {TreeElement|TreeOutline} treeElement
 * @param {WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 */
WebInspector.ArrayGroupingTreeElement._populateAsFragment = function(treeElement, object, fromIndex, toIndex)
{
    object.callFunction(buildArrayFragment, [{value: fromIndex}, {value: toIndex}], processArrayFragment.bind(this));

    /** @this {Object} */
    function buildArrayFragment(fromIndex, toIndex)
    {
        var result = Object.create(null);
        for (var i = fromIndex; i <= toIndex; ++i) {
            var value = this[i];
            if (typeof value !== "undefined")
                result[i] = value;
        }
        return result;
    }

    function processArrayFragment(arrayFragment)
    {
        arrayFragment.getAllProperties(processProperties.bind(this));
    }

    /** @this {WebInspector.ArrayGroupingTreeElement} */
    function processProperties(properties)
    {
        if (!properties)
            return;

        properties.sort(WebInspector.ObjectPropertiesSection.CompareProperties);
        for (var i = 0; i < properties.length; ++i) {
            properties[i].parentObject = this._object;
            var childTreeElement = new treeElement.treeOutline.section.treeElementConstructor(properties[i]);
            childTreeElement._readOnly = true;
            treeElement.appendChild(childTreeElement);
        }
    }
}

/**
 * @param {TreeElement|TreeOutline} treeElement
 * @param {WebInspector.RemoteObject} object
 */
WebInspector.ArrayGroupingTreeElement._populateNonIndexProperties = function(treeElement, object)
{
    object.callFunction(buildObjectFragment, undefined, processObjectFragment.bind(this));

    /** @this {Object} */
    function buildObjectFragment()
    {
        var result = Object.create(this.__proto__);
        var names = Object.getOwnPropertyNames(this);
        for (var i = 0; i < names.length; ++i) {
            var name = names[i];
            if (!isNaN(name))
                continue;
            var descriptor = Object.getOwnPropertyDescriptor(this, name);
            if (descriptor)
                Object.defineProperty(result, name, descriptor);
        }
        return result;
    }

    function processObjectFragment(arrayFragment)
    {
        arrayFragment.getOwnProperties(processProperties.bind(this));
    }

    /** @this {WebInspector.ArrayGroupingTreeElement} */
    function processProperties(properties)
    {
        if (!properties)
            return;

        properties.sort(WebInspector.ObjectPropertiesSection.CompareProperties);
        for (var i = 0; i < properties.length; ++i) {
            properties[i].parentObject = this._object;
            var childTreeElement = new treeElement.treeOutline.section.treeElementConstructor(properties[i]);
            childTreeElement._readOnly = true;
            treeElement.appendChild(childTreeElement);
        }
    }
}

WebInspector.ArrayGroupingTreeElement.prototype = {
    onpopulate: function()
    {
        if (this._populated)
            return;
        
        this._populated = true;

        if (this._propertyCount >= WebInspector.ArrayGroupingTreeElement._bucketThreshold) {
            WebInspector.ArrayGroupingTreeElement._populateRanges(this, this._object, this._fromIndex, this._toIndex, false);
            return;
        }
        WebInspector.ArrayGroupingTreeElement._populateAsFragment(this, this._object, this._fromIndex, this._toIndex);
    },

    onattach: function()
    {
        this.listItemElement.addStyleClass("name");
    }
}

WebInspector.ArrayGroupingTreeElement.prototype.__proto__ = TreeElement.prototype;

/**
 * @constructor
 * @extends {WebInspector.TextPrompt}
 * @param {boolean=} renderAsBlock
 */
WebInspector.ObjectPropertyPrompt = function(commitHandler, cancelHandler, renderAsBlock)
{
    const ExpressionStopCharacters = " =:[({;,!+-*/&|^<>."; // Same as in ConsoleView.js + "."
    WebInspector.TextPrompt.call(this, WebInspector.consoleView.completionsForTextPrompt.bind(WebInspector.consoleView), ExpressionStopCharacters);
    this.setSuggestBoxEnabled("generic-suggest");
    if (renderAsBlock)
        this.renderAsBlock();
}

WebInspector.ObjectPropertyPrompt.prototype.__proto__ = WebInspector.TextPrompt.prototype;
