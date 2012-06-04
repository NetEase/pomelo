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
WebInspector.TimelineModel = function()
{
    this._records = [];
    this._collectionEnabled = false;

    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineEventRecorded, this._onRecordAdded, this);
}

WebInspector.TimelineModel.RecordType = {
    Root: "Root",
    EventDispatch: "EventDispatch",

    BeginFrame: "BeginFrame",
    Layout: "Layout",
    RecalculateStyles: "RecalculateStyles",
    Paint: "Paint",

    ParseHTML: "ParseHTML",

    TimerInstall: "TimerInstall",
    TimerRemove: "TimerRemove",
    TimerFire: "TimerFire",

    XHRReadyStateChange: "XHRReadyStateChange",
    XHRLoad: "XHRLoad",
    EvaluateScript: "EvaluateScript",

    TimeStamp: "TimeStamp",

    MarkLoad: "MarkLoad",
    MarkDOMContent: "MarkDOMContent",

    ScheduleResourceRequest: "ScheduleResourceRequest",
    ResourceSendRequest: "ResourceSendRequest",
    ResourceReceiveResponse: "ResourceReceiveResponse",
    ResourceReceivedData: "ResourceReceivedData",
    ResourceFinish: "ResourceFinish",

    FunctionCall: "FunctionCall",
    GCEvent: "GCEvent",

    RequestAnimationFrame: "RequestAnimationFrame",
    CancelAnimationFrame: "CancelAnimationFrame",
    FireAnimationFrame: "FireAnimationFrame"
}

WebInspector.TimelineModel.Events = {
    RecordAdded: "RecordAdded",
    RecordsCleared: "RecordsCleared"
}

WebInspector.TimelineModel.prototype = {
    startRecord: function()
    {
        if (this._collectionEnabled)
            return;
        this.reset();
        WebInspector.timelineManager.start(30);
        this._collectionEnabled = true;
    },

    stopRecord: function()
    {
        if (!this._collectionEnabled)
            return;
        WebInspector.timelineManager.stop();
        this._collectionEnabled = false;
    },

    get records()
    {
        return this._records;
    },

    _onRecordAdded: function(event)
    {
        if (this._collectionEnabled)
            this._addRecord(event.data);
    },

    _addRecord: function(record)
    {
        this._records.push(record);
        this.dispatchEventToListeners(WebInspector.TimelineModel.Events.RecordAdded, record);
    },

    _loadNextChunk: function(data, index)
    {
        for (var i = 0; i < 20 && index < data.length; ++i, ++index)
            this._addRecord(data[index]);

        if (index !== data.length)
            setTimeout(this._loadNextChunk.bind(this, data, index), 0);
    },

    loadFromFile: function(file)
    {
        function onLoad(e)
        {
            var data = JSON.parse(e.target.result);
            this.reset();
            this._loadNextChunk(data, 1);
        }

        function onError(e)
        {
            switch(e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
                WebInspector.log(WebInspector.UIString('Timeline.loadFromFile: File "%s" not found.', file.name));
            break;
            case e.target.error.NOT_READABLE_ERR:
                WebInspector.log(WebInspector.UIString('Timeline.loadFromFile: File "%s" is not readable', file.name));
            break;
            case e.target.error.ABORT_ERR:
                break;
            default:
                WebInspector.log(WebInspector.UIString('Timeline.loadFromFile: An error occurred while reading the file "%s"', file.name));
            }
        }

        var reader = new FileReader();
        reader.onload = onLoad.bind(this);
        reader.onerror = onError;
        reader.readAsText(file);
    },

    saveToFile: function()
    {
        var records = ['[' + JSON.stringify(new String(window.navigator.appVersion))];
        for (var i = 0; i < this._records.length; ++i)
            records.push(JSON.stringify(this._records[i]));

        records[records.length - 1] = records[records.length - 1] + "]";

        var now = new Date();
        var suggestedFileName = "TimelineRawData-" + now.toISO8601Compact() + ".json";
        InspectorFrontendHost.saveAs(suggestedFileName, records.join(",\n"));
    },

    reset: function()
    {
        this._records = [];
        this.dispatchEventToListeners(WebInspector.TimelineModel.Events.RecordsCleared);
    }
}

WebInspector.TimelineModel.prototype.__proto__ = WebInspector.Object.prototype;
