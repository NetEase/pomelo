/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("API", function() {

    var actual = window;
    var expected = {Ext:{core:{Element: function(){} }}},
    Ext = expected.Ext;

    /* Element-more.js */ Ext.core.Element.prototype.clean = function clean(){};
    /* Element-more.js */ Ext.core.Element.prototype.createProxy = function createProxy(){};
    /* Element-more.js */ Ext.core.Element.prototype.getLoader = function getLoader(){};
    /* Element-more.js */ Ext.core.Element.prototype.monitorMouseLeave = function monitorMouseLeave(){};
    /* Element-more.js */ Ext.core.Element.prototype.relayEvent = function relayEvent(){};
    /* Element-more.js */ Ext.core.Element.prototype.swallowEvent = function swallowEvent(){};
    /* Element-more.js */ Ext.core.Element.prototype.load = function load(){};

    /* Element.alignment.js */ Ext.core.Element.prototype.getConstrainVector = function getConstrainVector(){};

    // /* Element.anim.js */ Ext.core.Element.prototype.fadeIn = function fadeIn(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.fadeOut = function fadeOut(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.frame = function frame(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.ghost = function ghost(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.highlight = function highlight(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.pause = function pause(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.puff = function puff(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.scale = function scale(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.shift = function shift(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.slideIn = function slideIn(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.slideOut = function slideOut(){};
    // /* Element.anim.js */ Ext.core.Element.prototype.switchOff = function switchOff(){};

    // /* Element.dd.js */ Ext.core.Element.prototype.initDD = function initDD(){};
    // /* Element.dd.js */ Ext.core.Element.prototype.initDDProxy = function initDDProxy(){};
    // /* Element.dd.js */ Ext.core.Element.prototype.initDDTarget = function initDDTarget(){};

    /* Element.fx-more.js */ Ext.core.Element.prototype.createShim = function createShim(){};
    /* Element.fx-more.js */ Ext.core.Element.prototype.enableDisplayMode = function enableDisplayMode(){};
    /* Element.fx-more.js */ Ext.core.Element.prototype.isDisplayed = function isDisplayed(){};
    /* Element.fx-more.js */ Ext.core.Element.prototype.isMasked = function isMasked(){};

    /* Element.fx.js */ Ext.core.Element.prototype.isVisible = function isVisible(){};
    /* Element.fx.js */ Ext.core.Element.prototype.originalDisplay = String();
    /* Element.fx.js */ Ext.core.Element.prototype.setDisplayed = function setDisplayed(){};
    /* Element.fx.js */ Ext.core.Element.prototype.setVisibilityMode = function setVisibilityMode(){};
    /* Element.fx.js */ Ext.core.Element.prototype.toggle = function toggle(){};
    /* Element.fx.js */ Ext.core.Element.visibilityCls = String();

    /* Element.insertion.js */ Ext.core.Element.prototype.appendChild = function appendChild(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.appendTo = function appendTo(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.createChild = function createChild(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.insertAfter = function insertAfter(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.insertBefore = function insertBefore(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.insertFirst = function insertFirst(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.insertHtml = function insertHtml(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.insertSibling = function insertSibling(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.replace = function replace(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.replaceWith = function replaceWith(){};
    /* Element.insertion.js */ Ext.core.Element.prototype.wrap = function wrap(){};

    /* Element.js */ Ext.core.Element.prototype.autoBoxAdjust = true;
    /* Element.js */ Ext.core.Element.prototype.blur = function blur(){};
    /* Element.js */ Ext.core.Element.prototype.clearListeners = function clearListeners(){};
    /* Element.js */ Ext.core.Element.prototype.destroy = function destroy(){};
    /* Element.js */ Ext.core.Element.prototype.focus = function focus(){};
    /* Element.js */ Ext.core.Element.prototype.getAttributeNS = function getAttributeNS(){};
    /* Element.js */ Ext.core.Element.prototype.hover = function hover(){};
    /* Element.js */ Ext.core.Element.prototype.isBorderBox = function isBorderBox(){};
    /* Element.js */ Ext.core.Element.prototype.on = function on(){};
    /* Element.js */ Ext.core.Element.prototype.un = function un(){};
    /* Element.js */ Ext.core.Element.prototype.update = function update(){};

    /* Element.keys.js */ Ext.core.Element.prototype.addKeyListener = function addKeyListener(){};
    /* Element.keys.js */ Ext.core.Element.prototype.addKeyMap = function addKeyMap(){};

    /* Element.position.js */ Ext.core.Element.prototype.clearPositioning = function clearPositioning(){};
    /* Element.position.js */ Ext.core.Element.prototype.getPositioning = function getPositioning(){};
    /* Element.position.js */ Ext.core.Element.prototype.getRegion = function getRegion(){};
    /* Element.position.js */ Ext.core.Element.prototype.getViewRegion = function getViewRegion(){};
    /* Element.position.js */ Ext.core.Element.prototype.move = function move(){};
    /* Element.position.js */ Ext.core.Element.prototype.moveTo = function moveTo(){};
    /* Element.position.js */ Ext.core.Element.prototype.position = function position(){};
    /* Element.position.js */ Ext.core.Element.prototype.setBounds = function setBounds(){};
    /* Element.position.js */ Ext.core.Element.prototype.setLeftTop = function setLeftTop(){};
    /* Element.position.js */ Ext.core.Element.prototype.setLocation = function setLocation(){};
    /* Element.position.js */ Ext.core.Element.prototype.setPositioning = function setPositioning(){};
    /* Element.position.js */ Ext.core.Element.prototype.setRegion = function setRegion(){};

    /* Element.scroll.js */ Ext.core.Element.prototype.getScroll = function getScroll(){};
    /* Element.scroll.js */ Ext.core.Element.prototype.isScrollable = function isScrollable(){};
    /* Element.scroll.js */ Ext.core.Element.prototype.scroll = function scroll(){};
    /* Element.scroll.js */ Ext.core.Element.prototype.scrollIntoView = function scrollIntoView(){};
    /* Element.scroll.js */ Ext.core.Element.prototype.scrollTo = function scrollTo(){};

    /* Element.static.js */ Ext.core.Element.fromPoint = function fromPoint(){};
    /* Element.static.js */ Ext.core.Element.getDocumentHeight = function getDocumentHeight(){};
    /* Element.static.js */ Ext.core.Element.getDocumentWidth = function getDocumentWidth(){};
    /* Element.static.js */ Ext.core.Element.getOrientation = function getOrientation(){};
    /* Element.static.js */ Ext.core.Element.getViewportHeight = function getViewportHeight(){};
    /* Element.static.js */ Ext.core.Element.getViewportWidth = function getViewportWidth(){};
    /* Element.static.js */ Ext.core.Element.normalize = function normalize(){};
    /* Element.static.js */ Ext.core.Element.parseBox = function parseBox(){};
    /* Element.static.js */ Ext.core.Element.parseStyles = function parseStyles(){};
    /* Element.static.js */ Ext.core.Element.unitizeBox = function unitizeBox(){};

    /* Element.style.js */ Ext.core.Element.prototype.addClsOnClick = function addClsOnClick(){};
    /* Element.style.js */ Ext.core.Element.prototype.addClsOnFocus = function addClsOnFocus(){};
    /* Element.style.js */ Ext.core.Element.prototype.addClsOnOver = function addClsOnOver(){};
    /* Element.style.js */ Ext.core.Element.prototype.boxWrap = function boxWrap(){};
    /* Element.style.js */ Ext.core.Element.prototype.clearOpacity = function clearOpacity(){};
    /* Element.style.js */ Ext.core.Element.prototype.clip = function clip(){};
    /* Element.style.js */ Ext.core.Element.prototype.getColor = function getColor(){};
    /* Element.style.js */ Ext.core.Element.prototype.getComputedHeight = function getComputedHeight(){};
    /* Element.style.js */ Ext.core.Element.prototype.getComputedWidth = function getComputedWidth(){};
    /* Element.style.js */ Ext.core.Element.prototype.getFrameWidth = function getFrameWidth(){};
    /* Element.style.js */ Ext.core.Element.prototype.getStyleSize = function getStyleSize(){};
    /* Element.style.js */ Ext.core.Element.prototype.getStyles = function getStyles(){};
    // /* Element.style.js */ Ext.core.Element.prototype.private = Object();
    /* Element.style.js */ Ext.core.Element.prototype.setOpacity = function setOpacity(){};
    /* Element.style.js */ Ext.core.Element.prototype.unclip = function unclip(){};
    /* Element.style.js */ Ext.core.Element.prototype.unselectable = function unselectable(){};

    /* Element.traversal.js */ Ext.core.Element.prototype.child = function child(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.down = function down(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.findParent = function findParent(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.findParentNode = function findParentNode(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.first = function first(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.last = function last(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.next = function next(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.parent = function parent(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.prev = function prev(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.query = function query(){};
    /* Element.traversal.js */ Ext.core.Element.prototype.up = function up(){};

    APITest({Ext:expected.Ext}, {Ext:actual.Ext});

});

