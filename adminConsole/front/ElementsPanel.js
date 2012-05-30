/*
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

/**
 * @constructor
 * @extends {WebInspector.Panel}
 */
WebInspector.ElementsPanel = function()
{
    WebInspector.Panel.call(this, "elements");
    this.registerRequiredCSS("elementsPanel.css");
    this.registerRequiredCSS("textPrompt.css");
    this.setHideOnDetach();

    const initialSidebarWidth = 325;
    const minimalContentWidthPercent = 34;
    this.createSplitView(this.element, WebInspector.SplitView.SidebarPosition.Right, initialSidebarWidth);
    this.splitView.minimalSidebarWidth = Preferences.minElementsSidebarWidth;
    this.splitView.minimalMainWidthPercent = minimalContentWidthPercent;

    this.contentElement = this.splitView.mainElement;
    this.contentElement.id = "elements-content";
    this.contentElement.addStyleClass("outline-disclosure");
    this.contentElement.addStyleClass("source-code");
    if (!WebInspector.settings.domWordWrap.get())
        this.contentElement.classList.add("nowrap");
    WebInspector.settings.domWordWrap.addChangeListener(this._domWordWrapSettingChanged.bind(this));

    this.contentElement.addEventListener("contextmenu", this._contextMenuEventFired.bind(this), true);

    this.treeOutline = new WebInspector.ElementsTreeOutline(true, true, false, this._populateContextMenu.bind(this));
    this.treeOutline.wireToDomAgent();

    this.treeOutline.addEventListener(WebInspector.ElementsTreeOutline.Events.SelectedNodeChanged, this._selectedNodeChanged, this);

    this.crumbsElement = document.createElement("div");
    this.crumbsElement.className = "crumbs";
    this.crumbsElement.addEventListener("mousemove", this._mouseMovedInCrumbs.bind(this), false);
    this.crumbsElement.addEventListener("mouseout", this._mouseMovedOutOfCrumbs.bind(this), false);

    this.sidebarPanes = {};
    this.sidebarPanes.computedStyle = new WebInspector.ComputedStyleSidebarPane();
    this.sidebarPanes.styles = new WebInspector.StylesSidebarPane(this.sidebarPanes.computedStyle);
    this.sidebarPanes.metrics = new WebInspector.MetricsSidebarPane();
    this.sidebarPanes.properties = new WebInspector.PropertiesSidebarPane();
    if (Capabilities.nativeInstrumentationEnabled)
        this.sidebarPanes.domBreakpoints = WebInspector.domBreakpointsSidebarPane;
    this.sidebarPanes.eventListeners = new WebInspector.EventListenersSidebarPane();

    this.sidebarPanes.styles.onexpand = this.updateStyles.bind(this);
    this.sidebarPanes.metrics.onexpand = this.updateMetrics.bind(this);
    this.sidebarPanes.properties.onexpand = this.updateProperties.bind(this);
    this.sidebarPanes.eventListeners.onexpand = this.updateEventListeners.bind(this);

    this.sidebarPanes.styles.expanded = true;

    this.sidebarPanes.styles.addEventListener("style edited", this._stylesPaneEdited, this);
    this.sidebarPanes.styles.addEventListener("style property toggled", this._stylesPaneEdited, this);
    this.sidebarPanes.metrics.addEventListener("metrics edited", this._metricsPaneEdited, this);

    for (var pane in this.sidebarPanes) {
        this.sidebarElement.appendChild(this.sidebarPanes[pane].element);
        if (this.sidebarPanes[pane].onattach)
            this.sidebarPanes[pane].onattach();
    }

    this.nodeSearchButton = new WebInspector.StatusBarButton(WebInspector.UIString("Select an element in the page to inspect it."), "node-search-status-bar-item");
    this.nodeSearchButton.addEventListener("click", this.toggleSearchingForNode, this);

    this._registerShortcuts();

    this._popoverHelper = new WebInspector.PopoverHelper(document.body, this._getPopoverAnchor.bind(this), this._showPopover.bind(this));
    this._popoverHelper.setTimeout(0);

    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.NodeRemoved, this._nodeRemoved, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.DocumentUpdated, this._documentUpdated, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.InspectElementRequested, this._inspectElementRequested, this);
}

WebInspector.ElementsPanel.prototype = {
    get toolbarItemLabel()
    {
        return WebInspector.UIString("Elements");
    },

    get statusBarItems()
    {
        return [this.crumbsElement];
    },

    get defaultFocusedElement()
    {
        return this.treeOutline.element;
    },

    statusBarResized: function()
    {
        this.updateBreadcrumbSizes();
    },

    wasShown: function()
    {
        // Attach heavy component lazily
        if (this.treeOutline.element.parentElement !== this.contentElement)
            this.contentElement.appendChild(this.treeOutline.element);

        WebInspector.Panel.prototype.wasShown.call(this);

        this.updateBreadcrumb();
        this.treeOutline.updateSelection();
        this.treeOutline.setVisible(true);

        if (!this.treeOutline.rootDOMNode)
            WebInspector.domAgent.requestDocument();

        if (Capabilities.nativeInstrumentationEnabled)
            this.sidebarElement.insertBefore(this.sidebarPanes.domBreakpoints.element, this.sidebarPanes.eventListeners.element);
    },

    willHide: function()
    {
        WebInspector.domAgent.hideDOMNodeHighlight();
        this.setSearchingForNode(false);
        this.treeOutline.setVisible(false);
        this._popoverHelper.hidePopover();

        // Detach heavy component on hide
        this.contentElement.removeChild(this.treeOutline.element);

        for (var pane in this.sidebarPanes) {
            if (this.sidebarPanes[pane].willHide)
                this.sidebarPanes[pane].willHide();
        }

        WebInspector.Panel.prototype.willHide.call(this);
    },

    onResize: function()
    {
        this.treeOutline.updateSelection();
        this.updateBreadcrumbSizes();
    },

    _selectedNodeChanged: function()
    {
        var selectedNode = this.selectedDOMNode();
        if (!selectedNode && this._lastValidSelectedNode)
            this._selectedPathOnReset = this._lastValidSelectedNode.path();

        this.updateBreadcrumb(false);

        this._updateSidebars();

        if (selectedNode) {
            ConsoleAgent.addInspectedNode(selectedNode.id);
            this._lastValidSelectedNode = selectedNode;
        }
    },

    _updateSidebars: function()
    {
        for (var pane in this.sidebarPanes)
           this.sidebarPanes[pane].needsUpdate = true;

        this.updateStyles(true);
        this.updateMetrics();
        this.updateProperties();
        this.updateEventListeners();
    },

    _reset: function()
    {
        delete this.currentQuery;
    },

    _documentUpdated: function(event)
    {
        var inspectedRootDocument = event.data;

        this._reset();
        this.searchCanceled();

        this.treeOutline.rootDOMNode = inspectedRootDocument;

        if (!inspectedRootDocument) {
            if (this.isShowing())
                WebInspector.domAgent.requestDocument();
            return;
        }

        if (Capabilities.nativeInstrumentationEnabled)
            this.sidebarPanes.domBreakpoints.restoreBreakpoints();

        /**
         * @this {WebInspector.ElementsPanel}
         * @param {WebInspector.DOMNode=} candidateFocusNode
         */
        function selectNode(candidateFocusNode)
        {
            if (!candidateFocusNode)
                candidateFocusNode = inspectedRootDocument.body || inspectedRootDocument.documentElement;

            if (!candidateFocusNode)
                return;

            this.selectDOMNode(candidateFocusNode);
            if (this.treeOutline.selectedTreeElement)
                this.treeOutline.selectedTreeElement.expand();
        }

        function selectLastSelectedNode(nodeId)
        {
            if (this.selectedDOMNode()) {
                // Focused node has been explicitly set while reaching out for the last selected node.
                return;
            }
            var node = nodeId ? WebInspector.domAgent.nodeForId(nodeId) : null;
            selectNode.call(this, node);
        }

        if (this._selectedPathOnReset)
            WebInspector.domAgent.pushNodeByPathToFrontend(this._selectedPathOnReset, selectLastSelectedNode.bind(this));
        else
            selectNode.call(this);
        delete this._selectedPathOnReset;
    },

    searchCanceled: function()
    {
        delete this._searchQuery;
        this._hideSearchHighlights();

        WebInspector.searchController.updateSearchMatchesCount(0, this);

        delete this._currentSearchResultIndex;
        delete this._searchResults;
        WebInspector.domAgent.cancelSearch();
    },

    performSearch: function(query)
    {
        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();

        const whitespaceTrimmedQuery = query.trim();
        if (!whitespaceTrimmedQuery.length)
            return;

        this._searchQuery = query;

        /**
         * @param {number} resultCount
         */
        function resultCountCallback(resultCount)
        {
            WebInspector.searchController.updateSearchMatchesCount(resultCount, this);
            if (!resultCount)
                return;

            this._searchResults = new Array(resultCount);
            this._currentSearchResultIndex = -1;
            this.jumpToNextSearchResult();
        }
        WebInspector.domAgent.performSearch(whitespaceTrimmedQuery, resultCountCallback.bind(this));
    },

    _contextMenuEventFired: function(event)
    {
        function toggleWordWrap()
        {
            WebInspector.settings.domWordWrap.set(!WebInspector.settings.domWordWrap.get());
        }

        var contextMenu = new WebInspector.ContextMenu();
        var populated = this.treeOutline.populateContextMenu(contextMenu, event);
        if (populated)
            contextMenu.appendSeparator();
        contextMenu.appendCheckboxItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Word wrap" : "Word Wrap"), toggleWordWrap.bind(this), WebInspector.settings.domWordWrap.get());

        contextMenu.show(event);
    },

    _domWordWrapSettingChanged: function(event)
    {
        if (event.data)
            this.contentElement.removeStyleClass("nowrap");
        else
            this.contentElement.addStyleClass("nowrap");

        var selectedNode = this.selectedDOMNode();
        if (!selectedNode)
            return;

        var treeElement = this.treeOutline.findTreeElement(selectedNode);
        if (treeElement)
            treeElement.updateSelection(); // Recalculate selection highlight dimensions.
    },

    switchToAndFocus: function(node)
    {
        // Reset search restore.
        WebInspector.searchController.cancelSearch();
        WebInspector.inspectorView.setCurrentPanel(this);
        this.selectDOMNode(node, true);
    },

    _populateContextMenu: function(contextMenu, node)
    {
        if (Capabilities.nativeInstrumentationEnabled) {
            // Add debbuging-related actions
            contextMenu.appendSeparator();
            var pane = this.sidebarPanes.domBreakpoints;
            pane.populateNodeContextMenu(node, contextMenu);
        }
    },

    _getPopoverAnchor: function(element)
    {
        var anchor = element.enclosingNodeOrSelfWithClass("webkit-html-resource-link");
        if (anchor) {
            if (!anchor.href)
                return null;

            var resource = WebInspector.resourceTreeModel.resourceForURL(anchor.href);
            if (!resource || resource.type !== WebInspector.Resource.Type.Image)
                return null;

            anchor.removeAttribute("title");
        }
        return anchor;
    },
    
    _loadDimensionsForNode: function(treeElement, callback)
    {
        // We get here for CSS properties, too, so bail out early for non-DOM treeElements.
        if (treeElement.treeOutline !== this.treeOutline) {
            callback();
            return;
        }
        
        var node = /** @type {WebInspector.DOMNode} */ treeElement.representedObject;

        if (!node.nodeName() || node.nodeName().toLowerCase() !== "img") {
            callback();
            return;
        }

        WebInspector.RemoteObject.resolveNode(node, "", resolvedNode);

        function resolvedNode(object)
        {
            if (!object) {
                callback();
                return;
            }

            object.callFunctionJSON(dimensions, undefined, callback);
            object.release();

            function dimensions()
            {
                return { offsetWidth: this.offsetWidth, offsetHeight: this.offsetHeight, naturalWidth: this.naturalWidth, naturalHeight: this.naturalHeight };
            }
        }
    },

    /**
     * @param {Element} anchor
     * @param {WebInspector.Popover} popover
     */
    _showPopover: function(anchor, popover)
    {
        var listItem = anchor.enclosingNodeOrSelfWithNodeNameInArray(["li"]);
        if (listItem && listItem.treeElement)
            this._loadDimensionsForNode(listItem.treeElement, dimensionsCallback);
        else
            dimensionsCallback();

        /**
         * @param {Object=} dimensions
         */
        function dimensionsCallback(dimensions)
        {
            var imageElement = document.createElement("img");
            imageElement.addEventListener("load", showPopover.bind(null, imageElement, dimensions), false);
            var resource = WebInspector.resourceTreeModel.resourceForURL(anchor.href);
            if (!resource)
                return;
    
            resource.populateImageSource(imageElement);
        }

        /**
         * @param {Object=} dimensions
         */
        function showPopover(imageElement, dimensions)
        {
            var contents = buildPopoverContents(imageElement, dimensions);
            popover.setCanShrink(false);
            popover.show(contents, anchor);
        }

        /**
         * @param {Object=} nodeDimensions
         */
        function buildPopoverContents(imageElement, nodeDimensions)
        {
            const maxImageWidth = 100;
            const maxImageHeight = 100;
            var container = document.createElement("table");
            container.className = "image-preview-container";
            var naturalWidth = nodeDimensions ? nodeDimensions.naturalWidth : imageElement.naturalWidth;
            var naturalHeight = nodeDimensions ? nodeDimensions.naturalHeight : imageElement.naturalHeight;
            var offsetWidth = nodeDimensions ? nodeDimensions.offsetWidth : naturalWidth;
            var offsetHeight = nodeDimensions ? nodeDimensions.offsetHeight : naturalHeight;
            var description;
            if (offsetHeight === naturalHeight && offsetWidth === naturalWidth)
                description = WebInspector.UIString("%d \xd7 %d pixels", offsetWidth, offsetHeight);
            else
                description = WebInspector.UIString("%d \xd7 %d pixels (Natural: %d \xd7 %d pixels)", offsetWidth, offsetHeight, naturalWidth, naturalHeight);

            if (naturalWidth > naturalHeight) {
                if (naturalWidth > maxImageWidth) {
                    imageElement.style.width = maxImageWidth + "px";
                    imageElement.style.height = (naturalHeight * maxImageWidth / naturalWidth) + "px";
                }
            } else {
                if (naturalHeight > maxImageHeight) {
                    imageElement.style.width = (naturalWidth * maxImageHeight / naturalHeight) + "px";
                    imageElement.style.height = maxImageHeight + "px";
                }
            }
            container.createChild("tr").createChild("td", "image-container").appendChild(imageElement);
            container.createChild("tr").createChild("td").createChild("span", "description").textContent = description;
            return container;
        }
    },

    jumpToNextSearchResult: function()
    {
        if (!this._searchResults)
            return;

        this._hideSearchHighlights();
        if (++this._currentSearchResultIndex >= this._searchResults.length)
            this._currentSearchResultIndex = 0;
            
        this._highlightCurrentSearchResult();
    },

    jumpToPreviousSearchResult: function()
    {
        if (!this._searchResults)
            return;

        this._hideSearchHighlights();
        if (--this._currentSearchResultIndex < 0)
            this._currentSearchResultIndex = (this._searchResults.length - 1);

        this._highlightCurrentSearchResult();
    },

    _highlightCurrentSearchResult: function()
    {
        var index = this._currentSearchResultIndex;
        var searchResults = this._searchResults;
        var searchResult = searchResults[index];

        if (searchResult === null) {
            WebInspector.searchController.updateCurrentMatchIndex(index, this);
            return;
        }

        if (typeof searchResult === "undefined") {
            // No data for slot, request it.
            function callback(node)
            {
                searchResults[index] = node || null;
                this._highlightCurrentSearchResult();
            }
            WebInspector.domAgent.searchResult(index, callback.bind(this));
            return;
        }

        WebInspector.searchController.updateCurrentMatchIndex(index, this);

        var treeElement = this.treeOutline.findTreeElement(searchResult);
        if (treeElement) {
            treeElement.highlightSearchResults(this._searchQuery);
            treeElement.reveal();
        }
    },

    _hideSearchHighlights: function()
    {
        if (!this._searchResults)
            return;
        var searchResult = this._searchResults[this._currentSearchResultIndex];
        if (!searchResult)
            return;
        var treeElement = this.treeOutline.findTreeElement(searchResult);
        if (treeElement)
            treeElement.hideSearchHighlights();
    },

    selectedDOMNode: function()
    {
        return this.treeOutline.selectedDOMNode();
    },

    /**
     * @param {boolean=} focus
     */
    selectDOMNode: function(node, focus)
    {
        this.treeOutline.selectDOMNode(node, focus);
    },

    _nodeRemoved: function(event)
    {
        if (!this.isShowing())
            return;

        var crumbs = this.crumbsElement;
        for (var crumb = crumbs.firstChild; crumb; crumb = crumb.nextSibling) {
            if (crumb.representedObject === event.data.node) {
                this.updateBreadcrumb(true);
                return;
            }
        }
    },

    _stylesPaneEdited: function()
    {
        // Once styles are edited, the Metrics pane should be updated.
        this.sidebarPanes.metrics.needsUpdate = true;
        this.updateMetrics();
    },

    _metricsPaneEdited: function()
    {
        // Once metrics are edited, the Styles pane should be updated.
        this.sidebarPanes.styles.needsUpdate = true;
        this.updateStyles(true);
    },

    _mouseMovedInCrumbs: function(event)
    {
        var nodeUnderMouse = document.elementFromPoint(event.pageX, event.pageY);
        var crumbElement = nodeUnderMouse.enclosingNodeOrSelfWithClass("crumb");

        WebInspector.domAgent.highlightDOMNode(crumbElement ? crumbElement.representedObject.id : 0);

        if ("_mouseOutOfCrumbsTimeout" in this) {
            clearTimeout(this._mouseOutOfCrumbsTimeout);
            delete this._mouseOutOfCrumbsTimeout;
        }
    },

    _mouseMovedOutOfCrumbs: function(event)
    {
        var nodeUnderMouse = document.elementFromPoint(event.pageX, event.pageY);
        if (nodeUnderMouse && nodeUnderMouse.isDescendant(this.crumbsElement))
            return;

        WebInspector.domAgent.hideDOMNodeHighlight();

        this._mouseOutOfCrumbsTimeout = setTimeout(this.updateBreadcrumbSizes.bind(this), 1000);
    },

    /**
     * @param {boolean=} forceUpdate
     */
    updateBreadcrumb: function(forceUpdate)
    {
        if (!this.isShowing())
            return;

        var crumbs = this.crumbsElement;

        var handled = false;
        var foundRoot = false;
        var crumb = crumbs.firstChild;
        while (crumb) {
            if (crumb.representedObject === this.treeOutline.rootDOMNode)
                foundRoot = true;

            if (foundRoot)
                crumb.addStyleClass("dimmed");
            else
                crumb.removeStyleClass("dimmed");

            if (crumb.representedObject === this.selectedDOMNode()) {
                crumb.addStyleClass("selected");
                handled = true;
            } else {
                crumb.removeStyleClass("selected");
            }

            crumb = crumb.nextSibling;
        }

        if (handled && !forceUpdate) {
            // We don't need to rebuild the crumbs, but we need to adjust sizes
            // to reflect the new focused or root node.
            this.updateBreadcrumbSizes();
            return;
        }

        crumbs.removeChildren();

        var panel = this;

        function selectCrumbFunction(event)
        {
            var crumb = event.currentTarget;
            if (crumb.hasStyleClass("collapsed")) {
                // Clicking a collapsed crumb will expose the hidden crumbs.
                if (crumb === panel.crumbsElement.firstChild) {
                    // If the focused crumb is the first child, pick the farthest crumb
                    // that is still hidden. This allows the user to expose every crumb.
                    var currentCrumb = crumb;
                    while (currentCrumb) {
                        var hidden = currentCrumb.hasStyleClass("hidden");
                        var collapsed = currentCrumb.hasStyleClass("collapsed");
                        if (!hidden && !collapsed)
                            break;
                        crumb = currentCrumb;
                        currentCrumb = currentCrumb.nextSibling;
                    }
                }

                panel.updateBreadcrumbSizes(crumb);
            } else
                panel.selectDOMNode(crumb.representedObject, true);

            event.preventDefault();
        }

        foundRoot = false;
        for (var current = this.selectedDOMNode(); current; current = current.parentNode) {
            if (current.nodeType() === Node.DOCUMENT_NODE)
                continue;

            if (current === this.treeOutline.rootDOMNode)
                foundRoot = true;

            crumb = document.createElement("span");
            crumb.className = "crumb";
            crumb.representedObject = current;
            crumb.addEventListener("mousedown", selectCrumbFunction, false);

            var crumbTitle;
            switch (current.nodeType()) {
                case Node.ELEMENT_NODE:
                    WebInspector.DOMPresentationUtils.decorateNodeLabel(current, crumb);
                    break;

                case Node.TEXT_NODE:
                    crumbTitle = WebInspector.UIString("(text)");
                    break

                case Node.COMMENT_NODE:
                    crumbTitle = "<!-->";
                    break;

                case Node.DOCUMENT_TYPE_NODE:
                    crumbTitle = "<!DOCTYPE>";
                    break;

                default:
                    crumbTitle = current.nodeNameInCorrectCase();
            }

            if (!crumb.childNodes.length) {
                var nameElement = document.createElement("span");
                nameElement.textContent = crumbTitle;
                crumb.appendChild(nameElement);
                crumb.title = crumbTitle;
            }

            if (foundRoot)
                crumb.addStyleClass("dimmed");
            if (current === this.selectedDOMNode())
                crumb.addStyleClass("selected");
            if (!crumbs.childNodes.length)
                crumb.addStyleClass("end");

            crumbs.appendChild(crumb);
        }

        if (crumbs.hasChildNodes())
            crumbs.lastChild.addStyleClass("start");

        this.updateBreadcrumbSizes();
    },

    /**
     * @param {Element=} focusedCrumb
     */
    updateBreadcrumbSizes: function(focusedCrumb)
    {
        if (!this.isShowing())
            return;

        if (document.body.offsetWidth <= 0) {
            // The stylesheet hasn't loaded yet or the window is closed,
            // so we can't calculate what is need. Return early.
            return;
        }

        var crumbs = this.crumbsElement;
        if (!crumbs.childNodes.length || crumbs.offsetWidth <= 0)
            return; // No crumbs, do nothing.

        // A Zero index is the right most child crumb in the breadcrumb.
        var selectedIndex = 0;
        var focusedIndex = 0;
        var selectedCrumb;

        var i = 0;
        var crumb = crumbs.firstChild;
        while (crumb) {
            // Find the selected crumb and index.
            if (!selectedCrumb && crumb.hasStyleClass("selected")) {
                selectedCrumb = crumb;
                selectedIndex = i;
            }

            // Find the focused crumb index.
            if (crumb === focusedCrumb)
                focusedIndex = i;

            // Remove any styles that affect size before
            // deciding to shorten any crumbs.
            if (crumb !== crumbs.lastChild)
                crumb.removeStyleClass("start");
            if (crumb !== crumbs.firstChild)
                crumb.removeStyleClass("end");

            crumb.removeStyleClass("compact");
            crumb.removeStyleClass("collapsed");
            crumb.removeStyleClass("hidden");

            crumb = crumb.nextSibling;
            ++i;
        }

        // Restore the start and end crumb classes in case they got removed in coalesceCollapsedCrumbs().
        // The order of the crumbs in the document is opposite of the visual order.
        crumbs.firstChild.addStyleClass("end");
        crumbs.lastChild.addStyleClass("start");

        function crumbsAreSmallerThanContainer()
        {
            var rightPadding = 20;
            var errorWarningElement = document.getElementById("error-warning-count");
            if (!WebInspector.drawer.visible && errorWarningElement)
                rightPadding += errorWarningElement.offsetWidth;
            return ((crumbs.totalOffsetLeft() + crumbs.offsetWidth + rightPadding) < window.innerWidth);
        }

        if (crumbsAreSmallerThanContainer())
            return; // No need to compact the crumbs, they all fit at full size.

        var BothSides = 0;
        var AncestorSide = -1;
        var ChildSide = 1;

        /**
         * @param {boolean=} significantCrumb
         */
        function makeCrumbsSmaller(shrinkingFunction, direction, significantCrumb)
        {
            if (!significantCrumb)
                significantCrumb = (focusedCrumb || selectedCrumb);

            if (significantCrumb === selectedCrumb)
                var significantIndex = selectedIndex;
            else if (significantCrumb === focusedCrumb)
                var significantIndex = focusedIndex;
            else {
                var significantIndex = 0;
                for (var i = 0; i < crumbs.childNodes.length; ++i) {
                    if (crumbs.childNodes[i] === significantCrumb) {
                        significantIndex = i;
                        break;
                    }
                }
            }

            function shrinkCrumbAtIndex(index)
            {
                var shrinkCrumb = crumbs.childNodes[index];
                if (shrinkCrumb && shrinkCrumb !== significantCrumb)
                    shrinkingFunction(shrinkCrumb);
                if (crumbsAreSmallerThanContainer())
                    return true; // No need to compact the crumbs more.
                return false;
            }

            // Shrink crumbs one at a time by applying the shrinkingFunction until the crumbs
            // fit in the container or we run out of crumbs to shrink.
            if (direction) {
                // Crumbs are shrunk on only one side (based on direction) of the signifcant crumb.
                var index = (direction > 0 ? 0 : crumbs.childNodes.length - 1);
                while (index !== significantIndex) {
                    if (shrinkCrumbAtIndex(index))
                        return true;
                    index += (direction > 0 ? 1 : -1);
                }
            } else {
                // Crumbs are shrunk in order of descending distance from the signifcant crumb,
                // with a tie going to child crumbs.
                var startIndex = 0;
                var endIndex = crumbs.childNodes.length - 1;
                while (startIndex != significantIndex || endIndex != significantIndex) {
                    var startDistance = significantIndex - startIndex;
                    var endDistance = endIndex - significantIndex;
                    if (startDistance >= endDistance)
                        var index = startIndex++;
                    else
                        var index = endIndex--;
                    if (shrinkCrumbAtIndex(index))
                        return true;
                }
            }

            // We are not small enough yet, return false so the caller knows.
            return false;
        }

        function coalesceCollapsedCrumbs()
        {
            var crumb = crumbs.firstChild;
            var collapsedRun = false;
            var newStartNeeded = false;
            var newEndNeeded = false;
            while (crumb) {
                var hidden = crumb.hasStyleClass("hidden");
                if (!hidden) {
                    var collapsed = crumb.hasStyleClass("collapsed");
                    if (collapsedRun && collapsed) {
                        crumb.addStyleClass("hidden");
                        crumb.removeStyleClass("compact");
                        crumb.removeStyleClass("collapsed");

                        if (crumb.hasStyleClass("start")) {
                            crumb.removeStyleClass("start");
                            newStartNeeded = true;
                        }

                        if (crumb.hasStyleClass("end")) {
                            crumb.removeStyleClass("end");
                            newEndNeeded = true;
                        }

                        continue;
                    }

                    collapsedRun = collapsed;

                    if (newEndNeeded) {
                        newEndNeeded = false;
                        crumb.addStyleClass("end");
                    }
                } else
                    collapsedRun = true;
                crumb = crumb.nextSibling;
            }

            if (newStartNeeded) {
                crumb = crumbs.lastChild;
                while (crumb) {
                    if (!crumb.hasStyleClass("hidden")) {
                        crumb.addStyleClass("start");
                        break;
                    }
                    crumb = crumb.previousSibling;
                }
            }
        }

        function compact(crumb)
        {
            if (crumb.hasStyleClass("hidden"))
                return;
            crumb.addStyleClass("compact");
        }

        function collapse(crumb, dontCoalesce)
        {
            if (crumb.hasStyleClass("hidden"))
                return;
            crumb.addStyleClass("collapsed");
            crumb.removeStyleClass("compact");
            if (!dontCoalesce)
                coalesceCollapsedCrumbs();
        }

        function compactDimmed(crumb)
        {
            if (crumb.hasStyleClass("dimmed"))
                compact(crumb);
        }

        function collapseDimmed(crumb)
        {
            if (crumb.hasStyleClass("dimmed"))
                collapse(crumb, false);
        }

        if (!focusedCrumb) {
            // When not focused on a crumb we can be biased and collapse less important
            // crumbs that the user might not care much about.

            // Compact child crumbs.
            if (makeCrumbsSmaller(compact, ChildSide))
                return;

            // Collapse child crumbs.
            if (makeCrumbsSmaller(collapse, ChildSide))
                return;

            // Compact dimmed ancestor crumbs.
            if (makeCrumbsSmaller(compactDimmed, AncestorSide))
                return;

            // Collapse dimmed ancestor crumbs.
            if (makeCrumbsSmaller(collapseDimmed, AncestorSide))
                return;
        }

        // Compact ancestor crumbs, or from both sides if focused.
        if (makeCrumbsSmaller(compact, (focusedCrumb ? BothSides : AncestorSide)))
            return;

        // Collapse ancestor crumbs, or from both sides if focused.
        if (makeCrumbsSmaller(collapse, (focusedCrumb ? BothSides : AncestorSide)))
            return;

        if (!selectedCrumb)
            return;

        // Compact the selected crumb.
        compact(selectedCrumb);
        if (crumbsAreSmallerThanContainer())
            return;

        // Collapse the selected crumb as a last resort. Pass true to prevent coalescing.
        collapse(selectedCrumb, true);
    },

    updateStyles: function(forceUpdate)
    {
        var stylesSidebarPane = this.sidebarPanes.styles;
        var computedStylePane = this.sidebarPanes.computedStyle;
        if ((!stylesSidebarPane.expanded && !computedStylePane.expanded) || !stylesSidebarPane.needsUpdate)
            return;

        stylesSidebarPane.update(this.selectedDOMNode(), forceUpdate);
        stylesSidebarPane.needsUpdate = false;
    },

    updateMetrics: function()
    {
        var metricsSidebarPane = this.sidebarPanes.metrics;
        if (!metricsSidebarPane.expanded || !metricsSidebarPane.needsUpdate)
            return;

        metricsSidebarPane.update(this.selectedDOMNode());
        metricsSidebarPane.needsUpdate = false;
    },

    updateProperties: function()
    {
        var propertiesSidebarPane = this.sidebarPanes.properties;
        if (!propertiesSidebarPane.expanded || !propertiesSidebarPane.needsUpdate)
            return;

        propertiesSidebarPane.update(this.selectedDOMNode());
        propertiesSidebarPane.needsUpdate = false;
    },

    updateEventListeners: function()
    {
        var eventListenersSidebarPane = this.sidebarPanes.eventListeners;
        if (!eventListenersSidebarPane.expanded || !eventListenersSidebarPane.needsUpdate)
            return;

        eventListenersSidebarPane.update(this.selectedDOMNode());
        eventListenersSidebarPane.needsUpdate = false;
    },

    _registerShortcuts: function()
    {
        var shortcut = WebInspector.KeyboardShortcut;
        var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("Elements Panel"));
        var keys = [
            shortcut.shortcutToString(shortcut.Keys.Up),
            shortcut.shortcutToString(shortcut.Keys.Down)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Navigate elements"));

        keys = [
            shortcut.shortcutToString(shortcut.Keys.Right),
            shortcut.shortcutToString(shortcut.Keys.Left)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Expand/collapse"));
        section.addKey(shortcut.shortcutToString(shortcut.Keys.Enter), WebInspector.UIString("Edit attribute"));
        section.addKey(shortcut.shortcutToString(shortcut.Keys.F2), WebInspector.UIString("Toggle edit as HTML"));

        this.sidebarPanes.styles.registerShortcuts();
    },

    handleShortcut: function(event)
    {
        // Cmd/Control + Shift + C should be a shortcut to clicking the Node Search Button.
        // This shortcut matches Firebug.
        if (event.keyIdentifier === "U+0043") { // C key
            if (WebInspector.isMac())
                var isNodeSearchKey = event.metaKey && !event.ctrlKey && !event.altKey && event.shiftKey;
            else
                var isNodeSearchKey = event.ctrlKey && !event.metaKey && !event.altKey && event.shiftKey;

            if (isNodeSearchKey) {
                this.toggleSearchingForNode();
                event.handled = true;
                return;
            }
            return;
        }

        if (WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && !event.shiftKey && event.keyIdentifier === "U+005A") { // Z key
            WebInspector.domAgent.undo(this._updateSidebars.bind(this));
            event.handled = true;
            return;
        }

        var isRedoKey = WebInspector.isMac() ? event.metaKey && event.shiftKey && event.keyIdentifier === "U+005A" : // Z key
                                               event.ctrlKey && event.keyIdentifier === "U+0059"; // Y key
        if (isRedoKey) {
            DOMAgent.redo(this._updateSidebars.bind(this));
            event.handled = true;
            return;
        }

        this.treeOutline.handleShortcut(event);
    },

    handleCopyEvent: function(event)
    {
        // Don't prevent the normal copy if the user has a selection.
        if (!window.getSelection().isCollapsed)
            return;
        event.clipboardData.clearData();
        event.preventDefault();
        this.selectedDOMNode().copyNode();
    },

    sidebarResized: function(event)
    {
        this.treeOutline.updateSelection();
    },

    _inspectElementRequested: function(event)
    {
        var node = event.data;
        this.revealAndSelectNode(node.id);
    },

    revealAndSelectNode: function(nodeId)
    {
        WebInspector.inspectorView.setCurrentPanel(this);

        var node = WebInspector.domAgent.nodeForId(nodeId);
        if (!node)
            return;

        WebInspector.domAgent.highlightDOMNodeForTwoSeconds(nodeId);
        this.selectDOMNode(node, true);
        if (this.nodeSearchButton.toggled) {
            InspectorFrontendHost.bringToFront();
            this.nodeSearchButton.toggled = false;
        }
    },

    setSearchingForNode: function(enabled)
    {
        function callback(error)
        {
            if (!error)
                this.nodeSearchButton.toggled = enabled;
        }
        WebInspector.domAgent.setInspectModeEnabled(enabled, callback.bind(this));
    },

    toggleSearchingForNode: function()
    {
        this.setSearchingForNode(!this.nodeSearchButton.toggled);
    }
}

WebInspector.ElementsPanel.prototype.__proto__ = WebInspector.Panel.prototype;
