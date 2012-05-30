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
 * @extends {WebInspector.Object}
 * @implements {WebInspector.TimelinePresentationModel.Filter}
 */
WebInspector.TimelineOverviewPane = function(presentationModel)
{
    this.element = document.createElement("div");
    this.element.id = "timeline-overview-panel";

    this._windowStartTime = 0;
    this._windowEndTime = Infinity;

    this._presentationModel = presentationModel;

    this._topPaneSidebarElement = document.createElement("div");
    this._topPaneSidebarElement.id = "timeline-overview-sidebar";

    if (WebInspector.experimentsSettings.timelineVerticalOverview.isEnabled()) {
        this._overviewModeSelector = new WebInspector.TimelineOverviewModeSelector(this._onOverviewModeChanged.bind(this));
        this._overviewModeSelector.addButton(WebInspector.UIString("Show each event category as a horizontal strip in overview"),
                                             "timeline-mode-horizontal-bars", WebInspector.TimelineOverviewPane.Mode.EventsHorizontal);
        this._overviewModeSelector.addButton(WebInspector.UIString("Show each event as a vertical bar in overview"),
                                             "timeline-mode-vertical-bars", WebInspector.TimelineOverviewPane.Mode.EventsVertical);
    }

    var overviewTreeElement = document.createElement("ol");
    overviewTreeElement.className = "sidebar-tree";
    this._topPaneSidebarElement.appendChild(overviewTreeElement);
    this.element.appendChild(this._topPaneSidebarElement);

    var topPaneSidebarTree = new TreeOutline(overviewTreeElement);
    this._timelinesOverviewItem = new WebInspector.SidebarTreeElement("resources-time-graph-sidebar-item", WebInspector.UIString("Timelines"));
    if (this._overviewModeSelector)
        this._timelinesOverviewItem.statusElement = this._overviewModeSelector.element;

    topPaneSidebarTree.appendChild(this._timelinesOverviewItem);
    this._timelinesOverviewItem.revealAndSelect(false);
    this._timelinesOverviewItem.onselect = this._showTimelines.bind(this);

    this._memoryOverviewItem = new WebInspector.SidebarTreeElement("resources-size-graph-sidebar-item", WebInspector.UIString("Memory"));
    topPaneSidebarTree.appendChild(this._memoryOverviewItem);
    this._memoryOverviewItem.onselect = this._showMemoryGraph.bind(this);

    this._currentMode = WebInspector.TimelineOverviewPane.Mode.EventsHorizontal;

    this._overviewContainer = this.element.createChild("div", "fill");
    this._overviewContainer.id = "timeline-overview-container";

    this._overviewGrid = new WebInspector.TimelineGrid();
    this._overviewGrid.element.id = "timeline-overview-grid";
    this._overviewGrid.itemsGraphsElement.id = "timeline-overview-timelines";

    this._overviewContainer.appendChild(this._overviewGrid.element);

    this._heapGraph = new WebInspector.HeapGraph();
    this._heapGraph.element.id = "timeline-overview-memory";
    this._overviewGrid.element.insertBefore(this._heapGraph.element, this._overviewGrid.itemsGraphsElement);

    this._overviewWindow = new WebInspector.TimelineOverviewWindow(this._overviewContainer);
    this._overviewWindow.addEventListener(WebInspector.TimelineOverviewWindow.Events.WindowChanged, this._onWindowChanged, this);

    this._overviewContainer.appendChild(this._overviewGrid.element);

    var separatorElement = document.createElement("div");
    separatorElement.id = "timeline-overview-separator";
    this.element.appendChild(separatorElement);
 
    this._categoryGraphs = {};
    var i = 0;
    var categories = this._presentationModel.categories;
    for (var category in categories) {
        var categoryGraph = new WebInspector.TimelineCategoryGraph(categories[category], i++ % 2);
        this._categoryGraphs[category] = categoryGraph;
        this._overviewGrid.itemsGraphsElement.appendChild(categoryGraph.graphElement);
        categories[category].addEventListener(WebInspector.TimelineCategory.Events.VisibilityChanged, this._onCategoryVisibilityChanged, this);
    }

    this._overviewGrid.setScrollAndDividerTop(0, 0);
    this._overviewCalculator = new WebInspector.TimelineOverviewCalculator();
}

WebInspector.TimelineOverviewPane.MinSelectableSize = 12;

WebInspector.TimelineOverviewPane.WindowScrollSpeedFactor = .3;

WebInspector.TimelineOverviewPane.ResizerOffset = 3.5; // half pixel because offset values are not rounded but ceiled

WebInspector.TimelineOverviewPane.Mode = {
    EventsVertical: "EventsVertical",
    EventsHorizontal: "EventsHorizontal",
    Memory: "Memory"
};

WebInspector.TimelineOverviewPane.Events = {
    ModeChanged: "ModeChanged",
    WindowChanged: "WindowChanged"
};

WebInspector.TimelineOverviewPane.prototype = {
    _showTimelines: function()
    {
        var newMode = this._overviewModeSelector ? this._overviewModeSelector.value : WebInspector.TimelineOverviewPane.Mode.EventsHorizontal;
        if (this._currentMode === newMode)
            return;
        this._currentMode = newMode;
        this._timelinesOverviewItem.revealAndSelect(false);
        this._heapGraph.hide();
        this._setVerticalOverview(this._currentMode === WebInspector.TimelineOverviewPane.Mode.EventsVertical);
        this._overviewGrid.itemsGraphsElement.removeStyleClass("hidden");
        this._updateCategoryStrips(this._presentationModel.rootRecord().children);
        this.dispatchEventToListeners(WebInspector.TimelineOverviewPane.Events.ModeChanged, this._currentMode);
    },

    _showMemoryGraph: function()
    {
        this._currentMode = WebInspector.TimelineOverviewPane.Mode.Memory;
        this._setVerticalOverview(false);
        this._memoryOverviewItem.revealAndSelect(false);
        this._heapGraph.show();
        this._heapGraph.update(this._presentationModel.rootRecord().children);
        this._overviewGrid.itemsGraphsElement.addStyleClass("hidden");
        this.dispatchEventToListeners(WebInspector.TimelineOverviewPane.Events.ModeChanged, this._currentMode);
    },

    _setVerticalOverview: function(enabled)
    {
        if (!enabled === !this._verticalOverview)
            return;
        if (enabled) {
            this._verticalOverview = new WebInspector.TimelineVerticalOverview();
            this._verticalOverview.show(this._overviewContainer);
            this._verticalOverview.update(this._presentationModel.rootRecord().children);
        } else {
            this._verticalOverview.detach();
            this._overviewGrid.itemsGraphsElement.removeStyleClass("hidden");
            this._verticalOverview = null;
        }
    },

    _onOverviewModeChanged: function()
    {
        // If we got this while in memory mode, we postpone actual switch until we get to the events mode.
        if (this._currentMode === WebInspector.TimelineOverviewPane.Mode.Memory)
            return;
        this._showTimelines();
    },

    _onCategoryVisibilityChanged: function(event)
    {
        var category = event.data;
        this._categoryGraphs[category.name].dimmed = category.hidden;
    },

    update: function(showShortEvents)
    {
        this._showShortEvents = showShortEvents;
        this._overviewCalculator.reset();

        function updateBoundaries(record)
        {
            this._overviewCalculator.updateBoundaries(record);
            return false;
        }

        var records = this._presentationModel.rootRecord().children;
        WebInspector.TimelinePanel.forAllRecords(records, updateBoundaries.bind(this));

        if (this._heapGraph.visible) {
            this._heapGraph.setSize(this._overviewGrid.element.offsetWidth, 60);
            this._heapGraph.update(records);
        } else if (this._verticalOverview)
            this._verticalOverview.update(records);
        else
            this._updateCategoryStrips(records);
        this._overviewGrid.updateDividers(true, this._overviewCalculator);
    },

    _updateCategoryStrips: function(records)
    {
        // Clear summary bars.
        var timelines = {};
        for (var category in this._presentationModel.categories) {
            timelines[category] = [];
            this._categoryGraphs[category].clearChunks();
        }

        // Create sparse arrays with 101 cells each to fill with chunks for a given category.
        function markPercentagesForRecord(record)
        {
            if (!(this._showShortEvents || record.isLong()))
                return;
            var percentages = this._overviewCalculator.computeBarGraphPercentages(record);

            var end = Math.round(percentages.end);
            var categoryName = record.category.name;
            for (var j = Math.round(percentages.start); j <= end; ++j)
                timelines[categoryName][j] = true;
        }
        WebInspector.TimelinePanel.forAllRecords(records, markPercentagesForRecord.bind(this));

        // Convert sparse arrays to continuous segments, render graphs for each.
        for (var category in this._presentationModel.categories) {
            var timeline = timelines[category];
            window.timelineSaved = timeline;
            var chunkStart = -1;
            for (var j = 0; j < 101; ++j) {
                if (timeline[j]) {
                    if (chunkStart === -1)
                        chunkStart = j;
                } else {
                    if (chunkStart !== -1) {
                        this._categoryGraphs[category].addChunk(chunkStart, j);
                        chunkStart = -1;
                    }
                }
            }
            if (chunkStart !== -1) {
                this._categoryGraphs[category].addChunk(chunkStart, 100);
                chunkStart = -1;
            }
        }

    },

    updateEventDividers: function(records, dividerConstructor)
    {
        this._overviewGrid.removeEventDividers();
        var dividers = [];
        for (var i = 0; i < records.length; ++i) {
            var record = records[i];
            if (record.type === WebInspector.TimelineModel.RecordType.BeginFrame)
                continue;
            var positions = this._overviewCalculator.computeBarGraphPercentages(record);
            var dividerPosition = Math.round(positions.start * 10);
            if (dividers[dividerPosition])
                continue;
            var divider = dividerConstructor(record);
            divider.style.left = positions.start + "%";
            dividers[dividerPosition] = divider;
        }
        this._overviewGrid.addEventDividers(dividers);
    },

    sidebarResized: function(width)
    {
        this._overviewContainer.style.left = width + "px";
        this._topPaneSidebarElement.style.width = width + "px";
    },

    reset: function()
    {
        this._windowStartTime = 0;
        this._windowEndTime = Infinity;
        this._overviewWindow.reset();
        this._overviewCalculator.reset();
        this._overviewGrid.updateDividers(true, this._overviewCalculator);
        if (this._verticalOverview)
            this._verticalOverview.reset();
    },

    scrollWindow: function(event)
    {
        this._overviewWindow.scrollWindow(event);
    },

    /**
     * @param {WebInspector.TimelinePresentationModel.Record} record
     */
    accept: function(record)
    {
        return record.endTime >= this._windowStartTime && record.startTime <= this._windowEndTime;
    },

    windowStartTime: function()
    {
        return this._windowStartTime || this._presentationModel.minimumRecordTime();
    },

    windowEndTime: function()
    {
        return this._windowEndTime < Infinity ? this._windowEndTime : this._presentationModel.maximumRecordTime();
    },

    windowLeft: function()
    {
        return this._overviewWindow.windowLeft;
    },

    windowRight: function()
    {
        return this._overviewWindow.windowRight;
    },

    _onWindowChanged: function()
    {
        if (this._verticalOverview) {
            var times = this._verticalOverview.getWindowTimes(this.windowLeft(), this.windowRight());
            this._windowStartTime = times.startTime;
            this._windowEndTime = times.endTime;
        } else {
            var absoluteMin = this._presentationModel.minimumRecordTime();
            var absoluteMax = this._presentationModel.maximumRecordTime();
            this._windowStartTime = absoluteMin + (absoluteMax - absoluteMin) * this.windowLeft();
            this._windowEndTime = absoluteMin + (absoluteMax - absoluteMin) * this.windowRight();
        }
        this.dispatchEventToListeners(WebInspector.TimelineOverviewPane.Events.WindowChanged);
    }
}

WebInspector.TimelineOverviewPane.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @param {Element} parentElement
 */
WebInspector.TimelineOverviewWindow = function(parentElement)
{
    this._parentElement = parentElement;

    this.windowLeft = 0.0;
    this.windowRight = 1.0;

    this._parentElement.addEventListener("mousedown", this._dragWindow.bind(this), true);
    this._parentElement.addEventListener("mousewheel", this.scrollWindow.bind(this), true);
    this._parentElement.addEventListener("dblclick", this._resizeWindowMaximum.bind(this), true);

    this._overviewWindowElement = document.createElement("div");
    this._overviewWindowElement.className = "timeline-overview-window";
    parentElement.appendChild(this._overviewWindowElement);

    this._overviewWindowBordersElement = document.createElement("div");
    this._overviewWindowBordersElement.className = "timeline-overview-window-rulers";
    parentElement.appendChild(this._overviewWindowBordersElement);

    var overviewDividersBackground = document.createElement("div");
    overviewDividersBackground.className = "timeline-overview-dividers-background";
    parentElement.appendChild(overviewDividersBackground);

    this._leftResizeElement = document.createElement("div");
    this._leftResizeElement.className = "timeline-window-resizer";
    this._leftResizeElement.style.left = 0;
    parentElement.appendChild(this._leftResizeElement);

    this._rightResizeElement = document.createElement("div");
    this._rightResizeElement.className = "timeline-window-resizer timeline-window-resizer-right";
    this._rightResizeElement.style.right = 0;
    parentElement.appendChild(this._rightResizeElement);
}

WebInspector.TimelineOverviewWindow.Events = {
    WindowChanged: "WindowChanged"
}

WebInspector.TimelineOverviewWindow.prototype = {
    reset: function()
    {
        this.windowLeft = 0.0;
        this.windowRight = 1.0;

        this._overviewWindowElement.style.left = "0%";
        this._overviewWindowElement.style.width = "100%";
        this._overviewWindowBordersElement.style.left = "0%";
        this._overviewWindowBordersElement.style.right = "0%";
        this._leftResizeElement.style.left = "0%";
        this._rightResizeElement.style.left = "100%";
    },

    _resizeWindow: function(resizeElement, event)
    {
        WebInspector.elementDragStart(resizeElement, this._windowResizeDragging.bind(this, resizeElement), this._endWindowDragging.bind(this), event, "ew-resize");
    },

    _windowResizeDragging: function(resizeElement, event)
    {
        if (resizeElement === this._leftResizeElement)
            this._resizeWindowLeft(event.pageX - this._parentElement.offsetLeft);
        else
            this._resizeWindowRight(event.pageX - this._parentElement.offsetLeft);
        event.preventDefault();
    },

    _dragWindow: function(event)
    {
        var node = event.target;
        while (node) {
            if (node.hasStyleClass("resources-dividers-label-bar")) {
                WebInspector.elementDragStart(this._overviewWindowElement, this._windowDragging.bind(this, event.pageX,
                    this._leftResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.ResizerOffset, this._rightResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.ResizerOffset), this._endWindowDragging.bind(this), event, "ew-resize");
                break;
            } else if (node === this._parentElement) {
                var position = event.pageX - this._parentElement.offsetLeft;
                this._overviewWindowSelector = new WebInspector.TimelineOverviewPane.WindowSelector(this._parentElement, position);
                WebInspector.elementDragStart(null, this._windowSelectorDragging.bind(this), this._endWindowSelectorDragging.bind(this), event, "ew-resize");
                break;
            } else if (node === this._leftResizeElement || node === this._rightResizeElement) {
                this._resizeWindow(node, event);
                break;
            }
            node = node.parentNode;
        }
    },

    _windowSelectorDragging: function(event)
    {
        this._overviewWindowSelector._updatePosition(event.pageX - this._parentElement.offsetLeft);
        event.preventDefault();
    },

    _endWindowSelectorDragging: function(event)
    {
        WebInspector.elementDragEnd(event);
        var window = this._overviewWindowSelector._close(event.pageX - this._parentElement.offsetLeft);
        delete this._overviewWindowSelector;
        if (window.end - window.start < WebInspector.TimelineOverviewPane.MinSelectableSize) {
            if (this._parentElement.clientWidth - window.end > WebInspector.TimelineOverviewPane.MinSelectableSize)
                window.end = window.start + WebInspector.TimelineOverviewPane.MinSelectableSize;
            else
                window.start = window.end - WebInspector.TimelineOverviewPane.MinSelectableSize;
        }
        this._setWindowPosition(window.start, window.end);
    },

    _windowDragging: function(startX, windowLeft, windowRight, event)
    {
        var delta = event.pageX - startX;
        var start = windowLeft + delta;
        var end = windowRight + delta;
        var windowSize = windowRight - windowLeft;

        if (start < 0) {
            start = 0;
            end = windowSize;
        }

        if (end > this._parentElement.clientWidth) {
            end = this._parentElement.clientWidth;
            start = end - windowSize;
        }
        this._setWindowPosition(start, end);

        event.preventDefault();
    },

    _resizeWindowLeft: function(start)
    {
        // Glue to edge.
        if (start < 10)
            start = 0;
        else if (start > this._rightResizeElement.offsetLeft -  4)
            start = this._rightResizeElement.offsetLeft - 4;
        this._setWindowPosition(start, null);
    },

    _resizeWindowRight: function(end)
    {
        // Glue to edge.
        if (end > this._parentElement.clientWidth - 10)
            end = this._parentElement.clientWidth;
        else if (end < this._leftResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.MinSelectableSize)
            end = this._leftResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.MinSelectableSize;
        this._setWindowPosition(null, end);
    },

    _resizeWindowMaximum: function()
    {
        this._setWindowPosition(0, this._parentElement.clientWidth);
    },

    _setWindowPosition: function(start, end)
    {
        var clientWidth = this._parentElement.clientWidth;
        const rulerAdjustment = 1 / clientWidth;
        if (typeof start === "number") {
            this.windowLeft = start / clientWidth;
            this._leftResizeElement.style.left = this.windowLeft * 100 + "%";
            this._overviewWindowElement.style.left = this.windowLeft * 100 + "%";
            this._overviewWindowBordersElement.style.left = (this.windowLeft - rulerAdjustment) * 100 + "%";
        }
        if (typeof end === "number") {
            this.windowRight = end / clientWidth;
            this._rightResizeElement.style.left = this.windowRight * 100 + "%";
        }
        this._overviewWindowElement.style.width = (this.windowRight - this.windowLeft) * 100 + "%";
        this._overviewWindowBordersElement.style.right = (1 - this.windowRight + 2 * rulerAdjustment) * 100 + "%";
        this.dispatchEventToListeners(WebInspector.TimelineOverviewWindow.Events.WindowChanged);
    },

    _endWindowDragging: function(event)
    {
        WebInspector.elementDragEnd(event);
    },

    scrollWindow: function(event)
    {
        if (typeof event.wheelDeltaX === "number" && event.wheelDeltaX !== 0) {
            this._windowDragging(event.pageX + Math.round(event.wheelDeltaX * WebInspector.TimelineOverviewPane.WindowScrollSpeedFactor),
                this._leftResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.ResizerOffset,
                this._rightResizeElement.offsetLeft + WebInspector.TimelineOverviewPane.ResizerOffset,
                event);
        }
    }
}

WebInspector.TimelineOverviewWindow.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 */
WebInspector.TimelineOverviewCalculator = function()
{
}

WebInspector.TimelineOverviewCalculator.prototype = {
    computeBarGraphPercentages: function(record)
    {
        var start = (record.startTime - this.minimumBoundary) / this.boundarySpan * 100;
        var end = (record.endTime - this.minimumBoundary) / this.boundarySpan * 100;
        return {start: start, end: end};
    },

    reset: function()
    {
        delete this.minimumBoundary;
        delete this.maximumBoundary;
    },

    updateBoundaries: function(record)
    {
        var result = false;
        if (typeof this.minimumBoundary === "undefined" || record.startTime < this.minimumBoundary) {
            this.minimumBoundary = record.startTime;
            result = true;
        }
        if (typeof this.maximumBoundary === "undefined" || record.endTime > this.maximumBoundary) {
            this.maximumBoundary = record.endTime;
            result = true;
        }
        return result;
    },

    get boundarySpan()
    {
        return this.maximumBoundary - this.minimumBoundary;
    },

    formatTime: function(value)
    {
        return Number.secondsToString(value);
    }
}

/**
 * @constructor
 */
WebInspector.TimelineCategoryGraph = function(category, isEven)
{
    this._category = category;

    this._graphElement = document.createElement("div");
    this._graphElement.className = "timeline-graph-side timeline-overview-graph-side" + (isEven ? " even" : "");

    this._barAreaElement = document.createElement("div");
    this._barAreaElement.className = "timeline-graph-bar-area timeline-category-" + category.name;
    this._graphElement.appendChild(this._barAreaElement);
}

WebInspector.TimelineCategoryGraph.prototype = {
    get graphElement()
    {
        return this._graphElement;
    },

    addChunk: function(start, end)
    {
        var chunk = document.createElement("div");
        chunk.className = "timeline-graph-bar";
        this._barAreaElement.appendChild(chunk);
        chunk.style.setProperty("left", start + "%");
        chunk.style.setProperty("width", (end - start) + "%");
    },

    clearChunks: function()
    {
        this._barAreaElement.removeChildren();
    },

    set dimmed(dimmed)
    {
        if (dimmed)
            this._barAreaElement.removeStyleClass("timeline-category-" + this._category.name);
        else
            this._barAreaElement.addStyleClass("timeline-category-" + this._category.name);
    }
}

/**
 * @constructor
 */
WebInspector.TimelineOverviewPane.WindowSelector = function(parent, position)
{
    this._startPosition = position;
    this._width = parent.offsetWidth;
    this._windowSelector = document.createElement("div");
    this._windowSelector.className = "timeline-window-selector";
    this._windowSelector.style.left = this._startPosition + "px";
    this._windowSelector.style.right = this._width - this._startPosition +  + "px";
    parent.appendChild(this._windowSelector);
}

WebInspector.TimelineOverviewPane.WindowSelector.prototype = {
    _createSelectorElement: function(parent, left, width, height)
    {
        var selectorElement = document.createElement("div");
        selectorElement.className = "timeline-window-selector";
        selectorElement.style.left = left + "px";
        selectorElement.style.width = width + "px";
        selectorElement.style.top = "0px";
        selectorElement.style.height = height + "px";
        parent.appendChild(selectorElement);
        return selectorElement;
    },

    _close: function(position)
    {
        position = Math.max(0, Math.min(position, this._width));
        this._windowSelector.parentNode.removeChild(this._windowSelector);
        return this._startPosition < position ? {start: this._startPosition, end: position} : {start: position, end: this._startPosition};
    },

    _updatePosition: function(position)
    {
        position = Math.max(0, Math.min(position, this._width));
        if (position < this._startPosition) {
            this._windowSelector.style.left = position + "px";
            this._windowSelector.style.right = this._width - this._startPosition + "px";
        } else {
            this._windowSelector.style.left = this._startPosition + "px";
            this._windowSelector.style.right = this._width - position + "px";
        }
    }
}

/**
 * @constructor
 */
WebInspector.HeapGraph = function() {
    this._canvas = document.createElement("canvas");

    this._maxHeapSizeLabel = document.createElement("div");
    this._maxHeapSizeLabel.addStyleClass("max");
    this._maxHeapSizeLabel.addStyleClass("memory-graph-label");
    this._minHeapSizeLabel = document.createElement("div");
    this._minHeapSizeLabel.addStyleClass("min");
    this._minHeapSizeLabel.addStyleClass("memory-graph-label");

    this._element = document.createElement("div");
    this._element.addStyleClass("hidden");
    this._element.appendChild(this._canvas);
    this._element.appendChild(this._maxHeapSizeLabel);
    this._element.appendChild(this._minHeapSizeLabel);
}

WebInspector.HeapGraph.prototype = {
    get element() {
    //    return this._canvas;
        return this._element;
    },

    get visible() {
        return !this.element.hasStyleClass("hidden");
    },

    show: function() {
        this.element.removeStyleClass("hidden");
    },

    hide: function() {
        this.element.addStyleClass("hidden");
    },

    setSize: function(w, h) {
        this._canvas.width = w;
        this._canvas.height = h - 5;
    },

    update: function(records)
    {
        if (!records.length)
            return;

        const lowerOffset = 3;
        var maxUsedHeapSize = 0;
        var minUsedHeapSize = 100000000000;
        var minTime;
        var maxTime;
        WebInspector.TimelinePanel.forAllRecords(records, function(r) {
            maxUsedHeapSize = Math.max(maxUsedHeapSize, r.usedHeapSize || maxUsedHeapSize);
            minUsedHeapSize = Math.min(minUsedHeapSize, r.usedHeapSize || minUsedHeapSize);

            if (typeof minTime === "undefined" || r.startTime < minTime)
                minTime = r.startTime;
            if (typeof maxTime === "undefined" || r.endTime > maxTime)
                maxTime = r.endTime;
        });
        minUsedHeapSize = Math.min(minUsedHeapSize, maxUsedHeapSize);

        var width = this._canvas.width;
        var height = this._canvas.height - lowerOffset;
        var xFactor = width / (maxTime - minTime);
        var yFactor = height / (maxUsedHeapSize - minUsedHeapSize);

        var histogram = new Array(width);
        WebInspector.TimelinePanel.forAllRecords(records, function(r) {
            if (!r.usedHeapSize)
                return;
             var x = Math.round((r.endTime - minTime) * xFactor);
             var y = Math.round((r.usedHeapSize - minUsedHeapSize) * yFactor);
             histogram[x] = Math.max(histogram[x] || 0, y);
        });

        var ctx = this._canvas.getContext("2d");
        this._clear(ctx);

        // +1 so that the border always fit into the canvas area.
        height = height + 1;

        ctx.beginPath();
        var initialY = 0;
        for (var k = 0; k < histogram.length; k++) {
            if (histogram[k]) {
                initialY = histogram[k];
                break;
            }
        }
        ctx.moveTo(0, height - initialY);

        for (var x = 0; x < histogram.length; x++) {
             if (!histogram[x])
                 continue;
             ctx.lineTo(x, height - histogram[x]);
        }

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "rgba(20,0,0,0.8)";
        ctx.stroke();

        ctx.fillStyle = "rgba(214,225,254, 0.8);";
        ctx.lineTo(width, 60);
        ctx.lineTo(0, 60);
        ctx.lineTo(0, height - initialY);
        ctx.fill();
        ctx.closePath();

        this._maxHeapSizeLabel.textContent = Number.bytesToString(maxUsedHeapSize);
        this._minHeapSizeLabel.textContent = Number.bytesToString(minUsedHeapSize);
    },

    _clear: function(ctx) {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    },
}

/**
 * @constructor
 * @extends {WebInspector.View}
 */
WebInspector.TimelineVerticalOverview = function() {
    WebInspector.View.call(this);
    this.element = document.createElement("div");
    this.element.className = "timeline-vertical-overview-bars fill";
    this.reset();
}

WebInspector.TimelineVerticalOverview.prototype = {
    reset: function()
    {
        this._recordsPerBar = 1;
        this._frameMode = false;
        this._barTimes = [];
        this._longestBarTime = 0;
    },

    update: function(allRecords)
    {
        var records = [];
        var frameCount = 0;
        for (var i = 0; i < allRecords.length; ++i) {
            var record = allRecords[i];
            if (record.category.hidden)
                continue;
            if (record.type === WebInspector.TimelineModel.RecordType.BeginFrame || (frameCount && (i + 1 === records.length)))
                ++frameCount;
            records.push(record);
        }
        // If we have frames, aggregate by frames; otherwise, just show top-level records.
        var recordCount = frameCount || records.length;

        const minBarWidth = 4;
        this._recordsPerBar = Math.max(1, recordCount * minBarWidth / this.element.clientWidth);
        var numberOfBars = Math.ceil(recordCount / this._recordsPerBar);

        this._barTimes = [];
        this._longestBarTime = 0;
        this.element.removeChildren();
        var padding = this.element.createChild("div", "padding");

        var statistics = frameCount ? this._aggregateFrames(records, numberOfBars) : this._aggregateRecords(records, numberOfBars);
        const paddingTop = 4;
        var scale = (this.element.clientHeight - paddingTop) / this._longestBarTime;

        for (var i = 0; i < statistics.length; ++i)
            this.element.insertBefore(this._buildBar(statistics[i], scale), padding);
    },

    _aggregateFrames: function(records, numberOfBars)
    {
        var statistics = [];
        for (var barNumber = 0, currentRecord = 0, currentFrame = 0;
             barNumber < numberOfBars && currentRecord < records.length; ++barNumber) {
            var lastFrame = Math.floor((barNumber + 1) * this._recordsPerBar);
            var barStartTime = records[currentRecord].startTime;
            var longestFrameStatistics;
            var longestFrameTime = 0;

            for (; currentFrame < lastFrame && currentRecord < records.length; ++currentFrame) {
                if (records[currentRecord].type === WebInspector.TimelineModel.RecordType.BeginFrame)
                    currentRecord++;
                var frameStatistics = {};
                var frameInfo = this._aggregateFrameStatistics(records, currentRecord, frameStatistics);
                currentRecord += frameInfo.recordCount;
                if (frameInfo.totalTime > longestFrameTime) {
                    longestFrameStatistics = frameStatistics;
                    longestFrameTime = frameInfo.totalTime;
                }
            }
            var barEndTime = records[currentRecord - 1].endTime;
            if (longestFrameStatistics) {
                this._longestBarTime = Math.max(this._longestBarTime, longestFrameTime);
                statistics.push(longestFrameStatistics);
                this._barTimes.push({ startTime: barStartTime, endTime: barEndTime });
            }
        }
        return statistics;
    },

    _aggregateFrameStatistics: function(records, startIndex, statistics)
    {
        var totalTime = 0;
        for (var index = startIndex; index < records.length; ++index) {
            var record = records[index];
            if (record.type === WebInspector.TimelineModel.RecordType.BeginFrame)
                break;
            var categories = Object.keys(record.aggregatedStats);
            for (var i = 0; i < categories.length; ++i) {
                var category = categories[i];
                var value = statistics[category] || 0;
                value += record.aggregatedStats[category];
                totalTime += record.aggregatedStats[category];
                statistics[category] = value;
            }
        }
        return {
            totalTime: totalTime,
            recordCount: index - startIndex
        }
    },

    _aggregateRecords: function(records, numberOfBars)
    {
        var statistics = [];
        for (var barNumber = 0, currentRecord = 0; barNumber < numberOfBars && currentRecord < records.length; ++barNumber) {
            var barStartTime = records[currentRecord].startTime;
            var longestRecord = records[currentRecord];
            var lastIndex = Math.min(Math.floor((barNumber + 1) * this._recordsPerBar), records.length);
            for (++currentRecord; currentRecord < lastIndex; ++currentRecord) {
                var record = records[currentRecord];
                if (longestRecord.endTime - longestRecord.startTime < record.endTime - record.startTime)
                    longestRecord = record;
            }
            var barEndTime = records[currentRecord - 1].endTime;
            statistics.push(longestRecord.aggregatedStats);
            this._longestBarTime = Math.max(this._longestBarTime, longestRecord.endTime - longestRecord.startTime);
            this._barTimes.push({ startTime: barStartTime, endTime: barEndTime });
        }
        return statistics;
    },

    _buildBar: function(statistics, scale)
    {
        var outer = document.createElement("div");
        outer.className = "timeline-bar-vertical";
        var categories = Object.keys(statistics);
        for (var i = 0; i < categories.length; ++i) {
            var category = categories[i];
            var duration = statistics[category];
            if (!duration)
                continue;
            var bar = outer.createChild("div", "timeline-" + category);
            bar.style.height = (statistics[category] * scale) + "px";
        }
        return outer;
    },

    getWindowTimes: function(windowLeft, windowRight)
    {
        var windowSpan = this.element.clientWidth
        var leftOffset = windowLeft * windowSpan;
        var rightOffset = windowRight * windowSpan;
        var bars = this.element.children;
        var offset0 = bars[0] ? bars[0].offsetLeft : 4;
        var barWidth = 9;
        if (bars.length > 2) {
            var offset1 = bars[bars.length - 2].offsetLeft;
            barWidth = (offset1 - offset0) / (bars.length - 2);
        }
        var firstBar = Math.floor(Math.max(leftOffset - offset0, 0) / barWidth);
        var lastBar = Math.min(Math.ceil((rightOffset - offset0 - 2) / barWidth), this._barTimes.length - 1);
        const snapToRightTolerancePixels = 3;
        return {
            startTime: firstBar >= this._barTimes.length ? Infinity : this._barTimes[firstBar].startTime,
            endTime: rightOffset + snapToRightTolerancePixels > windowSpan ? Infinity : this._barTimes[lastBar].endTime
        }
    }
}

WebInspector.TimelineVerticalOverview.prototype.__proto__ = WebInspector.View.prototype;

/**
 * @constructor
 */
WebInspector.TimelineOverviewModeSelector = function(selectCallback)
{
    this.element = document.createElement("div");
    this.element.className = "timeline-overview-mode-selector";
    this._selectCallback = selectCallback;

    this._buttons = [];
    this.element.addEventListener("click", this._onClick.bind(this), false);
}

WebInspector.TimelineOverviewModeSelector.prototype = {
    addButton: function(tooltip, className, value)
    {
        var button = this._createButton(tooltip, className, value);
        this.element.appendChild(button);
        this._buttons.push(button);
        if (this._buttons.length === 1)
            this._select(button, true);
    },

    get value()
    {
        return this._value;
    },

    _createButton: function(tooltip, className, value)
    {
        var button = document.createElement("button");
        button.createChild("div", "glyph");
        button.createChild("div", "glyph shadow");
        button.className = className;
        button.title = tooltip;
        button.value = value;
        return button;
    },

    _select: function(button, selected)
    {
        if (selected) {
            button.addStyleClass("toggled");
            this._value = button.value;
        } else
            button.removeStyleClass("toggled");
    },

    _onClick: function(event)
    {
        var button = event.target.enclosingNodeOrSelfWithNodeName("button");
        if (!button)
            return;
        for (var i = 0; i < this._buttons.length; ++i)
            this._select(this._buttons[i], this._buttons[i] === button);
        this._selectCallback(button.value);
    }
}
