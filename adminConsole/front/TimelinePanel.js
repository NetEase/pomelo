/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
 * @extends {WebInspector.Panel}
 */
WebInspector.TimelinePanel = function()
{
    WebInspector.Panel.call(this, "timeline");
    this.registerRequiredCSS("timelinePanel.css");

    this._presentationModel = new WebInspector.TimelinePresentationModel();

    this._overviewPane = new WebInspector.TimelineOverviewPane(this._presentationModel);
    this._overviewPane.addEventListener(WebInspector.TimelineOverviewPane.Events.WindowChanged, this._scheduleRefresh.bind(this, false));

    this.element.appendChild(this._overviewPane.element);
    this.element.addEventListener("contextmenu", this._contextMenu.bind(this), true);
    this.element.tabIndex = 0;

    this._sidebarBackgroundElement = document.createElement("div");
    this._sidebarBackgroundElement.className = "sidebar split-view-sidebar-left timeline-sidebar-background";
    this.element.appendChild(this._sidebarBackgroundElement);

    this.createSplitViewWithSidebarTree();
    this._containerElement = this.splitView.element;
    this._containerElement.id = "timeline-container";
    this._containerElement.addEventListener("scroll", this._onScroll.bind(this), false);

    this._timelineMemorySplitter = this.element.createChild("div");
    this._timelineMemorySplitter.id = "timeline-memory-splitter";
    this._timelineMemorySplitter.addEventListener("mousedown", this._startSplitterDragging.bind(this), false);
    this._timelineMemorySplitter.addStyleClass("hidden");
    this._memoryStatistics = new WebInspector.MemoryStatistics(this, this.splitView.preferredSidebarWidth());
    this._overviewPane.addEventListener(WebInspector.TimelineOverviewPane.Events.ModeChanged, this._timelinesOverviewModeChanged, this);
    WebInspector.settings.memoryCounterGraphsHeight = WebInspector.settings.createSetting("memoryCounterGraphsHeight", 150);

    var itemsTreeElement = new WebInspector.SidebarSectionTreeElement(WebInspector.UIString("RECORDS"), {}, true);
    this.sidebarTree.appendChild(itemsTreeElement);

    this._sidebarListElement = document.createElement("div");
    this.sidebarElement.appendChild(this._sidebarListElement);

    this._containerContentElement = this.splitView.mainElement;
    this._containerContentElement.id = "resources-container-content";

    this._timelineGrid = new WebInspector.TimelineGrid();
    this._itemsGraphsElement = this._timelineGrid.itemsGraphsElement;
    this._itemsGraphsElement.id = "timeline-graphs";
    this._itemsGraphsElement.addEventListener("mousewheel", this._overviewPane.scrollWindow.bind(this._overviewPane), true);
    this._containerContentElement.appendChild(this._timelineGrid.element);
    this._memoryStatistics.setMainTimelineGrid(this._timelineGrid);

    this._topGapElement = document.createElement("div");
    this._topGapElement.className = "timeline-gap";
    this._itemsGraphsElement.appendChild(this._topGapElement);

    this._graphRowsElement = document.createElement("div");
    this._itemsGraphsElement.appendChild(this._graphRowsElement);

    this._bottomGapElement = document.createElement("div");
    this._bottomGapElement.className = "timeline-gap";
    this._itemsGraphsElement.appendChild(this._bottomGapElement);

    this._expandElements = document.createElement("div");
    this._expandElements.id = "orphan-expand-elements";
    this._itemsGraphsElement.appendChild(this._expandElements);

    this._calculator = new WebInspector.TimelineCalculator(this._presentationModel);
    var shortRecordThresholdTitle = Number.secondsToString(WebInspector.TimelinePresentationModel.shortRecordThreshold);
    this._showShortRecordsTitleText = WebInspector.UIString("Show the records that are shorter than %s", shortRecordThresholdTitle);
    this._hideShortRecordsTitleText = WebInspector.UIString("Hide the records that are shorter than %s", shortRecordThresholdTitle);
    this._createStatusbarButtons();

    this._verticalOverview = false;
    this._boundariesAreValid = true;
    this._scrollTop = 0;

    this._popoverHelper = new WebInspector.PopoverHelper(this._containerElement, this._getPopoverAnchor.bind(this), this._showPopover.bind(this));
    this._containerElement.addEventListener("mousemove", this._mouseMove.bind(this), false);
    this._containerElement.addEventListener("mouseout", this._mouseOut.bind(this), false);

    // Disable short events filter by default.
    this.toggleFilterButton.toggled = true;
    this._showShortEvents = this.toggleFilterButton.toggled;
    this._timeStampRecords = [];
    this._expandOffset = 15;

    this._createFileSelector();
    this._model = new WebInspector.TimelineModel();
    this._model.addEventListener(WebInspector.TimelineModel.Events.RecordAdded, this._onTimelineEventRecorded, this);
    this._model.addEventListener(WebInspector.TimelineModel.Events.RecordsCleared, this._onRecordsCleared, this);

    this._registerShortcuts();

    this._allRecordsCount = 0;

    this._presentationModel.addFilter(this._overviewPane);
    this._presentationModel.addFilter(new WebInspector.TimelineCategoryFilter()); 
    this._presentationModel.addFilter(new WebInspector.TimelineIsLongFilter(this)); 
}

// Define row height, should be in sync with styles for timeline graphs.
WebInspector.TimelinePanel.rowHeight = 18;

WebInspector.TimelinePanel.prototype = {
    /**
     * @param {Event} event
     */
    _startSplitterDragging: function(event)
    {
        this._dragOffset = this._timelineMemorySplitter.offsetTop + 2 - event.pageY;
        WebInspector.elementDragStart(this._timelineMemorySplitter, this._splitterDragging.bind(this), this._endSplitterDragging.bind(this), event, "ns-resize");
    },

    /**
     * @param {Event} event
     */
    _splitterDragging: function(event)
    {
        var top = event.pageY + this._dragOffset
        this._setSplitterPosition(top);
        event.preventDefault();
        this._refresh();
    },

    /**
     * @param {Event} event
     */
    _endSplitterDragging: function(event)
    {
        delete this._dragOffset;
        WebInspector.elementDragEnd(event);
        this._memoryStatistics.show();
        WebInspector.settings.memoryCounterGraphsHeight.set(this.splitView.element.offsetHeight);
    },

    _setSplitterPosition: function(top)
    {
        const overviewHeight = 90;
        const sectionMinHeight = 100;
        top = Number.constrain(top, overviewHeight + sectionMinHeight, this.element.offsetHeight - sectionMinHeight);

        this.splitView.element.style.height = (top - overviewHeight) + "px";
        this._timelineMemorySplitter.style.top = (top - 2) + "px";
        this._memoryStatistics.setTopPosition(top);
    },

    get calculator()
    {
        return this._calculator;
    },

    get toolbarItemLabel()
    {
        return WebInspector.UIString("Timeline");
    },

    get statusBarItems()
    {
        var statusBarItems = [ this.toggleFilterButton.element, this.toggleTimelineButton.element, this.clearButton.element, this.garbageCollectButton.element, this._glueParentButton.element, this.statusBarFilters ];

        return statusBarItems;
    },

    get defaultFocusedElement()
    {
        return this.element;
    },

    _createStatusbarButtons: function()
    {
        this.toggleTimelineButton = new WebInspector.StatusBarButton(WebInspector.UIString("Record"), "record-profile-status-bar-item");
        this.toggleTimelineButton.addEventListener("click", this._toggleTimelineButtonClicked, this);

        this.clearButton = new WebInspector.StatusBarButton(WebInspector.UIString("Clear"), "clear-status-bar-item");
        this.clearButton.addEventListener("click", this._clearPanel, this);

        this.toggleFilterButton = new WebInspector.StatusBarButton(this._hideShortRecordsTitleText, "timeline-filter-status-bar-item");
        this.toggleFilterButton.addEventListener("click", this._toggleFilterButtonClicked, this);

        this.garbageCollectButton = new WebInspector.StatusBarButton(WebInspector.UIString("Collect Garbage"), "garbage-collect-status-bar-item");
        this.garbageCollectButton.addEventListener("click", this._garbageCollectButtonClicked, this);

        this.recordsCounter = document.createElement("span");
        this.recordsCounter.className = "timeline-records-counter";

        this._glueParentButton = new WebInspector.StatusBarButton(WebInspector.UIString("Glue asynchronous events to causes"), "glue-async-status-bar-item");
        this._glueParentButton.toggled = true;
        this._presentationModel.setGlueRecords(true);
        this._glueParentButton.addEventListener("click", this._glueParentButtonClicked, this);

        this.statusBarFilters = document.createElement("div");
        this.statusBarFilters.className = "status-bar-items";
        var categories = this._presentationModel.categories;
        for (var categoryName in categories) {
            var category = categories[categoryName];
            this.statusBarFilters.appendChild(this._createTimelineCategoryStatusBarCheckbox(category, this._onCategoryCheckboxClicked.bind(this, category)));
        }
    },

    _createTimelineCategoryStatusBarCheckbox: function(category, onCheckboxClicked)
    {
        var labelContainer = document.createElement("div");
        labelContainer.addStyleClass("timeline-category-statusbar-item");
        labelContainer.addStyleClass("timeline-category-" + category.name);
        labelContainer.addStyleClass("status-bar-item");

        var label = document.createElement("label");
        var checkElement = document.createElement("input");
        checkElement.type = "checkbox";
        checkElement.className = "timeline-category-checkbox";
        checkElement.checked = true;
        checkElement.addEventListener("click", onCheckboxClicked, false);
        label.appendChild(checkElement);

        var typeElement = document.createElement("span");
        typeElement.className = "type";
        typeElement.textContent = category.title;
        label.appendChild(typeElement);

        labelContainer.appendChild(label);
        return labelContainer;
    },

    _onCategoryCheckboxClicked: function(category, event)
    {
        category.hidden = !event.target.checked;
        this._scheduleRefresh(true);
    },

    _registerShortcuts: function()
    {
        var shortcut = WebInspector.KeyboardShortcut;
        var modifiers = shortcut.Modifiers;
        var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("Timeline Panel"));

        this._shortcuts[shortcut.makeKey("e", modifiers.CtrlOrMeta)] = this._toggleTimelineButtonClicked.bind(this);
        section.addKey(shortcut.shortcutToString("e", modifiers.CtrlOrMeta), WebInspector.UIString("Start/stop recording"));

        if (InspectorFrontendHost.canSaveAs()) {
            this._shortcuts[shortcut.makeKey("s", modifiers.CtrlOrMeta)] = this._saveToFile.bind(this);
            section.addKey(shortcut.shortcutToString("s", modifiers.CtrlOrMeta), WebInspector.UIString("Save timeline data"));
        }

        this._shortcuts[shortcut.makeKey("o", modifiers.CtrlOrMeta)] = this._fileSelectorElement.click.bind(this._fileSelectorElement);
        section.addKey(shortcut.shortcutToString("o", modifiers.CtrlOrMeta), WebInspector.UIString("Load timeline data"));
    },

    _createFileSelector: function()
    {
        if (this._fileSelectorElement)
            this.element.removeChild(this._fileSelectorElement);

        var fileSelectorElement = document.createElement("input");
        fileSelectorElement.type = "file";
        fileSelectorElement.style.zIndex = -1;
        fileSelectorElement.style.position = "absolute";
        fileSelectorElement.onchange = this._loadFromFile.bind(this);
        this.element.appendChild(fileSelectorElement);
        this._fileSelectorElement = fileSelectorElement;
    },

    _contextMenu: function(event)
    {
        var contextMenu = new WebInspector.ContextMenu();
        if (InspectorFrontendHost.canSaveAs())
            contextMenu.appendItem(WebInspector.UIString("Save Timeline data\u2026"), this._saveToFile.bind(this));
        contextMenu.appendItem(WebInspector.UIString("Load Timeline data\u2026"), this._fileSelectorElement.click.bind(this._fileSelectorElement));
        contextMenu.show(event);
    },

    _saveToFile: function()
    {
        this._model.saveToFile();
    },

    _loadFromFile: function()
    {
        if (this.toggleTimelineButton.toggled) {
            this.toggleTimelineButton.toggled = false;
            this._model.stopRecord();
        }
        this._model.loadFromFile(this._fileSelectorElement.files[0]);
        this._createFileSelector();
    },

    _rootRecord: function()
    {
        return this._presentationModel.rootRecord();
    },

    _updateRecordsCounter: function(recordsInWindowCount)
    {
        this.recordsCounter.textContent = WebInspector.UIString("%d of %d captured records are visible", recordsInWindowCount, this._allRecordsCount);
    },

    _updateEventDividers: function()
    {
        this._timelineGrid.removeEventDividers();
        var clientWidth = this._graphRowsElement.offsetWidth - this._expandOffset;
        var dividers = [];
        // Only show frames if we're zoomed close enough -- otherwise they'd be to dense to be useful and will overpopulate DOM.
        var showFrames = this.calculator.boundarySpan < 1.0 && this._verticalOverview;

        for (var i = 0; i < this._timeStampRecords.length; ++i) {
            var record = this._timeStampRecords[i];
            if (record.type === WebInspector.TimelineModel.RecordType.BeginFrame && !showFrames)
                continue;
            var positions = this._calculator.computeBarGraphWindowPosition(record, clientWidth);
            var dividerPosition = Math.round(positions.left);
            if (dividerPosition < 0 || dividerPosition >= clientWidth || dividers[dividerPosition])
                continue;
            var divider = this._createEventDivider(record);
            divider.style.left = (dividerPosition + this._expandOffset) + "px";
            dividers[dividerPosition] = divider;
        }
        this._timelineGrid.addEventDividers(dividers);
        this._overviewPane.updateEventDividers(this._timeStampRecords, this._createEventDivider.bind(this));
    },

    _createEventDivider: function(record)
    {
        var eventDivider = document.createElement("div");
        eventDivider.className = "resources-event-divider";
        var recordTypes = WebInspector.TimelineModel.RecordType;

        var eventDividerPadding = document.createElement("div");
        eventDividerPadding.className = "resources-event-divider-padding";
        eventDividerPadding.title = record.title;

        if (record.type === recordTypes.MarkDOMContent)
            eventDivider.className += " resources-blue-divider";
        else if (record.type === recordTypes.MarkLoad)
            eventDivider.className += " resources-red-divider";
        else if (record.type === recordTypes.TimeStamp) {
            eventDivider.className += " resources-orange-divider";
            eventDividerPadding.title = record.data["message"];
        } else if (record.type === recordTypes.BeginFrame)
            eventDivider.className += " timeline-frame-divider";

        eventDividerPadding.appendChild(eventDivider);
        return eventDividerPadding;
    },

    _timelinesOverviewModeChanged: function(event)
    {
        var shouldShowMemory = event.data === WebInspector.TimelineOverviewPane.Mode.Memory;
        var verticalOverview = event.data === WebInspector.TimelineOverviewPane.Mode.EventsVertical;
        if (verticalOverview !== this._verticalOverview) {
            this._verticalOverview = verticalOverview;
            this._glueParentButton.disabled = verticalOverview;
            if (verticalOverview)
                this.element.addStyleClass("timeline-vertical-overview");
            else
                this.element.removeStyleClass("timeline-vertical-overview");
            this._presentationModel.setGlueRecords(this._glueParentButton.toggled && !verticalOverview);
            this._repopulateRecords();
        }
        if (shouldShowMemory === this._memoryStatistics.visible())
            return;
        if (!shouldShowMemory) {
            this._timelineMemorySplitter.addStyleClass("hidden");
            this._memoryStatistics.hide();
            this.splitView.element.style.height = "auto";
            this.splitView.element.style.bottom = "0";
        } else {
            this._timelineMemorySplitter.removeStyleClass("hidden");
            this._memoryStatistics.show();
            this.splitView.element.style.bottom = "auto";
            this._setSplitterPosition(WebInspector.settings.memoryCounterGraphsHeight.get());
        }
        this._refresh();
    },

    _toggleTimelineButtonClicked: function()
    {
        if (this.toggleTimelineButton.toggled)
            this._model.stopRecord();
        else {
            this._model.startRecord();
            WebInspector.userMetrics.TimelineStarted.record();
        }
        this.toggleTimelineButton.toggled = !this.toggleTimelineButton.toggled;
    },

    _toggleFilterButtonClicked: function()
    {
        this.toggleFilterButton.toggled = !this.toggleFilterButton.toggled;
        this._showShortEvents = this.toggleFilterButton.toggled;
        this.toggleFilterButton.element.title = this._showShortEvents ? this._hideShortRecordsTitleText : this._showShortRecordsTitleText;
        this._scheduleRefresh(true);
    },

    _garbageCollectButtonClicked: function()
    {
        ProfilerAgent.collectGarbage();
    },

    _glueParentButtonClicked: function()
    {
        this._glueParentButton.toggled = !this._glueParentButton.toggled;
        this._presentationModel.setGlueRecords(this._glueParentButton.toggled);
        this._repopulateRecords();
    },

    _repopulateRecords: function()
    {
        this._resetPanel();
        var records = this._model.records;
        for (var i = 0; i < records.length; ++i)
            this._innerAddRecordToTimeline(records[i], this._rootRecord());
        this._scheduleRefresh(false);
    },

    _onTimelineEventRecorded: function(event)
    {
        this._innerAddRecordToTimeline(event.data, this._rootRecord());
        this._scheduleRefresh(false);

        if (event.data["counters"])
            this._memoryStatistics.addTimlineEvent(event);
    },

    _innerAddRecordToTimeline: function(record, parentRecord)
    {
        var formattedRecord = this._presentationModel.addRecord(record, parentRecord);
        ++this._allRecordsCount;
        var recordTypes = WebInspector.TimelineModel.RecordType;
        var timeStampRecords = this._timeStampRecords;
        function addTimestampRecords(record)
        {
            if (record.type === recordTypes.MarkDOMContent || record.type === recordTypes.MarkLoad ||
                record.type === recordTypes.TimeStamp || record.type === recordTypes.BeginFrame) {
                timeStampRecords.push(record);
            }
        }
        WebInspector.TimelinePanel.forAllRecords([ formattedRecord ], addTimestampRecords);
    },

    sidebarResized: function(event)
    {
        var width = event.data;
        this._sidebarBackgroundElement.style.width = width + "px";
        this._scheduleRefresh(false);
        this._overviewPane.sidebarResized(width);
        // Min width = <number of buttons on the left> * 31
        this.statusBarFilters.style.left = Math.max((this.statusBarItems.length + 2) * 31, width) + "px";
        this._memoryStatistics.setSidebarWidth(width);
    },

    onResize: function()
    {
        this._closeRecordDetails();
        this._scheduleRefresh(false);
    },

    _clearPanel: function()
    {
        this._model.reset();
    },

    _onRecordsCleared: function()
    {
        this._resetPanel();
        this._refresh();
    },

    _resetPanel: function()
    {
        this._presentationModel.reset();
        this._timeStampRecords = [];
        this._boundariesAreValid = false;
        this._overviewPane.reset();
        this._adjustScrollPosition(0);
        this._closeRecordDetails();
        this._allRecordsCount = 0;
        this._memoryStatistics.reset();
    },

    elementsToRestoreScrollPositionsFor: function()
    {
        return [this._containerElement];
    },

    wasShown: function()
    {
        WebInspector.Panel.prototype.wasShown.call(this);
        this._refresh();
        WebInspector.drawer.currentPanelCounters = this.recordsCounter;
    },

    willHide: function()
    {
        this._closeRecordDetails();
        WebInspector.drawer.currentPanelCounters = null;
        WebInspector.Panel.prototype.willHide.call(this);
    },

    _onScroll: function(event)
    {
        this._closeRecordDetails();
        var scrollTop = this._containerElement.scrollTop;
        var dividersTop = Math.max(0, scrollTop);
        this._timelineGrid.setScrollAndDividerTop(scrollTop, dividersTop);
        this._scheduleRefresh(true);
    },

    _scheduleRefresh: function(preserveBoundaries)
    {
        this._closeRecordDetails();
        this._boundariesAreValid &= preserveBoundaries;

        if (!this.isShowing())
            return;

        if (preserveBoundaries)
            this._refresh();
        else {
            if (!this._refreshTimeout)
                this._refreshTimeout = setTimeout(this._refresh.bind(this), 100);
        }
    },

    _refresh: function()
    {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            delete this._refreshTimeout;
        }

        this._overviewPane.update(this._showShortEvents);

        if (!this._boundariesAreValid)
            this._calculator.setWindow(this._overviewPane.windowStartTime(), this._overviewPane.windowEndTime());

        var recordsInWindowCount = this._refreshRecords(!this._boundariesAreValid);
        this._updateRecordsCounter(recordsInWindowCount);
        if(!this._boundariesAreValid)
            this._updateEventDividers();
        if (this._memoryStatistics.visible())
            this._memoryStatistics.refresh();
        this._boundariesAreValid = true;
    },

    revealRecordAt: function(time)
    {
        if (this._verticalOverview)
            return;
        var recordsInWindow = this._presentationModel.filteredRecords();
        var recordToReveal;
        for (var i = 0; i < recordsInWindow.length; ++i) {
            var record = recordsInWindow[i];
            if (record.containsTime(time)) {
                recordToReveal = record;
                break;
            }
            // If there is no record containing the time than use the latest one before that time.
            if (!recordToReveal || record.endTime < time && recordToReveal.endTime < record.endTime)
                recordToReveal = record;
        }

        // The record ends before the window left bound so scroll to the top.
        if (!recordToReveal) {
            this._containerElement.scrollTop = 0;
            return;
        }

        // Expand all ancestors.
        for (var parent = recordToReveal.parent; parent !== this._rootRecord(); parent = parent.parent)
            parent.collapsed = false;
        var index = recordsInWindow.indexOf(recordToReveal);
        this._containerElement.scrollTop = index * WebInspector.TimelinePanel.rowHeight;
    },

    _refreshRecords: function(updateBoundaries)
    {
        var recordsInWindow = this._presentationModel.filteredRecords();

        // Calculate the visible area.
        this._scrollTop = this._containerElement.scrollTop;
        var visibleTop = this._scrollTop;
        var visibleBottom = visibleTop + this._containerElement.clientHeight;

        const rowHeight = WebInspector.TimelinePanel.rowHeight;

        // Convert visible area to visible indexes. Always include top-level record for a visible nested record.
        var startIndex = Math.max(0, Math.min(Math.floor(visibleTop / rowHeight) - 1, recordsInWindow.length - 1));
        var endIndex = Math.min(recordsInWindow.length, Math.ceil(visibleBottom / rowHeight));

        // Resize gaps first.
        const top = (startIndex * rowHeight) + "px";
        this._topGapElement.style.height = top;
        this.sidebarElement.style.top = top;
        this.splitView.sidebarResizerElement.style.top = top;
        this._bottomGapElement.style.height = (recordsInWindow.length - endIndex) * rowHeight + "px";

        // Update visible rows.
        var listRowElement = this._sidebarListElement.firstChild;
        var width = this._graphRowsElement.offsetWidth;
        this._itemsGraphsElement.removeChild(this._graphRowsElement);
        var graphRowElement = this._graphRowsElement.firstChild;
        var scheduleRefreshCallback = this._scheduleRefresh.bind(this, true);
        this._itemsGraphsElement.removeChild(this._expandElements);
        this._expandElements.removeChildren();

        for (var i = 0; i < endIndex; ++i) {
            var record = recordsInWindow[i];
            var isEven = !(i % 2);

            if (i < startIndex) {
                var lastChildIndex = i + record.visibleChildrenCount;
                if (lastChildIndex >= startIndex && lastChildIndex < endIndex) {
                    var expandElement = new WebInspector.TimelineExpandableElement(this._expandElements);
                    expandElement._update(record, i, this._calculator.computeBarGraphWindowPosition(record, width - this._expandOffset));
                }
            } else {
                if (!listRowElement) {
                    listRowElement = new WebInspector.TimelineRecordListRow().element;
                    this._sidebarListElement.appendChild(listRowElement);
                }
                if (!graphRowElement) {
                    graphRowElement = new WebInspector.TimelineRecordGraphRow(this._itemsGraphsElement, scheduleRefreshCallback).element;
                    this._graphRowsElement.appendChild(graphRowElement);
                }

                listRowElement.row.update(record, isEven, this._calculator, visibleTop);
                graphRowElement.row.update(record, isEven, this._calculator, width, this._expandOffset, i);

                listRowElement = listRowElement.nextSibling;
                graphRowElement = graphRowElement.nextSibling;
            }
        }

        // Remove extra rows.
        while (listRowElement) {
            var nextElement = listRowElement.nextSibling;
            listRowElement.row.dispose();
            listRowElement = nextElement;
        }
        while (graphRowElement) {
            var nextElement = graphRowElement.nextSibling;
            graphRowElement.row.dispose();
            graphRowElement = nextElement;
        }

        this._itemsGraphsElement.insertBefore(this._graphRowsElement, this._bottomGapElement);
        this._itemsGraphsElement.appendChild(this._expandElements);
        this.splitView.sidebarResizerElement.style.height = this.sidebarElement.clientHeight + "px";
        // Reserve some room for expand / collapse controls to the left for records that start at 0ms.
        if (updateBoundaries)
            this._timelineGrid.updateDividers(true, this._calculator, this.timelinePaddingLeft);
        this._adjustScrollPosition((recordsInWindow.length + 1) * rowHeight);

        return recordsInWindow.length;
    },

    get timelinePaddingLeft()
    {
        return !this._overviewPane.windowLeft() ? this._expandOffset : 0;
    },

    _adjustScrollPosition: function(totalHeight)
    {
        // Prevent the container from being scrolled off the end.
        if ((this._containerElement.scrollTop + this._containerElement.offsetHeight) > totalHeight + 1)
            this._containerElement.scrollTop = (totalHeight - this._containerElement.offsetHeight);
    },

    _getPopoverAnchor: function(element)
    {
        return element.enclosingNodeOrSelfWithClass("timeline-graph-bar") || element.enclosingNodeOrSelfWithClass("timeline-tree-item");
    },

    _mouseOut: function(e)
    {
        this._hideRectHighlight();
    },

    _mouseMove: function(e)
    {
        var anchor = this._getPopoverAnchor(e.target);

        if (anchor && anchor.row._record.type === "Paint")
            this._highlightRect(anchor.row._record);
        else
            this._hideRectHighlight();
    },

    _highlightRect: function(record)
    {
        if (this._highlightedRect === record.data)
            return;
        this._highlightedRect = record.data;
        DOMAgent.highlightRect(this._highlightedRect.x, this._highlightedRect.y, this._highlightedRect.width, this._highlightedRect.height, WebInspector.Color.PageHighlight.Content.toProtocolRGBA(), WebInspector.Color.PageHighlight.ContentOutline.toProtocolRGBA());
    },

    _hideRectHighlight: function()
    {
        if (this._highlightedRect) {
            delete this._highlightedRect;
            DOMAgent.hideHighlight();
        }
    },

    /**
     * @param {Element} anchor
     * @param {WebInspector.Popover} popover
     */
    _showPopover: function(anchor, popover)
    {
        var record = anchor.row._record;
        popover.show(record.generatePopupContent(this._calculator), anchor);
    },

    _closeRecordDetails: function()
    {
        this._popoverHelper.hidePopover();
    }
}

WebInspector.TimelinePanel.prototype.__proto__ = WebInspector.Panel.prototype;

/**
 * @constructor
 * @param {WebInspector.TimelinePresentationModel} presentationModel
 */
WebInspector.TimelineCalculator = function(presentationModel)
{
    this._presentationModel = presentationModel;
}

WebInspector.TimelineCalculator.prototype = {
    computeBarGraphPercentages: function(record)
    {
        var start = (record.startTime - this.minimumBoundary) / this.boundarySpan * 100;
        var end = (record.startTime + record.selfTime - this.minimumBoundary) / this.boundarySpan * 100;
        var endWithChildren = (record.lastChildEndTime - this.minimumBoundary) / this.boundarySpan * 100;
        var cpuWidth = record.cpuTime / this.boundarySpan * 100;
        return {start: start, end: end, endWithChildren: endWithChildren, cpuWidth: cpuWidth};
    },

    computeBarGraphWindowPosition: function(record, clientWidth)
    {
        const minWidth = 5;
        const borderWidth = 4;
        var workingArea = clientWidth - minWidth - borderWidth;
        var percentages = this.computeBarGraphPercentages(record);

        var left = percentages.start / 100 * workingArea;
        var width = (percentages.end - percentages.start) / 100 * workingArea + minWidth;
        var widthWithChildren =  (percentages.endWithChildren - percentages.start) / 100 * workingArea;
        var cpuWidth = percentages.cpuWidth / 100 * workingArea + minWidth;
        if (percentages.endWithChildren > percentages.end)
            widthWithChildren += borderWidth + minWidth;
        return {left: left, width: width, widthWithChildren: widthWithChildren, cpuWidth: cpuWidth};
    },

    setWindow: function(minimumBoundary, maximumBoundary)
    {
        this.minimumBoundary = minimumBoundary;
        this.maximumBoundary = maximumBoundary;
        this.boundarySpan = this.maximumBoundary - this.minimumBoundary;
    },

    formatTime: function(value)
    {
        return Number.secondsToString(value + this.minimumBoundary - this._presentationModel.minimumRecordTime());
    }
}

/**
 * @constructor
 */
WebInspector.TimelineRecordListRow = function()
{
    this.element = document.createElement("div");
    this.element.row = this;
    this.element.style.cursor = "pointer";
    var iconElement = document.createElement("span");
    iconElement.className = "timeline-tree-icon";
    this.element.appendChild(iconElement);

    this._typeElement = document.createElement("span");
    this._typeElement.className = "type";
    this.element.appendChild(this._typeElement);

    var separatorElement = document.createElement("span");
    separatorElement.className = "separator";
    separatorElement.textContent = " ";

    this._dataElement = document.createElement("span");
    this._dataElement.className = "data dimmed";

    this.element.appendChild(separatorElement);
    this.element.appendChild(this._dataElement);
}

WebInspector.TimelineRecordListRow.prototype = {
    update: function(record, isEven, calculator, offset)
    {
        this._record = record;
        this._calculator = calculator;
        this._offset = offset;

        this.element.className = "timeline-tree-item timeline-category-" + record.category.name + (isEven ? " even" : "");
        this._typeElement.textContent = record.title;

        if (this._dataElement.firstChild)
            this._dataElement.removeChildren();
        if (record.details) {
            var detailsContainer = document.createElement("span");
            if (typeof record.details === "object") {
                detailsContainer.appendChild(document.createTextNode("("));
                detailsContainer.appendChild(record.details);
                detailsContainer.appendChild(document.createTextNode(")"));
            } else
                detailsContainer.textContent = "(" + record.details + ")";
            this._dataElement.appendChild(detailsContainer);
        }
    },

    dispose: function()
    {
        this.element.parentElement.removeChild(this.element);
    }
}

/**
 * @constructor
 */
WebInspector.TimelineRecordGraphRow = function(graphContainer, scheduleRefresh)
{
    this.element = document.createElement("div");
    this.element.row = this;

    this._barAreaElement = document.createElement("div");
    this._barAreaElement.className = "timeline-graph-bar-area";
    this.element.appendChild(this._barAreaElement);

    this._barWithChildrenElement = document.createElement("div");
    this._barWithChildrenElement.className = "timeline-graph-bar with-children";
    this._barWithChildrenElement.row = this;
    this._barAreaElement.appendChild(this._barWithChildrenElement);

    this._barCpuElement = document.createElement("div");
    this._barCpuElement.className = "timeline-graph-bar cpu"
    this._barCpuElement.row = this;
    this._barAreaElement.appendChild(this._barCpuElement);

    this._barElement = document.createElement("div");
    this._barElement.className = "timeline-graph-bar";
    this._barElement.row = this;
    this._barAreaElement.appendChild(this._barElement);

    this._expandElement = new WebInspector.TimelineExpandableElement(graphContainer);
    this._expandElement._element.addEventListener("click", this._onClick.bind(this));

    this._scheduleRefresh = scheduleRefresh;
}

WebInspector.TimelineRecordGraphRow.prototype = {
    update: function(record, isEven, calculator, clientWidth, expandOffset, index)
    {
        this._record = record;
        this.element.className = "timeline-graph-side timeline-category-" + record.category.name + (isEven ? " even" : "");
        var barPosition = calculator.computeBarGraphWindowPosition(record, clientWidth - expandOffset);
        this._barWithChildrenElement.style.left = barPosition.left + expandOffset + "px";
        this._barWithChildrenElement.style.width = barPosition.widthWithChildren + "px";
        this._barElement.style.left = barPosition.left + expandOffset + "px";
        this._barElement.style.width =  barPosition.width + "px";
        this._barCpuElement.style.left = barPosition.left + expandOffset + "px";
        this._barCpuElement.style.width = barPosition.cpuWidth + "px";
        this._expandElement._update(record, index, barPosition);
    },

    _onClick: function(event)
    {
        this._record.collapsed = !this._record.collapsed;
        this._scheduleRefresh(false);
    },

    dispose: function()
    {
        this.element.parentElement.removeChild(this.element);
        this._expandElement._dispose();
    }
}

WebInspector.TimelinePanel.forAllRecords = function(recordsArray, callback)
{
    if (!recordsArray)
        return;
    var stack = [{array: recordsArray, index: 0}];
    while (stack.length) {
        var entry = stack[stack.length - 1];
        var records = entry.array;
        if (entry.index < records.length) {
             var record = records[entry.index];
             if (callback(record))
                 return;
             if (record.children)
                 stack.push({array: record.children, index: 0});
             ++entry.index;
        } else
            stack.pop();
    }
}

/**
 * @constructor
 */
WebInspector.TimelineExpandableElement = function(container)
{
    this._element = document.createElement("div");
    this._element.className = "timeline-expandable";

    var leftBorder = document.createElement("div");
    leftBorder.className = "timeline-expandable-left";
    this._element.appendChild(leftBorder);

    container.appendChild(this._element);
}

WebInspector.TimelineExpandableElement.prototype = {
    _update: function(record, index, barPosition)
    {
        const rowHeight = WebInspector.TimelinePanel.rowHeight;
        if (record.visibleChildrenCount || record.invisibleChildrenCount) {
            this._element.style.top = index * rowHeight + "px";
            this._element.style.left = barPosition.left + "px";
            this._element.style.width = Math.max(12, barPosition.width + 25) + "px";
            if (!record.collapsed) {
                this._element.style.height = (record.visibleChildrenCount + 1) * rowHeight + "px";
                this._element.addStyleClass("timeline-expandable-expanded");
                this._element.removeStyleClass("timeline-expandable-collapsed");
            } else {
                this._element.style.height = rowHeight + "px";
                this._element.addStyleClass("timeline-expandable-collapsed");
                this._element.removeStyleClass("timeline-expandable-expanded");
            }
            this._element.removeStyleClass("hidden");
        } else
            this._element.addStyleClass("hidden");
    },

    _dispose: function()
    {
        this._element.parentElement.removeChild(this._element);
    }
}

/**
 * @constructor
 * @implements {WebInspector.TimelinePresentationModel.Filter}
 */
WebInspector.TimelineCategoryFilter = function()
{
}

WebInspector.TimelineCategoryFilter.prototype = {
    /**
     * @param {WebInspector.TimelinePresentationModel.Record} record
     */
    accept: function(record)
    {
        return !record.category.hidden && record.type !== WebInspector.TimelineModel.RecordType.BeginFrame;
    }
}

/**
 * @param {WebInspector.TimelinePanel} panel
 * @constructor
 * @implements {WebInspector.TimelinePresentationModel.Filter}
 */
WebInspector.TimelineIsLongFilter = function(panel)
{
    this._panel = panel;
}

WebInspector.TimelineIsLongFilter.prototype = {
    /**
     * @param {WebInspector.TimelinePresentationModel.Record} record
     */
    accept: function(record)
    {
        return this._panel._showShortEvents || record.isLong();
    }
}
