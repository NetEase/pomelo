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
WebInspector.InspectorView = function()
{
    WebInspector.View.call(this);
    this.markAsRoot();
    this.element.id = "main-panels";
    this.element.setAttribute("spellcheck", false);
    this._history = [];
    this._historyIterator = -1;
    document.addEventListener("keydown", this._keyDown.bind(this), false);
    this._panelOrder = [];
}

WebInspector.InspectorView.Events = {
    PanelSelected: "panel-selected"
}

WebInspector.InspectorView.prototype = {
    addPanel: function(panel)
    {
        this._panelOrder.push(panel);
        WebInspector.toolbar.addPanel(panel);
    },

    currentPanel: function()
    {
        return this._currentPanel;
    },

    setCurrentPanel: function(x)
    {
        if (this._currentPanel === x)
            return;

        if (this._currentPanel)
            this._currentPanel.detach();

        this._currentPanel = x;

        if (x) {
            x.show();
            this.dispatchEventToListeners(WebInspector.InspectorView.Events.PanelSelected);
            // FIXME: remove search controller.
            WebInspector.searchController.activePanelChanged();
        }
        for (var panelName in WebInspector.panels) {
            if (WebInspector.panels[panelName] === x) {
                WebInspector.settings.lastActivePanel.set(panelName);
                this._pushToHistory(panelName);
                WebInspector.userMetrics.panelShown(panelName);
            }
        }
    },

    _keyDown: function(event)
    {
        switch (event.keyIdentifier) {
            // Windows and Mac have two different definitions of [, so accept both.
            case "U+005B":
            case "U+00DB": // [ key
                var isRotateLeft = WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && !event.shiftKey && !event.altKey;
                if (isRotateLeft) {
                    var index = this._panelOrder.indexOf(this.currentPanel());
                    index = (index === 0) ? this._panelOrder.length - 1 : index - 1;
                    this._panelOrder[index].toolbarItem.click();
                    event.consume();
                    return;
                }

                var isGoBack = WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && event.altKey;
                if (isGoBack && this._canGoBackInHistory()) {
                    this._goBackInHistory();
                    event.consume();
                }
                break;

            // Windows and Mac have two different definitions of ], so accept both.
            case "U+005D":
            case "U+00DD":  // ] key
                var isRotateRight = WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && !event.shiftKey && !event.altKey;
                if (isRotateRight) {
                    var index = this._panelOrder.indexOf(this.currentPanel());
                    index = (index + 1) % this._panelOrder.length;
                    this._panelOrder[index].toolbarItem.click();
                    event.consume();
                    return;
                }

                var isGoForward = WebInspector.KeyboardShortcut.eventHasCtrlOrMeta(event) && event.altKey;
                if (isGoForward && this._canGoForwardInHistory()) {
                    this._goForwardInHistory();
                    event.consume();
                }
                break;
        }
    },

    _canGoBackInHistory: function()
    {
        return this._historyIterator > 0;
    },

    _goBackInHistory: function()
    {
        this._inHistory = true;
        this.setCurrentPanel(WebInspector.panels[this._history[--this._historyIterator]]);
        delete this._inHistory;
    },

    _canGoForwardInHistory: function()
    {
        return this._historyIterator < this._history.length - 1;
    },

    _goForwardInHistory: function()
    {
        this._inHistory = true;
        this.setCurrentPanel(WebInspector.panels[this._history[++this._historyIterator]]);
        delete this._inHistory;
    },

    _pushToHistory: function(panelName)
    {
        if (this._inHistory)
            return;

        this._history.splice(this._historyIterator + 1, this._history.length - this._historyIterator - 1);
        if (!this._history.length || this._history[this._history.length - 1] !== panelName)
            this._history.push(panelName);
        this._historyIterator = this._history.length - 1;
    }
}

WebInspector.InspectorView.prototype.__proto__ = WebInspector.View.prototype;

/**
 * @type {WebInspector.InspectorView}
 */
WebInspector.inspectorView = null;
