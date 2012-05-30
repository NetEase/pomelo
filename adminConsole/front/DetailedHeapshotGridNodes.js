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

WebInspector.HeapSnapshotGridNode = function(tree, hasChildren)
{
    WebInspector.DataGridNode.call(this, null, hasChildren);
    this._defaultPopulateCount = tree._defaultPopulateCount;
    this._provider = null;
    this.addEventListener("populate", this._populate, this);
}

WebInspector.HeapSnapshotGridNode.prototype = {
    createCell: function(columnIdentifier)
    {
        var cell = WebInspector.DataGridNode.prototype.createCell.call(this, columnIdentifier);
        if (this._searchMatched)
            cell.addStyleClass("highlight");
        return cell;
    },

    dispose: function()
    {
        if (this._provider)
            this._provider.dispose();
        for (var node = this.children[0]; node; node = node.traverseNextNode(true, this, true))
            if (node.dispose)
                node.dispose();
    },

    hasHoverMessage: false,

    queryObjectContent: function(callback)
    {
    },

    _toPercentString: function(num)
    {
        return num.toFixed(0) + "\u2009%"; // \u2009 is a thin space.
    },

    _createValueCell: function(columnIdentifier)
    {
        var cell = document.createElement("td");
        cell.className = columnIdentifier + "-column";
        if (this.dataGrid.snapshot.totalSize !== 0) {
            var div = document.createElement("div");
            var valueSpan = document.createElement("span");
            valueSpan.textContent = this.data[columnIdentifier];
            div.appendChild(valueSpan);
            var percentColumn = columnIdentifier + "-percent";
            if (percentColumn in this.data) {
                var percentSpan = document.createElement("span");
                percentSpan.className = "percent-column";
                percentSpan.textContent = this.data[percentColumn];
                div.appendChild(percentSpan);
            }
            cell.appendChild(div);
        }
        return cell;
    },

    _populate: function(event)
    {
        this.removeEventListener("populate", this._populate, this);
        function sorted(ignored)
        {
            this.populateChildren();
        }
        this._provider.sortAndRewind(this.comparator(), sorted.bind(this));
    },

    populateChildren: function(provider, howMany, atIndex, afterPopulate, suppressNotifyAboutCompletion)
    {
        if (!howMany && provider) {
            howMany = provider.instanceCount;
            provider.instanceCount = 0;
        }
        provider = provider || this._provider;
        if (!("instanceCount" in provider))
            provider.instanceCount = 0;
        howMany = howMany || this._defaultPopulateCount;
        atIndex = atIndex || this.children.length;
        var haveSavedChildren = !!this._savedChildren;
        if (haveSavedChildren) {
            haveSavedChildren = false;
            for (var c in this._savedChildren) {
                haveSavedChildren = true;
                break;
            }
        }

        var part = 0;
        function callSerialize()
        {
            if (part >= howMany)
                return;
            part += this._defaultPopulateCount;
            provider.serializeNextItems(this._defaultPopulateCount, childrenRetrieved.bind(this));
        }
        function childrenRetrieved(items)
        {
            var length = items.totalLength;
            for (var i = 0, l = items.length; i < l; ++i) {
                var item = items[i];
                if (haveSavedChildren) {
                    var hash = this._childHashForEntity(item);
                    if (hash in this._savedChildren) {
                        this.insertChild(this._savedChildren[hash], atIndex++);
                        continue;
                    }
                }
                this.insertChild(this._createChildNode(item, provider, this), atIndex++);
            }
            provider.instanceCount += items.length;
            if (part < howMany) {
                setTimeout(callSerialize.bind(this), 0);
                return;
            }

            if (items.hasNext)
                this.insertChild(new WebInspector.ShowMoreDataGridNode(this.populateChildren.bind(this, provider), this._defaultPopulateCount, length), atIndex++);
            if (afterPopulate)
                afterPopulate();
            if (!suppressNotifyAboutCompletion) {
                function notify()
                {
                    this.dispatchEventToListeners("populate complete");
                }
                setTimeout(notify.bind(this), 0);
            }
        }
        setTimeout(callSerialize.bind(this), 0);
    },

    _saveChildren: function()
    {
        this._savedChildren = {};
        for (var i = 0, childrenCount = this.children.length; i < childrenCount; ++i) {
            var child = this.children[i];
            if (child.expanded)
                this._savedChildren[this._childHashForNode(child)] = child;
        }
    },

    sort: function()
    {
        this.dataGrid.recursiveSortingEnter();
        function afterSort(sorted)
        {
            if (!sorted) {
                this.dataGrid.recursiveSortingLeave();
                return;
            }
            this._saveChildren();
            this.removeChildren();

            function afterPopulate()
            {
                for (var i = 0, l = this.children.length; i < l; ++i) {
                    var child = this.children[i];
                    if (child.expanded)
                        child.sort();
                }
                this.dataGrid.recursiveSortingLeave();
            }
            this.populateChildren(this._provider, null, null, afterPopulate.bind(this));
        }
        this._provider.sortAndRewind(this.comparator(), afterSort.bind(this));
    }
};

WebInspector.HeapSnapshotGridNode.prototype.__proto__ = WebInspector.DataGridNode.prototype;

WebInspector.HeapSnapshotGenericObjectNode = function(tree, node)
{
    WebInspector.HeapSnapshotGridNode.call(this, tree, false);
    this._name = node.name;
    this._type = node.type;
    this._distanceToWindow = node.distanceToWindow;
    this._shallowSize = node.selfSize;
    this._retainedSize = node.retainedSize;
    this.snapshotNodeId = node.id;
    this.snapshotNodeIndex = node.nodeIndex;
    if (this._type === "string")
        this.hasHoverMessage = true;
    else if (this._type === "object" && this.isWindow(this._name)) {
        this._name = this.shortenWindowURL(this._name, false);
        this.hasHoverMessage = true;
    } else if (node.flags & tree.snapshot.nodeFlags.canBeQueried)
        this.hasHoverMessage = true;
    if (node.flags & tree.snapshot.nodeFlags.detachedDOMTreeNode)
        this.detachedDOMTreeNode = true;
};

WebInspector.HeapSnapshotGenericObjectNode.prototype = {
    createCell: function(columnIdentifier)
    {
        var cell = columnIdentifier !== "object" ? this._createValueCell(columnIdentifier) : this._createObjectCell();
        if (this._searchMatched)
            cell.addStyleClass("highlight");
        return cell;
    },

    _createObjectCell: function()
    {
        var cell = document.createElement("td");
        cell.className = "object-column";
        var div = document.createElement("div");
        div.className = "source-code event-properties";
        div.style.overflow = "visible";
        var data = this.data["object"];
        if (this._prefixObjectCell)
            this._prefixObjectCell(div, data);
        var valueSpan = document.createElement("span");
        valueSpan.className = "value console-formatted-" + data.valueStyle;
        valueSpan.textContent = data.value;
        div.appendChild(valueSpan);
        var idSpan = document.createElement("span");
        idSpan.className = "console-formatted-id";
        idSpan.textContent = " @" + data["nodeId"];
        div.appendChild(idSpan);
        if (this._postfixObjectCell)
            this._postfixObjectCell(div, data);
        cell.appendChild(div);
        cell.addStyleClass("disclosure");
        if (this.depth)
            cell.style.setProperty("padding-left", (this.depth * this.dataGrid.indentWidth) + "px");
        return cell;
    },

    get _countPercent()
    {
        return this._count / this.dataGrid.snapshot.nodeCount * 100.0;
    },

    get data()
    {
        var data = this._emptyData();

        var value = this._name;
        var valueStyle = "object";
        switch (this._type) {
        case "string":
            value = "\"" + value + "\"";
            valueStyle = "string";
            break;
        case "regexp":
            value = "/" + value + "/";
            valueStyle = "string";
            break;
        case "closure":
            value = "function" + (value ? " " : "") + value + "()";
            valueStyle = "function";
            break;
        case "number":
            valueStyle = "number";
            break;
        case "hidden":
            valueStyle = "null";
            break;
        case "array":
            if (!value)
                value = "[]";
            else
                value += "[]";
            break;
        };
        if (this.hasHoverMessage)
            valueStyle += " highlight";
        if (value === "Object")
            value = "";
        if (this.detachedDOMTreeNode)
            valueStyle += " detached-dom-tree-node";
        data["object"] = { valueStyle: valueStyle, value: value, nodeId: this.snapshotNodeId };

        var view = this.dataGrid.snapshotView;
        data["distanceToWindow"] =  this._distanceToWindow;
        data["shallowSize"] = Number.withThousandsSeparator(this._shallowSize);
        data["retainedSize"] = Number.withThousandsSeparator(this._retainedSize);
        data["shallowSize-percent"] = this._toPercentString(this._shallowSizePercent);
        data["retainedSize-percent"] = this._toPercentString(this._retainedSizePercent);

        return this._enhanceData ? this._enhanceData(data) : data;
    },

    queryObjectContent: function(callback, objectGroupName)
    {
        if (this._type === "string")
            callback(WebInspector.RemoteObject.fromPrimitiveValue(this._name));
        else {
            function formatResult(error, object)
            {
                if (!error && object.type)
                    callback(WebInspector.RemoteObject.fromPayload(object), !!error);
                else
                    callback(WebInspector.RemoteObject.fromPrimitiveValue(WebInspector.UIString("Not available")));
            }
            ProfilerAgent.getObjectByHeapObjectId(this.snapshotNodeId, objectGroupName, formatResult);
        }
    },

    get _retainedSizePercent()
    {
        return this._retainedSize / this.dataGrid.snapshot.totalSize * 100.0;
    },

    get _shallowSizePercent()
    {
        return this._shallowSize / this.dataGrid.snapshot.totalSize * 100.0;
    },

    updateHasChildren: function()
    {
        function isEmptyCallback(isEmpty)
        {
            this.hasChildren = !isEmpty;
        }
        this._provider.isEmpty(isEmptyCallback.bind(this));
    },

    isWindow: function(fullName)
    {
        return fullName.substr(0, 9) === "Window";
    },

    shortenWindowURL: function(fullName, hasObjectId)
    {
        var startPos = fullName.indexOf("/");
        var endPos = hasObjectId ? fullName.indexOf("@") : fullName.length;
        if (startPos !== -1 && endPos !== -1) {
            var fullURL = fullName.substring(startPos + 1, endPos).trimLeft();
            var url = fullURL.trimURL();
            if (url.length > 40)
                url = url.trimMiddle(40);
            return fullName.substr(0, startPos + 2) + url + fullName.substr(endPos);
        } else
            return fullName;
    }
}

WebInspector.HeapSnapshotGenericObjectNode.prototype.__proto__ = WebInspector.HeapSnapshotGridNode.prototype;

WebInspector.HeapSnapshotObjectNode = function(tree, isFromBaseSnapshot, edge, parentGridNode)
{
    WebInspector.HeapSnapshotGenericObjectNode.call(this, tree, edge.node);
    this._referenceName = edge.name;
    this._referenceType = edge.type;
    this._propertyAccessor = edge.propertyAccessor;
    this._distanceToWindow = edge.distanceToWindow;
    this.showRetainingEdges = tree.showRetainingEdges;
    this._isFromBaseSnapshot = isFromBaseSnapshot;
    this._provider = this._createProvider(!isFromBaseSnapshot ? tree.snapshot : tree.baseSnapshot, edge.nodeIndex, tree);
    this.updateHasChildren(parentGridNode);
}

WebInspector.HeapSnapshotObjectNode.prototype = {
    updateHasChildren: function(parentGridNode)
    {
        this._parentGridNode = parentGridNode;
        var ancestor = parentGridNode;
        while (ancestor) {
            if (ancestor.snapshotNodeId === this.snapshotNodeId) {
                this._cycledWithAncestorGridNode = ancestor;
                return;
            }
            ancestor = ancestor._parentGridNode;
        }
        WebInspector.HeapSnapshotGenericObjectNode.prototype.updateHasChildren.call(this);
    },

    _createChildNode: function(item)
    {
        return new WebInspector.HeapSnapshotObjectNode(this.dataGrid, this._isFromBaseSnapshot, item, this);
    },

    _createProvider: function(snapshot, nodeIndex, tree)
    {
        var showHiddenData = WebInspector.settings.showHeapSnapshotObjectsHiddenProperties.get();
        var filter = "function(edge) {\n" +
            "    return !edge.isInvisible\n" +
            "        && (" + !this.showRetainingEdges + " || (edge.node.id !== 1 && !edge.node.isSynthetic))\n" +
            "        && (" + showHiddenData + " || (!edge.isHidden && !edge.node.isHidden));\n" +
            "}\n";
        if (tree.showRetainingEdges)
            return snapshot.createRetainingEdgesProvider(nodeIndex, filter);
        else
            return snapshot.createEdgesProvider(nodeIndex, filter);
    },

    _childHashForEntity: function(edge)
    {
        var prefix = this.showRetainingEdges ? edge.node.id + "#" : "";
        return prefix + edge.type + "#" + edge.name;
    },

    _childHashForNode: function(childNode)
    {
        var prefix = this.showRetainingEdges ? childNode.snapshotNodeId + "#" : "";
        return prefix + childNode._referenceType + "#" + childNode._referenceName;
    },

    comparator: function()
    {
        var sortAscending = this.dataGrid.sortOrder === "ascending";
        var sortColumnIdentifier = this.dataGrid.sortColumnIdentifier;
        var sortFields = {
            object: ["!edgeName", sortAscending, "retainedSize", false],
            count: ["!edgeName", true, "retainedSize", false],
            shallowSize: ["selfSize", sortAscending, "!edgeName", true],
            retainedSize: ["retainedSize", sortAscending, "!edgeName", true],
            distanceToWindow: ["distanceToWindow", sortAscending, "_name", true]
        }[sortColumnIdentifier] || ["!edgeName", true, "retainedSize", false];
        return WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator(sortFields);
    },

    _emptyData: function()
    {
        return { count: "", addedCount: "", removedCount: "", countDelta: "", addedSize: "", removedSize: "", sizeDelta: "" };
    },

    _enhanceData: function(data)
    {
        var name = this._referenceName;
        if (name === "") name = "(empty)";
        var nameClass = "name";
        switch (this._referenceType) {
        case "context":
            nameClass = "console-formatted-number";
            break;
        case "internal":
        case "hidden":
            nameClass = "console-formatted-null";
            break;
        case "element":
            name = "[" + name + "]";
            break;
        }
        data["object"].nameClass = nameClass;
        data["object"].name = name;
        data["distanceToWindow"] = this._distanceToWindow;
        return data;
    },

    _prefixObjectCell: function(div, data)
    {
        if (this._cycledWithAncestorGridNode)
            div.className += " cycled-ancessor-node";

        var nameSpan = document.createElement("span");
        nameSpan.className = data.nameClass;
        nameSpan.textContent = data.name;
        div.appendChild(nameSpan);

        var separatorSpan = document.createElement("span");
        separatorSpan.className = "grayed";
        separatorSpan.textContent = this.showRetainingEdges ? " in " : " :: ";
        div.appendChild(separatorSpan);
    }
}

WebInspector.HeapSnapshotObjectNode.prototype.__proto__ = WebInspector.HeapSnapshotGenericObjectNode.prototype;

WebInspector.HeapSnapshotInstanceNode = function(tree, baseSnapshot, snapshot, node)
{
    WebInspector.HeapSnapshotGenericObjectNode.call(this, tree, node);
    this._isDeletedNode = !!baseSnapshot;
    this._provider = this._createProvider(baseSnapshot || snapshot, node.nodeIndex);
    this.updateHasChildren();
};

WebInspector.HeapSnapshotInstanceNode.prototype = {
    _createChildNode: function(item)
    {
        return new WebInspector.HeapSnapshotObjectNode(this.dataGrid, this._isDeletedNode, item);
    },

    _createProvider: function(snapshot, nodeIndex)
    {
        var showHiddenData = WebInspector.settings.showHeapSnapshotObjectsHiddenProperties.get();
        return snapshot.createEdgesProvider(
            nodeIndex,
            "function(edge) {" +
            "    return !edge.isInvisible" +
            "        && (" + showHiddenData + " || (!edge.isHidden && !edge.node.isHidden));" +
            "}");
    },

    _childHashForEntity: function(edge)
    {
        return edge.type + "#" + edge.name;
    },

    _childHashForNode: function(childNode)
    {
        return childNode._referenceType + "#" + childNode._referenceName;
    },

    comparator: function()
    {
        var sortAscending = this.dataGrid.sortOrder === "ascending";
        var sortColumnIdentifier = this.dataGrid.sortColumnIdentifier;
        var sortFields = {
            object: ["!edgeName", sortAscending, "retainedSize", false],
            distanceToWindow: ["distanceToWindow", sortAscending, "retainedSize", false],
            count: ["!edgeName", true, "retainedSize", false],
            addedSize: ["selfSize", sortAscending, "!edgeName", true],
            removedSize: ["selfSize", sortAscending, "!edgeName", true],
            shallowSize: ["selfSize", sortAscending, "!edgeName", true],
            retainedSize: ["retainedSize", sortAscending, "!edgeName", true]
        }[sortColumnIdentifier] || ["!edgeName", true, "retainedSize", false];
        return WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator(sortFields);
    },

    _emptyData: function()
    {
        return {count:"", countDelta:"", sizeDelta: ""};
    },

    _enhanceData: function(data)
    {
        if (this._isDeletedNode) {
            data["addedCount"] = "";
            data["addedSize"] = "";
            data["removedCount"] = "\u2022";
            data["removedSize"] = Number.withThousandsSeparator(this._shallowSize);
        } else {
            data["addedCount"] = "\u2022";
            data["addedSize"] = Number.withThousandsSeparator(this._shallowSize);
            data["removedCount"] = "";
            data["removedSize"] = "";
        }
        return data;
    },

    get isDeletedNode()
    {
        return this._isDeletedNode;
    }
}

WebInspector.HeapSnapshotInstanceNode.prototype.__proto__ = WebInspector.HeapSnapshotGenericObjectNode.prototype;

WebInspector.HeapSnapshotConstructorNode = function(tree, className, aggregate, aggregatesKey)
{
    WebInspector.HeapSnapshotGridNode.call(this, tree, aggregate.count > 0);
    this._name = className;
    this._distanceToWindow = aggregate.distanceToWindow;
    this._count = aggregate.count;
    this._shallowSize = aggregate.self;
    this._retainedSize = aggregate.maxRet;
    this._provider = this._createNodesProvider(tree.snapshot, className, aggregatesKey);
}

WebInspector.HeapSnapshotConstructorNode.prototype = {
    createCell: function(columnIdentifier)
    {
        var cell = columnIdentifier !== "object" ? this._createValueCell(columnIdentifier) : WebInspector.HeapSnapshotGridNode.prototype.createCell.call(this, columnIdentifier);
        if (this._searchMatched)
            cell.addStyleClass("highlight");
        return cell;
    },

    _createChildNode: function(item)
    {
        return new WebInspector.HeapSnapshotInstanceNode(this.dataGrid, null, this.dataGrid.snapshot, item);
    },

    _createNodesProvider: function(snapshot, className, aggregatesKey)
    {
        return snapshot.createNodesProviderForClass(className, aggregatesKey);
    },

    comparator: function()
    {
        var sortAscending = this.dataGrid.sortOrder === "ascending";
        var sortColumnIdentifier = this.dataGrid.sortColumnIdentifier;
        var sortFields = {
            object: ["id", sortAscending, "retainedSize", false],
            distanceToWindow: ["distanceToWindow", true, "retainedSize", false],
            count: ["id", true, "retainedSize", false],
            shallowSize: ["selfSize", sortAscending, "id", true],
            retainedSize: ["retainedSize", sortAscending, "id", true]
        }[sortColumnIdentifier];
        return WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator(sortFields);
    },

    _childHashForEntity: function(node)
    {
        return node.id;
    },

    _childHashForNode: function(childNode)
    {
        return childNode.snapshotNodeId;
    },

    get data()
    {
        var data = { object: this._name };
        var view = this.dataGrid.snapshotView;
        data["count"] =  Number.withThousandsSeparator(this._count);
        data["distanceToWindow"] =  this._distanceToWindow;
        data["shallowSize"] = Number.withThousandsSeparator(this._shallowSize);
        data["retainedSize"] = Number.withThousandsSeparator(this._retainedSize);
        data["count-percent"] =  this._toPercentString(this._countPercent);
        data["shallowSize-percent"] = this._toPercentString(this._shallowSizePercent);
        data["retainedSize-percent"] = this._toPercentString(this._retainedSizePercent);
        return data;
    },

    get _countPercent()
    {
        return this._count / this.dataGrid.snapshot.nodeCount * 100.0;
    },

    get _retainedSizePercent()
    {
        return this._retainedSize / this.dataGrid.snapshot.totalSize * 100.0;
    },

    get _shallowSizePercent()
    {
        return this._shallowSize / this.dataGrid.snapshot.totalSize * 100.0;
    }
};

WebInspector.HeapSnapshotConstructorNode.prototype.__proto__ = WebInspector.HeapSnapshotGridNode.prototype;

WebInspector.HeapSnapshotIteratorsTuple = function(it1, it2)
{
    this._it1 = it1;
    this._it2 = it2;
}

WebInspector.HeapSnapshotIteratorsTuple.prototype = {
    dispose: function()
    {
        this._it1.dispose();
        this._it2.dispose();
    },

    sortAndRewind: function(comparator, callback)
    {
        function afterSort(ignored)
        {
            this._it2.sortAndRewind(comparator, callback);
        }
        this._it1.sortAndRewind(comparator, afterSort.bind(this));
    }
};

WebInspector.HeapSnapshotDiffNode = function(tree, className, baseAggregate, aggregate)
{
    WebInspector.HeapSnapshotGridNode.call(this, tree, true);
    this._name = className;
    this._baseIndexes = baseAggregate ? baseAggregate.idxs : [];
    this._indexes = aggregate ? aggregate.idxs : [];
    this._provider = this._createNodesProvider(tree.baseSnapshot, tree.snapshot, aggregate ? aggregate.type : baseAggregate.type, className);
}

WebInspector.HeapSnapshotDiffNode.prototype = {
    calculateDiff: function(dataGrid, callback)
    {
        var diff = dataGrid.snapshot.createDiff(this._name);

        function diffCalculated(diffResult)
        {
            diff.dispose();
            this._addedCount = diffResult.addedCount;
            this._removedCount = diffResult.removedCount;
            this._countDelta = diffResult.countDelta;
            this._addedSize = diffResult.addedSize;
            this._removedSize = diffResult.removedSize;
            this._sizeDelta = diffResult.sizeDelta;
            this._baseIndexes = null;
            this._indexes = null;
            callback(this._addedSize === 0 && this._removedSize === 0);
        }
        function baseSelfSizesReceived(baseSelfSizes)
        {
            diff.pushBaseSelfSizes(baseSelfSizes);
            diff.calculate(diffCalculated.bind(this));
        }
        function baseIdsReceived(baseIds)
        {
            diff.pushBaseIds(baseIds);
            dataGrid.snapshot.pushBaseIds(dataGrid.baseSnapshot.uid, this._name, baseIds);
            dataGrid.baseSnapshot.nodeFieldValuesByIndex("selfSize", this._baseIndexes, baseSelfSizesReceived.bind(this));
        }
        function idsReceived(ids)
        {
            dataGrid.baseSnapshot.pushBaseIds(dataGrid.snapshot.uid, this._name, ids);
        }
        dataGrid.baseSnapshot.nodeFieldValuesByIndex("id", this._baseIndexes, baseIdsReceived.bind(this));
        dataGrid.snapshot.nodeFieldValuesByIndex("id", this._indexes, idsReceived.bind(this));
    },

    _createChildNode: function(item, provider)
    {
        if (provider === this._provider._it1)
            return new WebInspector.HeapSnapshotInstanceNode(this.dataGrid, null, provider.snapshot, item);
        else
            return new WebInspector.HeapSnapshotInstanceNode(this.dataGrid, provider.snapshot, null, item);
    },

    _createNodesProvider: function(baseSnapshot, snapshot, nodeType, nodeClassName)
    {
        var className = this._name;
        return new WebInspector.HeapSnapshotIteratorsTuple(
            createProvider(snapshot, baseSnapshot), createProvider(baseSnapshot, snapshot));

        function createProvider(snapshot, otherSnapshot)
        {
            var otherSnapshotId = otherSnapshot.uid;
            var provider = snapshot.createNodesProvider(
                "function (node) {" +
                "     return node.type === \"" + nodeType + "\" " +
                (nodeClassName !== null ? "&& node.className === \"" + nodeClassName + "\"" : "") +
                "         && !this.baseSnapshotHasNode(" + otherSnapshotId + ", \"" + className + "\", node.id);" +
                "}");
            provider.snapshot = snapshot;
            return provider;
        }
    },

    _childHashForEntity: function(node)
    {
        return node.id;
    },

    _childHashForNode: function(childNode)
    {
        return childNode.snapshotNodeId;
    },

    comparator: function()
    {
        var sortAscending = this.dataGrid.sortOrder === "ascending";
        var sortColumnIdentifier = this.dataGrid.sortColumnIdentifier;
        var sortFields = {
            object: ["id", sortAscending, "selfSize", false],
            addedCount: ["selfSize", sortAscending, "id", true],
            removedCount: ["selfSize", sortAscending, "id", true],
            countDelta: ["selfSize", sortAscending, "id", true],
            addedSize: ["selfSize", sortAscending, "id", true],
            removedSize: ["selfSize", sortAscending, "id", true],
            sizeDelta: ["selfSize", sortAscending, "id", true]
        }[sortColumnIdentifier];
        return WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator(sortFields);
    },

    populateChildren: function(provider, howMany, atIndex, afterPopulate)
    {
        if (!provider && !howMany) {
            var firstProviderPopulated = function()
            {
                WebInspector.HeapSnapshotGridNode.prototype.populateChildren.call(this, this._provider._it2, this._defaultPopulateCount, atIndex, afterPopulate);
            };
            WebInspector.HeapSnapshotGridNode.prototype.populateChildren.call(this, this._provider._it1, this._defaultPopulateCount, atIndex, firstProviderPopulated.bind(this), true);
        } else if (!howMany) {
            var firstProviderPopulated = function()
            {
                WebInspector.HeapSnapshotGridNode.prototype.populateChildren.call(this, this._provider._it2, null, atIndex, afterPopulate);
            };
            WebInspector.HeapSnapshotGridNode.prototype.populateChildren.call(this, this._provider._it1, null, atIndex, firstProviderPopulated.bind(this), true);
        } else
            WebInspector.HeapSnapshotGridNode.prototype.populateChildren.call(this, provider, howMany, atIndex, afterPopulate);
    },

    _signForDelta: function(delta)
    {
        if (delta === 0)
            return "";
        if (delta > 0)
            return "+";
        else
            return "\u2212";  // Math minus sign, same width as plus.
    },

    get data()
    {
        var data = {object: this._name};

        data["addedCount"] = Number.withThousandsSeparator(this._addedCount);
        data["removedCount"] = Number.withThousandsSeparator(this._removedCount);
        data["countDelta"] = this._signForDelta(this._countDelta) + Number.withThousandsSeparator(Math.abs(this._countDelta));
        data["addedSize"] = Number.withThousandsSeparator(this._addedSize);
        data["removedSize"] = Number.withThousandsSeparator(this._removedSize);
        data["sizeDelta"] = this._signForDelta(this._sizeDelta) + Number.withThousandsSeparator(Math.abs(this._sizeDelta));

        return data;
    }
};

WebInspector.HeapSnapshotDiffNode.prototype.__proto__ = WebInspector.HeapSnapshotGridNode.prototype;

WebInspector.HeapSnapshotDominatorObjectNode = function(tree, node)
{
    WebInspector.HeapSnapshotGenericObjectNode.call(this, tree, node);
    this._provider = this._createProvider(tree.snapshot, node.nodeIndex);
    this.updateHasChildren();
};

WebInspector.HeapSnapshotDominatorObjectNode.prototype = {
    _createChildNode: function(item)
    {
        return new WebInspector.HeapSnapshotDominatorObjectNode(this.dataGrid, item);
    },

    _createProvider: function(snapshot, nodeIndex)
    {
        return snapshot.createNodesProviderForDominator(nodeIndex,
            "function (node) { return true; }");
    },

    _childHashForEntity: function(node)
    {
        return node.id;
    },

    _childHashForNode: function(childNode)
    {
        return childNode.snapshotNodeId;
    },

    comparator: function()
    {
        var sortAscending = this.dataGrid.sortOrder === "ascending";
        var sortColumnIdentifier = this.dataGrid.sortColumnIdentifier;
        var sortFields = {
            object: ["id", sortAscending, "retainedSize", false],
            shallowSize: ["selfSize", sortAscending, "id", true],
            retainedSize: ["retainedSize", sortAscending, "id", true]
        }[sortColumnIdentifier];
        return WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator(sortFields);
    },

    _emptyData: function()
    {
        return {};
    }
};

WebInspector.HeapSnapshotDominatorObjectNode.prototype.__proto__ = WebInspector.HeapSnapshotGenericObjectNode.prototype;

function MixInSnapshotNodeFunctions(sourcePrototype, targetPrototype)
{
    targetPrototype._childHashForEntity = sourcePrototype._childHashForEntity;
    targetPrototype._childHashForNode = sourcePrototype._childHashForNode;
    targetPrototype.comparator = sourcePrototype.comparator;
    targetPrototype._createChildNode = sourcePrototype._createChildNode;
    targetPrototype._createProvider = sourcePrototype._createProvider;
    targetPrototype.dispose = sourcePrototype.dispose;
    targetPrototype.populateChildren = sourcePrototype.populateChildren;
    targetPrototype._saveChildren = sourcePrototype._saveChildren;
    targetPrototype.sort = sourcePrototype.sort;
}
