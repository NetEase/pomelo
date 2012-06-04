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
 * @extends {TreeOutline}
 * @param {boolean=} omitRootDOMNode
 * @param {boolean=} selectEnabled
 * @param {boolean=} showInElementsPanelEnabled
 * @param {function(WebInspector.ContextMenu, WebInspector.DOMNode)=} contextMenuCallback
 */
WebInspector.ElementsTreeOutline = function(omitRootDOMNode, selectEnabled, showInElementsPanelEnabled, contextMenuCallback)
{
    this.element = document.createElement("ol");
    this.element.addEventListener("mousedown", this._onmousedown.bind(this), false);
    this.element.addEventListener("mousemove", this._onmousemove.bind(this), false);
    this.element.addEventListener("mouseout", this._onmouseout.bind(this), false);
    this.element.addEventListener("dragstart", this._ondragstart.bind(this), false);
    this.element.addEventListener("dragover", this._ondragover.bind(this), false);
    this.element.addEventListener("dragleave", this._ondragleave.bind(this), false);
    this.element.addEventListener("drop", this._ondrop.bind(this), false);
    this.element.addEventListener("dragend", this._ondragend.bind(this), false);

    TreeOutline.call(this, this.element);

    this._includeRootDOMNode = !omitRootDOMNode;
    this._selectEnabled = selectEnabled;
    this._showInElementsPanelEnabled = showInElementsPanelEnabled;
    this._rootDOMNode = null;
    this._selectDOMNode = null;
    this._eventSupport = new WebInspector.Object();
    this._editing = false;

    this._visible = false;

    this.element.addEventListener("contextmenu", this._contextMenuEventFired.bind(this), true);
    this._contextMenuCallback = contextMenuCallback;
}

WebInspector.ElementsTreeOutline.Events = {
    SelectedNodeChanged: "SelectedNodeChanged"
}

WebInspector.ElementsTreeOutline.prototype = {
    wireToDomAgent: function()
    {
        this._elementsTreeUpdater = new WebInspector.ElementsTreeUpdater(this);
    },

    setVisible: function(visible)
    {
        this._visible = visible;
        if (!this._visible)
            return;

        this._updateModifiedNodes();
        if (this._selectedDOMNode)
            this._revealAndSelectNode(this._selectedDOMNode, false);
    },

    addEventListener: function(eventType, listener, thisObject)
    {
        this._eventSupport.addEventListener(eventType, listener, thisObject);
    },

    removeEventListener: function(eventType, listener, thisObject)
    {
        this._eventSupport.removeEventListener(eventType, listener, thisObject);
    },

    get rootDOMNode()
    {
        return this._rootDOMNode;
    },

    set rootDOMNode(x)
    {
        if (this._rootDOMNode === x)
            return;

        this._rootDOMNode = x;

        this._isXMLMimeType = x && x.isXMLNode();

        this.update();
    },

    get isXMLMimeType()
    {
        return this._isXMLMimeType;
    },

    selectedDOMNode: function()
    {
        return this._selectedDOMNode;
    },

    selectDOMNode: function(node, focus)
    {
        if (this._selectedDOMNode === node) {
            this._revealAndSelectNode(node, !focus);
            return;
        }

        this._selectedDOMNode = node;
        this._revealAndSelectNode(node, !focus);

        // The _revealAndSelectNode() method might find a different element if there is inlined text,
        // and the select() call would change the selectedDOMNode and reenter this setter. So to
        // avoid calling _selectedNodeChanged() twice, first check if _selectedDOMNode is the same
        // node as the one passed in.
        if (this._selectedDOMNode === node)
            this._selectedNodeChanged();
    },

    get editing()
    {
        return this._editing;
    },

    update: function()
    {
        var selectedNode = this.selectedTreeElement ? this.selectedTreeElement.representedObject : null;

        this.removeChildren();

        if (!this.rootDOMNode)
            return;

        var treeElement;
        if (this._includeRootDOMNode) {
            treeElement = new WebInspector.ElementsTreeElement(this.rootDOMNode);
            treeElement.selectable = this._selectEnabled;
            this.appendChild(treeElement);
        } else {
            // FIXME: this could use findTreeElement to reuse a tree element if it already exists
            var node = this.rootDOMNode.firstChild;
            while (node) {
                treeElement = new WebInspector.ElementsTreeElement(node);
                treeElement.selectable = this._selectEnabled;
                this.appendChild(treeElement);
                node = node.nextSibling;
            }
        }

        if (selectedNode)
            this._revealAndSelectNode(selectedNode, true);
    },

    updateSelection: function()
    {
        if (!this.selectedTreeElement)
            return;
        var element = this.treeOutline.selectedTreeElement;
        element.updateSelection();
    },

    _selectedNodeChanged: function()
    {
        this._eventSupport.dispatchEventToListeners(WebInspector.ElementsTreeOutline.Events.SelectedNodeChanged, this._selectedDOMNode);
    },

    findTreeElement: function(node)
    {
        function isAncestorNode(ancestor, node)
        {
            return ancestor.isAncestor(node);
        }

        function parentNode(node)
        {
            return node.parentNode;
        }

        var treeElement = TreeOutline.prototype.findTreeElement.call(this, node, isAncestorNode, parentNode);
        if (!treeElement && node.nodeType() === Node.TEXT_NODE) {
            // The text node might have been inlined if it was short, so try to find the parent element.
            treeElement = TreeOutline.prototype.findTreeElement.call(this, node.parentNode, isAncestorNode, parentNode);
        }

        return treeElement;
    },

    createTreeElementFor: function(node)
    {
        var treeElement = this.findTreeElement(node);
        if (treeElement)
            return treeElement;
        if (!node.parentNode)
            return null;

        treeElement = this.createTreeElementFor(node.parentNode);
        if (treeElement && treeElement.showChild(node.index))
            return treeElement.children[node.index];

        return null;
    },

    set suppressRevealAndSelect(x)
    {
        if (this._suppressRevealAndSelect === x)
            return;
        this._suppressRevealAndSelect = x;
    },

    _revealAndSelectNode: function(node, omitFocus)
    {
        if (!node || this._suppressRevealAndSelect)
            return;

        var treeElement = this.createTreeElementFor(node);
        if (!treeElement)
            return;

        treeElement.revealAndSelect(omitFocus);
    },

    _treeElementFromEvent: function(event)
    {
        var scrollContainer = this.element.parentElement;

        // We choose this X coordinate based on the knowledge that our list
        // items extend at least to the right edge of the outer <ol> container.
        // In the no-word-wrap mode the outer <ol> may be wider than the tree container
        // (and partially hidden), in which case we are left to use only its right boundary.
        var x = scrollContainer.totalOffsetLeft() + scrollContainer.offsetWidth - 36;

        var y = event.pageY;

        // Our list items have 1-pixel cracks between them vertically. We avoid
        // the cracks by checking slightly above and slightly below the mouse
        // and seeing if we hit the same element each time.
        var elementUnderMouse = this.treeElementFromPoint(x, y);
        var elementAboveMouse = this.treeElementFromPoint(x, y - 2);
        var element;
        if (elementUnderMouse === elementAboveMouse)
            element = elementUnderMouse;
        else
            element = this.treeElementFromPoint(x, y + 2);

        return element;
    },

    _onmousedown: function(event)
    {
        var element = this._treeElementFromEvent(event);

        if (!element || element.isEventWithinDisclosureTriangle(event))
            return;

        element.select();
    },

    _onmousemove: function(event)
    {
        var element = this._treeElementFromEvent(event);
        if (element && this._previousHoveredElement === element)
            return;

        if (this._previousHoveredElement) {
            this._previousHoveredElement.hovered = false;
            delete this._previousHoveredElement;
        }

        if (element) {
            element.hovered = true;
            this._previousHoveredElement = element;
        }

        WebInspector.domAgent.highlightDOMNode(element ? element.representedObject.id : 0);
    },

    _onmouseout: function(event)
    {
        var nodeUnderMouse = document.elementFromPoint(event.pageX, event.pageY);
        if (nodeUnderMouse && nodeUnderMouse.isDescendant(this.element))
            return;

        if (this._previousHoveredElement) {
            this._previousHoveredElement.hovered = false;
            delete this._previousHoveredElement;
        }

        WebInspector.domAgent.hideDOMNodeHighlight();
    },

    _ondragstart: function(event)
    {
        var treeElement = this._treeElementFromEvent(event);
        if (!treeElement)
            return false;

        if (!this._isValidDragSourceOrTarget(treeElement))
            return false;

        if (treeElement.representedObject.nodeName() === "BODY" || treeElement.representedObject.nodeName() === "HEAD")
            return false;

        event.dataTransfer.setData("text/plain", treeElement.listItemElement.textContent);
        event.dataTransfer.effectAllowed = "copyMove";
        this._treeElementBeingDragged = treeElement;

        WebInspector.domAgent.hideDOMNodeHighlight();

        return true;
    },

    _ondragover: function(event)
    {
        if (!this._treeElementBeingDragged)
            return false;

        var treeElement = this._treeElementFromEvent(event);
        if (!this._isValidDragSourceOrTarget(treeElement))
            return false;

        var node = treeElement.representedObject;
        while (node) {
            if (node === this._treeElementBeingDragged.representedObject)
                return false;
            node = node.parentNode;
        }

        treeElement.updateSelection();
        treeElement.listItemElement.addStyleClass("elements-drag-over");
        this._dragOverTreeElement = treeElement;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        return false;
    },

    _ondragleave: function(event)
    {
        this._clearDragOverTreeElementMarker();
        event.preventDefault();
        return false;
    },

    _isValidDragSourceOrTarget: function(treeElement)
    {
        if (!treeElement)
            return false;

        var node = treeElement.representedObject;
        if (!(node instanceof WebInspector.DOMNode))
            return false;

        if (!node.parentNode || node.parentNode.nodeType() !== Node.ELEMENT_NODE)
            return false;

        return true;
    },

    _ondrop: function(event)
    {
        event.preventDefault();
        var treeElement = this._treeElementFromEvent(event);
        if (treeElement)
            this._doMove(treeElement);
    },

    _doMove: function(treeElement)
    {
        if (!this._treeElementBeingDragged)
            return;

        var parentNode;
        var anchorNode;

        if (treeElement._elementCloseTag) {
            // Drop onto closing tag -> insert as last child.
            parentNode = treeElement.representedObject;
        } else {
            var dragTargetNode = treeElement.representedObject;
            parentNode = dragTargetNode.parentNode;
            anchorNode = dragTargetNode;
        }

        var wasExpanded = this._treeElementBeingDragged.expanded;
        this._treeElementBeingDragged.representedObject.moveTo(parentNode, anchorNode, this._selectNodeAfterEdit.bind(this, null, wasExpanded));

        delete this._treeElementBeingDragged;
    },

    _ondragend: function(event)
    {
        event.preventDefault();
        this._clearDragOverTreeElementMarker();
        delete this._treeElementBeingDragged;
    },

    _clearDragOverTreeElementMarker: function()
    {
        if (this._dragOverTreeElement) {
            this._dragOverTreeElement.updateSelection();
            this._dragOverTreeElement.listItemElement.removeStyleClass("elements-drag-over");
            delete this._dragOverTreeElement;
        }
    },

    _contextMenuEventFired: function(event)
    {
        if (!this._showInElementsPanelEnabled)
            return;

        var treeElement = this._treeElementFromEvent(event);
        if (!treeElement)
            return;

        function focusElement()
        {
            WebInspector.domAgent.inspectElement(treeElement.representedObject.id);
        }
        var contextMenu = new WebInspector.ContextMenu();
        contextMenu.appendItem(WebInspector.UIString("Reveal in Elements Panel"), focusElement.bind(this));
        contextMenu.show(event);
    },

    populateContextMenu: function(contextMenu, event)
    {
        var treeElement = this._treeElementFromEvent(event);
        if (!treeElement)
            return false;

        var tag = event.target.enclosingNodeOrSelfWithClass("webkit-html-tag");
        var textNode = event.target.enclosingNodeOrSelfWithClass("webkit-html-text-node");
        var commentNode = event.target.enclosingNodeOrSelfWithClass("webkit-html-comment");
        var populated = WebInspector.populateHrefContextMenu(contextMenu, this.selectedDOMNode(), event);
        if (tag && treeElement._populateTagContextMenu) {
            if (populated)
                contextMenu.appendSeparator();
            treeElement._populateTagContextMenu(contextMenu, event);
            populated = true;
        } else if (textNode && treeElement._populateTextContextMenu) {
            if (populated)
                contextMenu.appendSeparator();
            treeElement._populateTextContextMenu(contextMenu, textNode);
            populated = true;
        } else if (commentNode && treeElement._populateNodeContextMenu) {
            if (populated)
                contextMenu.appendSeparator();
            treeElement._populateNodeContextMenu(contextMenu, textNode);
            populated = true;
        }

        return populated;
    },

    adjustCollapsedRange: function()
    {
    },

    _updateModifiedNodes: function()
    {
        if (this._elementsTreeUpdater)
            this._elementsTreeUpdater._updateModifiedNodes();
    },

    _populateContextMenu: function(contextMenu, node)
    {
        if (this._contextMenuCallback)
            this._contextMenuCallback(contextMenu, node);
    },

    handleShortcut: function(event)
    {
        var node = this.selectedDOMNode();
        var treeElement = this.getCachedTreeElement(node);
        if (!node || !treeElement)
            return;

        if (event.keyIdentifier === "F2") {
            this._toggleEditAsHTML(node);
            return;
        }

        if (WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && node.parentNode) {
            if (event.keyIdentifier === "Up" && node.previousSibling) {
                node.moveTo(node.parentNode, node.previousSibling, this._selectNodeAfterEdit.bind(this, null, treeElement.expanded));
                return;
            }
            if (event.keyIdentifier === "Down" && node.nextSibling) {
                node.moveTo(node.parentNode, node.nextSibling.nextSibling, this._selectNodeAfterEdit.bind(this, null, treeElement.expanded));
                return;
            }
        }

    },

    _toggleEditAsHTML: function(node)
    {
        var treeElement = this.getCachedTreeElement(node);
        if (!treeElement)
            return;

        if (treeElement._editing && treeElement._htmlEditElement && WebInspector.isBeingEdited(treeElement._htmlEditElement))
            treeElement._editing.commit();
        else
            treeElement._editAsHTML();
    },

    _selectNodeAfterEdit: function(fallbackNode, wasExpanded, error, nodeId)
    {
        if (error)
            return;

        // Select it and expand if necessary. We force tree update so that it processes dom events and is up to date.
        this._updateModifiedNodes();

        var newNode = WebInspector.domAgent.nodeForId(nodeId) || fallbackNode;
        if (!newNode)
            return;

        this.selectDOMNode(newNode, true);

        var newTreeItem = this.findTreeElement(newNode);
        if (wasExpanded) {
            if (newTreeItem)
                newTreeItem.expand();
        }
        return newTreeItem;
    }
}

WebInspector.ElementsTreeOutline.prototype.__proto__ = TreeOutline.prototype;

/**
 * @constructor
 * @extends {TreeElement}
 * @param {boolean=} elementCloseTag
 */
WebInspector.ElementsTreeElement = function(node, elementCloseTag)
{
    this._elementCloseTag = elementCloseTag;
    var hasChildrenOverride = !elementCloseTag && node.hasChildNodes() && !this._showInlineText(node);

    // The title will be updated in onattach.
    TreeElement.call(this, "", node, hasChildrenOverride);

    if (this.representedObject.nodeType() == Node.ELEMENT_NODE && !elementCloseTag)
        this._canAddAttributes = true;
    this._searchQuery = null;
    this._expandedChildrenLimit = WebInspector.ElementsTreeElement.InitialChildrenLimit;
}

WebInspector.ElementsTreeElement.InitialChildrenLimit = 500;

// A union of HTML4 and HTML5-Draft elements that explicitly
// or implicitly (for HTML5) forbid the closing tag.
// FIXME: Revise once HTML5 Final is published.
WebInspector.ElementsTreeElement.ForbiddenClosingTagElements = [
    "area", "base", "basefont", "br", "canvas", "col", "command", "embed", "frame",
    "hr", "img", "input", "isindex", "keygen", "link", "meta", "param", "source"
].keySet();

// These tags we do not allow editing their tag name.
WebInspector.ElementsTreeElement.EditTagBlacklist = [
    "html", "head", "body"
].keySet();

WebInspector.ElementsTreeElement.prototype = {
    highlightSearchResults: function(searchQuery)
    {
        if (this._searchQuery !== searchQuery) {
            this._updateSearchHighlight(false);
            delete this._highlightResult; // A new search query.
        }

        this._searchQuery = searchQuery;
        this._searchHighlightsVisible = true;
        this.updateTitle(true);
    },

    hideSearchHighlights: function()
    {
        delete this._searchHighlightsVisible;
        this._updateSearchHighlight(false);
    },

    _updateSearchHighlight: function(show)
    {
        if (!this._highlightResult)
            return;

        function updateEntryShow(entry)
        {
            switch (entry.type) {
                case "added":
                    entry.parent.insertBefore(entry.node, entry.nextSibling);
                    break;
                case "changed":
                    entry.node.textContent = entry.newText;
                    break;
            }
        }

        function updateEntryHide(entry)
        {
            switch (entry.type) {
                case "added":
                    if (entry.node.parentElement)
                        entry.node.parentElement.removeChild(entry.node);
                    break;
                case "changed":
                    entry.node.textContent = entry.oldText;
                    break;
            }
        }

        var updater = show ? updateEntryShow : updateEntryHide;

        for (var i = 0, size = this._highlightResult.length; i < size; ++i)
            updater(this._highlightResult[i]);
    },

    get hovered()
    {
        return this._hovered;
    },

    set hovered(x)
    {
        if (this._hovered === x)
            return;

        this._hovered = x;

        if (this.listItemElement) {
            if (x) {
                this.updateSelection();
                this.listItemElement.addStyleClass("hovered");
            } else {
                this.listItemElement.removeStyleClass("hovered");
            }
        }
    },

    get expandedChildrenLimit()
    {
        return this._expandedChildrenLimit;
    },

    set expandedChildrenLimit(x)
    {
        if (this._expandedChildrenLimit === x)
            return;

        this._expandedChildrenLimit = x;
        if (this.treeOutline && !this._updateChildrenInProgress)
            this._updateChildren(true);
    },

    get expandedChildCount()
    {
        var count = this.children.length;
        if (count && this.children[count - 1]._elementCloseTag)
            count--;
        if (count && this.children[count - 1].expandAllButton)
            count--;
        return count;
    },

    showChild: function(index)
    {
        if (this._elementCloseTag)
            return;

        if (index >= this.expandedChildrenLimit) {
            this._expandedChildrenLimit = index + 1;
            this._updateChildren(true);
        }

        // Whether index-th child is visible in the children tree
        return this.expandedChildCount > index;
    },

    updateSelection: function()
    {
        var listItemElement = this.listItemElement;
        if (!listItemElement)
            return;

        if (document.body.offsetWidth <= 0) {
            // The stylesheet hasn't loaded yet or the window is closed,
            // so we can't calculate what is need. Return early.
            return;
        }

        if (!this.selectionElement) {
            this.selectionElement = document.createElement("div");
            this.selectionElement.className = "selection selected";
            listItemElement.insertBefore(this.selectionElement, listItemElement.firstChild);
        }

        this.selectionElement.style.height = listItemElement.offsetHeight + "px";
    },

    onattach: function()
    {
        if (this._hovered) {
            this.updateSelection();
            this.listItemElement.addStyleClass("hovered");
        }

        this.updateTitle();
        this._preventFollowingLinksOnDoubleClick();
        this.listItemElement.draggable = true;
    },

    _preventFollowingLinksOnDoubleClick: function()
    {
        var links = this.listItemElement.querySelectorAll("li > .webkit-html-tag > .webkit-html-attribute > .webkit-html-external-link, li > .webkit-html-tag > .webkit-html-attribute > .webkit-html-resource-link");
        if (!links)
            return;

        for (var i = 0; i < links.length; ++i)
            links[i].preventFollowOnDoubleClick = true;
    },

    onpopulate: function()
    {
        if (this.children.length || this._showInlineText(this.representedObject) || this._elementCloseTag)
            return;

        this.updateChildren();
    },

    /**
     * @param {boolean=} fullRefresh
     */
    updateChildren: function(fullRefresh)
    {
        if (this._elementCloseTag)
            return;
        this.representedObject.getChildNodes(this._updateChildren.bind(this, fullRefresh));
    },

    /**
     * @param {boolean=} closingTag
     */
    insertChildElement: function(child, index, closingTag)
    {
        var newElement = new WebInspector.ElementsTreeElement(child, closingTag);
        newElement.selectable = this.treeOutline._selectEnabled;
        this.insertChild(newElement, index);
        return newElement;
    },

    moveChild: function(child, targetIndex)
    {
        var wasSelected = child.selected;
        this.removeChild(child);
        this.insertChild(child, targetIndex);
        if (wasSelected)
            child.select();
    },

    /**
     * @param {boolean=} fullRefresh
     */
    _updateChildren: function(fullRefresh)
    {
        if (this._updateChildrenInProgress || !this.treeOutline._visible)
            return;

        this._updateChildrenInProgress = true;
        var selectedNode = this.treeOutline.selectedDOMNode();
        var originalScrollTop = 0;
        if (fullRefresh) {
            var treeOutlineContainerElement = this.treeOutline.element.parentNode;
            originalScrollTop = treeOutlineContainerElement.scrollTop;
            var selectedTreeElement = this.treeOutline.selectedTreeElement;
            if (selectedTreeElement && selectedTreeElement.hasAncestor(this))
                this.select();
            this.removeChildren();
        }

        var treeElement = this;
        var treeChildIndex = 0;
        var elementToSelect;

        function updateChildrenOfNode(node)
        {
            var treeOutline = treeElement.treeOutline;
            var child = node.firstChild;
            while (child) {
                var currentTreeElement = treeElement.children[treeChildIndex];
                if (!currentTreeElement || currentTreeElement.representedObject !== child) {
                    // Find any existing element that is later in the children list.
                    var existingTreeElement = null;
                    for (var i = (treeChildIndex + 1), size = treeElement.expandedChildCount; i < size; ++i) {
                        if (treeElement.children[i].representedObject === child) {
                            existingTreeElement = treeElement.children[i];
                            break;
                        }
                    }

                    if (existingTreeElement && existingTreeElement.parent === treeElement) {
                        // If an existing element was found and it has the same parent, just move it.
                        treeElement.moveChild(existingTreeElement, treeChildIndex);
                    } else {
                        // No existing element found, insert a new element.
                        if (treeChildIndex < treeElement.expandedChildrenLimit) {
                            var newElement = treeElement.insertChildElement(child, treeChildIndex);
                            if (child === selectedNode)
                                elementToSelect = newElement;
                            if (treeElement.expandedChildCount > treeElement.expandedChildrenLimit)
                                treeElement.expandedChildrenLimit++;
                        }
                    }
                }

                child = child.nextSibling;
                ++treeChildIndex;
            }
        }

        // Remove any tree elements that no longer have this node (or this node's contentDocument) as their parent.
        for (var i = (this.children.length - 1); i >= 0; --i) {
            var currentChild = this.children[i];
            var currentNode = currentChild.representedObject;
            var currentParentNode = currentNode.parentNode;

            if (currentParentNode === this.representedObject)
                continue;

            var selectedTreeElement = this.treeOutline.selectedTreeElement;
            if (selectedTreeElement && (selectedTreeElement === currentChild || selectedTreeElement.hasAncestor(currentChild)))
                this.select();

            this.removeChildAtIndex(i);
        }

        updateChildrenOfNode(this.representedObject);
        this.adjustCollapsedRange();

        var lastChild = this.children[this.children.length - 1];
        if (this.representedObject.nodeType() == Node.ELEMENT_NODE && (!lastChild || !lastChild._elementCloseTag))
            this.insertChildElement(this.representedObject, this.children.length, true);

        // We want to restore the original selection and tree scroll position after a full refresh, if possible.
        if (fullRefresh && elementToSelect) {
            elementToSelect.select();
            if (treeOutlineContainerElement && originalScrollTop <= treeOutlineContainerElement.scrollHeight)
                treeOutlineContainerElement.scrollTop = originalScrollTop;
        }

        delete this._updateChildrenInProgress;
    },

    adjustCollapsedRange: function()
    {
        // Ensure precondition: only the tree elements for node children are found in the tree
        // (not the Expand All button or the closing tag).
        if (this.expandAllButtonElement && this.expandAllButtonElement.__treeElement.parent)
            this.removeChild(this.expandAllButtonElement.__treeElement);

        const node = this.representedObject;
        if (!node.children)
            return;
        const childNodeCount = node.children.length;

        // In case some nodes from the expanded range were removed, pull some nodes from the collapsed range into the expanded range at the bottom.
        for (var i = this.expandedChildCount, limit = Math.min(this.expandedChildrenLimit, childNodeCount); i < limit; ++i)
            this.insertChildElement(node.children[i], i);

        const expandedChildCount = this.expandedChildCount;
        if (childNodeCount > this.expandedChildCount) {
            var targetButtonIndex = expandedChildCount;
            if (!this.expandAllButtonElement) {
                var button = document.createElement("button");
                button.className = "show-all-nodes";
                button.value = "";
                var item = new TreeElement(button, null, false);
                item.selectable = false;
                item.expandAllButton = true;
                this.insertChild(item, targetButtonIndex);
                this.expandAllButtonElement = item.listItemElement.firstChild;
                this.expandAllButtonElement.__treeElement = item;
                this.expandAllButtonElement.addEventListener("click", this.handleLoadAllChildren.bind(this), false);
            } else if (!this.expandAllButtonElement.__treeElement.parent)
                this.insertChild(this.expandAllButtonElement.__treeElement, targetButtonIndex);
            this.expandAllButtonElement.textContent = WebInspector.UIString("Show All Nodes (%d More)", childNodeCount - expandedChildCount);
        } else if (this.expandAllButtonElement)
            delete this.expandAllButtonElement;
    },

    handleLoadAllChildren: function()
    {
        this.expandedChildrenLimit = Math.max(this.representedObject._childNodeCount, this.expandedChildrenLimit + WebInspector.ElementsTreeElement.InitialChildrenLimit);
    },

    onexpand: function()
    {
        if (this._elementCloseTag)
            return;

        this.updateTitle();
        this.treeOutline.updateSelection();
    },

    oncollapse: function()
    {
        if (this._elementCloseTag)
            return;

        this.updateTitle();
        this.treeOutline.updateSelection();
    },

    onreveal: function()
    {
        if (this.listItemElement) {
            var tagSpans = this.listItemElement.getElementsByClassName("webkit-html-tag-name");
            if (tagSpans.length)
                tagSpans[0].scrollIntoViewIfNeeded(false);
            else
                this.listItemElement.scrollIntoViewIfNeeded(false);
        }
    },

    onselect: function(treeElement, selectedByUser)
    {
        this.treeOutline.suppressRevealAndSelect = true;
        this.treeOutline.selectDOMNode(this.representedObject, selectedByUser);
        if (selectedByUser)
            WebInspector.domAgent.highlightDOMNode(this.representedObject.id);
        this.updateSelection();
        this.treeOutline.suppressRevealAndSelect = false;
        return true;
    },

    ondelete: function()
    {
        var startTagTreeElement = this.treeOutline.findTreeElement(this.representedObject);
        startTagTreeElement ? startTagTreeElement.remove() : this.remove();
        return true;
    },

    onenter: function()
    {
        // On Enter or Return start editing the first attribute
        // or create a new attribute on the selected element.
        if (this.treeOutline.editing)
            return false;

        this._startEditing();

        // prevent a newline from being immediately inserted
        return true;
    },

    selectOnMouseDown: function(event)
    {
        TreeElement.prototype.selectOnMouseDown.call(this, event);

        if (this._editing)
            return;

        if (this.treeOutline._showInElementsPanelEnabled) {
            WebInspector.showPanel("elements");
            this.treeOutline.selectDOMNode(this.representedObject, true);
        }

        // Prevent selecting the nearest word on double click.
        if (event.detail >= 2)
            event.preventDefault();
    },

    ondblclick: function(event)
    {
        if (this._editing || this._elementCloseTag)
            return;

        if (this._startEditingTarget(event.target))
            return;

        if (this.hasChildren && !this.expanded)
            this.expand();
    },

    _insertInLastAttributePosition: function(tag, node)
    {
        if (tag.getElementsByClassName("webkit-html-attribute").length > 0)
            tag.insertBefore(node, tag.lastChild);
        else {
            var nodeName = tag.textContent.match(/^<(.*?)>$/)[1];
            tag.textContent = '';
            tag.appendChild(document.createTextNode('<'+nodeName));
            tag.appendChild(node);
            tag.appendChild(document.createTextNode('>'));
        }

        this.updateSelection();
    },

    _startEditingTarget: function(eventTarget)
    {
        if (this.treeOutline.selectedDOMNode() != this.representedObject)
            return;

        if (this.representedObject.nodeType() != Node.ELEMENT_NODE && this.representedObject.nodeType() != Node.TEXT_NODE)
            return false;

        var textNode = eventTarget.enclosingNodeOrSelfWithClass("webkit-html-text-node");
        if (textNode)
            return this._startEditingTextNode(textNode);

        var attribute = eventTarget.enclosingNodeOrSelfWithClass("webkit-html-attribute");
        if (attribute)
            return this._startEditingAttribute(attribute, eventTarget);

        var tagName = eventTarget.enclosingNodeOrSelfWithClass("webkit-html-tag-name");
        if (tagName)
            return this._startEditingTagName(tagName);

        var newAttribute = eventTarget.enclosingNodeOrSelfWithClass("add-attribute");
        if (newAttribute)
            return this._addNewAttribute();

        return false;
    },

    _populateTagContextMenu: function(contextMenu, event)
    {
        var attribute = event.target.enclosingNodeOrSelfWithClass("webkit-html-attribute");
        var newAttribute = event.target.enclosingNodeOrSelfWithClass("add-attribute");

        // Add attribute-related actions.
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Add attribute" : "Add Attribute"), this._addNewAttribute.bind(this));
        if (attribute && !newAttribute)
            contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Edit attribute" : "Edit Attribute"), this._startEditingAttribute.bind(this, attribute, event.target));
        contextMenu.appendSeparator();

        this._populateNodeContextMenu(contextMenu);
        this.treeOutline._populateContextMenu(contextMenu, this.representedObject);
    },

    _populateTextContextMenu: function(contextMenu, textNode)
    {
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Edit text" : "Edit Text"), this._startEditingTextNode.bind(this, textNode));
        this._populateNodeContextMenu(contextMenu);
    },

    _populateNodeContextMenu: function(contextMenu)
    {
        // Add free-form node-related actions.
        contextMenu.appendItem(WebInspector.UIString("Edit as HTML"), this._editAsHTML.bind(this));
        contextMenu.appendItem(WebInspector.UIString("Copy as HTML"), this._copyHTML.bind(this));
        contextMenu.appendItem(WebInspector.UIString("Copy XPath"), this._copyXPath.bind(this));
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Delete node" : "Delete Node"), this.remove.bind(this));
    },

    _startEditing: function()
    {
        if (this.treeOutline.selectedDOMNode() !== this.representedObject)
            return;

        var listItem = this._listItemNode;

        if (this._canAddAttributes) {
            var attribute = listItem.getElementsByClassName("webkit-html-attribute")[0];
            if (attribute)
                return this._startEditingAttribute(attribute, attribute.getElementsByClassName("webkit-html-attribute-value")[0]);

            return this._addNewAttribute();
        }

        if (this.representedObject.nodeType() === Node.TEXT_NODE) {
            var textNode = listItem.getElementsByClassName("webkit-html-text-node")[0];
            if (textNode)
                return this._startEditingTextNode(textNode);
            return;
        }
    },

    _addNewAttribute: function()
    {
        // Cannot just convert the textual html into an element without
        // a parent node. Use a temporary span container for the HTML.
        var container = document.createElement("span");
        this._buildAttributeDOM(container, " ", "");
        var attr = container.firstChild;
        attr.style.marginLeft = "2px"; // overrides the .editing margin rule
        attr.style.marginRight = "2px"; // overrides the .editing margin rule

        var tag = this.listItemElement.getElementsByClassName("webkit-html-tag")[0];
        this._insertInLastAttributePosition(tag, attr);
        return this._startEditingAttribute(attr, attr);
    },

    _triggerEditAttribute: function(attributeName)
    {
        var attributeElements = this.listItemElement.getElementsByClassName("webkit-html-attribute-name");
        for (var i = 0, len = attributeElements.length; i < len; ++i) {
            if (attributeElements[i].textContent === attributeName) {
                for (var elem = attributeElements[i].nextSibling; elem; elem = elem.nextSibling) {
                    if (elem.nodeType !== Node.ELEMENT_NODE)
                        continue;

                    if (elem.hasStyleClass("webkit-html-attribute-value"))
                        return this._startEditingAttribute(elem.parentNode, elem);
                }
            }
        }
    },

    _startEditingAttribute: function(attribute, elementForSelection)
    {
        if (WebInspector.isBeingEdited(attribute))
            return true;

        var attributeNameElement = attribute.getElementsByClassName("webkit-html-attribute-name")[0];
        if (!attributeNameElement)
            return false;

        var attributeName = attributeNameElement.textContent;

        function removeZeroWidthSpaceRecursive(node)
        {
            if (node.nodeType === Node.TEXT_NODE) {
                node.nodeValue = node.nodeValue.replace(/\u200B/g, "");
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE)
                return;

            for (var child = node.firstChild; child; child = child.nextSibling)
                removeZeroWidthSpaceRecursive(child);
        }

        // Remove zero-width spaces that were added by nodeTitleInfo.
        removeZeroWidthSpaceRecursive(attribute);

        var config = new WebInspector.EditingConfig(this._attributeEditingCommitted.bind(this), this._editingCancelled.bind(this), attributeName);
        this._editing = WebInspector.startEditing(attribute, config);

        window.getSelection().setBaseAndExtent(elementForSelection, 0, elementForSelection, 1);

        return true;
    },

    _startEditingTextNode: function(textNode)
    {
        if (WebInspector.isBeingEdited(textNode))
            return true;

        var config = new WebInspector.EditingConfig(this._textNodeEditingCommitted.bind(this), this._editingCancelled.bind(this));
        this._editing = WebInspector.startEditing(textNode, config);
        window.getSelection().setBaseAndExtent(textNode, 0, textNode, 1);

        return true;
    },

    _startEditingTagName: function(tagNameElement)
    {
        if (!tagNameElement) {
            tagNameElement = this.listItemElement.getElementsByClassName("webkit-html-tag-name")[0];
            if (!tagNameElement)
                return false;
        }

        var tagName = tagNameElement.textContent;
        if (WebInspector.ElementsTreeElement.EditTagBlacklist[tagName.toLowerCase()])
            return false;

        if (WebInspector.isBeingEdited(tagNameElement))
            return true;

        var closingTagElement = this._distinctClosingTagElement();

        function keyupListener(event)
        {
            if (closingTagElement)
                closingTagElement.textContent = "</" + tagNameElement.textContent + ">";
        }

        function editingComitted(element, newTagName)
        {
            tagNameElement.removeEventListener('keyup', keyupListener, false);
            this._tagNameEditingCommitted.apply(this, arguments);
        }

        function editingCancelled()
        {
            tagNameElement.removeEventListener('keyup', keyupListener, false);
            this._editingCancelled.apply(this, arguments);
        }

        tagNameElement.addEventListener('keyup', keyupListener, false);

        var config = new WebInspector.EditingConfig(editingComitted.bind(this), editingCancelled.bind(this), tagName);
        this._editing = WebInspector.startEditing(tagNameElement, config);
        window.getSelection().setBaseAndExtent(tagNameElement, 0, tagNameElement, 1);
        return true;
    },

    _startEditingAsHTML: function(commitCallback, error, initialValue)
    {
        if (error)
            return;
        if (this._htmlEditElement && WebInspector.isBeingEdited(this._htmlEditElement))
            return;

        this._htmlEditElement = document.createElement("div");
        this._htmlEditElement.className = "source-code elements-tree-editor";
        this._htmlEditElement.textContent = initialValue;

        // Hide header items.
        var child = this.listItemElement.firstChild;
        while (child) {
            child.style.display = "none";
            child = child.nextSibling;
        }
        // Hide children item.
        if (this._childrenListNode)
            this._childrenListNode.style.display = "none";
        // Append editor.
        this.listItemElement.appendChild(this._htmlEditElement);

        this.updateSelection();

        function commit()
        {
            commitCallback(initialValue, this._htmlEditElement.textContent);
            dispose.call(this);
        }

        function dispose()
        {
            this._editing = false;

            // Remove editor.
            this.listItemElement.removeChild(this._htmlEditElement);
            delete this._htmlEditElement;
            // Unhide children item.
            if (this._childrenListNode)
                this._childrenListNode.style.removeProperty("display");
            // Unhide header items.
            var child = this.listItemElement.firstChild;
            while (child) {
                child.style.removeProperty("display");
                child = child.nextSibling;
            }

            this.updateSelection();
        }

        var config = new WebInspector.EditingConfig(commit.bind(this), dispose.bind(this));
        config.setMultiline(true);
        this._editing = WebInspector.startEditing(this._htmlEditElement, config);
    },

    _attributeEditingCommitted: function(element, newText, oldText, attributeName, moveDirection)
    {
        this._editing = false;

        var treeOutline = this.treeOutline;
        /**
         * @param {Protocol.Error=} error
         */
        function moveToNextAttributeIfNeeded(error)
        {
            if (error)
                this._editingCancelled(element, attributeName);

            if (!moveDirection)
                return;

            treeOutline._updateModifiedNodes();

            // Search for the attribute's position, and then decide where to move to.
            var attributes = this.representedObject.attributes();
            for (var i = 0; i < attributes.length; ++i) {
                if (attributes[i].name !== attributeName)
                    continue;

                if (moveDirection === "backward") {
                    if (i === 0)
                        this._startEditingTagName();
                    else
                        this._triggerEditAttribute(attributes[i - 1].name);
                } else {
                    if (i === attributes.length - 1)
                        this._addNewAttribute();
                    else
                        this._triggerEditAttribute(attributes[i + 1].name);
                }
                return;
            }

            // Moving From the "New Attribute" position.
            if (moveDirection === "backward") {
                if (newText === " ") {
                    // Moving from "New Attribute" that was not edited
                    if (attributes.length > 0)
                        this._triggerEditAttribute(attributes[attributes.length - 1].name);
                } else {
                    // Moving from "New Attribute" that holds new value
                    if (attributes.length > 1)
                        this._triggerEditAttribute(attributes[attributes.length - 2].name);
                }
            } else if (moveDirection === "forward") {
                if (!/^\s*$/.test(newText))
                    this._addNewAttribute();
                else
                    this._startEditingTagName();
            }
        }

        if (oldText !== newText)
            this.representedObject.setAttribute(attributeName, newText, moveToNextAttributeIfNeeded.bind(this));
        else
            moveToNextAttributeIfNeeded.call(this);
    },

    _tagNameEditingCommitted: function(element, newText, oldText, tagName, moveDirection)
    {
        this._editing = false;
        var self = this;

        function cancel()
        {
            var closingTagElement = self._distinctClosingTagElement();
            if (closingTagElement)
                closingTagElement.textContent = "</" + tagName + ">";

            self._editingCancelled(element, tagName);
            moveToNextAttributeIfNeeded.call(self);
        }

        function moveToNextAttributeIfNeeded()
        {
            if (moveDirection !== "forward") {
                this._addNewAttribute();
                return;
            }

            var attributes = this.representedObject.attributes();
            if (attributes.length > 0)
                this._triggerEditAttribute(attributes[0].name);
            else
                this._addNewAttribute();
        }

        newText = newText.trim();
        if (newText === oldText) {
            cancel();
            return;
        }

        var treeOutline = this.treeOutline;
        var wasExpanded = this.expanded;

        function changeTagNameCallback(error, nodeId)
        {
            if (error || !nodeId) {
                cancel();
                return;
            }
            var newTreeItem = treeOutline._selectNodeAfterEdit(null, wasExpanded, error, nodeId);
            moveToNextAttributeIfNeeded.call(newTreeItem);
        }

        this.representedObject.setNodeName(newText, changeTagNameCallback);
    },

    _textNodeEditingCommitted: function(element, newText)
    {
        this._editing = false;

        var textNode;
        if (this.representedObject.nodeType() === Node.ELEMENT_NODE) {
            // We only show text nodes inline in elements if the element only
            // has a single child, and that child is a text node.
            textNode = this.representedObject.firstChild;
        } else if (this.representedObject.nodeType() == Node.TEXT_NODE)
            textNode = this.representedObject;

        textNode.setNodeValue(newText, this.updateTitle.bind(this));
    },

    _editingCancelled: function(element, context)
    {
        this._editing = false;

        // Need to restore attributes structure.
        this.updateTitle();
    },

    _distinctClosingTagElement: function()
    {
        // FIXME: Improve the Tree Element / Outline Abstraction to prevent crawling the DOM

        // For an expanded element, it will be the last element with class "close"
        // in the child element list.
        if (this.expanded) {
            var closers = this._childrenListNode.querySelectorAll(".close");
            return closers[closers.length-1];
        }

        // Remaining cases are single line non-expanded elements with a closing
        // tag, or HTML elements without a closing tag (such as <br>). Return
        // null in the case where there isn't a closing tag.
        var tags = this.listItemElement.getElementsByClassName("webkit-html-tag");
        return (tags.length === 1 ? null : tags[tags.length-1]);
    },

    /**
     * @param {boolean=} onlySearchQueryChanged
     */
    updateTitle: function(onlySearchQueryChanged)
    {
        // If we are editing, return early to prevent canceling the edit.
        // After editing is committed updateTitle will be called.
        if (this._editing)
            return;

        if (onlySearchQueryChanged) {
            if (this._highlightResult)
                this._updateSearchHighlight(false);
        } else {
            var highlightElement = document.createElement("span");
            highlightElement.className = "highlight";
            highlightElement.appendChild(this._nodeTitleInfo(WebInspector.linkifyURLAsNode).titleDOM);
            this.title = highlightElement;
            delete this._highlightResult;
        }

        delete this.selectionElement;
        this.updateSelection();
        this._preventFollowingLinksOnDoubleClick();
        this._highlightSearchResults();
    },

    /**
     * @param {WebInspector.DOMNode=} node
     * @param {function(string, string, string, boolean=, string=)=} linkify
     */
    _buildAttributeDOM: function(parentElement, name, value, node, linkify)
    {
        var hasText = (value.length > 0);
        var attrSpanElement = parentElement.createChild("span", "webkit-html-attribute");
        var attrNameElement = attrSpanElement.createChild("span", "webkit-html-attribute-name");
        attrNameElement.textContent = name;

        if (hasText)
            attrSpanElement.appendChild(document.createTextNode("=\u200B\""));

        if (linkify && (name === "src" || name === "href")) {
            var rewrittenHref = WebInspector.resourceURLForRelatedNode(node, value);
            value = value.replace(/([\/;:\)\]\}])/g, "$1\u200B");
            if (rewrittenHref === null) {
                var attrValueElement = attrSpanElement.createChild("span", "webkit-html-attribute-value");
                attrValueElement.textContent = value;
            } else {
                if (value.indexOf("data:") === 0)
                    value = value.trimMiddle(60);
                attrSpanElement.appendChild(linkify(rewrittenHref, value, "webkit-html-attribute-value", node.nodeName().toLowerCase() === "a"));
            }
        } else {
            value = value.replace(/([\/;:\)\]\}])/g, "$1\u200B");
            var attrValueElement = attrSpanElement.createChild("span", "webkit-html-attribute-value");
            attrValueElement.textContent = value;
        }

        if (hasText)
            attrSpanElement.appendChild(document.createTextNode("\""));
    },

    /**
     * @param {function(string, string, string, boolean=, string=)=} linkify
     */
    _buildTagDOM: function(parentElement, tagName, isClosingTag, isDistinctTreeElement, linkify)
    {
        var node = /** @type WebInspector.DOMNode */ this.representedObject;
        var classes = [ "webkit-html-tag" ];
        if (isClosingTag && isDistinctTreeElement)
            classes.push("close");
        if (node.isInShadowTree())
            classes.push("shadow");
        var tagElement = parentElement.createChild("span", classes.join(" "));
        tagElement.appendChild(document.createTextNode("<"));
        var tagNameElement = tagElement.createChild("span", isClosingTag ? "" : "webkit-html-tag-name");
        tagNameElement.textContent = (isClosingTag ? "/" : "") + tagName;
        if (!isClosingTag && node.hasAttributes()) {
            var attributes = node.attributes();
            for (var i = 0; i < attributes.length; ++i) {
                var attr = attributes[i];
                tagElement.appendChild(document.createTextNode(" "));
                this._buildAttributeDOM(tagElement, attr.name, attr.value, node, linkify);
            }
        }
        tagElement.appendChild(document.createTextNode(">"));
        parentElement.appendChild(document.createTextNode("\u200B"));
    },

    _nodeTitleInfo: function(linkify)
    {
        var node = this.representedObject;
        var info = {titleDOM: document.createDocumentFragment(), hasChildren: this.hasChildren};

        switch (node.nodeType()) {
            case Node.ATTRIBUTE_NODE:
                var value = node.value || "\u200B"; // Zero width space to force showing an empty value.
                this._buildAttributeDOM(info.titleDOM, node.name, value);
                break;

            case Node.ELEMENT_NODE:
                var tagName = node.nodeNameInCorrectCase();
                if (this._elementCloseTag) {
                    this._buildTagDOM(info.titleDOM, tagName, true, true);
                    info.hasChildren = false;
                    break;
                }

                this._buildTagDOM(info.titleDOM, tagName, false, false, linkify);

                var textChild = this._singleTextChild(node);
                var showInlineText = textChild && textChild.nodeValue().length < Preferences.maxInlineTextChildLength;

                if (!this.expanded && (!showInlineText && (this.treeOutline.isXMLMimeType || !WebInspector.ElementsTreeElement.ForbiddenClosingTagElements[tagName]))) {
                    if (this.hasChildren) {
                        var textNodeElement = info.titleDOM.createChild("span", "webkit-html-text-node");
                        textNodeElement.textContent = "\u2026";
                        info.titleDOM.appendChild(document.createTextNode("\u200B"));
                    }
                    this._buildTagDOM(info.titleDOM, tagName, true, false);
                }

                // If this element only has a single child that is a text node,
                // just show that text and the closing tag inline rather than
                // create a subtree for them
                if (showInlineText) {
                    var textNodeElement = info.titleDOM.createChild("span", "webkit-html-text-node");
                    textNodeElement.textContent = textChild.nodeValue();
                    info.titleDOM.appendChild(document.createTextNode("\u200B"));
                    this._buildTagDOM(info.titleDOM, tagName, true, false);
                    info.hasChildren = false;
                }
                break;

            case Node.TEXT_NODE:
                if (node.parentNode && node.parentNode.nodeName().toLowerCase() === "script") {
                    var newNode = info.titleDOM.createChild("span", "webkit-html-text-node webkit-html-js-node");
                    newNode.textContent = node.nodeValue();

                    var javascriptSyntaxHighlighter = new WebInspector.DOMSyntaxHighlighter("text/javascript", true);
                    javascriptSyntaxHighlighter.syntaxHighlightNode(newNode);
                } else if (node.parentNode && node.parentNode.nodeName().toLowerCase() === "style") {
                    var newNode = info.titleDOM.createChild("span", "webkit-html-text-node webkit-html-css-node");
                    newNode.textContent = node.nodeValue();

                    var cssSyntaxHighlighter = new WebInspector.DOMSyntaxHighlighter("text/css", true);
                    cssSyntaxHighlighter.syntaxHighlightNode(newNode);
                } else {
                    info.titleDOM.appendChild(document.createTextNode("\""));
                    var textNodeElement = info.titleDOM.createChild("span", "webkit-html-text-node");
                    textNodeElement.textContent = node.nodeValue();
                    info.titleDOM.appendChild(document.createTextNode("\""));
                }
                break;

            case Node.COMMENT_NODE:
                var commentElement = info.titleDOM.createChild("span", "webkit-html-comment");
                commentElement.appendChild(document.createTextNode("<!--" + node.nodeValue() + "-->"));
                break;

            case Node.DOCUMENT_TYPE_NODE:
                var docTypeElement = info.titleDOM.createChild("span", "webkit-html-doctype");
                docTypeElement.appendChild(document.createTextNode("<!DOCTYPE " + node.nodeName()));
                if (node.publicId) {
                    docTypeElement.appendChild(document.createTextNode(" PUBLIC \"" + node.publicId + "\""));
                    if (node.systemId)
                        docTypeElement.appendChild(document.createTextNode(" \"" + node.systemId + "\""));
                } else if (node.systemId)
                    docTypeElement.appendChild(document.createTextNode(" SYSTEM \"" + node.systemId + "\""));

                if (node.internalSubset)
                    docTypeElement.appendChild(document.createTextNode(" [" + node.internalSubset + "]"));

                docTypeElement.appendChild(document.createTextNode(">"));
                break;

            case Node.CDATA_SECTION_NODE:
                var cdataElement = info.titleDOM.createChild("span", "webkit-html-text-node");
                cdataElement.appendChild(document.createTextNode("<![CDATA[" + node.nodeValue() + "]]>"));
                break;
            case Node.DOCUMENT_FRAGMENT_NODE:
                var fragmentElement = info.titleDOM.createChild("span", "webkit-html-fragment");
                fragmentElement.textContent = node.nodeNameInCorrectCase().collapseWhitespace();
                if (node.isInShadowTree())
                    fragmentElement.addStyleClass("shadow");
                break;
            default:
                info.titleDOM.appendChild(document.createTextNode(node.nodeNameInCorrectCase().collapseWhitespace()));
        }
        return info;
    },

    _singleTextChild: function(node)
    {
        if (!node)
            return null;

        var firstChild = node.firstChild;
        if (!firstChild || firstChild.nodeType() !== Node.TEXT_NODE)
            return null;

        var sibling = firstChild.nextSibling;
        return sibling ? null : firstChild;
    },

    _showInlineText: function(node)
    {
        if (node.nodeType() === Node.ELEMENT_NODE) {
            var textChild = this._singleTextChild(node);
            if (textChild && textChild.nodeValue().length < Preferences.maxInlineTextChildLength)
                return true;
        }
        return false;
    },

    remove: function()
    {
        var parentElement = this.parent;
        if (!parentElement)
            return;

        var self = this;
        function removeNodeCallback(error, removedNodeId)
        {
            if (error)
                return;

            parentElement.removeChild(self);
            parentElement.adjustCollapsedRange();
        }

        if (!this.representedObject.parentNode || this.representedObject.parentNode.nodeType() === Node.DOCUMENT_NODE)
            return;
        this.representedObject.removeNode(removeNodeCallback);
    },

    _editAsHTML: function()
    {
        var treeOutline = this.treeOutline;
        var node = this.representedObject;
        var parentNode = node.parentNode;
        var index = node.index;
        var wasExpanded = this.expanded;

        function selectNode(error, nodeId)
        {
            if (error)
                return;

            // Select it and expand if necessary. We force tree update so that it processes dom events and is up to date.
            treeOutline._updateModifiedNodes();

            var newNode = parentNode ? parentNode.children[index] || parentNode : null;
            if (!newNode)
                return;

            treeOutline.selectDOMNode(newNode, true);

            if (wasExpanded) {
                var newTreeItem = treeOutline.findTreeElement(newNode);
                if (newTreeItem)
                    newTreeItem.expand();
            }
        }

        function commitChange(initialValue, value)
        {
            if (initialValue !== value)
                node.setOuterHTML(value, selectNode);
            else
                return;
        }

        node.getOuterHTML(this._startEditingAsHTML.bind(this, commitChange));
    },

    _copyHTML: function()
    {
        this.representedObject.copyNode();
    },

    _copyXPath: function()
    {
        this.representedObject.copyXPath(true);
    },

    _highlightSearchResults: function()
    {
        if (!this._searchQuery || !this._searchHighlightsVisible)
            return;
        if (this._highlightResult) {
            this._updateSearchHighlight(true);
            return;
        }

        var text = this.listItemElement.textContent;
        var regexObject = createPlainTextSearchRegex(this._searchQuery, "gi");

        var offset = 0;
        var match = regexObject.exec(text);
        var matchRanges = [];
        while (match) {
            matchRanges.push({ offset: match.index, length: match[0].length });
            match = regexObject.exec(text);
        }

        // Fall back for XPath, etc. matches.
        if (!matchRanges.length)
            matchRanges.push({ offset: 0, length: text.length });

        this._highlightResult = [];
        highlightSearchResults(this.listItemElement, matchRanges, this._highlightResult);
    }
}

WebInspector.ElementsTreeElement.prototype.__proto__ = TreeElement.prototype;

/**
 * @constructor
 */
WebInspector.ElementsTreeUpdater = function(treeOutline)
{
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.NodeInserted, this._nodeInserted, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.NodeRemoved, this._nodeRemoved, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.AttrModified, this._attributesUpdated, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.AttrRemoved, this._attributesUpdated, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.CharacterDataModified, this._characterDataModified, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.DocumentUpdated, this._documentUpdated, this);
    WebInspector.domAgent.addEventListener(WebInspector.DOMAgent.Events.ChildNodeCountUpdated, this._childNodeCountUpdated, this);

    this._treeOutline = treeOutline;
    this._recentlyModifiedNodes = [];
}

WebInspector.ElementsTreeUpdater.prototype = {
    _documentUpdated: function(event)
    {
        var inspectedRootDocument = event.data;

        this._reset();

        if (!inspectedRootDocument)
            return;

        this._treeOutline.rootDOMNode = inspectedRootDocument;
    },

    _attributesUpdated: function(event)
    {
        this._recentlyModifiedNodes.push({node: event.data.node, updated: true});
        if (this._treeOutline._visible)
            this._updateModifiedNodesSoon();
    },

    _characterDataModified: function(event)
    {
        this._recentlyModifiedNodes.push({node: event.data, updated: true});
        if (this._treeOutline._visible)
            this._updateModifiedNodesSoon();
    },

    _nodeInserted: function(event)
    {
        this._recentlyModifiedNodes.push({node: event.data, parent: event.data.parentNode, inserted: true});
        if (this._treeOutline._visible)
            this._updateModifiedNodesSoon();
    },

    _nodeRemoved: function(event)
    {
        this._recentlyModifiedNodes.push({node: event.data.node, parent: event.data.parent, removed: true});
        if (this._treeOutline._visible)
            this._updateModifiedNodesSoon();
    },

    _childNodeCountUpdated: function(event)
    {
        var treeElement = this._treeOutline.findTreeElement(event.data);
        if (treeElement)
            treeElement.hasChildren = event.data.hasChildNodes();
    },

    _updateModifiedNodesSoon: function()
    {
        if (this._updateModifiedNodesTimeout)
            return;
        this._updateModifiedNodesTimeout = setTimeout(this._updateModifiedNodes.bind(this), 0);
    },

    _updateModifiedNodes: function()
    {
        if (this._updateModifiedNodesTimeout) {
            clearTimeout(this._updateModifiedNodesTimeout);
            delete this._updateModifiedNodesTimeout;
        }

        var updatedParentTreeElements = [];

        for (var i = 0; i < this._recentlyModifiedNodes.length; ++i) {
            var parent = this._recentlyModifiedNodes[i].parent;
            var node = this._recentlyModifiedNodes[i].node;

            if (this._recentlyModifiedNodes[i].updated) {
                var nodeItem = this._treeOutline.findTreeElement(node);
                if (nodeItem)
                    nodeItem.updateTitle();
                continue;
            }

            if (!parent)
                continue;

            var parentNodeItem = this._treeOutline.findTreeElement(parent);
            if (parentNodeItem && !parentNodeItem.alreadyUpdatedChildren) {
                parentNodeItem.updateChildren();
                parentNodeItem.alreadyUpdatedChildren = true;
                updatedParentTreeElements.push(parentNodeItem);
            }
        }

        for (var i = 0; i < updatedParentTreeElements.length; ++i)
            delete updatedParentTreeElements[i].alreadyUpdatedChildren;

        this._recentlyModifiedNodes = [];
    },

    _reset: function()
    {
        this._treeOutline.rootDOMNode = null;
        this._treeOutline.selectDOMNode(null, false);
        WebInspector.domAgent.hideDOMNodeHighlight();
        this._recentlyModifiedNodes = [];
    }
}
