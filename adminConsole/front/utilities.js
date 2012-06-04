/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
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
 *
 * Contains diff method based on Javascript Diff Algorithm By John Resig
 * http://ejohn.org/files/jsdiff.js (released under the MIT license).
 */

/**
 * @param {string=} direction
 */
Node.prototype.rangeOfWord = function(offset, stopCharacters, stayWithinNode, direction)
{
    var startNode;
    var startOffset = 0;
    var endNode;
    var endOffset = 0;

    if (!stayWithinNode)
        stayWithinNode = this;

    if (!direction || direction === "backward" || direction === "both") {
        var node = this;
        while (node) {
            if (node === stayWithinNode) {
                if (!startNode)
                    startNode = stayWithinNode;
                break;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                var start = (node === this ? (offset - 1) : (node.nodeValue.length - 1));
                for (var i = start; i >= 0; --i) {
                    if (stopCharacters.indexOf(node.nodeValue[i]) !== -1) {
                        startNode = node;
                        startOffset = i + 1;
                        break;
                    }
                }
            }

            if (startNode)
                break;

            node = node.traversePreviousNode(stayWithinNode);
        }

        if (!startNode) {
            startNode = stayWithinNode;
            startOffset = 0;
        }
    } else {
        startNode = this;
        startOffset = offset;
    }

    if (!direction || direction === "forward" || direction === "both") {
        node = this;
        while (node) {
            if (node === stayWithinNode) {
                if (!endNode)
                    endNode = stayWithinNode;
                break;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                var start = (node === this ? offset : 0);
                for (var i = start; i < node.nodeValue.length; ++i) {
                    if (stopCharacters.indexOf(node.nodeValue[i]) !== -1) {
                        endNode = node;
                        endOffset = i;
                        break;
                    }
                }
            }

            if (endNode)
                break;

            node = node.traverseNextNode(stayWithinNode);
        }

        if (!endNode) {
            endNode = stayWithinNode;
            endOffset = stayWithinNode.nodeType === Node.TEXT_NODE ? stayWithinNode.nodeValue.length : stayWithinNode.childNodes.length;
        }
    } else {
        endNode = this;
        endOffset = offset;
    }

    var result = this.ownerDocument.createRange();
    result.setStart(startNode, startOffset);
    result.setEnd(endNode, endOffset);

    return result;
}

Node.prototype.traverseNextTextNode = function(stayWithin)
{
    var node = this.traverseNextNode(stayWithin);
    if (!node)
        return;

    while (node && node.nodeType !== Node.TEXT_NODE)
        node = node.traverseNextNode(stayWithin);

    return node;
}

Node.prototype.rangeBoundaryForOffset = function(offset)
{
    var node = this.traverseNextTextNode(this);
    while (node && offset > node.nodeValue.length) {
        offset -= node.nodeValue.length;
        node = node.traverseNextTextNode(this);
    }
    if (!node)
        return { container: this, offset: 0 };
    return { container: node, offset: offset };
}

Element.prototype.removeStyleClass = function(className)
{
    this.classList.remove(className);
}

Element.prototype.removeMatchingStyleClasses = function(classNameRegex)
{
    var regex = new RegExp("(^|\\s+)" + classNameRegex + "($|\\s+)");
    if (regex.test(this.className))
        this.className = this.className.replace(regex, " ");
}

Element.prototype.addStyleClass = function(className)
{
    this.classList.add(className);
}

Element.prototype.hasStyleClass = function(className)
{
    return this.classList.contains(className);
}

Element.prototype.positionAt = function(x, y)
{
    this.style.left = x + "px";
    this.style.top = y + "px";
}

Element.prototype.pruneEmptyTextNodes = function()
{
    var sibling = this.firstChild;
    while (sibling) {
        var nextSibling = sibling.nextSibling;
        if (sibling.nodeType === this.TEXT_NODE && sibling.nodeValue === "")
            this.removeChild(sibling);
        sibling = nextSibling;
    }
}

Element.prototype.isScrolledToBottom = function()
{
    // This code works only for 0-width border
    return this.scrollTop + this.clientHeight === this.scrollHeight;
}

Node.prototype.enclosingNodeOrSelfWithNodeNameInArray = function(nameArray)
{
    for (var node = this; node && node !== this.ownerDocument; node = node.parentNode)
        for (var i = 0; i < nameArray.length; ++i)
            if (node.nodeName.toLowerCase() === nameArray[i].toLowerCase())
                return node;
    return null;
}

Node.prototype.enclosingNodeOrSelfWithNodeName = function(nodeName)
{
    return this.enclosingNodeOrSelfWithNodeNameInArray([nodeName]);
}

Node.prototype.enclosingNodeOrSelfWithClass = function(className)
{
    for (var node = this; node && node !== this.ownerDocument; node = node.parentNode)
        if (node.nodeType === Node.ELEMENT_NODE && node.hasStyleClass(className))
            return node;
    return null;
}

Node.prototype.enclosingNodeWithClass = function(className)
{
    if (!this.parentNode)
        return null;
    return this.parentNode.enclosingNodeOrSelfWithClass(className);
}

Element.prototype.query = function(query)
{
    return this.ownerDocument.evaluate(query, this, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

Element.prototype.removeChildren = function()
{
    if (this.firstChild)
        this.textContent = "";
}

Element.prototype.isInsertionCaretInside = function()
{
    var selection = window.getSelection();
    if (!selection.rangeCount || !selection.isCollapsed)
        return false;
    var selectionRange = selection.getRangeAt(0);
    return selectionRange.startContainer.isSelfOrDescendant(this);
}

/**
 * @param {string=} className
 */
Element.prototype.createChild = function(elementName, className)
{
    var element = this.ownerDocument.createElement(elementName);
    if (className)
        element.className = className;
    this.appendChild(element);
    return element;
}

DocumentFragment.prototype.createChild = Element.prototype.createChild;

/**
 * @return {number}
 */
Element.prototype.totalOffsetLeft = function()
{
    return this.totalOffset().left;
}

/**
 * @return {number}
 */
Element.prototype.totalOffsetTop = function()
{
    return this.totalOffset().top;

}

Element.prototype.totalOffset = function()
{
    var totalLeft = 0;
    var totalTop = 0;

    for (var element = this; element; element = element.offsetParent) {
        totalLeft += element.offsetLeft;
        totalTop += element.offsetTop;
        if (this !== element) {
            totalLeft += element.clientLeft - element.scrollLeft;
            totalTop += element.clientTop - element.scrollTop;
        }
    }

    return { left: totalLeft, top: totalTop };
}

Element.prototype.scrollOffset = function()
{
    var curLeft = 0;
    var curTop = 0;
    for (var element = this; element; element = element.scrollParent) {
        curLeft += element.scrollLeft;
        curTop += element.scrollTop;
    }
    return { left: curLeft, top: curTop };
}

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} width
 * @param {number=} height
 */
function AnchorBox(x, y, width, height)
{
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
}

/**
 * @param {Window} targetWindow
 * @return {AnchorBox}
 */
Element.prototype.offsetRelativeToWindow = function(targetWindow)
{
    var elementOffset = new AnchorBox();
    var curElement = this;
    var curWindow = this.ownerDocument.defaultView;
    while (curWindow && curElement) {
        elementOffset.x += curElement.totalOffsetLeft();
        elementOffset.y += curElement.totalOffsetTop();
        if (curWindow === targetWindow)
            break;

        curElement = curWindow.frameElement;
        curWindow = curWindow.parent;
    }

    return elementOffset;
}

/**
 * @param {Window} targetWindow
 * @return {AnchorBox}
 */
Element.prototype.boxInWindow = function(targetWindow)
{
    targetWindow = targetWindow || this.ownerDocument.defaultView;

    var anchorBox = this.offsetRelativeToWindow(window);
    anchorBox.width = Math.min(this.offsetWidth, window.innerWidth - anchorBox.x);
    anchorBox.height = Math.min(this.offsetHeight, window.innerHeight - anchorBox.y);

    return anchorBox;
}

/**
 * @param {string} text
 */
Element.prototype.setTextAndTitle = function(text)
{
    this.textContent = text;
    this.title = text;
}

KeyboardEvent.prototype.__defineGetter__("data", function()
{
    // Emulate "data" attribute from DOM 3 TextInput event.
    // See http://www.w3.org/TR/DOM-Level-3-Events/#events-Events-TextEvent-data
    switch (this.type) {
        case "keypress":
            if (!this.ctrlKey && !this.metaKey)
                return String.fromCharCode(this.charCode);
            else
                return "";
        case "keydown":
        case "keyup":
            if (!this.ctrlKey && !this.metaKey && !this.altKey)
                return String.fromCharCode(this.which);
            else
                return "";
    }
});

/**
 * @param {boolean=} preventDefault
 */
Event.prototype.consume = function(preventDefault)
{
    this.stopImmediatePropagation();
    if (preventDefault)
        this.preventDefault();
    this.handled = true;
}

Text.prototype.select = function(start, end)
{
    start = start || 0;
    end = end || this.textContent.length;

    if (start < 0)
        start = end + start;

    var selection = this.ownerDocument.defaultView.getSelection();
    selection.removeAllRanges();
    var range = this.ownerDocument.createRange();
    range.setStart(this, start);
    range.setEnd(this, end);
    selection.addRange(range);
    return this;
}

Element.prototype.selectionLeftOffset = function()
{
    // Calculate selection offset relative to the current element.

    var selection = window.getSelection();
    if (!selection.containsNode(this, true))
        return null;

    var leftOffset = selection.anchorOffset;
    var node = selection.anchorNode;

    while (node !== this) {
        while (node.previousSibling) {
            node = node.previousSibling;
            leftOffset += node.textContent.length;
        }
        node = node.parentNode;
    }

    return leftOffset;
}

String.prototype.hasSubstring = function(string, caseInsensitive)
{
    if (!caseInsensitive)
        return this.indexOf(string) !== -1;
    return this.match(new RegExp(string.escapeForRegExp(), "i"));
}

String.prototype.findAll = function(string)
{
    var matches = [];
    var i = this.indexOf(string);
    while (i !== -1) {
        matches.push(i);
        i = this.indexOf(string, i + string.length);
    }
    return matches;
}

String.prototype.lineEndings = function()
{
    if (!this._lineEndings) {
        this._lineEndings = this.findAll("\n");
        this._lineEndings.push(this.length);
    }
    return this._lineEndings;
}

String.prototype.asParsedURL = function()
{
    // RegExp groups:
    // 1 - scheme
    // 2 - hostname
    // 3 - ?port
    // 4 - ?path
    // 5 - ?fragment
    var match = this.match(/^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
    if (!match) {
        if (this == "about:blank") {
            return { scheme: "about",
                     host: "blank",
                     path: "/",
                     lastPathComponent: ""};
        }
        return null;
    }
    var result = {};
    result.scheme = match[1].toLowerCase();
    result.host = match[2];
    result.port = match[3];
    result.path = match[4] || "/";
    result.fragment = match[5];

    result.lastPathComponent = "";
    if (result.path) {
        // First cut the query params.
        var path = result.path;
        var indexOfQuery = path.indexOf("?");
        if (indexOfQuery !== -1)
            path = path.substring(0, indexOfQuery);

        // Then take last path component.
        var lastSlashIndex = path.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
            result.firstPathComponents = path.substring(0, lastSlashIndex + 1);
            result.lastPathComponent = path.substring(lastSlashIndex + 1);
        }
    } 
    return result;
}

String.prototype.escapeCharacters = function(chars)
{
    var foundChar = false;
    for (var i = 0; i < chars.length; ++i) {
        if (this.indexOf(chars.charAt(i)) !== -1) {
            foundChar = true;
            break;
        }
    }

    if (!foundChar)
        return this;

    var result = "";
    for (var i = 0; i < this.length; ++i) {
        if (chars.indexOf(this.charAt(i)) !== -1)
            result += "\\";
        result += this.charAt(i);
    }

    return result;
}

String.prototype.escapeForRegExp = function()
{
    return this.escapeCharacters("^[]{}()\\.$*+?|");
}

String.prototype.escapeHTML = function()
{
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); //" doublequotes just for editor
}

String.prototype.collapseWhitespace = function()
{
    return this.replace(/[\s\xA0]+/g, " ");
}

String.prototype.trimMiddle = function(maxLength)
{
    if (this.length <= maxLength)
        return this;
    var leftHalf = maxLength >> 1;
    var rightHalf = maxLength - leftHalf - 1;
    return this.substr(0, leftHalf) + "\u2026" + this.substr(this.length - rightHalf, rightHalf);
}

String.prototype.trimEnd = function(maxLength)
{
    if (this.length <= maxLength)
        return this;
    return this.substr(0, maxLength - 1) + "\u2026";
}

String.prototype.trimURL = function(baseURLDomain)
{
    var result = this.replace(/^(https|http|file):\/\//i, "");
    if (baseURLDomain)
        result = result.replace(new RegExp("^" + baseURLDomain.escapeForRegExp(), "i"), "");
    return result;
}

String.prototype.removeURLFragment = function()
{
    var fragmentIndex = this.indexOf("#");
    if (fragmentIndex == -1)
        fragmentIndex = this.length;
    return this.substring(0, fragmentIndex);
}

Node.prototype.isAncestor = function(node)
{
    if (!node)
        return false;

    var currentNode = node.parentNode;
    while (currentNode) {
        if (this === currentNode)
            return true;
        currentNode = currentNode.parentNode;
    }
    return false;
}

Node.prototype.isDescendant = function(descendant)
{
    return !!descendant && descendant.isAncestor(this);
}

Node.prototype.isSelfOrAncestor = function(node)
{
    return !!node && (node === this || this.isAncestor(node));
}

Node.prototype.isSelfOrDescendant = function(node)
{
    return !!node && (node === this || this.isDescendant(node));
}

Node.prototype.traverseNextNode = function(stayWithin)
{
    var node = this.firstChild;
    if (node)
        return node;

    if (stayWithin && this === stayWithin)
        return null;

    node = this.nextSibling;
    if (node)
        return node;

    node = this;
    while (node && !node.nextSibling && (!stayWithin || !node.parentNode || node.parentNode !== stayWithin))
        node = node.parentNode;
    if (!node)
        return null;

    return node.nextSibling;
}

Node.prototype.traversePreviousNode = function(stayWithin)
{
    if (stayWithin && this === stayWithin)
        return null;
    var node = this.previousSibling;
    while (node && node.lastChild)
        node = node.lastChild;
    if (node)
        return node;
    return this.parentNode;
}

Number.constrain = function(num, min, max)
{
    if (num < min)
        num = min;
    else if (num > max)
        num = max;
    return num;
}

Date.prototype.toISO8601Compact = function()
{
    function leadZero(x)
    {
        return x > 9 ? '' + x : '0' + x
    }
    return this.getFullYear() +
           leadZero(this.getMonth() + 1) +
           leadZero(this.getDate()) + 'T' +
           leadZero(this.getHours()) +
           leadZero(this.getMinutes()) +
           leadZero(this.getSeconds());
}

HTMLTextAreaElement.prototype.moveCursorToEnd = function()
{
    var length = this.value.length;
    this.setSelectionRange(length, length);
}

Object.defineProperty(Array.prototype, "remove",
{
    /**
     * @this {Array.<*>}
     */
    value: function(value, onlyFirst)
    {
        if (onlyFirst) {
            var index = this.indexOf(value);
            if (index !== -1)
                this.splice(index, 1);
            return;
        }

        var length = this.length;
        for (var i = 0; i < length; ++i) {
            if (this[i] === value)
                this.splice(i, 1);
        }
    }
});

Object.defineProperty(Array.prototype, "keySet",
{
    /**
     * @this {Array.<*>}
     */
    value: function()
    {
        var keys = {};
        for (var i = 0; i < this.length; ++i)
            keys[this[i]] = true;
        return keys;
    }
});

Object.defineProperty(Array.prototype, "upperBound",
{
    /**
     * @this {Array.<number>}
     */
    value: function(value)
    {
        var first = 0;
        var count = this.length;
        while (count > 0) {
          var step = count >> 1;
          var middle = first + step;
          if (value >= this[middle]) {
              first = middle + 1;
              count -= step + 1;
          } else
              count = step;
        }
        return first;
    }
});

Array.diff = function(left, right)
{
    var o = left;
    var n = right;

    var ns = {};
    var os = {};

    for (var i = 0; i < n.length; i++) {
        if (ns[n[i]] == null)
            ns[n[i]] = { rows: [], o: null };
        ns[n[i]].rows.push(i);
    }

    for (var i = 0; i < o.length; i++) {
        if (os[o[i]] == null)
            os[o[i]] = { rows: [], n: null };
        os[o[i]].rows.push(i);
    }

    for (var i in ns) {
        if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
            n[ns[i].rows[0]] = { text: n[ns[i].rows[0]], row: os[i].rows[0] };
            o[os[i].rows[0]] = { text: o[os[i].rows[0]], row: ns[i].rows[0] };
        }
    }

    for (var i = 0; i < n.length - 1; i++) {
        if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null && n[i + 1] == o[n[i].row + 1]) {
            n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
            o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
        }
    }

    for (var i = n.length - 1; i > 0; i--) {
        if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
            n[i - 1] == o[n[i].row - 1]) {
            n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
            o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
        }
    }

    return { left: o, right: n };
}

Array.convert = function(list)
{
    // Cast array-like object to an array.
    return Array.prototype.slice.call(list);
}

/**
 * @param {string} format
 * @param {...*} var_arg
 */
String.sprintf = function(format, var_arg)
{
    return String.vsprintf(format, Array.prototype.slice.call(arguments, 1));
}

String.tokenizeFormatString = function(format, formatters)
{
    var tokens = [];
    var substitutionIndex = 0;

    function addStringToken(str)
    {
        tokens.push({ type: "string", value: str });
    }

    function addSpecifierToken(specifier, precision, substitutionIndex)
    {
        tokens.push({ type: "specifier", specifier: specifier, precision: precision, substitutionIndex: substitutionIndex });
    }

    function isDigit(c)
    {
        return !!/[0-9]/.exec(c);
    }

    var index = 0;
    for (var precentIndex = format.indexOf("%", index); precentIndex !== -1; precentIndex = format.indexOf("%", index)) {
        addStringToken(format.substring(index, precentIndex));
        index = precentIndex + 1;

        if (isDigit(format[index])) {
            // The first character is a number, it might be a substitution index.
            var number = parseInt(format.substring(index), 10);
            while (isDigit(format[index]))
                ++index;

            // If the number is greater than zero and ends with a "$",
            // then this is a substitution index.
            if (number > 0 && format[index] === "$") {
                substitutionIndex = (number - 1);
                ++index;
            }
        }

        var precision = -1;
        if (format[index] === ".") {
            // This is a precision specifier. If no digit follows the ".",
            // then the precision should be zero.
            ++index;
            precision = parseInt(format.substring(index), 10);
            if (isNaN(precision))
                precision = 0;

            while (isDigit(format[index]))
                ++index;
        }

        if (!(format[index] in formatters)) {
            addStringToken(format.substring(precentIndex, index + 1));
            ++index;
            continue;
        }

        addSpecifierToken(format[index], precision, substitutionIndex);

        ++substitutionIndex;
        ++index;
    }

    addStringToken(format.substring(index));

    return tokens;
}

String.standardFormatters = {
    d: function(substitution)
    {
        return !isNaN(substitution) ? substitution : 0;
    },

    f: function(substitution, token)
    {
        if (substitution && token.precision > -1)
            substitution = substitution.toFixed(token.precision);
        return !isNaN(substitution) ? substitution : (token.precision > -1 ? Number(0).toFixed(token.precision) : 0);
    },

    s: function(substitution)
    {
        return substitution;
    }
}

String.vsprintf = function(format, substitutions)
{
    return String.format(format, substitutions, String.standardFormatters, "", function(a, b) { return a + b; }).formattedResult;
}

String.format = function(format, substitutions, formatters, initialValue, append)
{
    if (!format || !substitutions || !substitutions.length)
        return { formattedResult: append(initialValue, format), unusedSubstitutions: substitutions };

    function prettyFunctionName()
    {
        return "String.format(\"" + format + "\", \"" + substitutions.join("\", \"") + "\")";
    }

    function warn(msg)
    {
        console.warn(prettyFunctionName() + ": " + msg);
    }

    function error(msg)
    {
        console.error(prettyFunctionName() + ": " + msg);
    }

    var result = initialValue;
    var tokens = String.tokenizeFormatString(format, formatters);
    var usedSubstitutionIndexes = {};

    for (var i = 0; i < tokens.length; ++i) {
        var token = tokens[i];

        if (token.type === "string") {
            result = append(result, token.value);
            continue;
        }

        if (token.type !== "specifier") {
            error("Unknown token type \"" + token.type + "\" found.");
            continue;
        }

        if (token.substitutionIndex >= substitutions.length) {
            // If there are not enough substitutions for the current substitutionIndex
            // just output the format specifier literally and move on.
            error("not enough substitution arguments. Had " + substitutions.length + " but needed " + (token.substitutionIndex + 1) + ", so substitution was skipped.");
            result = append(result, "%" + (token.precision > -1 ? token.precision : "") + token.specifier);
            continue;
        }

        usedSubstitutionIndexes[token.substitutionIndex] = true;

        if (!(token.specifier in formatters)) {
            // Encountered an unsupported format character, treat as a string.
            warn("unsupported format character \u201C" + token.specifier + "\u201D. Treating as a string.");
            result = append(result, substitutions[token.substitutionIndex]);
            continue;
        }

        result = append(result, formatters[token.specifier](substitutions[token.substitutionIndex], token));
    }

    var unusedSubstitutions = [];
    for (var i = 0; i < substitutions.length; ++i) {
        if (i in usedSubstitutionIndexes)
            continue;
        unusedSubstitutions.push(substitutions[i]);
    }

    return { formattedResult: result, unusedSubstitutions: unusedSubstitutions };
}

function isEnterKey(event) {
    // Check if in IME.
    return event.keyCode !== 229 && event.keyIdentifier === "Enter";
}

function consumeEvent(e)
{
    e.consume();
}

/**
 * @param {Element} element
 * @param {number} offset
 * @param {number} length
 * @param {Array.<Object>=} domChanges
 */
function highlightSearchResult(element, offset, length, domChanges)
{
    var result = highlightSearchResults(element, [{offset: offset, length: length }], domChanges);
    return result.length ? result[0] : null;
}

/**
 * @param {Element} element
 * @param {Array.<Object>} resultRanges
 * @param {Array.<Object>=} changes
 */
function highlightSearchResults(element, resultRanges, changes)
{
    return highlightRangesWithStyleClass(element, resultRanges, "webkit-search-result", changes);
    
}

/**
 * @param {Element} element
 * @param {Array.<Object>} resultRanges
 * @param {string} styleClass
 * @param {Array.<Object>=} changes
 */
function highlightRangesWithStyleClass(element, resultRanges, styleClass, changes)
{
    changes = changes || [];
    var highlightNodes = [];
    var lineText = element.textContent;
    var ownerDocument = element.ownerDocument;
    var textNodeSnapshot = ownerDocument.evaluate(".//text()", element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    var snapshotLength = textNodeSnapshot.snapshotLength;
    if (snapshotLength === 0)
        return highlightNodes;

    var nodeRanges = [];
    var rangeEndOffset = 0;
    for (var i = 0; i < snapshotLength; ++i) {
        var range = {};
        range.offset = rangeEndOffset;
        range.length = textNodeSnapshot.snapshotItem(i).textContent.length;
        rangeEndOffset = range.offset + range.length;
        nodeRanges.push(range);
    }

    var startIndex = 0;
    for (var i = 0; i < resultRanges.length; ++i) {
        var startOffset = resultRanges[i].offset;
        var endOffset = startOffset + resultRanges[i].length;

        while (startIndex < snapshotLength && nodeRanges[startIndex].offset + nodeRanges[startIndex].length <= startOffset)
            startIndex++;
        var endIndex = startIndex; 
        while (endIndex < snapshotLength && nodeRanges[endIndex].offset + nodeRanges[endIndex].length < endOffset)
            endIndex++;
        if (endIndex === snapshotLength)
            break;
        
        var highlightNode = ownerDocument.createElement("span");
        highlightNode.className = styleClass;
        highlightNode.textContent = lineText.substring(startOffset, endOffset);

        var lastTextNode = textNodeSnapshot.snapshotItem(endIndex);
        var lastText = lastTextNode.textContent;
        lastTextNode.textContent = lastText.substring(endOffset - nodeRanges[endIndex].offset);
        changes.push({ node: lastTextNode, type: "changed", oldText: lastText, newText: lastTextNode.textContent });
        
        if (startIndex === endIndex) {
            lastTextNode.parentElement.insertBefore(highlightNode, lastTextNode);
            changes.push({ node: highlightNode, type: "added", nextSibling: lastTextNode, parent: lastTextNode.parentElement });
            highlightNodes.push(highlightNode);
            
            var prefixNode = ownerDocument.createTextNode(lastText.substring(0, startOffset - nodeRanges[startIndex].offset));
            lastTextNode.parentElement.insertBefore(prefixNode, highlightNode);
            changes.push({ node: prefixNode, type: "added", nextSibling: highlightNode, parent: lastTextNode.parentElement });
        } else {
            var firstTextNode = textNodeSnapshot.snapshotItem(startIndex);
            var firstText = firstTextNode.textContent;
            var anchorElement = firstTextNode.nextSibling;

            firstTextNode.parentElement.insertBefore(highlightNode, anchorElement);
            changes.push({ node: highlightNode, type: "added", nextSibling: anchorElement, parent: firstTextNode.parentElement });
            highlightNodes.push(highlightNode);

            firstTextNode.textContent = firstText.substring(0, startOffset - nodeRanges[startIndex].offset);
            changes.push({ node: firstTextNode, type: "changed", oldText: firstText, newText: firstTextNode.textContent });

            for (var j = startIndex + 1; j < endIndex; j++) {
                var textNode = textNodeSnapshot.snapshotItem(j);
                var text = textNode.textContent;
                textNode.textContent = "";
                changes.push({ node: textNode, type: "changed", oldText: text, newText: textNode.textContent });
            }
        }
        startIndex = endIndex;
        nodeRanges[startIndex].offset = endOffset;
        nodeRanges[startIndex].length = lastTextNode.textContent.length;
            
    }
    return highlightNodes;
}

function applyDomChanges(domChanges)
{
    for (var i = 0, size = domChanges.length; i < size; ++i) {
        var entry = domChanges[i];
        switch (entry.type) {
        case "added":
            entry.parent.insertBefore(entry.node, entry.nextSibling);
            break;
        case "changed":
            entry.node.textContent = entry.newText;
            break;
        }
    }
}

function revertDomChanges(domChanges)
{
    for (var i = domChanges.length - 1; i >= 0; --i) {
        var entry = domChanges[i];
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
}

/**
 * @param {string} query
 * @param {boolean} caseSensitive
 * @param {boolean} isRegex
 * @return {RegExp}
 */
function createSearchRegex(query, caseSensitive, isRegex)
{
    var regexFlags = caseSensitive ? "g" : "gi";
    var regexObject;

    if (isRegex) {
        try {
            regexObject = new RegExp(query, regexFlags);
        } catch (e) {
            // Silent catch.
        }
    }

    if (!regexObject)
        regexObject = createPlainTextSearchRegex(query, regexFlags);

    return regexObject;
}

/**
 * @param {string} query
 * @param {string=} flags
 * @return {RegExp}
 */
function createPlainTextSearchRegex(query, flags)
{
    // This should be kept the same as the one in ContentSearchUtils.cpp.
    var regexSpecialCharacters = "[](){}+-*.,?\\^$|";
    var regex = "";
    for (var i = 0; i < query.length; ++i) {
        var c = query.charAt(i);
        if (regexSpecialCharacters.indexOf(c) != -1)
            regex += "\\";
        regex += c;
    }
    return new RegExp(regex, flags || "");
}

/**
 * @param {RegExp} regex
 * @param {string} content
 * @return {number}
 */
function countRegexMatches(regex, content)
{
    var text = content;
    var result = 0;
    var match;
    while (text && (match = regex.exec(text))) {
        if (match[0].length > 0)
            ++result;
        text = text.substring(match.index + 1);
    }
    return result;
}

/**
 * @param {number} value
 * @param {number} symbolsCount
 * @return {string}
 */
function numberToStringWithSpacesPadding(value, symbolsCount)
{
    var numberString = value.toString();
    var paddingLength = Math.max(0, symbolsCount - numberString.length);
    var paddingString = Array(paddingLength + 1).join("\u00a0");
    return paddingString + numberString;
}

/**
 * @constructor
 */
function TextDiff()
{
    this.added = [];
    this.removed = [];
    this.changed = [];
} 

/**
 * @param {string} baseContent
 * @param {string} newContent
 * @return {TextDiff}
 */
TextDiff.compute = function(baseContent, newContent)
{
    var oldLines = baseContent.split(/\r?\n/);
    var newLines = newContent.split(/\r?\n/);

    var diff = Array.diff(oldLines, newLines);

    var diffData = new TextDiff();

    var offset = 0;
    var right = diff.right;
    for (var i = 0; i < right.length; ++i) {
        if (typeof right[i] === "string") {
            if (right.length > i + 1 && right[i + 1].row === i + 1 - offset)
                diffData.changed.push(i);
            else {
                diffData.added.push(i);
                offset++;
            }
        } else
            offset = i - right[i].row;
    }
    return diffData;
}

/**
 * @constructor
 */
var Map = function()
{
    this._map = {};
}

Map._lastObjectIdentifier = 0;

Map.prototype = {
    /**
     * @param {Object} key
     */
    put: function(key, value)
    {
        var objectIdentifier = key.__identifier;
        if (!objectIdentifier) {
            objectIdentifier = ++Map._lastObjectIdentifier;
            key.__identifier = objectIdentifier;
        }
        this._map[objectIdentifier] = value;
    },
    
    /**
     * @param {Object} key
     */
    remove: function(key)
    {
        delete this._map[key.__identifier];
    },
    
    values: function()
    {
        var result = [];
        for (var objectIdentifier in this._map)
            result.push(this._map[objectIdentifier]);
        return result;
    },
    
    /**
     * @param {Object} key
     */
    get: function(key)
    {
        return this._map[key.__identifier];
    },
    
    clear: function()
    {
        this._map = {};
    }
}
