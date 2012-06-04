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
 */
WebInspector.TimelinePresentationModel = function()
{
    this._categories = {};
    this._addCategory(new WebInspector.TimelineCategory("loading", WebInspector.UIString("Loading"), "rgb(47,102,236)"));
    this._addCategory(new WebInspector.TimelineCategory("scripting", WebInspector.UIString("Scripting"), "rgb(157,231,119)"));
    this._addCategory(new WebInspector.TimelineCategory("rendering", WebInspector.UIString("Rendering"), "rgb(164,60,255)"));
    this._linkifier = WebInspector.debuggerPresentationModel.createLinkifier();
    this._glueRecords = false;
    this._filters = [];
    this.reset();
}

WebInspector.TimelinePresentationModel.shortRecordThreshold = 0.015;

WebInspector.TimelinePresentationModel.prototype = {
    /**
     * @param {WebInspector.TimelinePresentationModel.Filter} filter
     */
    addFilter: function(filter)
    {
        this._filters.push(filter);
    },

    rootRecord: function()
    {
        return this._rootRecord;
    },

    reset: function()
    {
        this._linkifier.reset();
        this._rootRecord = new WebInspector.TimelinePresentationModel.Record(this, { type: WebInspector.TimelineModel.RecordType.Root }, null, null);
        this._sendRequestRecords = {};
        this._scheduledResourceRequests = {};
        this._timerRecords = {};
        this._requestAnimationFrameRecords = {};
        this._minimumRecordTime = -1;
        this._maximumRecordTime = -1;
    },

    minimumRecordTime: function()
    {
        return this._minimumRecordTime;
    },

    maximumRecordTime: function()
    {
        return this._maximumRecordTime;
    },

    addRecord: function(record, parentRecord)
    {
        var connectedToOldRecord = false;
        var recordTypes = WebInspector.TimelineModel.RecordType;

        if (record.type === recordTypes.MarkDOMContent || record.type === recordTypes.MarkLoad)
            parentRecord = null; // No bar entry for load events.
        else {
            var newParentRecord = this._findParentRecord(record);
            if (newParentRecord) {
                parentRecord = newParentRecord;
                connectedToOldRecord = true;
            }
        }

        var children = record.children;
        var scriptDetails;
        if (record.data && record.data["scriptName"]) {
            scriptDetails = {
                scriptName: record.data["scriptName"],
                scriptLine: record.data["scriptLine"]
            }
        };

        if ((record.type === recordTypes.TimerFire || record.type === recordTypes.FireAnimationFrame) && children && children.length) {
            var childRecord = children[0];
            if (childRecord.type === recordTypes.FunctionCall) {
                scriptDetails = {
                    scriptName: childRecord.data["scriptName"],
                    scriptLine: childRecord.data["scriptLine"]
                };
                children = childRecord.children.concat(children.slice(1));
            }
        }

        var formattedRecord = new WebInspector.TimelinePresentationModel.Record(this, record, parentRecord, scriptDetails);
        this._updateBoundaries(formattedRecord);    

        if (record.type === recordTypes.MarkDOMContent || record.type === recordTypes.MarkLoad)
            return formattedRecord;

        formattedRecord.collapsed = (parentRecord === this._rootRecord);

        var childrenCount = children ? children.length : 0;
        for (var i = 0; i < childrenCount; ++i)
            this.addRecord(children[i], formattedRecord);

        formattedRecord.calculateAggregatedStats(this._categories);

        if (connectedToOldRecord) {
            record = formattedRecord;
            do {
                var parent = record.parent;
                if (parent.lastChildEndTime < record.lastChildEndTime)
                    parent.lastChildEndTime = record.lastChildEndTime;
                for (var category in formattedRecord.aggregatedStats)
                    parent.aggregatedStats[category] += formattedRecord.aggregatedStats[category];
                record = parent;
            } while (record.parent);
        } else {
            if (parentRecord !== this._rootRecord)
                parentRecord.selfTime -= formattedRecord.endTime - formattedRecord.startTime;
        }
        return formattedRecord;
    },

    _updateBoundaries: function(formattedRecord)
    {
        if (this._minimumRecordTime === -1 || formattedRecord.startTime < this._minimumRecordTime)
            this._minimumRecordTime = formattedRecord.startTime;
        if (this._maximumRecordTime === -1 || formattedRecord.endTime > this._maximumRecordTime)
            this._maximumRecordTime = formattedRecord.endTime;
    },

    _findParentRecord: function(record)
    {
        if (!this._glueRecords)
            return null;
        var recordTypes = WebInspector.TimelineModel.RecordType;
        var parentRecord;
        if (record.type === recordTypes.ResourceReceiveResponse ||
            record.type === recordTypes.ResourceFinish ||
            record.type === recordTypes.ResourceReceivedData)
            parentRecord = this._sendRequestRecords[record.data["requestId"]];
        else if (record.type === recordTypes.TimerFire)
            parentRecord = this._timerRecords[record.data["timerId"]];
        else if (record.type === recordTypes.ResourceSendRequest)
            parentRecord = this._scheduledResourceRequests[record.data["url"]];
        else if (record.type === recordTypes.FireAnimationFrame)
            parentRecord = this._requestAnimationFrameRecords[record.data["id"]];
        return parentRecord;
    },

    setGlueRecords: function(glue)
    {
        this._glueRecords = glue;
    },

    get categories()
    {
        return this._categories;
    },

    /**
     * @param {WebInspector.TimelineCategory} category
     */
    _addCategory: function(category)
    {
        this._categories[category.name] = category;
    },

    get _recordStyles()
    {
        if (!this._recordStylesArray) {
            var recordTypes = WebInspector.TimelineModel.RecordType;
            var categories = this._categories;

            var recordStyles = {};
            recordStyles[recordTypes.Root] = { title: "#root", category: categories["loading"] };
            recordStyles[recordTypes.EventDispatch] = { title: WebInspector.UIString("Event"), category: categories["scripting"] };
            recordStyles[recordTypes.Layout] = { title: WebInspector.UIString("Layout"), category: categories["rendering"] };
            recordStyles[recordTypes.RecalculateStyles] = { title: WebInspector.UIString("Recalculate Style"), category: categories["rendering"] };
            recordStyles[recordTypes.Paint] = { title: WebInspector.UIString("Paint"), category: categories["rendering"] };
            recordStyles[recordTypes.BeginFrame] = { title: WebInspector.UIString("Frame Start"), category: categories["rendering"] };
            recordStyles[recordTypes.ParseHTML] = { title: WebInspector.UIString("Parse"), category: categories["loading"] };
            recordStyles[recordTypes.TimerInstall] = { title: WebInspector.UIString("Install Timer"), category: categories["scripting"] };
            recordStyles[recordTypes.TimerRemove] = { title: WebInspector.UIString("Remove Timer"), category: categories["scripting"] };
            recordStyles[recordTypes.TimerFire] = { title: WebInspector.UIString("Timer Fired"), category: categories["scripting"] };
            recordStyles[recordTypes.XHRReadyStateChange] = { title: WebInspector.UIString("XHR Ready State Change"), category: categories["scripting"] };
            recordStyles[recordTypes.XHRLoad] = { title: WebInspector.UIString("XHR Load"), category: categories["scripting"] };
            recordStyles[recordTypes.EvaluateScript] = { title: WebInspector.UIString("Evaluate Script"), category: categories["scripting"] };
            recordStyles[recordTypes.TimeStamp] = { title: WebInspector.UIString("Stamp"), category: categories["scripting"] };
            recordStyles[recordTypes.ResourceSendRequest] = { title: WebInspector.UIString("Send Request"), category: categories["loading"] };
            recordStyles[recordTypes.ResourceReceiveResponse] = { title: WebInspector.UIString("Receive Response"), category: categories["loading"] };
            recordStyles[recordTypes.ResourceFinish] = { title: WebInspector.UIString("Finish Loading"), category: categories["loading"] };
            recordStyles[recordTypes.FunctionCall] = { title: WebInspector.UIString("Function Call"), category: categories["scripting"] };
            recordStyles[recordTypes.ResourceReceivedData] = { title: WebInspector.UIString("Receive Data"), category: categories["loading"] };
            recordStyles[recordTypes.GCEvent] = { title: WebInspector.UIString("GC Event"), category: categories["scripting"] };
            recordStyles[recordTypes.MarkDOMContent] = { title: WebInspector.UIString("DOMContent event"), category: categories["scripting"] };
            recordStyles[recordTypes.MarkLoad] = { title: WebInspector.UIString("Load event"), category: categories["scripting"] };
            recordStyles[recordTypes.ScheduleResourceRequest] = { title: WebInspector.UIString("Schedule Request"), category: categories["loading"] };
            recordStyles[recordTypes.RequestAnimationFrame] = { title: WebInspector.UIString("Request Animation Frame"), category: categories["scripting"] };
            recordStyles[recordTypes.CancelAnimationFrame] = { title: WebInspector.UIString("Cancel Animation Frame"), category: categories["scripting"] };
            recordStyles[recordTypes.FireAnimationFrame] = { title: WebInspector.UIString("Animation Frame Fired"), category: categories["scripting"] };
            this._recordStylesArray = recordStyles;
        }
        return this._recordStylesArray;
    },

    filteredRecords: function()
    {
        function filter(record)
        {
            for (var i = 0; i < this._filters.length; ++i) {
                if (!this._filters[i].accept(record))
                    return false;
            }
            return true;
        }
        return this._filterRecords(filter.bind(this));
    },

    _filterRecords: function(filter)
    {
        var recordsInWindow = [];

        var stack = [{children: this._rootRecord.children, index: 0, parentIsCollapsed: false}];
        while (stack.length) {
            var entry = stack[stack.length - 1];
            var records = entry.children;
            if (records && entry.index < records.length) {
                 var record = records[entry.index];
                 ++entry.index;

                 if (filter(record)) {
                     ++record.parent._invisibleChildrenCount;
                     if (!entry.parentIsCollapsed)
                         recordsInWindow.push(record);
                 }

                 record._invisibleChildrenCount = 0;

                 stack.push({children: record.children,
                             index: 0,
                             parentIsCollapsed: (entry.parentIsCollapsed || record.collapsed),
                             parentRecord: record,
                             windowLengthBeforeChildrenTraversal: recordsInWindow.length});
            } else {
                stack.pop();
                if (entry.parentRecord)
                    entry.parentRecord._visibleChildrenCount = recordsInWindow.length - entry.windowLengthBeforeChildrenTraversal;
            }
        }

        return recordsInWindow;
    }
}

WebInspector.TimelinePresentationModel.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 */
WebInspector.TimelinePresentationModel.Record = function(presentationModel, record, parentRecord, scriptDetails)
{
    this._presentationModel = presentationModel;
    this._linkifier = this._presentationModel._linkifier;
    this._aggregatedStats = [];
    var recordTypes = WebInspector.TimelineModel.RecordType;
    var style = presentationModel._recordStyles[record.type];
    this.parent = parentRecord;
    if (parentRecord)
        parentRecord.children.push(this);
    this.category = style.category;
    this.title = style.title;
    this.startTime = record.startTime / 1000;
    this.data = record.data;
    this.type = record.type;
    this.endTime = (typeof record.endTime !== "undefined") ? record.endTime / 1000 : this.startTime;
    this._selfTime = this.endTime - this.startTime;
    this._lastChildEndTime = this.endTime;
    this._initiatorOffset = (parentRecord && parentRecord !== presentationModel._rootRecord) ?
        parentRecord._initiatorOffset + this.startTime - parentRecord.startTime : 0;

    if (record.stackTrace && record.stackTrace.length)
        this.stackTrace = record.stackTrace;
    this.totalHeapSize = record.totalHeapSize;
    this.usedHeapSize = record.usedHeapSize;
    if (record.data && record.data["url"])
        this.url = record.data["url"];
    if (scriptDetails) {
        this.scriptName = scriptDetails.scriptName;
        this.scriptLine = scriptDetails.scriptLine;
    }
    // Make resource receive record last since request was sent; make finish record last since response received.
    if (record.type === recordTypes.ResourceSendRequest) {
        presentationModel._sendRequestRecords[record.data["requestId"]] = this;
    } else if (record.type === recordTypes.ScheduleResourceRequest) {
        presentationModel._scheduledResourceRequests[record.data["url"]] = this;
    } else if (record.type === recordTypes.ResourceReceiveResponse) {
        var sendRequestRecord = presentationModel._sendRequestRecords[record.data["requestId"]];
        if (sendRequestRecord) { // False if we started instrumentation in the middle of request.
            this.url = sendRequestRecord.url;
            // Now that we have resource in the collection, recalculate details in order to display short url.
            sendRequestRecord._refreshDetails();
            if (sendRequestRecord.parent !== presentationModel._rootRecord && sendRequestRecord.parent.type === recordTypes.ScheduleResourceRequest)
                sendRequestRecord.parent._refreshDetails();
        }
    } else if (record.type === recordTypes.ResourceReceivedData || record.type === recordTypes.ResourceFinish) {
        var sendRequestRecord = presentationModel._sendRequestRecords[record.data["requestId"]];
        if (sendRequestRecord) // False for main resource.
            this.url = sendRequestRecord.url;
    } else if (record.type === recordTypes.TimerInstall) {
        this.timeout = record.data["timeout"];
        this.singleShot = record.data["singleShot"];
        presentationModel._timerRecords[record.data["timerId"]] = this;
    } else if (record.type === recordTypes.TimerFire) {
        var timerInstalledRecord = presentationModel._timerRecords[record.data["timerId"]];
        if (timerInstalledRecord) {
            this.callSiteStackTrace = timerInstalledRecord.stackTrace;
            this.timeout = timerInstalledRecord.timeout;
            this.singleShot = timerInstalledRecord.singleShot;
        }
    } else if (record.type === recordTypes.RequestAnimationFrame) {
        presentationModel._requestAnimationFrameRecords[record.data["id"]] = this;
    } else if (record.type === recordTypes.FireAnimationFrame) {
        var requestAnimationRecord = presentationModel._requestAnimationFrameRecords[record.data["id"]];
        if (requestAnimationRecord)
            this.callSiteStackTrace = requestAnimationRecord.stackTrace;
    }
    this._refreshDetails();
}

WebInspector.TimelinePresentationModel.Record.prototype = {
    get lastChildEndTime()
    {
        return this._lastChildEndTime;
    },

    set lastChildEndTime(time)
    {
        this._lastChildEndTime = time;
    },

    get selfTime()
    {
        return this._selfTime;
    },

    set selfTime(time)
    {
        this._selfTime = time;
    },

    get cpuTime()
    {
        return this._cpuTime;
    },

    isLong: function()
    {
        return (this._lastChildEndTime - this.startTime) > WebInspector.TimelinePresentationModel.shortRecordThreshold;
    },

    get children()
    {
        if (!this._children)
            this._children = [];
        return this._children;
    },

    get visibleChildrenCount()
    {
        return this._visibleChildrenCount || 0;
    },

    get invisibleChildrenCount()
    {
        return this._invisibleChildrenCount || 0;
    },

    containsTime: function(time)
    {
        return this.startTime <= time && time <= this.endTime;
    },

    _generateAggregatedInfo: function()
    {
        var cell = document.createElement("span");
        cell.className = "timeline-aggregated-info";
        for (var index in this._aggregatedStats) {
            var label = document.createElement("div");
            label.className = "timeline-aggregated-category timeline-" + index;
            cell.appendChild(label);
            var text = document.createElement("span");
            text.textContent = Number.secondsToString(this._aggregatedStats[index], true);
            cell.appendChild(text);
        }
        return cell;
    },

    generatePopupContent: function(calculator)
    {
        var contentHelper = new WebInspector.TimelinePresentationModel.PopupContentHelper(this.title);

        if (this._children && this._children.length) {
            contentHelper._appendTextRow(WebInspector.UIString("Self Time"), Number.secondsToString(this._selfTime, true));
            contentHelper._appendElementRow(WebInspector.UIString("Aggregated Time"), this._generateAggregatedInfo());
        }
        var text = WebInspector.UIString("%s (at %s)", Number.secondsToString(this._lastChildEndTime - this.startTime, true),
            Number.secondsToString(this.startTime - this._presentationModel.minimumRecordTime()));
        contentHelper._appendTextRow(WebInspector.UIString("Duration"), text);

        const recordTypes = WebInspector.TimelineModel.RecordType;

        switch (this.type) {
            case recordTypes.GCEvent:
                contentHelper._appendTextRow(WebInspector.UIString("Collected"), Number.bytesToString(this.data["usedHeapSizeDelta"]));
                break;
            case recordTypes.TimerInstall:
            case recordTypes.TimerFire:
            case recordTypes.TimerRemove:
                contentHelper._appendTextRow(WebInspector.UIString("Timer ID"), this.data["timerId"]);
                if (typeof this.timeout === "number") {
                    contentHelper._appendTextRow(WebInspector.UIString("Timeout"), Number.secondsToString(this.timeout / 1000));
                    contentHelper._appendTextRow(WebInspector.UIString("Repeats"), !this.singleShot);
                }
                break;
            case recordTypes.FireAnimationFrame:
                contentHelper._appendTextRow(WebInspector.UIString("Callback ID"), this.data["id"]);
                break;
            case recordTypes.FunctionCall:
                contentHelper._appendElementRow(WebInspector.UIString("Location"), this._linkifyScriptLocation());
                break;
            case recordTypes.ScheduleResourceRequest:
            case recordTypes.ResourceSendRequest:
            case recordTypes.ResourceReceiveResponse:
            case recordTypes.ResourceReceivedData:
            case recordTypes.ResourceFinish:
                contentHelper._appendElementRow(WebInspector.UIString("Resource"), this._linkifyLocation(this.url));
                if (this.data["requestMethod"])
                    contentHelper._appendTextRow(WebInspector.UIString("Request Method"), this.data["requestMethod"]);
                if (typeof this.data["statusCode"] === "number")
                    contentHelper._appendTextRow(WebInspector.UIString("Status Code"), this.data["statusCode"]);
                if (this.data["mimeType"])
                    contentHelper._appendTextRow(WebInspector.UIString("MIME Type"), this.data["mimeType"]);
                break;
            case recordTypes.EvaluateScript:
                if (this.data && this.url)
                    contentHelper._appendElementRow(WebInspector.UIString("Script"), this._linkifyLocation(this.url, this.data["lineNumber"]));
                break;
            case recordTypes.Paint:
                contentHelper._appendTextRow(WebInspector.UIString("Location"), WebInspector.UIString("(%d, %d)", this.data["x"], this.data["y"]));
                contentHelper._appendTextRow(WebInspector.UIString("Dimensions"), WebInspector.UIString("%d × %d", this.data["width"], this.data["height"]));
            case recordTypes.RecalculateStyles: // We don't want to see default details.
                break;
            default:
                if (this.details)
                    contentHelper._appendTextRow(WebInspector.UIString("Details"), this.details);
                break;
        }

        if (this.scriptName && this.type !== recordTypes.FunctionCall)
            contentHelper._appendElementRow(WebInspector.UIString("Function Call"), this._linkifyScriptLocation());

        if (this.usedHeapSize)
            contentHelper._appendTextRow(WebInspector.UIString("Used Heap Size"), WebInspector.UIString("%s of %s", Number.bytesToString(this.usedHeapSize), Number.bytesToString(this.totalHeapSize)));

        if (this.callSiteStackTrace && this.callSiteStackTrace.length)
            contentHelper._appendStackTrace(WebInspector.UIString("Call Site stack"), this.callSiteStackTrace, this._linkifyCallFrame.bind(this));

        if (this.stackTrace)
            contentHelper._appendStackTrace(WebInspector.UIString("Call Stack"), this.stackTrace, this._linkifyCallFrame.bind(this));

        return contentHelper._contentTable;
    },

    _refreshDetails: function()
    {
        this.details = this._getRecordDetails();
    },

    _getRecordDetails: function()
    {
        switch (this.type) {
            case WebInspector.TimelineModel.RecordType.GCEvent:
                return WebInspector.UIString("%s collected", Number.bytesToString(this.data["usedHeapSizeDelta"]));
            case WebInspector.TimelineModel.RecordType.TimerFire:
                return this._linkifyScriptLocation(this.data["timerId"]);
            case WebInspector.TimelineModel.RecordType.FunctionCall:
                return this._linkifyScriptLocation();
            case WebInspector.TimelineModel.RecordType.FireAnimationFrame:
                return this._linkifyScriptLocation(this.data["id"]);
            case WebInspector.TimelineModel.RecordType.EventDispatch:
                return this.data ? this.data["type"] : null;
            case WebInspector.TimelineModel.RecordType.Paint:
                return this.data["width"] + "\u2009\u00d7\u2009" + this.data["height"];
            case WebInspector.TimelineModel.RecordType.TimerInstall:
            case WebInspector.TimelineModel.RecordType.TimerRemove:
                return this._linkifyTopCallFrame(this.data["timerId"]);
            case WebInspector.TimelineModel.RecordType.RequestAnimationFrame:
            case WebInspector.TimelineModel.RecordType.CancelAnimationFrame:
                return this._linkifyTopCallFrame(this.data["id"]);
            case WebInspector.TimelineModel.RecordType.ParseHTML:
            case WebInspector.TimelineModel.RecordType.RecalculateStyles:
                return this._linkifyTopCallFrame();
            case WebInspector.TimelineModel.RecordType.EvaluateScript:
                return this.url ? this._linkifyLocation(this.url, this.data["lineNumber"], 0) : null;
            case WebInspector.TimelineModel.RecordType.XHRReadyStateChange:
            case WebInspector.TimelineModel.RecordType.XHRLoad:
            case WebInspector.TimelineModel.RecordType.ScheduleResourceRequest:
            case WebInspector.TimelineModel.RecordType.ResourceSendRequest:
            case WebInspector.TimelineModel.RecordType.ResourceReceivedData:
            case WebInspector.TimelineModel.RecordType.ResourceReceiveResponse:
            case WebInspector.TimelineModel.RecordType.ResourceFinish:
                return WebInspector.displayNameForURL(this.url);
            case WebInspector.TimelineModel.RecordType.TimeStamp:
                return this.data["message"];
            default:
                return null;
        }
    },

    /**
     * @param {string} url
     * @param {number=} lineNumber
     * @param {number=} columnNumber
     */
    _linkifyLocation: function(url, lineNumber, columnNumber)
    {
        // FIXME(62725): stack trace line/column numbers are one-based.
        lineNumber = lineNumber ? lineNumber - 1 : lineNumber;
        columnNumber = columnNumber ? columnNumber - 1 : 0;
        return this._linkifier.linkifyLocation(url, lineNumber, columnNumber, "timeline-details");
    },

    _linkifyCallFrame: function(callFrame)
    {
        return this._linkifyLocation(callFrame.url, callFrame.lineNumber, callFrame.columnNumber);
    },

    /**
     * @param {string=} defaultValue
     */
    _linkifyTopCallFrame: function(defaultValue)
    {
        return this.stackTrace ? this._linkifyCallFrame(this.stackTrace[0]) : defaultValue;
    },

    /**
     * @param {string=} defaultValue
     */
    _linkifyScriptLocation: function(defaultValue)
    {
        return this.scriptName ? this._linkifyLocation(this.scriptName, this.scriptLine, 0) : defaultValue;
    },

    calculateAggregatedStats: function(categories)
    {
        this._aggregatedStats = {};
        for (var category in categories)
            this._aggregatedStats[category] = 0;
        this._cpuTime = this._selfTime;

        if (this._children) {
            for (var index = this._children.length; index; --index) {
                var child = this._children[index - 1];
                for (var category in categories)
                    this._aggregatedStats[category] += child._aggregatedStats[category];
            }
            for (var category in this._aggregatedStats)
                this._cpuTime += this._aggregatedStats[category];
        }
        this._aggregatedStats[this.category.name] += this._selfTime;
    },

    get aggregatedStats()
    {
        return this._aggregatedStats;
    }
}

/**
 * @constructor
 */
WebInspector.TimelinePresentationModel.PopupContentHelper = function(title)
{
    this._contentTable = document.createElement("table");
    var titleCell = this._createCell(WebInspector.UIString("%s - Details", title), "timeline-details-title");
    titleCell.colSpan = 2;
    var titleRow = document.createElement("tr");
    titleRow.appendChild(titleCell);
    this._contentTable.appendChild(titleRow);
}

WebInspector.TimelinePresentationModel.PopupContentHelper.prototype = {
    /**
     * @param {string=} styleName
     */
    _createCell: function(content, styleName)
    {
        var text = document.createElement("label");
        text.appendChild(document.createTextNode(content));
        var cell = document.createElement("td");
        cell.className = "timeline-details";
        if (styleName)
            cell.className += " " + styleName;
        cell.textContent = content;
        return cell;
    },

    _appendTextRow: function(title, content)
    {
        var row = document.createElement("tr");
        row.appendChild(this._createCell(title, "timeline-details-row-title"));
        row.appendChild(this._createCell(content, "timeline-details-row-data"));
        this._contentTable.appendChild(row);
    },

    /**
     * @param {string=} titleStyle
     */
    _appendElementRow: function(title, content, titleStyle)
    {
        var row = document.createElement("tr");
        var titleCell = this._createCell(title, "timeline-details-row-title");
        if (titleStyle)
            titleCell.addStyleClass(titleStyle);
        row.appendChild(titleCell);
        var cell = document.createElement("td");
        cell.className = "timeline-details";
        cell.appendChild(content);
        row.appendChild(cell);
        this._contentTable.appendChild(row);
    },

    _appendStackTrace: function(title, stackTrace, callFrameLinkifier)
    {
        this._appendTextRow("", "");
        var framesTable = document.createElement("table");
        for (var i = 0; i < stackTrace.length; ++i) {
            var stackFrame = stackTrace[i];
            var row = document.createElement("tr");
            row.className = "timeline-details";
            row.appendChild(this._createCell(stackFrame.functionName ? stackFrame.functionName : WebInspector.UIString("(anonymous function)"), "timeline-function-name"));
            row.appendChild(this._createCell(" @ "));
            var linkCell = document.createElement("td");
            var urlElement = callFrameLinkifier(stackFrame);
            linkCell.appendChild(urlElement);
            row.appendChild(linkCell);
            framesTable.appendChild(row);
        }
        this._appendElementRow(title, framesTable, "timeline-stacktrace-title");
    }
}

/**
 * @interface
 */
WebInspector.TimelinePresentationModel.Filter = function()
{
}

WebInspector.TimelinePresentationModel.Filter.prototype = {
    /**
     * @param {WebInspector.TimelinePresentationModel.Record} record
     */
    accept: function(record) { return false; }
}

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.TimelineCategory = function(name, title, color)
{
    this.name = name;
    this.title = title;
    this.color = color;
    this.hidden = false;
}

WebInspector.TimelineCategory.Events = {
    VisibilityChanged: "VisibilityChanged"
};

WebInspector.TimelineCategory.prototype = {
    /**
     * @type {boolean}
     */
    get hidden()
    {
        return this._hidden;
    },

    set hidden(hidden)
    {
        this._hidden = hidden;
        this.dispatchEventToListeners(WebInspector.TimelineCategory.Events.VisibilityChanged, this);
    }
}

WebInspector.TimelineCategory.prototype.__proto__ = WebInspector.Object.prototype;
