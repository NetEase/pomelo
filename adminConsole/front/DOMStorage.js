/*
 * Copyright (C) 2008 Nokia Inc.  All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND ANY
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
 */
WebInspector.DOMStorage = function(id, domain, isLocalStorage)
{
    this._id = id;
    this._domain = domain;
    this._isLocalStorage = isLocalStorage;
}

WebInspector.DOMStorage.prototype = {
    /** @return {string} */
    get id()
    {
        return this._id;
    },

    /** @return {string} */
    get domain()
    {
        return this._domain;
    },

    /** @return {boolean} */
    get isLocalStorage()
    {
        return this._isLocalStorage;
    },

    /**
     * @param {function(?Protocol.Error, Array.<DOMStorageAgent.Entry>):void=} callback
     */
    getEntries: function(callback)
    {
        DOMStorageAgent.getDOMStorageEntries(this._id, callback);
    },

    /**
     * @param {string} key
     * @param {string} value
     * @param {function(?Protocol.Error, boolean):void=} callback
     */
    setItem: function(key, value, callback)
    {
        DOMStorageAgent.setDOMStorageItem(this._id, key, value, callback);
    },

    /**
     * @param {string} key
     * @param {function(?Protocol.Error, boolean):void=} callback
     */
    removeItem: function(key, callback)
    {
        DOMStorageAgent.removeDOMStorageItem(this._id, key, callback);
    }
}

/**
 * @constructor
 * @implements {DOMStorageAgent.Dispatcher}
 */
WebInspector.DOMStorageDispatcher = function()
{
}

WebInspector.DOMStorageDispatcher.prototype = {

    /**
     * @param {DOMStorageAgent.Entry} payload
     */
    addDOMStorage: function(payload)
    {
        var domStorage = new WebInspector.DOMStorage(
            payload.id,
            payload.host,
            payload.isLocalStorage);
        WebInspector.panels.resources.addDOMStorage(domStorage);
    },

    /**
     * @param {number} storageId
     */
    updateDOMStorage: function(storageId)
    {
        WebInspector.panels.resources.updateDOMStorage(storageId);
    }
}
