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
 * @extends {WebInspector.View}
 */
WebInspector.AuditLauncherView = function(runnerCallback, stopCallback)
{
    WebInspector.View.call(this);

    this._runnerCallback = runnerCallback;
    this._stopCallback = stopCallback;
    this._categoryIdPrefix = "audit-category-item-";
    this._auditRunning = false;

    this.element.addStyleClass("audit-launcher-view");
    this.element.addStyleClass("panel-enabler-view");

    this._contentElement = document.createElement("div");
    this._contentElement.className = "audit-launcher-view-content";
    this.element.appendChild(this._contentElement);
    this._boundCategoryClickListener = this._categoryClicked.bind(this);

    this._resetResourceCount();

    this._sortedCategories = [];

    this._headerElement = document.createElement("h1");
    this._headerElement.className = "no-audits";
    this._headerElement.textContent = WebInspector.UIString("No audits to run");
    this._contentElement.appendChild(this._headerElement);

    WebInspector.networkManager.addEventListener(WebInspector.NetworkManager.EventTypes.ResourceStarted, this._onResourceStarted, this);
    WebInspector.networkManager.addEventListener(WebInspector.NetworkManager.EventTypes.ResourceFinished, this._onResourceFinished, this);
}

WebInspector.AuditLauncherView.prototype = {
    _resetResourceCount: function()
    {
        this._loadedResources = 0;
        this._totalResources = 0;
    },

    _onResourceStarted: function(event)
    {
        var resource = event.data;
        // Ignore long-living WebSockets for the sake of progress indicator, as we won't be waiting them anyway.
        if (resource.type === WebInspector.Resource.Type.WebSocket)
            return;
        ++this._totalResources;
        this._updateResourceProgress();
    },

    _onResourceFinished: function(event)
    {
        var resource = event.data;
        // See resorceStarted for details.
        if (resource.type === WebInspector.Resource.Type.WebSocket)
            return;
        ++this._loadedResources;
        this._updateResourceProgress();
    },

    addCategory: function(category)
    {
        if (!this._sortedCategories.length)
            this._createLauncherUI();

        var categoryElement = this._createCategoryElement(category.displayName, category.id);
        category._checkboxElement = categoryElement.firstChild;
        if (this._selectAllCheckboxElement.checked) {
            category._checkboxElement.checked = true;
            ++this._currentCategoriesCount;
        }

        function compareCategories(a, b)
        {
            var aTitle = a.displayName || "";
            var bTitle = b.displayName || "";
            return aTitle.localeCompare(bTitle);
        }
        var insertBefore = insertionIndexForObjectInListSortedByFunction(category, this._sortedCategories, compareCategories);
        this._categoriesElement.insertBefore(categoryElement, this._categoriesElement.children[insertBefore]);
        this._sortedCategories.splice(insertBefore, 0, category);
        this._updateButton();
    },

    _setAuditRunning: function(auditRunning)
    {
        if (this._auditRunning === auditRunning)
            return;
        this._auditRunning = auditRunning;
        delete this._stopRequested;
        this._updateButton();
        this._updateResourceProgress();
    },

    _launchButtonClicked: function(event)
    {
        if (!this._auditRunning) {
            var catIds = [];
            for (var category = 0; category < this._sortedCategories.length; ++category) {
                if (this._sortedCategories[category]._checkboxElement.checked)
                    catIds.push(this._sortedCategories[category].id);
            }

            this._setAuditRunning(true);
            this._runnerCallback(catIds, this._resourceProgressElement, this._auditPresentStateElement.checked, this._setAuditRunning.bind(this, false));
        } else {
            this._stopRequested = true;
            this._stopCallback(this._setAuditRunning.bind(this, false));
            this._updateButton();
        }
    },

    _selectAllClicked: function(checkCategories)
    {
        var childNodes = this._categoriesElement.childNodes;
        for (var i = 0, length = childNodes.length; i < length; ++i)
            childNodes[i].firstChild.checked = checkCategories;
        this._currentCategoriesCount = checkCategories ? this._sortedCategories.length : 0;
        this._updateButton();
    },

    _categoryClicked: function(event)
    {
        this._currentCategoriesCount += event.target.checked ? 1 : -1;
        this._selectAllCheckboxElement.checked = this._currentCategoriesCount === this._sortedCategories.length;
        this._updateButton();
    },

    _createCategoryElement: function(title, id)
    {
        var labelElement = document.createElement("label");
        labelElement.id = this._categoryIdPrefix + id;

        var element = document.createElement("input");
        element.type = "checkbox";
        if (id !== "")
            element.addEventListener("click", this._boundCategoryClickListener, false);
        labelElement.appendChild(element);
        labelElement.appendChild(document.createTextNode(title));

        return labelElement;
    },

    _createLauncherUI: function()
    {
        this._headerElement = document.createElement("h1");
        this._headerElement.textContent = WebInspector.UIString("Select audits to run");

        for (var child = 0; child < this._contentElement.children.length; ++child)
            this._contentElement.removeChild(this._contentElement.children[child]);

        this._contentElement.appendChild(this._headerElement);

        function handleSelectAllClick(event)
        {
            this._selectAllClicked(event.target.checked);
        }
        var categoryElement = this._createCategoryElement(WebInspector.UIString("Select All"), "");
        categoryElement.id = "audit-launcher-selectall";
        this._selectAllCheckboxElement = categoryElement.firstChild;
        this._selectAllCheckboxElement.checked = true;
        this._selectAllCheckboxElement.addEventListener("click", handleSelectAllClick.bind(this), false);
        this._contentElement.appendChild(categoryElement);

        this._categoriesElement = this._contentElement.createChild("div", "audit-categories-container");
        this._currentCategoriesCount = 0;

        this._contentElement.createChild("div", "flexible-space");

        this._buttonContainerElement = this._contentElement.createChild("div", "button-container");

        var labelElement = this._buttonContainerElement.createChild("label");
        this._auditPresentStateElement = labelElement.createChild("input");
        this._auditPresentStateElement.name = "audit-mode";
        this._auditPresentStateElement.type = "radio";
        this._auditPresentStateElement.checked = true;
        this._auditPresentStateLabelElement = document.createTextNode(WebInspector.UIString("Audit Present State"));
        labelElement.appendChild(this._auditPresentStateLabelElement);

        labelElement = this._buttonContainerElement.createChild("label");
        this.auditReloadedStateElement = labelElement.createChild("input");
        this.auditReloadedStateElement.name = "audit-mode";
        this.auditReloadedStateElement.type = "radio";
        labelElement.appendChild(document.createTextNode("Reload Page and Audit on Load"));

        this._launchButton = this._buttonContainerElement.createChild("button");
        this._launchButton.textContent = WebInspector.UIString("Run");
        this._launchButton.addEventListener("click", this._launchButtonClicked.bind(this), false);

        this._resourceProgressContainer = this._buttonContainerElement.createChild("span", "resource-progress");
        this._resourceProgressElement = this._resourceProgressContainer.createChild("progress");
        this._resourceProgressContainer.appendChild(document.createTextNode(" "));
        this._resourceProgressTextElement = this._resourceProgressContainer.createChild("span");


        this._selectAllClicked(this._selectAllCheckboxElement.checked);
        this._updateButton();
        this._updateResourceProgress();
    },

    _updateResourceProgress: function()
    {
        if (!this._resourceProgressContainer)
            return;

        if (!this._auditRunning || this._stopRequested) {
            this._resetResourceCount();
            this._resourceProgressContainer.addStyleClass("hidden");
        } else
            this._resourceProgressContainer.removeStyleClass("hidden");
        if (this._loadedResources)
            this._resourceProgressTextElement.textContent = WebInspector.UIString("Loading (%d of %d)", this._loadedResources, this._totalResources);
        else
            this._resourceProgressTextElement.textContent = "";
    },

    _updateButton: function()
    {
        this._launchButton.textContent = this._auditRunning ? WebInspector.UIString("Stop") : WebInspector.UIString("Run");
        this._launchButton.disabled = !this._currentCategoriesCount || (this._auditRunning && this._stopRequested);
    }
}

WebInspector.AuditLauncherView.prototype.__proto__ = WebInspector.View.prototype;
