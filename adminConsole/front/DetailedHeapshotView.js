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

WebInspector.HeapSnapshotSortableDataGrid = function(columns)
{
    WebInspector.DataGrid.call(this, columns);
    this.addEventListener("sorting changed", this.sortingChanged, this);
}

WebInspector.HeapSnapshotSortableDataGrid.prototype = {
    dispose: function()
    {
        for (var i = 0, l = this.children.length; i < l; ++i)
            this.children[i].dispose();
    },

    resetSortingCache: function()
    {
        delete this._lastSortColumnIdentifier;
        delete this._lastSortAscending;
    },

    sortingChanged: function()
    {
        var sortAscending = this.sortOrder === "ascending";
        var sortColumnIdentifier = this.sortColumnIdentifier;
        if (this._lastSortColumnIdentifier === sortColumnIdentifier && this._lastSortAscending === sortAscending)
            return;
        this._lastSortColumnIdentifier = sortColumnIdentifier;
        this._lastSortAscending = sortAscending;
        var sortFields = this._sortFields(sortColumnIdentifier, sortAscending);

        function SortByTwoFields(nodeA, nodeB)
        {
            var field1 = nodeA[sortFields[0]];
            var field2 = nodeB[sortFields[0]];
            var result = field1 < field2 ? -1 : (field1 > field2 ? 1 : 0);
            if (!sortFields[1])
                result = -result;
            if (result !== 0)
                return result;
            field1 = nodeA[sortFields[2]];
            field2 = nodeB[sortFields[2]];
            result = field1 < field2 ? -1 : (field1 > field2 ? 1 : 0);
            if (!sortFields[3])
                result = -result;
            return result;
        }
        this._performSorting(SortByTwoFields);
    },

    _performSorting: function(sortFunction)
    {
        this.recursiveSortingEnter();
        var children = this.children;
        this.removeChildren();
        children.sort(sortFunction);
        for (var i = 0, l = children.length; i < l; ++i) {
            var child = children[i];
            var revealed = child.revealed;
            this.appendChild(child);
            child.revealed = revealed;
            if (child.expanded)
                child.sort();
        }
        this.recursiveSortingLeave();
    },

    recursiveSortingEnter: function()
    {
        if (!("_recursiveSortingDepth" in this))
            this._recursiveSortingDepth = 1;
        else
            ++this._recursiveSortingDepth;
    },

    recursiveSortingLeave: function()
    {
        if (!("_recursiveSortingDepth" in this))
            return;
        if (!--this._recursiveSortingDepth) {
            delete this._recursiveSortingDepth;
            this.dispatchEventToListeners("sorting complete");
        }
    }
};

WebInspector.HeapSnapshotSortableDataGrid.prototype.__proto__ = WebInspector.DataGrid.prototype;

WebInspector.HeapSnapshotContainmentDataGrid = function(columns)
{
    columns = columns || {
        object: { title: WebInspector.UIString("Object"), disclosure: true, sortable: true },
        shallowSize: { title: WebInspector.UIString("Shallow Size"), width: "120px", sortable: true },
        retainedSize: { title: WebInspector.UIString("Retained Size"), width: "120px", sortable: true, sort: "descending" }
    };
    WebInspector.HeapSnapshotSortableDataGrid.call(this, columns);
}

WebInspector.HeapSnapshotContainmentDataGrid.prototype = {
    _defaultPopulateCount: 100,

    expandRoute: function(route)
    {
        function nextStep(parent, hopIndex)
        {
            if (hopIndex >= route.length) {
                parent.element.scrollIntoViewIfNeeded(true);
                parent.select();
                return;
            }
            var nodeIndex = route[hopIndex];
            for (var i = 0, l = parent.children.length; i < l; ++i) {
                var child = parent.children[i];
                if (child.snapshotNodeIndex === nodeIndex) {
                    if (child.expanded)
                        nextStep(child, hopIndex + 1);
                    else {
                        function afterExpand()
                        {
                            child.removeEventListener("populate complete", afterExpand, null);
                            var lastChild = child.children[child.children.length - 1];
                            if (!lastChild.showAll)
                                nextStep(child, hopIndex + 1);
                            else {
                                child.addEventListener("populate complete", afterExpand, null);
                                lastChild.showAll.click();
                            }
                        }
                        child.addEventListener("populate complete", afterExpand, null);
                        child.expand();
                    }
                    break;
                }
            }
        }
        nextStep(this, 0);
    },

    setDataSource: function(snapshotView, snapshot, nodeIndex)
    {
        this.snapshotView = snapshotView;
        this.snapshot = snapshot;
        this.snapshotNodeIndex = nodeIndex || this.snapshot.rootNodeIndex;
        this._provider = this._createProvider(snapshot, this.snapshotNodeIndex, this);
        this.sort();
    },

    sortingChanged: function()
    {
        this.sort();
    }
};

MixInSnapshotNodeFunctions(WebInspector.HeapSnapshotObjectNode.prototype, WebInspector.HeapSnapshotContainmentDataGrid.prototype);
WebInspector.HeapSnapshotContainmentDataGrid.prototype.__proto__ = WebInspector.HeapSnapshotSortableDataGrid.prototype;

WebInspector.HeapSnapshotRetainmentDataGrid = function()
{
    this.showRetainingEdges = true;
    var columns = {
        object: { title: WebInspector.UIString("Object"), disclosure: true, sortable: true },
        shallowSize: { title: WebInspector.UIString("Shallow Size"), width: "120px", sortable: true },
        retainedSize: { title: WebInspector.UIString("Retained Size"), width: "120px", sortable: true },
        distanceToWindow: { title: WebInspector.UIString("Distance"), width: "80px", sortable: true, sort: "ascending" }
    };
    WebInspector.HeapSnapshotContainmentDataGrid.call(this, columns);
}

WebInspector.HeapSnapshotRetainmentDataGrid.prototype = {
    _sortFields: function(sortColumn, sortAscending)
    {
        return {
            object: ["_name", sortAscending, "_count", false],
            count: ["_count", sortAscending, "_name", true],
            shallowSize: ["_shallowSize", sortAscending, "_name", true],
            retainedSize: ["_retainedSize", sortAscending, "_name", true],
            distanceToWindow: ["_distanceToWindow", sortAscending, "_name", true]
        }[sortColumn];
    },

    reset: function()
    {
        this.removeChildren();
        this.resetSortingCache();
    },
}

WebInspector.HeapSnapshotRetainmentDataGrid.prototype.__proto__ = WebInspector.HeapSnapshotContainmentDataGrid.prototype;

WebInspector.HeapSnapshotConstructorsDataGrid = function()
{
    var columns = {
        object: { title: WebInspector.UIString("Constructor"), disclosure: true, sortable: true },
        distanceToWindow: { title: WebInspector.UIString("Distance"), width: "90px", sortable: true },
        count: { title: WebInspector.UIString("Objects Count"), width: "90px", sortable: true },
        shallowSize: { title: WebInspector.UIString("Shallow Size"), width: "120px", sortable: true },
        retainedSize: { title: WebInspector.UIString("Retained Size"), width: "120px", sort: "descending", sortable: true }
    };
    WebInspector.HeapSnapshotSortableDataGrid.call(this, columns);
    this._filterProfileIndex = -1;
}

WebInspector.HeapSnapshotConstructorsDataGrid.prototype = {
    _defaultPopulateCount: 100,

    _sortFields: function(sortColumn, sortAscending)
    {
        return {
            object: ["_name", sortAscending, "_count", false],
            distanceToWindow: ["_distanceToWindow", sortAscending, "_retainedSize", true],
            count: ["_count", sortAscending, "_name", true],
            shallowSize: ["_shallowSize", sortAscending, "_name", true],
            retainedSize: ["_retainedSize", sortAscending, "_name", true]
        }[sortColumn];
    },

    setDataSource: function(snapshotView, snapshot)
    {
        this.snapshotView = snapshotView;
        this.snapshot = snapshot;
        if (this._filterProfileIndex === -1)
            this.populateChildren();
    },

    populateChildren: function()
    {
        function aggregatesReceived(key, aggregates)
        {
            for (var constructor in aggregates)
                this.appendChild(new WebInspector.HeapSnapshotConstructorNode(this, constructor, aggregates[constructor], key));
            this.sortingChanged();
        }

        this.dispose();
        this.removeChildren();
        this.resetSortingCache();

        var key = this._filterProfileIndex === -1 ? "allObjects" : this._minNodeId + ".." + this._maxNodeId;
        var filter = this._filterProfileIndex === -1 ? null : "function(node) { var id = node.id; return id > " + this._minNodeId + " && id <= " + this._maxNodeId + "; }";

        this.snapshot.aggregates(false, key, filter, aggregatesReceived.bind(this, key));
    },

    _filterSelectIndexChanged: function(loader, profileIndex)
    {
        this._filterProfileIndex = profileIndex;

        delete this._maxNodeId;
        delete this._minNodeId;

        if (this._filterProfileIndex === -1) {
            this.populateChildren();
            return;
        }

        function firstSnapshotLoaded(snapshot)
        {
            this._maxNodeId = snapshot.maxNodeId;
            if (profileIndex > 0)
                loader(profileIndex - 1, secondSnapshotLoaded.bind(this));
            else {
                this._minNodeId = 0;
                this.populateChildren();
            }
        }

        function secondSnapshotLoaded(snapshot)
        {
            this._minNodeId = snapshot.maxNodeId;
            this.populateChildren();
        }

        loader(profileIndex, firstSnapshotLoaded.bind(this));
    },

};

WebInspector.HeapSnapshotConstructorsDataGrid.prototype.__proto__ = WebInspector.HeapSnapshotSortableDataGrid.prototype;

WebInspector.HeapSnapshotDiffDataGrid = function()
{
    var columns = {
        object: { title: WebInspector.UIString("Constructor"), disclosure: true, sortable: true },
        addedCount: { title: WebInspector.UIString("# New"), width: "72px", sortable: true },
        removedCount: { title: WebInspector.UIString("# Deleted"), width: "72px", sortable: true },
        countDelta: { title: "# Delta", width: "64px", sortable: true },
        addedSize: { title: WebInspector.UIString("Alloc. Size"), width: "72px", sortable: true, sort: "descending" },
        removedSize: { title: WebInspector.UIString("Freed Size"), width: "72px", sortable: true },
        sizeDelta: { title: "Size Delta", width: "72px", sortable: true }
    };
    WebInspector.HeapSnapshotSortableDataGrid.call(this, columns);
}

WebInspector.HeapSnapshotDiffDataGrid.prototype = {
    _defaultPopulateCount: 50,

    _sortFields: function(sortColumn, sortAscending)
    {
        return {
            object: ["_name", sortAscending, "_count", false],
            addedCount: ["_addedCount", sortAscending, "_name", true],
            removedCount: ["_removedCount", sortAscending, "_name", true],
            countDelta: ["_countDelta", sortAscending, "_name", true],
            addedSize: ["_addedSize", sortAscending, "_name", true],
            removedSize: ["_removedSize", sortAscending, "_name", true],
            sizeDelta: ["_sizeDelta", sortAscending, "_name", true]
        }[sortColumn];
    },

    setDataSource: function(snapshotView, snapshot)
    {
        this.snapshotView = snapshotView;
        this.snapshot = snapshot;
    },

    _baseProfileIndexChanged: function(loader, profileIndex)
    {
        loader(profileIndex, this.setBaseDataSource.bind(this));
    },

    setBaseDataSource: function(baseSnapshot)
    {
        this.baseSnapshot = baseSnapshot;
        this.dispose();
        this.removeChildren();
        this.resetSortingCache();
        if (this.baseSnapshot === this.snapshot) {
            this.dispatchEventToListeners("sorting complete");
            return;
        }
        this.populateChildren();
    },

    populateChildren: function()
    {
        function baseAggregatesReceived(baseClasses)
        {
            function aggregatesReceived(classes)
            {
                var nodeCount = 0;
                var nodes = [];
                for (var clss in baseClasses)
                    nodes.push(new WebInspector.HeapSnapshotDiffNode(this, clss, baseClasses[clss], classes[clss]));
                for (clss in classes) {
                    if (!(clss in baseClasses))
                        nodes.push(new WebInspector.HeapSnapshotDiffNode(this, clss, null, classes[clss]));
                }
                nodeCount = nodes.length;
                function addNodeIfNonZeroDiff(boundNode, zeroDiff)
                {
                    if (!zeroDiff)
                        this.appendChild(boundNode);
                    if (!--nodeCount)
                        this.sortingChanged();
                }
                for (var i = 0, l = nodes.length; i < l; ++i) {
                    var node = nodes[i];
                    node.calculateDiff(this, addNodeIfNonZeroDiff.bind(this, node));
                }
            }
            this.snapshot.aggregates(true, "allObjects", null, aggregatesReceived.bind(this));
        }
        this.baseSnapshot.aggregates(true, "allObjects", null, baseAggregatesReceived.bind(this));
    }
};

WebInspector.HeapSnapshotDiffDataGrid.prototype.__proto__ = WebInspector.HeapSnapshotSortableDataGrid.prototype;

WebInspector.HeapSnapshotDominatorsDataGrid = function()
{
    var columns = {
        object: { title: WebInspector.UIString("Object"), disclosure: true, sortable: true },
        shallowSize: { title: WebInspector.UIString("Shallow Size"), width: "120px", sortable: true },
        retainedSize: { title: WebInspector.UIString("Retained Size"), width: "120px", sort: "descending", sortable: true }
    };
    WebInspector.HeapSnapshotSortableDataGrid.call(this, columns);
}

WebInspector.HeapSnapshotDominatorsDataGrid.prototype = {
    _defaultPopulateCount: 25,

    setDataSource: function(snapshotView, snapshot)
    {
        this.snapshotView = snapshotView;
        this.snapshot = snapshot;
        this.snapshotNodeIndex = this.snapshot.rootNodeIndex;
        this._provider = this._createProvider(snapshot, this.snapshotNodeIndex);
        this.sort();
    },

    sortingChanged: function()
    {
        this.sort();
    }
};

MixInSnapshotNodeFunctions(WebInspector.HeapSnapshotDominatorObjectNode.prototype, WebInspector.HeapSnapshotDominatorsDataGrid.prototype);
WebInspector.HeapSnapshotDominatorsDataGrid.prototype.__proto__ = WebInspector.HeapSnapshotSortableDataGrid.prototype;

WebInspector.DetailedHeapshotView = function(parent, profile)
{
    WebInspector.View.call(this);

    this.element.addStyleClass("detailed-heapshot-view");

    this.parent = parent;
    this.parent.addEventListener("profile added", this._updateBaseOptions, this);
    this.parent.addEventListener("profile added", this._updateFilterOptions, this);

    this.viewsContainer = document.createElement("div");
    this.viewsContainer.addStyleClass("views-container");
    this.element.appendChild(this.viewsContainer);

    this.containmentView = new WebInspector.View();
    this.containmentView.element.addStyleClass("view");
    this.containmentDataGrid = new WebInspector.HeapSnapshotContainmentDataGrid();
    this.containmentDataGrid.element.addEventListener("mousedown", this._mouseDownInContentsGrid.bind(this), true);
    this.containmentDataGrid.show(this.containmentView.element);
    this.containmentDataGrid.addEventListener(WebInspector.DataGrid.Events.SelectedNode, this._selectionChanged, this);

    this.constructorsView = new WebInspector.View();
    this.constructorsView.element.addStyleClass("view");
    this.constructorsView.element.appendChild(this._createToolbarWithClassNameFilter());

    this.constructorsDataGrid = new WebInspector.HeapSnapshotConstructorsDataGrid();
    this.constructorsDataGrid.element.addStyleClass("class-view-grid");
    this.constructorsDataGrid.element.addEventListener("mousedown", this._mouseDownInContentsGrid.bind(this), true);
    this.constructorsDataGrid.show(this.constructorsView.element);
    this.constructorsDataGrid.addEventListener(WebInspector.DataGrid.Events.SelectedNode, this._selectionChanged, this);

    this.diffView = new WebInspector.View();
    this.diffView.element.addStyleClass("view");
    this.diffView.element.appendChild(this._createToolbarWithClassNameFilter());

    this.diffDataGrid = new WebInspector.HeapSnapshotDiffDataGrid();
    this.diffDataGrid.element.addStyleClass("class-view-grid");
    this.diffDataGrid.show(this.diffView.element);
    this.diffDataGrid.addEventListener(WebInspector.DataGrid.Events.SelectedNode, this._selectionChanged, this);

    this.dominatorView = new WebInspector.View();
    this.dominatorView.element.addStyleClass("view");
    this.dominatorDataGrid = new WebInspector.HeapSnapshotDominatorsDataGrid();
    this.dominatorDataGrid.element.addEventListener("mousedown", this._mouseDownInContentsGrid.bind(this), true);
    this.dominatorDataGrid.show(this.dominatorView.element);
    this.dominatorDataGrid.addEventListener(WebInspector.DataGrid.Events.SelectedNode, this._selectionChanged, this);

    this.retainmentViewHeader = document.createElement("div");
    this.retainmentViewHeader.addStyleClass("retainers-view-header");
    this.retainmentViewHeader.addEventListener("mousedown", this._startRetainersHeaderDragging.bind(this), true);
    var retainingPathsTitleDiv = document.createElement("div");
    retainingPathsTitleDiv.className = "title";
    var retainingPathsTitle = document.createElement("span");
    retainingPathsTitle.textContent = WebInspector.UIString("Object's retaining tree");
    retainingPathsTitleDiv.appendChild(retainingPathsTitle);
    this.retainmentViewHeader.appendChild(retainingPathsTitleDiv);
    this.element.appendChild(this.retainmentViewHeader);

    this.retainmentView = new WebInspector.View();
    this.retainmentView.element.addStyleClass("view");
    this.retainmentView.element.addStyleClass("retaining-paths-view");
    this.retainmentDataGrid = new WebInspector.HeapSnapshotRetainmentDataGrid();
    this.retainmentDataGrid.element.addEventListener("click", this._mouseClickInRetainmentGrid.bind(this), true);
    this.retainmentDataGrid.show(this.retainmentView.element);
    this.retainmentDataGrid.addEventListener(WebInspector.DataGrid.Events.SelectedNode, this._inspectedObjectChanged, this);
    this.retainmentView.show(this.element);
    this.retainmentDataGrid.reset();

    this.dataGrid = this.constructorsDataGrid;
    this.currentView = this.constructorsView;

    this.viewSelectElement = document.createElement("select");
    this.viewSelectElement.className = "status-bar-item";
    this.viewSelectElement.addEventListener("change", this._changeView.bind(this), false);

    this.views = [{title: "Summary", view: this.constructorsView, grid: this.constructorsDataGrid},
                  {title: "Comparison", view: this.diffView, grid: this.diffDataGrid},
                  {title: "Containment", view: this.containmentView, grid: this.containmentDataGrid},
                  {title: "Dominators", view: this.dominatorView, grid: this.dominatorDataGrid}];
    this.views.current = 0;
    for (var i = 0; i < this.views.length; ++i) {
        var view = this.views[i];
        var option = document.createElement("option");
        option.label = WebInspector.UIString(view.title);
        this.viewSelectElement.appendChild(option);
    }

    this._profileUid = profile.uid;

    this.baseSelectElement = document.createElement("select");
    this.baseSelectElement.className = "status-bar-item hidden";
    this.baseSelectElement.addEventListener("change", this._changeBase.bind(this), false);
    this._updateBaseOptions();

    this.filterSelectElement = document.createElement("select");
    this.filterSelectElement.className = "status-bar-item";
    this.filterSelectElement.addEventListener("change", this._changeFilter.bind(this), false);
    this._updateFilterOptions();

    this.helpButton = new WebInspector.StatusBarButton("", "heapshot-help-status-bar-item status-bar-item");
    this.helpButton.addEventListener("click", this._helpClicked.bind(this), false);

    this._popoverHelper = new WebInspector.ObjectPopoverHelper(this.element, this._getHoverAnchor.bind(this), this._resolveObjectForPopover.bind(this), undefined, true);

    this._loadProfile(this._profileUid, profileCallback.bind(this));

    function profileCallback()
    {
        var list = this._profiles();
        var profileIndex;
        for (var i = 0; i < list.length; ++i) {
            if (list[i].uid === this._profileUid) {
                profileIndex = i;
                break;
            }
        }

        if (profileIndex > 0)
            this.baseSelectElement.selectedIndex = profileIndex - 1;
        else
            this.baseSelectElement.selectedIndex = profileIndex;
        this.dataGrid.setDataSource(this, this.profileWrapper);
    }
}

WebInspector.DetailedHeapshotView.prototype = {
    dispose: function()
    {
        this.profileWrapper.dispose();
        if (this.baseProfile)
            this.baseProfileWrapper.dispose();
        this.containmentDataGrid.dispose();
        this.constructorsDataGrid.dispose();
        this.diffDataGrid.dispose();
        this.dominatorDataGrid.dispose();
        this.retainmentDataGrid.dispose();
    },

    get statusBarItems()
    {
        return [this.viewSelectElement, this.baseSelectElement, this.filterSelectElement, this.helpButton.element];
    },

    get profile()
    {
        return this.parent.getProfile(WebInspector.DetailedHeapshotProfileType.TypeId, this._profileUid);
    },

    get profileWrapper()
    {
        return this.profile.proxy;
    },

    get baseProfile()
    {
        return this.parent.getProfile(WebInspector.DetailedHeapshotProfileType.TypeId, this._baseProfileUid);
    },

    get baseProfileWrapper()
    {
        return this.baseProfile.proxy;
    },

    wasShown: function()
    {
        if (!this.profileWrapper.loaded)
            this._loadProfile(this._profileUid, profileCallback1.bind(this));
        else
            profileCallback1.call(this);

        function profileCallback1() {
            if (this.baseProfile && !this.baseProfileWrapper.loaded)
                this._loadProfile(this._baseProfileUid, profileCallback2.bind(this));
            else
                profileCallback2.call(this);
        }

        function profileCallback2() {
            this.currentView.show(this.viewsContainer);
        }
    },

    willHide: function()
    {
        this._currentSearchResultIndex = -1;
        this._popoverHelper.hidePopover();
        if (this.helpPopover && this.helpPopover.visible)
            this.helpPopover.hide();
    },

    onResize: function()
    {
        var height = this.retainmentView.element.clientHeight;
        this._updateRetainmentViewHeight(height);
    },

    searchCanceled: function()
    {
        if (this._searchResults) {
            for (var i = 0; i < this._searchResults.length; ++i) {
                var node = this._searchResults[i].node;
                delete node._searchMatched;
                node.refresh();
            }
        }

        delete this._searchFinishedCallback;
        this._currentSearchResultIndex = -1;
        this._searchResults = [];
    },

    performSearch: function(query, finishedCallback)
    {
        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();

        query = query.trim();

        if (!query.length)
            return;
        if (this.currentView !== this.constructorsView && this.currentView !== this.diffView)
            return;

        this._searchFinishedCallback = finishedCallback;

        function matchesByName(gridNode) {
            return ("name" in gridNode) && gridNode.name.hasSubstring(query, true);
        }

        function matchesById(gridNode) {
            return ("snapshotNodeId" in gridNode) && gridNode.snapshotNodeId === query;
        }

        var matchPredicate;
        if (query.charAt(0) !== "@")
            matchPredicate = matchesByName;
        else {
            query = parseInt(query.substring(1), 10);
            matchPredicate = matchesById;
        }

        function matchesQuery(gridNode)
        {
            delete gridNode._searchMatched;
            if (matchPredicate(gridNode)) {
                gridNode._searchMatched = true;
                gridNode.refresh();
                return true;
            }
            return false;
        }

        var current = this.dataGrid.children[0];
        var depth = 0;
        var info = {};

        // Restrict to type nodes and instances.
        const maxDepth = 1;

        while (current) {
            if (matchesQuery(current))
                this._searchResults.push({ node: current });
            current = current.traverseNextNode(false, null, (depth >= maxDepth), info);
            depth += info.depthChange;
        }

        finishedCallback(this, this._searchResults.length);
    },

    jumpToFirstSearchResult: function()
    {
        if (!this._searchResults || !this._searchResults.length)
            return;
        this._currentSearchResultIndex = 0;
        this._jumpToSearchResult(this._currentSearchResultIndex);
    },

    jumpToLastSearchResult: function()
    {
        if (!this._searchResults || !this._searchResults.length)
            return;
        this._currentSearchResultIndex = (this._searchResults.length - 1);
        this._jumpToSearchResult(this._currentSearchResultIndex);
    },

    jumpToNextSearchResult: function()
    {
        if (!this._searchResults || !this._searchResults.length)
            return;
        if (++this._currentSearchResultIndex >= this._searchResults.length)
            this._currentSearchResultIndex = 0;
        this._jumpToSearchResult(this._currentSearchResultIndex);
    },

    jumpToPreviousSearchResult: function()
    {
        if (!this._searchResults || !this._searchResults.length)
            return;
        if (--this._currentSearchResultIndex < 0)
            this._currentSearchResultIndex = (this._searchResults.length - 1);
        this._jumpToSearchResult(this._currentSearchResultIndex);
    },

    showingFirstSearchResult: function()
    {
        return (this._currentSearchResultIndex === 0);
    },

    showingLastSearchResult: function()
    {
        return (this._searchResults && this._currentSearchResultIndex === (this._searchResults.length - 1));
    },

    _jumpToSearchResult: function(index)
    {
        var searchResult = this._searchResults[index];
        if (!searchResult)
            return;

        var node = searchResult.node;
        node.revealAndSelect();
    },

    refreshVisibleData: function()
    {
        var child = this.dataGrid.children[0];
        while (child) {
            child.refresh();
            child = child.traverseNextNode(false, null, true);
        }
    },

    _changeBase: function()
    {
        if (this._baseProfileUid === this._profiles()[this.baseSelectElement.selectedIndex].uid)
            return;

        this._baseProfileUid = this._profiles()[this.baseSelectElement.selectedIndex].uid;
        this.dataGrid._baseProfileIndexChanged(this._loadProfileByIndex.bind(this), this.baseSelectElement.selectedIndex);

        if (!this.currentQuery || !this._searchFinishedCallback || !this._searchResults)
            return;

        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again with the same query and callback.
        this._searchFinishedCallback(this, -this._searchResults.length);
        this.performSearch(this.currentQuery, this._searchFinishedCallback);
    },

    _changeFilter: function()
    {
        var profileIndex = this.filterSelectElement.selectedIndex - 1;
        this.dataGrid._filterSelectIndexChanged(this._loadProfileByIndex.bind(this), profileIndex);

        if (!this.currentQuery || !this._searchFinishedCallback || !this._searchResults)
            return;

        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again with the same query and callback.
        this._searchFinishedCallback(this, -this._searchResults.length);
        this.performSearch(this.currentQuery, this._searchFinishedCallback);
    },

    _createToolbarWithClassNameFilter: function()
    {
        var toolbar = document.createElement("div");
        toolbar.addStyleClass("class-view-toolbar");
        var classNameFilter = document.createElement("input");
        classNameFilter.addStyleClass("class-name-filter");
        classNameFilter.setAttribute("placeholder", WebInspector.UIString("Class filter"));
        classNameFilter.addEventListener("keyup", this._changeNameFilter.bind(this, classNameFilter), false);
        toolbar.appendChild(classNameFilter);
        return toolbar;
    },

    _changeNameFilter: function(classNameInputElement)
    {
        var filter = classNameInputElement.value.toLowerCase();
        var children = this.dataGrid.children;
        for (var i = 0, l = children.length; i < l; ++i) {
            var node = children[i];
            if (node.depth === 0)
                node.revealed = node._name.toLowerCase().indexOf(filter) !== -1;
        }
    },

    _profiles: function()
    {
        return WebInspector.panels.profiles.getProfiles(WebInspector.DetailedHeapshotProfileType.TypeId);
    },

    _loadProfile: function(profileUid, callback)
    {
        WebInspector.panels.profiles.loadHeapSnapshot(profileUid, callback);
    },

    _loadProfileByIndex: function(profileIndex, callback)
    {
        var profileUid = this._profiles()[profileIndex].uid;
        WebInspector.panels.profiles.loadHeapSnapshot(profileUid, callback);
    },

    isDetailedSnapshot: function(snapshot)
    {
        var s = new WebInspector.HeapSnapshot(snapshot);
        for (var iter = s.rootNode.edges; iter.hasNext(); iter.next())
            if (iter.edge.node.name === "(GC roots)")
                return true;
        return false;
    },

    processLoadedSnapshot: function(profile, snapshot)
    {
        profile.nodes = snapshot.nodes;
        profile.strings = snapshot.strings;
        var s = new WebInspector.HeapSnapshot(profile);
        profile.sidebarElement.subtitle = Number.bytesToString(s.totalSize);
    },

    _selectionChanged: function(event)
    {
        var selectedNode = event.target.selectedNode;
        this._setRetainmentDataGridSource(selectedNode);
        this._inspectedObjectChanged(event);
    },

    _inspectedObjectChanged: function(event)
    {
        var selectedNode = event.target.selectedNode;
        if (selectedNode instanceof WebInspector.HeapSnapshotGenericObjectNode)
            ConsoleAgent.addInspectedHeapObject(selectedNode.snapshotNodeId);
    },

    _setRetainmentDataGridSource: function(nodeItem)
    {
        if (nodeItem && nodeItem.snapshotNodeIndex)
            this.retainmentDataGrid.setDataSource(this, nodeItem.isDeletedNode ? nodeItem.dataGrid.baseSnapshot : nodeItem.dataGrid.snapshot, nodeItem.snapshotNodeIndex, nodeItem.isDeletedNode ? this.baseSelectElement.childNodes[this.baseSelectElement.selectedIndex].label + " | " : "");
        else
            this.retainmentDataGrid.reset();
    },

    _mouseDownInContentsGrid: function(event)
    {
        if (event.detail < 2)
            return;

        var cell = event.target.enclosingNodeOrSelfWithNodeName("td");
        if (!cell || (!cell.hasStyleClass("count-column") && !cell.hasStyleClass("shallowSize-column") && !cell.hasStyleClass("retainedSize-column")))
            return;

        event.consume(true);
    },

    _mouseClickInRetainmentGrid: function(event)
    {
        var cell = event.target.enclosingNodeOrSelfWithNodeName("td");
        if (!cell || (!cell.hasStyleClass("path-column")))
            return;
        var row = event.target.enclosingNodeOrSelfWithNodeName("tr");
        var nodeItem = row._dataGridNode;
        if (!nodeItem || !nodeItem.route)
            return;
        function expandRoute()
        {
            this.dataGrid.expandRoute(nodeItem.route);
        }
        this.changeView("Containment", expandRoute.bind(this));
    },

    changeView: function(viewTitle, callback)
    {
        var viewIndex = null;
        for (var i = 0; i < this.views.length; ++i)
            if (this.views[i].title === viewTitle) {
                viewIndex = i;
                break;
            }
        if (this.views.current === viewIndex) {
            setTimeout(callback, 0);
            return;
        }
        var grid = this.views[viewIndex].grid;
        function sortingComplete()
        {
            grid.removeEventListener("sorting complete", sortingComplete, this);
            setTimeout(callback, 0);
        }
        this.views[viewIndex].grid.addEventListener("sorting complete", sortingComplete, this);
        this.viewSelectElement.selectedIndex = viewIndex;
        this._changeView({target: {selectedIndex: viewIndex}});
    },

    _changeView: function(event)
    {
        if (!event || !this._profileUid)
            return;
        if (event.target.selectedIndex === this.views.current)
            return;

        this.views.current = event.target.selectedIndex;
        this.currentView.detach();
        var view = this.views[this.views.current];
        this.currentView = view.view;
        this.dataGrid = view.grid;
        this.currentView.show(this.viewsContainer);
        this.refreshVisibleData();
        this.dataGrid.updateWidths();

        if (this.currentView === this.diffView) {
            this.baseSelectElement.removeStyleClass("hidden");
            if (!this.dataGrid.snapshotView) {
                this._changeBase();
                this.dataGrid.setDataSource(this, this.profileWrapper);
            }
        } else {
            this.baseSelectElement.addStyleClass("hidden");
            if (!this.dataGrid.snapshotView)
                this.dataGrid.setDataSource(this, this.profileWrapper);
        }

        if (this.currentView === this.constructorsView)
            this.filterSelectElement.removeStyleClass("hidden");
        else
            this.filterSelectElement.addStyleClass("hidden");

        if (!this.currentQuery || !this._searchFinishedCallback || !this._searchResults)
            return;

        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again the with same query and callback.
        this._searchFinishedCallback(this, -this._searchResults.length);
        this.performSearch(this.currentQuery, this._searchFinishedCallback);
    },

    _getHoverAnchor: function(target)
    {
        var span = target.enclosingNodeOrSelfWithNodeName("span");
        if (!span)
            return;
        var row = target.enclosingNodeOrSelfWithNodeName("tr");
        if (!row)
            return;
        var gridNode = row._dataGridNode;
        if (!gridNode.hasHoverMessage)
            return;
        span.node = gridNode;
        return span;
    },

    _resolveObjectForPopover: function(element, showCallback, objectGroupName)
    {
        element.node.queryObjectContent(showCallback, objectGroupName);
    },

    _helpClicked: function(event)
    {
        if (!this._helpPopoverContentElement) {
            var refTypes = ["a:", "console-formatted-name", WebInspector.UIString("property"),
                            "0:", "console-formatted-name", WebInspector.UIString("element"),
                            "a:", "console-formatted-number", WebInspector.UIString("context var"),
                            "a:", "console-formatted-null", WebInspector.UIString("system prop")];
            var objTypes = [" a ", "console-formatted-object", "Object",
                            "\"a\"", "console-formatted-string", "String",
                            "/a/", "console-formatted-string", "RegExp",
                            "a()", "console-formatted-function", "Function",
                            "a[]", "console-formatted-object", "Array",
                            "num", "console-formatted-number", "Number",
                            " a ", "console-formatted-null", "System"];

            var contentElement = document.createElement("table");
            contentElement.className = "heapshot-help";
            var headerRow = document.createElement("tr");
            var propsHeader = document.createElement("th");
            propsHeader.textContent = WebInspector.UIString("Property types:");
            headerRow.appendChild(propsHeader);
            var objsHeader = document.createElement("th");
            objsHeader.textContent = WebInspector.UIString("Object types:");
            headerRow.appendChild(objsHeader);
            contentElement.appendChild(headerRow);
            var len = Math.max(refTypes.length, objTypes.length);
            for (var i = 0; i < len; i += 3) {
                var row = document.createElement("tr");
                var refCell = document.createElement("td");
                if (refTypes[i])
                    appendHelp(refTypes, i, refCell);
                row.appendChild(refCell);
                var objCell = document.createElement("td");
                if (objTypes[i])
                    appendHelp(objTypes, i, objCell);
                row.appendChild(objCell);
                contentElement.appendChild(row);
            }
            this._helpPopoverContentElement = contentElement;
            this.helpPopover = new WebInspector.Popover();

            function appendHelp(help, index, cell)
            {
                var div = document.createElement("div");
                div.className = "source-code event-properties";
                var name = document.createElement("span");
                name.textContent = help[index];
                name.className = help[index + 1];
                div.appendChild(name);
                var desc = document.createElement("span");
                desc.textContent = " " + help[index + 2];
                div.appendChild(desc);
                cell.appendChild(div);
            }
        }
        if (this.helpPopover.visible)
            this.helpPopover.hide();
        else
            this.helpPopover.show(this._helpPopoverContentElement, this.helpButton.element);
    },

    _startRetainersHeaderDragging: function(event)
    {
        if (!this.isShowing())
            return;

        WebInspector.elementDragStart(this.retainmentViewHeader, this._retainersHeaderDragging.bind(this), this._endRetainersHeaderDragging.bind(this), event, "row-resize");
        this._previousDragPosition = event.pageY;
        event.consume();
    },

    _retainersHeaderDragging: function(event)
    {
        var height = this.retainmentView.element.clientHeight;
        height += this._previousDragPosition - event.pageY;
        this._previousDragPosition = event.pageY;
        this._updateRetainmentViewHeight(height);
        event.consume(true);
    },

    _endRetainersHeaderDragging: function(event)
    {
        WebInspector.elementDragEnd(event);
        delete this._previousDragPosition;
        event.consume();
    },

    _updateRetainmentViewHeight: function(height)
    {
        height = Number.constrain(height, Preferences.minConsoleHeight, this.element.clientHeight - Preferences.minConsoleHeight);
        this.viewsContainer.style.bottom = (height + this.retainmentViewHeader.clientHeight) + "px";
        this.retainmentView.element.style.height = height + "px";
        this.retainmentViewHeader.style.bottom = height + "px";
    },

    _updateBaseOptions: function()
    {
        var list = this._profiles();
        // We're assuming that snapshots can only be added.
        if (this.baseSelectElement.length === list.length)
            return;

        for (var i = this.baseSelectElement.length, n = list.length; i < n; ++i) {
            var baseOption = document.createElement("option");
            var title = list[i].title;
            if (!title.indexOf(UserInitiatedProfileName))
                title = WebInspector.UIString("Snapshot %d", title.substring(UserInitiatedProfileName.length + 1));
            baseOption.label = title;
            this.baseSelectElement.appendChild(baseOption);
        }
    },

    _updateFilterOptions: function()
    {
        var list = this._profiles();
        // We're assuming that snapshots can only be added.
        if (this.filterSelectElement.length - 1 === list.length)
            return;

        if (!this.filterSelectElement.length) {
            var filterOption = document.createElement("option");
            filterOption.label = WebInspector.UIString("All objects");
            this.filterSelectElement.appendChild(filterOption);
        }

        for (var i = this.filterSelectElement.length - 1, n = list.length; i < n; ++i) {
            var filterOption = document.createElement("option");
            var title = list[i].title;
            if (!title.indexOf(UserInitiatedProfileName)) {
                if (!i)
                    title = WebInspector.UIString("Objects allocated before Snapshot %d", title.substring(UserInitiatedProfileName.length + 1));
                else
                    title = WebInspector.UIString("Objects allocated between Snapshots %d and %d", title.substring(UserInitiatedProfileName.length + 1) - 1, title.substring(UserInitiatedProfileName.length + 1));
            }
            filterOption.label = title;
            this.filterSelectElement.appendChild(filterOption);
        }
    }
};

WebInspector.DetailedHeapshotView.prototype.__proto__ = WebInspector.View.prototype;

WebInspector.settings.showHeapSnapshotObjectsHiddenProperties = WebInspector.settings.createSetting("showHeaSnapshotObjectsHiddenProperties", false);

WebInspector.DetailedHeapshotProfileType = function()
{
    WebInspector.ProfileType.call(this, WebInspector.DetailedHeapshotProfileType.TypeId, WebInspector.UIString("Take Heap Snapshot"));
}

WebInspector.DetailedHeapshotProfileType.TypeId = "HEAP";

WebInspector.DetailedHeapshotProfileType.prototype = {
    get buttonTooltip()
    {
        return WebInspector.UIString("Take heap snapshot.");
    },

    buttonClicked: function()
    {
        WebInspector.panels.profiles.takeHeapSnapshot();
    },

    get treeItemTitle()
    {
        return WebInspector.UIString("HEAP SNAPSHOTS");
    },

    get description()
    {
        return WebInspector.UIString("Heap snapshot profiles show memory distribution among your page's JavaScript objects and related DOM nodes.");
    },

    createSidebarTreeElementForProfile: function(profile)
    {
        return new WebInspector.ProfileSidebarTreeElement(profile, WebInspector.UIString("Snapshot %d"), "heap-snapshot-sidebar-tree-item");
    },

    createView: function(profile)
    {
        return new WebInspector.DetailedHeapshotView(WebInspector.panels.profiles, profile);
    }
}

WebInspector.DetailedHeapshotProfileType.prototype.__proto__ = WebInspector.ProfileType.prototype;
