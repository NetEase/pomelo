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
 * @extends {WebInspector.Object}
 */
WebInspector.ConsoleModel = function()
{
    this.messages = [];
    this.warnings = 0;
    this.errors = 0;
    this._interruptRepeatCount = false;
    InspectorBackend.registerConsoleDispatcher(new WebInspector.ConsoleDispatcher(this));
}

WebInspector.ConsoleModel.Events = {
    ConsoleCleared: "console-cleared",
    MessageAdded: "console-message-added",
    RepeatCountUpdated: "repeat-count-updated"
}

WebInspector.ConsoleModel.prototype = {
    enableAgent: function()
    {
        if (WebInspector.settings.monitoringXHREnabled.get())
            ConsoleAgent.setMonitoringXHREnabled(true);

        ConsoleAgent.enable();
    },

    /**
     * @param {WebInspector.ConsoleMessage} msg
     */
    addMessage: function(msg)
    {
        this.messages.push(msg);
        this._previousMessage = msg;
        this._incrementErrorWarningCount(msg);
        this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.MessageAdded, msg);
        this._interruptRepeatCount = false;
    },

    /**
     * @param {WebInspector.ConsoleMessage} msg
     */
    _incrementErrorWarningCount: function(msg)
    {
        switch (msg.level) {
            case WebInspector.ConsoleMessage.MessageLevel.Warning:
                this.warnings += msg.repeatDelta;
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Error:
                this.errors += msg.repeatDelta;
                break;
        }
    },

    requestClearMessages: function()
    {
        ConsoleAgent.clearMessages();
        this.clearMessages();
    },

    clearMessages: function()
    {
        this.messages = [];

        this.errors = 0;
        this.warnings = 0;

        this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.ConsoleCleared);
    },

    interruptRepeatCount: function()
    {
        this._interruptRepeatCount = true;
    },

    /**
     * @param {number} count
     */
    _messageRepeatCountUpdated: function(count)
    {
        var msg = this._previousMessage;
        if (!msg)
            return;

        var prevRepeatCount = msg.totalRepeatCount;

        if (!this._interruptRepeatCount) {
            msg.repeatDelta = count - prevRepeatCount;
            msg.repeatCount = msg.repeatCount + msg.repeatDelta;
            msg.totalRepeatCount = count;
            msg.updateRepeatCount();

            this._incrementErrorWarningCount(msg);
            this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.RepeatCountUpdated, msg);
        } else {
            var msgCopy = msg.clone();
            msgCopy.totalRepeatCount = count;
            msgCopy.repeatCount = (count - prevRepeatCount) || 1;
            msgCopy.repeatDelta = msgCopy.repeatCount;
            this.addMessage(msgCopy);
        }
    }
}

WebInspector.ConsoleModel.prototype.__proto__ = WebInspector.Object.prototype;

/**
 * @constructor
 * @param {string} source
 * @param {string} level
 * @param {string=} url
 * @param {number=} line
 * @param {number=} repeatCount
 */
WebInspector.ConsoleMessage = function(source, level, url, line, repeatCount)
{
    this.source = source;
    this.level = level;
    this.url = url || null;
    this.line = line || 0;

    repeatCount = repeatCount || 1;
    this.repeatCount = repeatCount;
    this.repeatDelta = repeatCount;
    this.totalRepeatCount = repeatCount;
}

WebInspector.ConsoleMessage.prototype = {
    /**
     * @return {boolean}
     */
    isErrorOrWarning: function()
    {
        return (this.level === WebInspector.ConsoleMessage.MessageLevel.Warning || this.level === WebInspector.ConsoleMessage.MessageLevel.Error);
    },

    updateRepeatCount: function()
    {
        // Implemented by concrete instances
    },

    /**
     * @return {WebInspector.ConsoleMessage}
     */
    clone: function()
    {
        // Implemented by concrete instances
    }
}

/**
 * @param {string} source
 * @param {string} level
 * @param {string} message
 * @param {string=} type
 * @param {string=} url
 * @param {number=} line
 * @param {number=} repeatCount
 * @param {Array.<RuntimeAgent.RemoteObject>=} parameters
 * @param {ConsoleAgent.StackTrace=} stackTrace
 * @param {WebInspector.Resource=} request
 *
 * @return {WebInspector.ConsoleMessage}
 */
WebInspector.ConsoleMessage.create = function(source, level, message, type, url, line, repeatCount, parameters, stackTrace, request)
{
}

// Note: Keep these constants in sync with the ones in Console.h
WebInspector.ConsoleMessage.MessageSource = {
    HTML: "html",
    XML: "xml",
    JS: "javascript",
    Network: "network",
    ConsoleAPI: "console-api",
    Other: "other"
}

WebInspector.ConsoleMessage.MessageType = {
    Log: "log",
    Dir: "dir",
    DirXML: "dirxml",
    Trace: "trace",
    StartGroup: "startGroup",
    StartGroupCollapsed: "startGroupCollapsed",
    EndGroup: "endGroup",
    Assert: "assert",
    Result: "result"
}

WebInspector.ConsoleMessage.MessageLevel = {
    Tip: "tip",
    Log: "log",
    Warning: "warning",
    Error: "error",
    Debug: "debug"
}


/**
 * @constructor
 * @implements {ConsoleAgent.Dispatcher}
 * @param {WebInspector.ConsoleModel} console
 */
WebInspector.ConsoleDispatcher = function(console)
{
    this._console = console;
}

WebInspector.ConsoleDispatcher.prototype = {
    /**
     * @param {ConsoleAgent.ConsoleMessage} payload
     */
    messageAdded: function(payload)
    {
        var consoleMessage = WebInspector.ConsoleMessage.create(
            payload.source,
            payload.level,
            payload.text,
            payload.type,
            payload.url,
            payload.line,
            payload.repeatCount,
            payload.parameters,
            payload.stackTrace,
            payload.networkRequestId ? WebInspector.networkResourceById(payload.networkRequestId) : undefined);
        this._console.addMessage(consoleMessage);
    },

    /**
     * @param {number} count
     */
    messageRepeatCountUpdated: function(count)
    {
        this._console._messageRepeatCountUpdated(count);
    },

    messagesCleared: function()
    {
        if (!WebInspector.settings.preserveConsoleLog.get())
            this._console.clearMessages();
    }
}

/**
 * @type {?WebInspector.ConsoleModel}
 */
WebInspector.console = null;
