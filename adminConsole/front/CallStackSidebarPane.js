/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 */
WebInspector.CallStackSidebarPane = function(model)
{
    WebInspector.SidebarPane.call(this, WebInspector.UIString("Call Stack"));
    this._model = model;

    this.bodyElement.addEventListener("contextmenu", this._contextMenu.bind(this), true);
}

WebInspector.CallStackSidebarPane.prototype = {
    update: function(callFrames)
    {
        this.bodyElement.removeChildren();

        if (this.placards) {
            for (var i = 0; i < this.placards.length; ++i)
                this.placards[i].discard();
        }
        this.placards = [];

        if (!callFrames) {
            var infoElement = document.createElement("div");
            infoElement.className = "info";
            infoElement.textContent = WebInspector.UIString("Not Paused");
            this.bodyElement.appendChild(infoElement);
            return;
        }

        for (var i = 0; i < callFrames.length; ++i) {
            var callFrame = callFrames[i];
            var placard = this._model.createPlacard(callFrame);
            placard.callFrame = callFrame;
            placard.element.addEventListener("click", this._placardSelected.bind(this, placard), false);
            this.placards.push(placard);
            this.bodyElement.appendChild(placard.element);
        }
    },

    set selectedCallFrame(x)
    {
        for (var i = 0; i < this.placards.length; ++i) {
            var placard = this.placards[i];
            placard.selected = (placard.callFrame === x);
        }
    },

    _selectNextCallFrameOnStack: function()
    {
        var index = this._selectedCallFrameIndex();
        if (index == -1)
            return;
        this._selectedPlacardByIndex(index + 1);
    },

    _selectPreviousCallFrameOnStack: function()
    {
        var index = this._selectedCallFrameIndex();
        if (index == -1)
            return;
        this._selectedPlacardByIndex(index - 1);
    },

    _selectedPlacardByIndex: function(index)
    {
        if (index < 0 || index >= this.placards.length)
            return;
        this._placardSelected(this.placards[index])
    },

    _selectedCallFrameIndex: function()
    {
        if (!this._model.selectedCallFrame)
            return -1;
        for (var i = 0; i < this.placards.length; ++i) {
            var placard = this.placards[i];
            if (placard.callFrame === this._model.selectedCallFrame)
                return i;
        }
        return -1;
    },

    _placardSelected: function(placard)
    {
        this._model.selectedCallFrame = placard.callFrame;
    },

    _contextMenu: function(event)
    {
        if (!this.placards.length)
            return;

        var contextMenu = new WebInspector.ContextMenu();
        contextMenu.appendItem(WebInspector.UIString("Copy Stack Trace"), this._copyStackTrace.bind(this));
        contextMenu.show(event);
    },

    _copyStackTrace: function()
    {
        var text = "";
        for (var i = 0; i < this.placards.length; ++i)
            text += this.placards[i].title + " (" + this.placards[i].subtitle + ")\n";
        InspectorFrontendHost.copyText(text);
    },

    registerShortcuts: function(section, registerShortcutDelegate)
    {
        var nextCallFrame = WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.Period,
            WebInspector.KeyboardShortcut.Modifiers.Ctrl);
        registerShortcutDelegate(nextCallFrame.key, this._selectNextCallFrameOnStack.bind(this));

        var prevCallFrame = WebInspector.KeyboardShortcut.makeDescriptor(WebInspector.KeyboardShortcut.Keys.Comma,
            WebInspector.KeyboardShortcut.Modifiers.Ctrl);
        registerShortcutDelegate(prevCallFrame.key, this._selectPreviousCallFrameOnStack.bind(this));

        section.addRelatedKeys([ nextCallFrame.name, prevCallFrame.name ], WebInspector.UIString("Next/previous call frame"));
    },

    setStatus: function(status)
    {
        var statusMessageElement = document.createElement("div");
        statusMessageElement.className = "info";
        if (typeof status === "string")
            statusMessageElement.textContent = status;
        else
            statusMessageElement.appendChild(status);
        this.bodyElement.appendChild(statusMessageElement);
    }
}

WebInspector.CallStackSidebarPane.prototype.__proto__ = WebInspector.SidebarPane.prototype;
