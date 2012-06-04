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

WebInspector.Uint32Array = function(size)
{
    const preallocateSize = 1000;
    size = size || preallocateSize;
    this._usedSize = 0;
    this._array = new Uint32Array(preallocateSize);
}

WebInspector.Uint32Array.prototype = {
    push: function(value)
    {
        if (this._usedSize + 1 > this._array.length) {
            var tempArray = new Uint32Array(this._array.length * 2);
            tempArray.set(this._array);
            this._array = tempArray;
        }
        this._array[this._usedSize++] = value;
    },

    get array()
    {
        return this._array.subarray(0, this._usedSize);
    }
}

WebInspector.HeapSnapshotLoader = function()
{
    this._json = "";
    this._state = "find-snapshot-info";
    this._snapshot = {};
}

WebInspector.HeapSnapshotLoader.prototype = {
    _findBalancedCurlyBrackets: function()
    {
        var counter = 0;
        var openingBracket = "{".charCodeAt(0), closingBracket = "}".charCodeAt(0);
        for (var i = 0, l = this._json.length; i < l; ++i) {
            var character = this._json.charCodeAt(i);
            if (character === openingBracket)
                ++counter;
            else if (character === closingBracket) {
                if (--counter === 0)
                    return i + 1;
            }
        }
        return -1;
    },

    finishLoading: function()
    {
        if (!this._json)
            return null;
        this._parseStringsArray();
        this._json = "";
        var result = new WebInspector.HeapSnapshot(this._snapshot);
        this._json = "";
        this._snapshot = {};
        return result;
    },

    _parseNodes: function()
    {
        var index = 0;
        var char0 = "0".charCodeAt(0), char9 = "9".charCodeAt(0), closingBracket = "]".charCodeAt(0);
        var length = this._json.length;
        while (true) {
            while (index < length) {
                var code = this._json.charCodeAt(index);
                if (char0 <= code && code <= char9)
                    break;
                else if (code === closingBracket) {
                    this._json = this._json.slice(index + 1);
                    this._snapshot.nodes = this._nodes.array;
                    return false;
                }
                ++index;
            }
            if (index === length) {
                this._json = "";
                return true;
            }
            var nextNumber = 0;
            var startIndex = index;
            while (index < length) {
                var code = this._json.charCodeAt(index);
                if (char0 > code || code > char9)
                    break;
                nextNumber *= 10;
                nextNumber += (code - char0);
                ++index;
            }
            if (index === length) {
                this._json = this._json.slice(startIndex);
                return true;
            }
            this._nodes.push(nextNumber);
        }
    },

    _parseStringsArray: function()
    {
        var closingBracketIndex = this._json.lastIndexOf("]");
        if (closingBracketIndex === -1)
            throw new Error("Incomplete JSON");
        this._json = this._json.slice(0, closingBracketIndex + 1);
        this._snapshot.strings = JSON.parse(this._json);
    },

    pushJSONChunk: function(chunk)
    {
        this._json += chunk;
        switch (this._state) {
        case "find-snapshot-info": {
            var snapshotToken = "\"snapshot\"";
            var snapshotTokenIndex = this._json.indexOf(snapshotToken);
            if (snapshotTokenIndex === -1)
                throw new Error("Snapshot token not found");
            this._json = this._json.slice(snapshotTokenIndex + snapshotToken.length + 1);
            this._state = "parse-snapshot-info";
            this.pushJSONChunk("");
            break;
        }
        case "parse-snapshot-info": {
            var closingBracketIndex = this._findBalancedCurlyBrackets();
            if (closingBracketIndex === -1)
                return;
            this._snapshot.snapshot = JSON.parse(this._json.slice(0, closingBracketIndex));
            this._json = this._json.slice(closingBracketIndex);
            this._state = "find-nodes";
            this.pushJSONChunk("");
            break;
        }
        case "find-nodes": {
            var nodesToken = "\"nodes\"";
            var nodesTokenIndex = this._json.indexOf(nodesToken);
            if (nodesTokenIndex === -1)
                return;
            var bracketIndex = this._json.indexOf("[", nodesTokenIndex);
            if (bracketIndex === -1)
                return;
            this._json = this._json.slice(bracketIndex + 1);
            this._state = "parse-nodes-meta-info";
            this.pushJSONChunk("");
            break;
        }
        case "parse-nodes-meta-info": {
            var closingBracketIndex = this._findBalancedCurlyBrackets();
            if (closingBracketIndex === -1)
                return;
            this._nodes = new WebInspector.Uint32Array();
            this._nodes.push(0);
            this._snapshot.metaNode = JSON.parse(this._json.slice(0, closingBracketIndex));
            this._json = this._json.slice(closingBracketIndex);
            this._state = "parse-nodes";
            this.pushJSONChunk("");
            break;
        }
        case "parse-nodes": {
            if (this._parseNodes())
                return;
            this._state = "find-strings";
            this.pushJSONChunk("");
            break;
        }
        case "find-strings": {
            var stringsToken = "\"strings\"";
            var stringsTokenIndex = this._json.indexOf(stringsToken);
            if (stringsTokenIndex === -1)
                return;
            var bracketIndex = this._json.indexOf("[", stringsTokenIndex);
            if (bracketIndex === -1)
                return;
            this._json = this._json.slice(bracketIndex);
            this._state = "accumulate-strings";
            break;
        }
        case "accumulate-strings":
            break;
        }
    }
};

WebInspector.HeapSnapshotArraySlice = function(array, start, end)
{
    this._array = array;
    this._start = start;
    this.length = end - start;
}

WebInspector.HeapSnapshotArraySlice.prototype = {
    item: function(index)
    {
        return this._array[this._start + index];
    },

    slice: function(start, end)
    {
        if (typeof end === "undefined")
            end = this.length;
        return this._array.subarray(this._start + start, this._start + end);
    }
}

WebInspector.HeapSnapshotEdge = function(snapshot, edges, edgeIndex)
{
    this._snapshot = snapshot;
    this._edges = edges;
    this.edgeIndex = edgeIndex || 0;
}

WebInspector.HeapSnapshotEdge.prototype = {
    clone: function()
    {
        return new WebInspector.HeapSnapshotEdge(this._snapshot, this._edges, this.edgeIndex);
    },

    get hasStringName()
    {
        if (!this.isShortcut)
            return this._hasStringName;
        return isNaN(parseInt(this._name, 10));
    },

    get isElement()
    {
        return this._type() === this._snapshot._edgeElementType;
    },

    get isHidden()
    {
        return this._type() === this._snapshot._edgeHiddenType;
    },

    get isWeak()
    {
        return this._type() === this._snapshot._edgeWeakType;
    },

    get isInternal()
    {
        return this._type() === this._snapshot._edgeInternalType;
    },

    get isInvisible()
    {
        return this._type() === this._snapshot._edgeInvisibleType;
    },

    get isShortcut()
    {
        return this._type() === this._snapshot._edgeShortcutType;
    },

    get name()
    {
        if (!this.isShortcut)
            return this._name;
        var numName = parseInt(this._name, 10);
        return isNaN(numName) ? this._name : numName;
    },

    get node()
    {
        return new WebInspector.HeapSnapshotNode(this._snapshot, this.nodeIndex);
    },

    get nodeIndex()
    {
        return this._edges.item(this.edgeIndex + this._snapshot._edgeToNodeOffset);
    },

    get rawEdges()
    {
        return this._edges;
    },

    toString: function()
    {
        switch (this.type) {
        case "context": return "->" + this.name;
        case "element": return "[" + this.name + "]";
        case "weak": return "[[" + this.name + "]]";
        case "property":
            return this.name.indexOf(" ") === -1 ? "." + this.name : "[\"" + this.name + "\"]";
        case "shortcut":
            var name = this.name;
            if (typeof name === "string")
                return this.name.indexOf(" ") === -1 ? "." + this.name : "[\"" + this.name + "\"]";
            else
                return "[" + this.name + "]";
        case "internal":
        case "hidden":
        case "invisible":
            return "{" + this.name + "}";
        };
        return "?" + this.name + "?";
    },

    get type()
    {
        return this._snapshot._edgeTypes[this._type()];
    },

    get _hasStringName()
    {
        return !this.isElement && !this.isHidden && !this.isWeak;
    },

    get _name()
    {
        return this._hasStringName ? this._snapshot._strings[this._nameOrIndex] : this._nameOrIndex;
    },

    get _nameOrIndex()
    {
        return this._edges.item(this.edgeIndex + this._snapshot._edgeNameOffset);
    },

    _type: function()
    {
        return this._edges.item(this.edgeIndex + this._snapshot._edgeTypeOffset);
    }
};

WebInspector.HeapSnapshotEdgeIterator = function(edge)
{
    this.edge = edge;
}

WebInspector.HeapSnapshotEdgeIterator.prototype = {
    first: function()
    {
        this.edge.edgeIndex = 0;
    },

    hasNext: function()
    {
        return this.edge.edgeIndex < this.edge._edges.length;
    },

    get index()
    {
        return this.edge.edgeIndex;
    },

    set index(newIndex)
    {
        this.edge.edgeIndex = newIndex;
    },

    get item()
    {
        return this.edge;
    },

    next: function()
    {
        this.edge.edgeIndex += this.edge._snapshot._edgeFieldsCount;
    }
};

WebInspector.HeapSnapshotRetainerEdge = function(snapshot, retainers, retainerIndex)
{
    this._snapshot = snapshot;
    this._retainers = retainers;
    this.retainerIndex = retainerIndex || 0;
}

WebInspector.HeapSnapshotRetainerEdge.prototype = {
    clone: function()
    {
        return new WebInspector.HeapSnapshotRetainerEdge(this._snapshot, this._retainers, this.retainerIndex);
    },

    get hasStringName()
    {
        return this._edge.hasStringName;
    },

    get isElement()
    {
        return this._edge.isElement;
    },

    get isHidden()
    {
        return this._edge.isHidden;
    },

    get isInternal()
    {
        return this._edge.isInternal;
    },

    get isInvisible()
    {
        return this._edge.isInvisible;
    },

    get isShortcut()
    {
        return this._edge.isShortcut;
    },

    get isWeak()
    {
        return this._edge.isWeak;
    },

    get name()
    {
        return this._edge.name;
    },

    get node()
    {
        return this._node;
    },

    get nodeIndex()
    {
        return this._nodeIndex;
    },

    get retainerIndex()
    {
        return this._retainerIndex;
    },

    set retainerIndex(newIndex)
    {
        if (newIndex !== this._retainerIndex) {
            this._retainerIndex = newIndex;
            this.edgeIndex = newIndex;
        }
    },

    set edgeIndex(edgeIndex)
    {
        this._globalEdgeIndex = this._retainers.item(edgeIndex);
        this._nodeIndex = this._snapshot._findNearestNodeIndex(this._globalEdgeIndex);
        delete this._edgeInstance;
        delete this._nodeInstance;
    },

    get _node()
    {
        if (!this._nodeInstance)
            this._nodeInstance = new WebInspector.HeapSnapshotNode(this._snapshot, this._nodeIndex);
        return this._nodeInstance;
    },

    get _edge()
    {
        if (!this._edgeInstance) {
            var edgeIndex = this._globalEdgeIndex - this._nodeIndex - this._snapshot._firstEdgeOffset;
            this._edgeInstance = new WebInspector.HeapSnapshotEdge(this._snapshot, this._node.rawEdges, edgeIndex);
        }
        return this._edgeInstance;
    },

    toString: function()
    {
        return this._edge.toString();
    },

    get type()
    {
        return this._edge.type;
    }
}

WebInspector.HeapSnapshotRetainerEdgeIterator = function(retainer)
{
    this.retainer = retainer;
}

WebInspector.HeapSnapshotRetainerEdgeIterator.prototype = {
    first: function()
    {
        this.retainer.retainerIndex = 0;
    },

    hasNext: function()
    {
        return this.retainer.retainerIndex < this.retainer._retainers.length;
    },

    get index()
    {
        return this.retainer.retainerIndex;
    },

    set index(newIndex)
    {
        this.retainer.retainerIndex = newIndex;
    },

    get item()
    {
        return this.retainer;
    },

    next: function()
    {
        ++this.retainer.retainerIndex;
    }
};

WebInspector.HeapSnapshotNode = function(snapshot, nodeIndex)
{
    this._snapshot = snapshot;
    this._firstNodeIndex = nodeIndex;
    this.nodeIndex = nodeIndex;
}

WebInspector.HeapSnapshotNode.prototype = {
    get canBeQueried()
    {
        var flags = this._snapshot._flagsOfNode(this);
        return !!(flags & this._snapshot._nodeFlags.canBeQueried);
    },

    get distanceToWindow()
    {
        return this._snapshot._distancesToWindow[this.nodeIndex];
    },

    get className()
    {
        switch (this.type) {
        case "hidden":
            return WebInspector.UIString("(system)");
        case "object":
        case "native":
            return this.name;
        case "code":
            return WebInspector.UIString("(compiled code)");
        default:
            return "(" + this.type + ")";
        }
    },

    get classIndex()
    {
        var type = this._type();
        switch (type) {
        case this._snapshot._nodeObjectType:
        case this._snapshot._nodeNativeType:
            return this._name();
        default:
            return -1 - type;
        }
    },

    get dominatorIndex()
    {
        return this._nodes[this.nodeIndex + this._snapshot._dominatorOffset];
    },

    get edges()
    {
        return new WebInspector.HeapSnapshotEdgeIterator(new WebInspector.HeapSnapshotEdge(this._snapshot, this.rawEdges));
    },

    get edgesCount()
    {
        return this._nodes[this.nodeIndex + this._snapshot._edgesCountOffset];
    },

    get flags()
    {
        return this._snapshot._flagsOfNode(this);
    },

    get id()
    {
        return this._nodes[this.nodeIndex + this._snapshot._nodeIdOffset];
    },

    get isHidden()
    {
        return this._type() === this._snapshot._nodeHiddenType;
    },

    get isNative()
    {
        return this._type() === this._snapshot._nodeNativeType;
    },

    get isSynthetic()
    {
        return this._type() === this._snapshot._nodeSyntheticType;
    },

    get isWindow()
    {
        const windowRE = /^Window/;
        return windowRE.test(this.name);
    },

    get isDetachedDOMTreesRoot()
    {
        return this.name === "(Detached DOM trees)";
    },

    get isDetachedDOMTree()
    {
        const detachedDOMTreeRE = /^Detached DOM tree/;
        return detachedDOMTreeRE.test(this.className);
    },

    get isRoot()
    {
        return this.nodeIndex === this._snapshot._rootNodeIndex;
    },

    get name()
    {
        return this._snapshot._strings[this._name()];
    },

    get rawEdges()
    {
        var firstEdgeIndex = this._firstEdgeIndex();
        return new WebInspector.HeapSnapshotArraySlice(this._snapshot._nodes, firstEdgeIndex, firstEdgeIndex + this.edgesCount * this._snapshot._edgeFieldsCount);
    },

    get retainedSize()
    {
        return this._nodes[this.nodeIndex + this._snapshot._nodeRetainedSizeOffset];
    },

    get retainers()
    {
        return new WebInspector.HeapSnapshotRetainerEdgeIterator(new WebInspector.HeapSnapshotRetainerEdge(this._snapshot, this._snapshot._retainersForNode(this)));
    },

    get selfSize()
    {
        return this._nodes[this.nodeIndex + this._snapshot._nodeSelfSizeOffset];
    },

    get type()
    {
        return this._snapshot._nodeTypes[this._type()];
    },

    _name: function()
    {
        return this._nodes[this.nodeIndex + this._snapshot._nodeNameOffset];
    },

    get _nodes()
    {
        return this._snapshot._nodes;
    },

    _firstEdgeIndex: function()
    {
        return this.nodeIndex + this._snapshot._firstEdgeOffset;
    },

    get _nextNodeIndex()
    {
        return this._firstEdgeIndex() + this.edgesCount * this._snapshot._edgeFieldsCount;
    },

    _type: function()
    {
        return this._nodes[this.nodeIndex + this._snapshot._nodeTypeOffset];
    }
};

WebInspector.HeapSnapshotNodeIterator = function(node)
{
    this.node = node;
}

WebInspector.HeapSnapshotNodeIterator.prototype = {
    first: function()
    {
        this.node.nodeIndex = this.node._firstNodeIndex;
    },

    hasNext: function()
    {
        return this.node.nodeIndex < this.node._nodes.length;
    },

    get index()
    {
        return this.node.nodeIndex;
    },

    set index(newIndex)
    {
        this.node.nodeIndex = newIndex;
    },

    get item()
    {
        return this.node;
    },

    next: function()
    {
        this.node.nodeIndex = this.node._nextNodeIndex;
    }
}

WebInspector.HeapSnapshot = function(profile)
{
    this.uid = profile.snapshot.uid;
    this._nodes = profile.nodes;
    this._metaNode = profile.metaNode;
    this._strings = profile.strings;

    this._init();
}

WebInspector.HeapSnapshot.prototype = {
    _init: function()
    {
        this._rootNodeIndex = 1;
        var meta = this._metaNode;
        this._nodeTypeOffset = meta.fields.indexOf("type");
        this._nodeNameOffset = meta.fields.indexOf("name");
        this._nodeIdOffset = meta.fields.indexOf("id");
        this._nodeSelfSizeOffset = meta.fields.indexOf("self_size");
        this._nodeRetainedSizeOffset = meta.fields.indexOf("retained_size");
        this._dominatorOffset = meta.fields.indexOf("dominator");
        this._edgesCountOffset = meta.fields.indexOf("children_count");
        this._firstEdgeOffset = meta.fields.indexOf("children");
        this._nodeFieldCount = this._firstEdgeOffset;
        this._nodeTypes = meta.types[this._nodeTypeOffset];
        this._nodeHiddenType = this._nodeTypes.indexOf("hidden");
        this._nodeObjectType = this._nodeTypes.indexOf("object");
        this._nodeNativeType = this._nodeTypes.indexOf("native");
        this._nodeCodeType = this._nodeTypes.indexOf("code");
        this._nodeSyntheticType = this._nodeTypes.indexOf("synthetic");
        var edgesMeta = meta.types[this._firstEdgeOffset];
        this._edgeFieldsCount = edgesMeta.fields.length;
        this._edgeTypeOffset = edgesMeta.fields.indexOf("type");
        this._edgeNameOffset = edgesMeta.fields.indexOf("name_or_index");
        this._edgeToNodeOffset = edgesMeta.fields.indexOf("to_node");
        this._edgeTypes = edgesMeta.types[this._edgeTypeOffset];
        this._edgeElementType = this._edgeTypes.indexOf("element");
        this._edgeHiddenType = this._edgeTypes.indexOf("hidden");
        this._edgeInternalType = this._edgeTypes.indexOf("internal");
        this._edgeShortcutType = this._edgeTypes.indexOf("shortcut");
        this._edgeWeakType = this._edgeTypes.indexOf("weak");
        this._edgeInvisibleType = this._edgeTypes.length;
        this._edgeTypes.push("invisible");

        this._nodeFlags = { // bit flags
            canBeQueried: 1,
            detachedDOMTreeNode: 2,
        };

        this._markInvisibleEdges();
        this._buildNodeIndex();
        this._buildRetainers();
        this._buildDominatedNodes();
        this._calculateFlags();
        this._calculateObjectToWindowDistance();
    },

    _buildContinuousNodeArray: function()
    {
        // Estimate number of nodes.
        var totalEdgeCount = 0;
        var totalNodeCount = 0;
        for (var index = this._rootNodeIndex; index < this._nodes.length; ) {
            ++totalNodeCount;
            var edgesCount = this._nodes[index + this._edgesCountOffset];
            totalEdgeCount += edgesCount;
            index += this._firstEdgeOffset + edgesCount * this._edgeFieldsCount;
        }
        this._createOnlyNodesArray(totalNodeCount);
        this._createContainmentEdgesArray(totalEdgeCount);
        this._createRetainmentEdgesArray(totalNodeCount, totalEdgeCount);
        this._restoreNodeTypes();
    },

    _createOnlyNodesArray: function(totalNodeCount)
    {
        // Copy nodes to their own array.
        this._onlyNodes = new Uint32Array(totalNodeCount * this._nodeFieldCount);
        var dstIndex = 0;
        var srcIndex = this._rootNodeIndex;
        while (srcIndex < this._nodes.length) {
            var srcNodeTypeIndex = srcIndex + this._nodeTypeOffset;
            var currentDstIndex = dstIndex;
            var edgesCount = this._nodes[srcIndex + this._edgesCountOffset];
            for (var i = 0; i < this._nodeFieldCount; i++)
                this._onlyNodes[dstIndex++] = this._nodes[srcIndex++];
            // Write new node index into the type field.
            this._nodes[srcNodeTypeIndex] = currentDstIndex;
            srcIndex += edgesCount * this._edgeFieldsCount;
        }
        // Translate dominator indexes.
        for (var dominatorSlotIndex = this._dominatorOffset; dominatorSlotIndex < this._onlyNodes.length; dominatorSlotIndex += this._nodeFieldCount) {
            var dominatorIndex = this._onlyNodes[dominatorSlotIndex];
            this._onlyNodes[dominatorSlotIndex] = this._nodes[dominatorIndex + this._nodeTypeOffset];
        }
    },

    _createContainmentEdgesArray: function(totalEdgeCount)
    {
        // Copy edges to their own array.
        this._containmentEdges = new Uint32Array(totalEdgeCount * this._edgeFieldsCount);
        var edgeArrayIndex = 0;
        var srcIndex = this._rootNodeIndex;
        while (srcIndex < this._nodes.length) {
            var srcNodeNewIndex = this._nodes[srcIndex + this._nodeTypeOffset];
            // Set index of first outgoing egde in the _containmentEdges array.
            this._onlyNodes[srcNodeNewIndex + this._edgesCountOffset] = edgeArrayIndex;

            // Now copy all edge information.
            var edgesCount = this._nodes[srcIndex + this._edgesCountOffset];
            srcIndex += this._firstEdgeOffset;
            var nextNodeIndex = srcIndex + edgesCount * this._edgeFieldsCount;
            while (srcIndex < nextNodeIndex) {
                this._containmentEdges[edgeArrayIndex] = this._nodes[srcIndex];
                // Translate destination node indexes for the copied edges.
                if (edgeArrayIndex % this._edgeFieldsCount === this._edgeToNodeOffset) {
                    var toNodeIndex = this._containmentEdges[edgeArrayIndex];
                    this._containmentEdges[edgeArrayIndex] = this._nodes[toNodeIndex + this._nodeTypeOffset];
                }
                ++edgeArrayIndex;
                ++srcIndex;
            }
        }
    },

    _createRetainmentEdgesArray: function(totalNodeCount, totalEdgeCount)
    {
        this._retainingNodes = new Uint32Array(totalEdgeCount);
        // Index of the first retainer in the _retainingNodes array. Addressed by retained node index.
        this._firstRetainerIndex = new Uint32Array(totalNodeCount);

        for (var toNodeIndex = this._edgeToNodeOffset; toNodeIndex < this._containmentEdges.length; toNodeIndex += this._edgeFieldsCount)
            ++this._firstRetainerIndex[this._containmentEdges[toNodeIndex]];
        for (var i = 0, firstUnusedRetainerSlot = 0; i < this._firstRetainerIndex.length; i++) {
            var retainersCount = this._firstRetainerIndex[i];
            this._firstRetainerIndex[i] = firstUnusedRetainerSlot;
            this._retainingNodes[firstUnusedRetainerSlot] = retainersCount;
            firstUnusedRetainerSlot += retainersCount;
        }

        var srcNodeIndex = 0;
        var nextNodeFirstEdgeIndex = this._edgesCountOffset;
        while (srcNodeIndex < this._onlyNodes.length) {
            var firstEdgeIndex = nextNodeFirstEdgeIndex;
            var nextNodeIndex = srcNodeIndex + this._nodeFieldCount;
            var nextNodeFirstEdgeIndex = nextNodeIndex < this._onlyNodes.length
                                       ? this._onlyNodes[nextNodeIndex + this._edgesCountOffset]
                                       : this._containmentEdges.length;
            for (var edgeIndex = firstEdgeIndex; edgeIndex < nextNodeFirstEdgeIndex; edgeIndex += this._edgeFieldsCount) {
                var toNodeIndex = this._containmentEdges[edgeIndex + this._edgeToNodeOffset];
                var firstRetainerSlotIndex = this._firstRetainerIndex[toNodeIndex];
                var nextUnusedRetainerSlotIndex = firstRetainerSlotIndex + (--this._retainingNodes[firstRetainerSlotIndex]);
                this._retainingNodes[nextUnusedRetainerSlotIndex] = srcNodeIndex;
            }
            srcNodeIndex = nextNodeIndex;
        }
    },

    _restoreNodeTypes: function()
    {
        var srcIndex = this._rootNodeIndex;
        while (srcIndex < this._nodes.length) {
            var srcNodeTypeIndex = srcIndex + this._nodeTypeOffset;
            var newNodeIndex = this._nodes[srcNodeTypeIndex];
            this._nodes[srcNodeTypeIndex] = this._onlyNodes[newNodeIndex + this._nodeTypeOffset];
            var edgesCount = this._nodes[srcIndex + this._edgesCountOffset];
            srcIndex += this._firstEdgeOffset + edgesCount * this._edgeFieldsCount;
        }
    },

    dispose: function()
    {
        delete this._nodes;
        delete this._strings;
        delete this._retainers;
        delete this._retainerIndex;
        delete this._nodeIndex;
        if (this._aggregates) {
            delete this._aggregates;
            delete this._aggregatesSortedFlags;
        }
        delete this._baseNodeIds;
        delete this._dominatedNodes;
        delete this._dominatedIndex;
        delete this._flags;
        delete this._distancesToWindow;
    },

    get _allNodes()
    {
        return new WebInspector.HeapSnapshotNodeIterator(this.rootNode);
    },

    get nodeCount()
    {
        return this.nodeIndexes.length - 1;
    },

    nodeFieldValuesByIndex: function(fieldName, indexes)
    {
        var node = new WebInspector.HeapSnapshotNode(this);
        var result = new Array(indexes.length);
        for (var i = 0, l = indexes.length; i < l; ++i) {
            node.nodeIndex = indexes[i];
            result[i] = node[fieldName];
        }
        return result;
    },

    get rootNode()
    {
        return new WebInspector.HeapSnapshotNode(this, this._rootNodeIndex);
    },

    get maxNodeId()
    {
        if (typeof this._maxNodeId === "number")
            return this._maxNodeId;
        this._maxNodeId = 0;
        var node = new WebInspector.HeapSnapshotNode(this, this.nodeIndexes[0]);
        for (var i = 0, l = this.nodeCount; i < l; ++i) {
            node.nodeIndex = this.nodeIndexes[i];
            var id = node.id;
            if ((id % 2) && id > this._maxNodeId)
                this._maxNodeId = id;
        }
        return this._maxNodeId;
    },

    get rootNodeIndex()
    {
        return this._rootNodeIndex;
    },

    get totalSize()
    {
        return this.rootNode.retainedSize;
    },

    _retainersForNode: function(node)
    {
        var retIndexFrom = this._getRetainerIndex(node.nodeIndex);
        var retIndexTo = this._getRetainerIndex(node._nextNodeIndex);
        return new WebInspector.HeapSnapshotArraySlice(this._retainers, retIndexFrom, retIndexTo);
    },

    _dominatedNodesOfNode: function(node)
    {
        var dominatedIndexFrom = this._getDominatedIndex(node.nodeIndex);
        var dominatedIndexTo = this._getDominatedIndex(node._nextNodeIndex);
        return new WebInspector.HeapSnapshotArraySlice(this._dominatedNodes, dominatedIndexFrom, dominatedIndexTo);
    },

    _flagsOfNode: function(node)
    {
        return this._flags[node.nodeIndex];
    },

    aggregates: function(sortedIndexes, key, filterString)
    {
        if (!this._aggregates) {
            this._aggregates = {};
            this._aggregatesSortedFlags = {};
        }

        var aggregates = this._aggregates[key];
        if (aggregates) {
            if (sortedIndexes && !this._aggregatesSortedFlags[key]) {
                this._sortAggregateIndexes(aggregates);
                this._aggregatesSortedFlags[key] = sortedIndexes;
            }
            return aggregates;
        }

        var filter;
        if (filterString)
            filter = this._parseFilter(filterString);

        aggregates = this._buildAggregates(filter);

        if (sortedIndexes)
            this._sortAggregateIndexes(aggregates);

        this._aggregatesSortedFlags[key] = sortedIndexes;
        this._aggregates[key] = aggregates;

        return aggregates;
    },

    _buildRetainers: function()
    {
        var nodeIndexes = this.nodeIndexes;
        var nodePositions = this._nodePosition;
        var nodeCount = this.nodeCount;
        var nodes = this._nodes;

        // Builds up two arrays:
        //  - "backRefsArray" is a continuous array, where each node owns an
        //    interval (can be empty) with corresponding back references.
        //  - "indexArray" is an array of indexes in the "backRefsArray"
        //    with the same positions as in the _nodeIndex.
        var indexArray = this._retainerIndex = new Uint32Array(nodeCount + 1);
        var edgesCountOffset = this._edgesCountOffset;
        var firstEdgeOffset = this._firstEdgeOffset;
        var edgeFieldsCount = this._edgeFieldsCount;
        var edgeToNodeOffset = this._edgeToNodeOffset;
        var backRefsCount = 0;
        // Count the number of retainers for each node
        for (var i = 0; i < nodeCount; ++i) {
            var nodeIndex = nodeIndexes[i];
            var edgesOffset = nodeIndex + firstEdgeOffset + edgeToNodeOffset;
            var edgesCount = nodes[nodeIndex + edgesCountOffset];
            backRefsCount += edgesCount;
            for (var j = 0; j < edgesCount; ++j) {
              var targetNodeIndex = nodes[j * edgeFieldsCount + edgesOffset];
              ++indexArray[nodePositions[targetNodeIndex]];
            }
        }
        var backRefsArray = this._retainers = new Uint32Array(backRefsCount);
        // Put in the first slot of each backRefsArray slice the count of entries
        // that will be filled.
        var backRefsPosition = 0;
        // The one extra slot in the _retainerIndex array is set to the
        // end of _retainers array. It is used in the retainers iterator.
        for (i = 0; i <= nodeCount; ++i) {
            backRefsCount = backRefsArray[backRefsPosition] = indexArray[i];
            indexArray[i] = backRefsPosition;
            backRefsPosition += backRefsCount;
        }
        var retainerIndex = this._retainerIndex;
        // Fill up the retainers array with indexes of edges.
        for (var i = 0; i < nodeCount; ++i) {
            var nodeIndex = nodeIndexes[i];
            var edgesOffset = nodeIndex + firstEdgeOffset;
            var edgesCount = nodes[nodeIndex + edgesCountOffset];
            for (var j = 0; j < edgesCount; ++j) {
                var edgeIndex = j * edgeFieldsCount + edgesOffset;
                var retNode = nodePositions[nodes[edgeIndex + edgeToNodeOffset]];
                var retIndex = indexArray[retNode];
                var backRefIndex = retIndex + (--backRefsArray[retIndex]);
                backRefsArray[backRefIndex] = edgeIndex;
            }
        }
    },

    _calculateObjectToWindowDistance: function()
    {
        this._distancesToWindow = new Array(this.nodeCount);

        // bfs for Window roots
        var list = [];
        for (var iter = this.rootNode.edges; iter.hasNext(); iter.next()) {
            var node = iter.edge.node;
            if (node.isWindow) {
                list.push(node.nodeIndex);
                this._distancesToWindow[node.nodeIndex] = 0;
            }
        }
        this._bfs(list);

        // bfs for root
        list = [];
        list.push(this._rootNodeIndex);
        this._distancesToWindow[this.rootNode.nodeIndex] = 0;
        this._bfs(list);
    },

    _bfs: function(list)
    {
        var index = 0;
        var nodes = this._nodes;
        while (index < list.length) {
            var nodeIndex = list[index++]; // shift generates too much garbage.
            if (index > 100000) {
                list = list.slice(index);
                index = 0;
            }
            var distance = this._distancesToWindow[nodeIndex] + 1;
            var edgesCount = nodes[nodeIndex + this._edgesCountOffset];
            var edgeToNodeIndex = nodeIndex + this._firstEdgeOffset + this._edgeToNodeOffset;
            for (var i = 0; i < edgesCount; ++i) {
                var childNodeIndex = nodes[edgeToNodeIndex];
                edgeToNodeIndex += this._edgeFieldsCount;
                if (childNodeIndex in this._distancesToWindow)
                    continue;
                this._distancesToWindow[childNodeIndex] = distance;
                list.push(childNodeIndex);
            }
        }
    },

    _buildAggregates: function(filter)
    {
        function shouldSkip(node)
        {
            if (filter && !filter(node))
                return true;
            if (!node.isNative && node.selfSize === 0)
                return true;
            return false;
        }

        var aggregates = {};
        var aggregatesByClassName = {};
        var node = new WebInspector.HeapSnapshotNode(this, this.nodeIndexes[0]);
        for (var i = 0, l = this.nodeCount; i < l; ++i) {
            node.nodeIndex = this.nodeIndexes[i];
            if (shouldSkip(node))
                continue;
            var classIndex = node.classIndex;
            if (!(classIndex in aggregates)) {
                var nodeType = node.type;
                var nameMatters = nodeType === "object" || nodeType === "native";
                var value = {
                    count: 1,
                    distanceToWindow: node.distanceToWindow,
                    self: node.selfSize,
                    maxRet: 0,
                    type: nodeType,
                    name: nameMatters ? node.name : null,
                    idxs: [node.nodeIndex]
                };
                aggregates[classIndex] = value;
                aggregatesByClassName[node.className] = value;
            } else {
                var clss = aggregates[classIndex];
                clss.distanceToWindow = Math.min(clss.distanceToWindow, node.distanceToWindow);
                ++clss.count;
                clss.self += node.selfSize;
                clss.idxs.push(node.nodeIndex);
            }
        }

        // Recursively visit dominators tree and sum up retained sizes
        // of topmost objects in each class.
        // This gives us retained sizes for classes.
        var seenClassNameIndexes = {};
        var snapshot = this;
        function forDominatedNodes(nodeIndex)
        {
            var node = new WebInspector.HeapSnapshotNode(snapshot, nodeIndex);
            var classIndex = node.classIndex;
            var seen = !!seenClassNameIndexes[classIndex];
            if (!seen && classIndex in aggregates && !shouldSkip(node)) {
                aggregates[classIndex].maxRet += node.retainedSize;
                seenClassNameIndexes[classIndex] = true;
            }
            var dominatedNodes = snapshot._dominatedNodesOfNode(node);
            for (var i = 0; i < dominatedNodes.length; i++)
                forDominatedNodes(dominatedNodes.item(i));
            seenClassNameIndexes[classIndex] = seen;
        }
        forDominatedNodes(this._rootNodeIndex);

        // Shave off provisionally allocated space.
        for (var classIndex in aggregates)
            aggregates[classIndex].idxs = aggregates[classIndex].idxs.slice(0);
        return aggregatesByClassName;
    },

    _sortAggregateIndexes: function(aggregates)
    {
        var nodeA = new WebInspector.HeapSnapshotNode(this);
        var nodeB = new WebInspector.HeapSnapshotNode(this);
        for (var clss in aggregates)
            aggregates[clss].idxs.sort(
                function(idxA, idxB) {
                    nodeA.nodeIndex = idxA;
                    nodeB.nodeIndex = idxB;
                    return nodeA.id < nodeB.id ? -1 : 1;
                });
    },

    get nodeIndexes()
    {
        return this._nodeIndex;
    },

    _buildNodeIndex: function()
    {
        var count = 0;
        for (var i = this._rootNodeIndex, l = this._nodes.length; i < l; ++count) {
            var edgesCount = this._nodes[i + this._edgesCountOffset];
            i += this._firstEdgeOffset + edgesCount * this._edgeFieldsCount;
        }
        var nodeIndex = new Uint32Array(count + 1);
        var nodePosition = {};
        count = 0;
        for (var i = this._rootNodeIndex, l = this._nodes.length; i < l; ++count) {
            nodeIndex[count] = i;
            nodePosition[i] = count;
            var edgesCount = this._nodes[i + this._edgesCountOffset];
            i += this._firstEdgeOffset + edgesCount * this._edgeFieldsCount;
        }
        nodeIndex[count] = this._nodes.length;
        nodePosition[this._nodes.length] = count;
        this._nodeIndex = nodeIndex;
        this._nodePosition = nodePosition;
    },

    _findNearestNodeIndex: function(index)
    {
        var result = binarySearch(index, this._nodeIndex, this._numbersComparator);
        if (result < 0) {
            result = -result - 1;
            nodeIndex = this._nodeIndex[result];
            // Binary search can return either maximum lower value, or minimum higher value.
            if (nodeIndex > index)
                nodeIndex = this._nodeIndex[result - 1];
        } else
            var nodeIndex = this._nodeIndex[result];
        return nodeIndex;
    },

    _getRetainerIndex: function(nodeIndex)
    {
        var nodePosition = this._nodePosition[nodeIndex];
        return this._retainerIndex[nodePosition];
    },

    _buildDominatedNodes: function()
    {
        var nodeCount = this.nodeCount;
        // Builds up two arrays:
        //  - "dominatedNodes" is a continuous array, where each node owns an
        //    interval (can be empty) with corresponding dominated nodes.
        //  - "indexArray" is an array of indexes in the "dominatedNodes"
        //    with the same positions as in the _nodeIndex.
        var indexArray = this._dominatedIndex = new Uint32Array(nodeCount + 1);
        // Count the number of retainers for each node
        for (var i = 0; i < nodeCount; ++i) {
            var nodeIndex = this.nodeIndexes[i];
            var dominatorIndex = this._nodes[nodeIndex + this._dominatorOffset];
            if (nodeIndex === dominatorIndex) continue;
            ++indexArray[this._nodePosition[dominatorIndex]];
        }
        var dominatedNodes = this._dominatedNodes = new Uint32Array(nodeCount - 1);
        // Put in the first slot of each dominatedNodes slice the count of entries
        // that will be filled.
        var dominatedPosition = 0;
        for (i = 0; i <= nodeCount; ++i) {
            var dominatedCount = dominatedNodes[dominatedPosition] = indexArray[i];
            indexArray[i] = dominatedPosition;
            dominatedPosition += dominatedCount;
        }
        // Fill up the dominatedNodes array with indexes of dominated nodes.
        for (var i = 0; i < nodeCount; ++i) {
            var nodeIndex = this.nodeIndexes[i];
            var dominatorIndex = this._nodes[nodeIndex + this._dominatorOffset];
            if (nodeIndex === dominatorIndex) continue;
            var dominatorPos = this._nodePosition[dominatorIndex];
            var dominatedRefIndex = indexArray[dominatorPos];
            dominatedRefIndex += (--dominatedNodes[dominatedRefIndex]);
            dominatedNodes[dominatedRefIndex] = nodeIndex;
        }
    },

    _getDominatedIndex: function(nodeIndex)
    {
        var nodePosition = this._nodePosition[nodeIndex];
        return this._dominatedIndex[nodePosition];
    },

    _markInvisibleEdges: function()
    {
        // Mark hidden edges of global objects as invisible.
        // FIXME: This is a temporary measure. Normally, we should
        // really hide all hidden nodes.
        for (var iter = this.rootNode.edges; iter.hasNext(); iter.next()) {
            var edge = iter.edge;
            if (!edge.isShortcut)
                continue;
            var node = edge.node;
            var propNames = {};
            for (var innerIter = node.edges; innerIter.hasNext(); innerIter.next()) {
                var globalObjEdge = innerIter.edge;
                if (globalObjEdge.isShortcut)
                    propNames[globalObjEdge._nameOrIndex] = true;
            }
            for (innerIter.first(); innerIter.hasNext(); innerIter.next()) {
                var globalObjEdge = innerIter.edge;
                if (!globalObjEdge.isShortcut
                    && globalObjEdge.node.isHidden
                    && globalObjEdge._hasStringName
                    && (globalObjEdge._nameOrIndex in propNames))
                    this._nodes[globalObjEdge._edges._start + globalObjEdge.edgeIndex + this._edgeTypeOffset] = this._edgeInvisibleType;
            }
        }
    },

    _numbersComparator: function(a, b)
    {
        return a < b ? -1 : (a > b ? 1 : 0);
    },

    _markDetachedDOMTreeNodes: function()
    {
        var flag = this._nodeFlags.detachedDOMTreeNode;
        var detachedDOMTreesRoot;
        for (var iter = this.rootNode.edges; iter.hasNext(); iter.next()) {
            var node = iter.edge.node;
            if (node.isDetachedDOMTreesRoot) {
                detachedDOMTreesRoot = node;
                break;
            }
        }

        if (!detachedDOMTreesRoot)
            return;

        for (var iter = detachedDOMTreesRoot.edges; iter.hasNext(); iter.next()) {
            var node = iter.edge.node;
            if (node.isDetachedDOMTree) {
                for (var edgesIter = node.edges; edgesIter.hasNext(); edgesIter.next())
                    this._flags[edgesIter.edge.node.nodeIndex] |= flag;
            }
        }
    },

    _markQueriableHeapObjects: function()
    {
        // Allow runtime properties query for objects accessible from Window objects
        // via regular properties, and for DOM wrappers. Trying to access random objects
        // can cause a crash due to insonsistent state of internal properties of wrappers.
        var flag = this._nodeFlags.canBeQueried;

        var list = [];
        for (var iter = this.rootNode.edges; iter.hasNext(); iter.next()) {
            if (iter.edge.node.isWindow)
                list.push(iter.edge.node.nodeIndex);
        }

        var edge = new WebInspector.HeapSnapshotEdge(this);
        var node = new WebInspector.HeapSnapshotNode(this);
        while (list.length) {
            var nodeIndex = list.pop();
            if (this._flags[nodeIndex] & flag)
                continue;
            node.nodeIndex = nodeIndex;
            this._flags[nodeIndex] |= flag;
            var edgesOffset = nodeIndex + this._firstEdgeOffset;
            var edgesCount = this._nodes[nodeIndex + this._edgesCountOffset];
            edge._edges = node.rawEdges;
            for (var j = 0; j < edgesCount; ++j) {
                edge.edgeIndex = j * this._edgeFieldsCount;
                var nodeIndex = this._nodes[edgesOffset + edge.edgeIndex + this._edgeToNodeOffset];
                if (this._flags[nodeIndex] & flag)
                    continue;
                if (edge.isHidden || edge.isInvisible)
                    continue;
                if (edge.isInternal)
                    continue;
                var name = edge.name;
                if (!name)
                    continue;
                list.push(nodeIndex);
            }
        }
    },

    _calculateFlags: function()
    {
        this._flags = new Array(this.nodeCount);
        this._markDetachedDOMTreeNodes();
        this._markQueriableHeapObjects();
    },

    baseSnapshotHasNode: function(baseSnapshotId, className, nodeId)
    {
        return this._baseNodeIds[baseSnapshotId][className].binaryIndexOf(nodeId, this._numbersComparator) !== -1;
    },

    pushBaseIds: function(baseSnapshotId, className, nodeIds)
    {
        if (!this._baseNodeIds)
            this._baseNodeIds = [];
        if (!this._baseNodeIds[baseSnapshotId])
            this._baseNodeIds[baseSnapshotId] = {};
        this._baseNodeIds[baseSnapshotId][className] = nodeIds;
    },

    createDiff: function(className)
    {
        return new WebInspector.HeapSnapshotsDiff(this, className);
    },

    _parseFilter: function(filter)
    {
        if (!filter)
            return null;
        var parsedFilter = eval("(function(){return " + filter + "})()");
        return parsedFilter.bind(this);
    },

    createEdgesProvider: function(nodeIndex, filter)
    {
        var node = new WebInspector.HeapSnapshotNode(this, nodeIndex);
        return new WebInspector.HeapSnapshotEdgesProvider(this, nodeIndex, this._parseFilter(filter), node.edges);
    },

    createRetainingEdgesProvider: function(nodeIndex, filter)
    {
        var node = new WebInspector.HeapSnapshotNode(this, nodeIndex);
        return new WebInspector.HeapSnapshotEdgesProvider(this, nodeIndex, this._parseFilter(filter), node.retainers);
    },

    createNodesProvider: function(filter)
    {
        return new WebInspector.HeapSnapshotNodesProvider(this, this._parseFilter(filter));
    },

    createNodesProviderForClass: function(className, aggregatesKey)
    {
        return new WebInspector.HeapSnapshotNodesProvider(this, null, this.aggregates(false, aggregatesKey)[className].idxs);
    },

    createNodesProviderForDominator: function(nodeIndex, filter)
    {
        var node = new WebInspector.HeapSnapshotNode(this, nodeIndex);
        return new WebInspector.HeapSnapshotNodesProvider(this, this._parseFilter(filter), this._dominatedNodesOfNode(node));
    },

    updateStaticData: function()
    {
        return {nodeCount: this.nodeCount, rootNodeIndex: this._rootNodeIndex, totalSize: this.totalSize, uid: this.uid, nodeFlags: this._nodeFlags, maxNodeId: this.maxNodeId};
    }
};

WebInspector.HeapSnapshotFilteredOrderedIterator = function(iterator, filter, unfilteredIterationOrder)
{
    this._filter = filter;
    this._iterator = iterator;
    this._unfilteredIterationOrder = unfilteredIterationOrder;
    this._iterationOrder = null;
    this._position = 0;
    this._currentComparator = null;
    this._lastComparator = null;
}

WebInspector.HeapSnapshotFilteredOrderedIterator.prototype = {
    _createIterationOrder: function()
    {
        if (this._iterationOrder)
            return;
        if (this._unfilteredIterationOrder && !this._filter) {
            this._iterationOrder = this._unfilteredIterationOrder.slice(0);
            this._unfilteredIterationOrder = null;
            return;
        }
        this._iterationOrder = [];
        var iterator = this._iterator;
        if (!this._unfilteredIterationOrder && !this._filter) {
            for (iterator.first(); iterator.hasNext(); iterator.next())
                this._iterationOrder.push(iterator.index);
        } else if (!this._unfilteredIterationOrder) {
            for (iterator.first(); iterator.hasNext(); iterator.next()) {
                if (this._filter(iterator.item))
                    this._iterationOrder.push(iterator.index);
            }
        } else {
            var order = this._unfilteredIterationOrder.constructor === Array ?
                this._unfilteredIterationOrder : this._unfilteredIterationOrder.slice(0);
            for (var i = 0, l = order.length; i < l; ++i) {
                iterator.index = order[i];
                if (this._filter(iterator.item))
                    this._iterationOrder.push(iterator.index);
            }
            this._unfilteredIterationOrder = null;
        }
    },

    first: function()
    {
        this._position = 0;
    },

    hasNext: function()
    {
        return this._position < this._iterationOrder.length;
    },

    get isEmpty()
    {
        if (this._iterationOrder)
            return !this._iterationOrder.length;
        if (this._unfilteredIterationOrder && !this._filter)
            return !this._unfilteredIterationOrder.length;
        var iterator = this._iterator;
        if (!this._unfilteredIterationOrder && !this._filter) {
            iterator.first();
            return !iterator.hasNext();
        } else if (!this._unfilteredIterationOrder) {
            for (iterator.first(); iterator.hasNext(); iterator.next())
                if (this._filter(iterator.item))
                    return false;
        } else {
            var order = this._unfilteredIterationOrder.constructor === Array ?
                this._unfilteredIterationOrder : this._unfilteredIterationOrder.slice(0);
            for (var i = 0, l = order.length; i < l; ++i) {
                iterator.index = order[i];
                if (this._filter(iterator.item))
                    return false;
            }
        }
        return true;
    },

    get item()
    {
        this._iterator.index = this._iterationOrder[this._position];
        return this._iterator.item;
    },

    get length()
    {
        this._createIterationOrder();
        return this._iterationOrder.length;
    },

    next: function()
    {
        ++this._position;
    },

    serializeNextItems: function(count)
    {
        this._createIterationOrder();
        var result = new Array(count);
        if (this._lastComparator !== this._currentComparator)
            this.sort(this._currentComparator, this._position, this._iterationOrder.length - 1, count);
        for (var i = 0 ; i < count && this.hasNext(); ++i, this.next())
            result[i] = this._serialize(this.item);
        result.length = i;
        result.hasNext = this.hasNext();
        result.totalLength = this._iterationOrder.length;
        return result;
    },

    sortAndRewind: function(comparator)
    {
        this._lastComparator = this._currentComparator;
        this._currentComparator = comparator;
        var result = this._lastComparator !== this._currentComparator;
        if (result)
            this.first();
        return result;
    }
}

WebInspector.HeapSnapshotFilteredOrderedIterator.prototype.createComparator = function(fieldNames)
{
    return {fieldName1:fieldNames[0], ascending1:fieldNames[1], fieldName2:fieldNames[2], ascending2:fieldNames[3]};
}

WebInspector.HeapSnapshotEdgesProvider = function(snapshot, nodeIndex, filter, edgesIter)
{
    this.snapshot = snapshot;
    WebInspector.HeapSnapshotFilteredOrderedIterator.call(this, edgesIter, filter);
}

WebInspector.HeapSnapshotEdgesProvider.prototype = {
    _serialize: function(edge)
    {
        return {
            name: edge.name,
            propertyAccessor: edge.toString(),
            node: WebInspector.HeapSnapshotNodesProvider.prototype._serialize(edge.node),
            nodeIndex: edge.nodeIndex,
            type: edge.type,
            distanceToWindow: edge.node.distanceToWindow
        };
    },

    sort: function(comparator, leftBound, rightBound, count)
    {
        var fieldName1 = comparator.fieldName1;
        var fieldName2 = comparator.fieldName2;
        var ascending1 = comparator.ascending1;
        var ascending2 = comparator.ascending2;

        var edgeA = this._iterator.item.clone();
        var edgeB = edgeA.clone();
        var nodeA = new WebInspector.HeapSnapshotNode(this.snapshot);
        var nodeB = new WebInspector.HeapSnapshotNode(this.snapshot);

        function compareEdgeFieldName(ascending, indexA, indexB)
        {
            edgeA.edgeIndex = indexA;
            edgeB.edgeIndex = indexB;
            if (edgeB.name === "__proto__") return -1;
            if (edgeA.name === "__proto__") return 1;
            var result =
                edgeA.hasStringName === edgeB.hasStringName ?
                (edgeA.name < edgeB.name ? -1 : (edgeA.name > edgeB.name ? 1 : 0)) :
                (edgeA.hasStringName ? -1 : 1);
            return ascending ? result : -result;
        }

        function compareNodeField(fieldName, ascending, indexA, indexB)
        {
            edgeA.edgeIndex = indexA;
            nodeA.nodeIndex = edgeA.nodeIndex;
            var valueA = nodeA[fieldName];

            edgeB.edgeIndex = indexB;
            nodeB.nodeIndex = edgeB.nodeIndex;
            var valueB = nodeB[fieldName];

            var result = valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
            return ascending ? result : -result;
        }

        function compareEdgeAndNode(indexA, indexB) {
            var result = compareEdgeFieldName(ascending1, indexA, indexB);
            if (result === 0)
                result = compareNodeField(fieldName2, ascending2, indexA, indexB);
            return result;
        }

        function compareNodeAndEdge(indexA, indexB) {
            var result = compareNodeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0)
                result = compareEdgeFieldName(ascending2, indexA, indexB);
            return result;
        }

        function compareNodeAndNode(indexA, indexB) {
            var result = compareNodeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0)
                result = compareNodeField(fieldName2, ascending2, indexA, indexB);
            return result;
        }

        if (fieldName1 === "!edgeName")
            this._iterationOrder.sortRange(compareEdgeAndNode, leftBound, rightBound, count);
        else if (fieldName2 === "!edgeName")
            this._iterationOrder.sortRange(compareNodeAndEdge, leftBound, rightBound, count);
        else
            this._iterationOrder.sortRange(compareNodeAndNode, leftBound, rightBound, count);
    }
};

WebInspector.HeapSnapshotEdgesProvider.prototype.__proto__ = WebInspector.HeapSnapshotFilteredOrderedIterator.prototype;

WebInspector.HeapSnapshotNodesProvider = function(snapshot, filter, nodeIndexes)
{
    this.snapshot = snapshot;
    WebInspector.HeapSnapshotFilteredOrderedIterator.call(this, snapshot._allNodes, filter, nodeIndexes);
}

WebInspector.HeapSnapshotNodesProvider.prototype = {
    _serialize: function(node)
    {
        return {
            id: node.id,
            name: node.name,
            distanceToWindow: node.distanceToWindow,
            nodeIndex: node.nodeIndex,
            retainedSize: node.retainedSize,
            selfSize: node.selfSize,
            type: node.type,
            flags: node.flags
        };
    },

    sort: function(comparator, leftBound, rightBound, count)
    {
        var fieldName1 = comparator.fieldName1;
        var fieldName2 = comparator.fieldName2;
        var ascending1 = comparator.ascending1;
        var ascending2 = comparator.ascending2;

        var nodeA = new WebInspector.HeapSnapshotNode(this.snapshot);
        var nodeB = new WebInspector.HeapSnapshotNode(this.snapshot);

        function sortByNodeField(fieldName, ascending, indexA, indexB)
        {
            nodeA.nodeIndex = indexA;
            nodeB.nodeIndex = indexB;
            var valueA = nodeA[fieldName];
            var valueB = nodeB[fieldName];
            var result = valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
            return ascending ? result : -result;
        }

        function sortByComparator(indexA, indexB) {
            var result = sortByNodeField(fieldName1, ascending1, indexA, indexB);
            if (result === 0)
                result = sortByNodeField(fieldName2, ascending2, indexA, indexB);
            return result;
        }

        this._iterationOrder.sortRange(sortByComparator, leftBound, rightBound, count);
    }
};

WebInspector.HeapSnapshotNodesProvider.prototype.__proto__ = WebInspector.HeapSnapshotFilteredOrderedIterator.prototype;

WebInspector.HeapSnapshotsDiff = function(snapshot, className)
{
    this._snapshot = snapshot;
    this._className = className;
};

WebInspector.HeapSnapshotsDiff.prototype = {
    calculate: function()
    {
        var aggregates = this._snapshot.aggregates(true)[this._className];
        var indexes = aggregates ? aggregates.idxs : [];
        var i = 0, l = this._baseIds.length;
        var j = 0, m = indexes.length;
        var diff = { addedCount: 0, removedCount: 0, addedSize: 0, removedSize: 0 };

        var nodeB = new WebInspector.HeapSnapshotNode(this._snapshot, indexes[j]);
        while (i < l && j < m) {
            var nodeAId = this._baseIds[i];
            if (nodeAId < nodeB.id) {
                diff.removedCount++;
                diff.removedSize += this._baseSelfSizes[i];
                ++i;
            } else if (nodeAId > nodeB.id) {
                diff.addedCount++;
                diff.addedSize += nodeB.selfSize;
                nodeB.nodeIndex = indexes[++j];
            } else {
                ++i;
                nodeB.nodeIndex = indexes[++j];
            }
        }
        while (i < l) {
            diff.removedCount++;
            diff.removedSize += this._baseSelfSizes[i];
            ++i;
        }
        while (j < m) {
            diff.addedCount++;
            diff.addedSize += nodeB.selfSize;
            nodeB.nodeIndex = indexes[++j];
        }
        diff.countDelta = diff.addedCount - diff.removedCount;
        diff.sizeDelta = diff.addedSize - diff.removedSize;
        return diff;
    },

    pushBaseIds: function(baseIds)
    {
        this._baseIds = baseIds;
    },

    pushBaseSelfSizes: function(baseSelfSizes)
    {
        this._baseSelfSizes = baseSelfSizes;
    }
};
