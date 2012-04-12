/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.draw.engine.Vml
 * @extends Ext.draw.Surface
 * Provides specific methods to draw with VML.
 */

Ext.define('Ext.draw.engine.Vml', {

    /* Begin Definitions */

    extend: 'Ext.draw.Surface',

    requires: ['Ext.draw.Draw', 'Ext.draw.Color', 'Ext.draw.Sprite', 'Ext.draw.Matrix', 'Ext.Element'],

    /* End Definitions */

    engine: 'Vml',

    map: {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
    bitesRe: /([clmz]),?([^clmz]*)/gi,
    valRe: /-?[^,\s-]+/g,
    fillUrlRe: /^url\(\s*['"]?([^\)]+?)['"]?\s*\)$/i,
    pathlike: /^(path|rect)$/,
    NonVmlPathRe: /[ahqstv]/ig, // Non-VML Pathing ops
    partialPathRe: /[clmz]/g,
    fontFamilyRe: /^['"]+|['"]+$/g,
    baseVmlCls: Ext.baseCSSPrefix + 'vml-base',
    vmlGroupCls: Ext.baseCSSPrefix + 'vml-group',
    spriteCls: Ext.baseCSSPrefix + 'vml-sprite',
    measureSpanCls: Ext.baseCSSPrefix + 'vml-measure-span',
    zoom: 21600,
    coordsize: 1000,
    coordorigin: '0 0',

    // VML uses CSS z-index and therefore doesn't need sprites to be kept in zIndex order
    orderSpritesByZIndex: false,

    // @private
    // Convert an SVG standard path into a VML path
    path2vml: function (path) {
        var me = this,
            nonVML =  me.NonVmlPathRe,
            map = me.map,
            val = me.valRe,
            zoom = me.zoom,
            bites = me.bitesRe,
            command = Ext.Function.bind(Ext.draw.Draw.pathToAbsolute, Ext.draw.Draw),
            res, pa, p, r, i, ii, j, jj;
        if (String(path).match(nonVML)) {
            command = Ext.Function.bind(Ext.draw.Draw.path2curve, Ext.draw.Draw);
        } else if (!String(path).match(me.partialPathRe)) {
            res = String(path).replace(bites, function (all, command, args) {
                var vals = [],
                    isMove = command.toLowerCase() == "m",
                    res = map[command];
                args.replace(val, function (value) {
                    if (isMove && vals[length] == 2) {
                        res += vals + map[command == "m" ? "l" : "L"];
                        vals = [];
                    }
                    vals.push(Math.round(value * zoom));
                });
                return res + vals;
            });
            return res;
        }
        pa = command(path);
        res = [];
        for (i = 0, ii = pa.length; i < ii; i++) {
            p = pa[i];
            r = pa[i][0].toLowerCase();
            if (r == "z") {
                r = "x";
            }
            for (j = 1, jj = p.length; j < jj; j++) {
                r += Math.round(p[j] * me.zoom) + (j != jj - 1 ? "," : "");
            }
            res.push(r);
        }
        return res.join(" ");
    },

    // @private - set of attributes which need to be translated from the sprite API to the native browser API
    translateAttrs: {
        radius: "r",
        radiusX: "rx",
        radiusY: "ry",
        lineWidth: "stroke-width",
        fillOpacity: "fill-opacity",
        strokeOpacity: "stroke-opacity",
        strokeLinejoin: "stroke-linejoin"
    },

    // @private - Minimun set of defaults for different types of sprites.
    minDefaults: {
        circle: {
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        ellipse: {
            cx: 0,
            cy: 0,
            rx: 0,
            ry: 0,
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        rect: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rx: 0,
            ry: 0,
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        text: {
            x: 0,
            y: 0,
            "text-anchor": "start",
            font: '10px "Arial"',
            fill: "#000",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        path: {
            d: "M0,0",
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        image: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            preserveAspectRatio: "none",
            opacity: null
        }
    },

    // private
    onMouseEnter: function(e) {
        this.fireEvent("mouseenter", e);
    },

    // private
    onMouseLeave: function(e) {
        this.fireEvent("mouseleave", e);
    },

    // @private - Normalize a delegated single event from the main container to each sprite and sprite group
    processEvent: function(name, e) {
        var target = e.getTarget(),
            surface = this.surface,
            sprite;
        this.fireEvent(name, e);
        sprite = this.items.get(target.id);
        if (sprite) {
            sprite.fireEvent(name, sprite, e);
        }
    },

    // Create the VML element/elements and append them to the DOM
    createSpriteElement: function(sprite) {
        var me = this,
            attr = sprite.attr,
            type = sprite.type,
            zoom = me.zoom,
            vml = sprite.vml || (sprite.vml = {}),
            round = Math.round,
            el = me.createNode('shape'),
            path, skew, textPath;

        el.coordsize = zoom + ' ' + zoom;
        el.coordorigin = attr.coordorigin || "0 0";
        Ext.get(el).addCls(me.spriteCls);
        if (type == "text") {
            vml.path = path = me.createNode("path");
            path.textpathok = true;
            vml.textpath = textPath = me.createNode("textpath");
            textPath.on = true;
            el.appendChild(textPath);
            el.appendChild(path);
        }
        el.id = sprite.id;
        sprite.el = Ext.get(el);
        me.el.appendChild(el);
        if (type !== 'image') {
            skew = me.createNode("skew");
            skew.on = true;
            el.appendChild(skew);
            sprite.skew = skew;
        }
        sprite.matrix = Ext.create('Ext.draw.Matrix');
        sprite.bbox = {
            plain: null,
            transform: null
        };
        sprite.fireEvent("render", sprite);
        return sprite.el;
    },

    // @private - Get bounding box for the sprite.  The Sprite itself has the public method.
    getBBox: function (sprite, isWithoutTransform) {
        var realPath = this["getPath" + sprite.type](sprite);
        if (isWithoutTransform) {
            sprite.bbox.plain = sprite.bbox.plain || Ext.draw.Draw.pathDimensions(realPath);
            return sprite.bbox.plain;
        }
        sprite.bbox.transform = sprite.bbox.transform || Ext.draw.Draw.pathDimensions(Ext.draw.Draw.mapPath(realPath, sprite.matrix));
        return sprite.bbox.transform;
    },

    getBBoxText: function (sprite) {
        var vml = sprite.vml;
        return {
            x: vml.X + (vml.bbx || 0) - vml.W / 2,
            y: vml.Y - vml.H / 2,
            width: vml.W,
            height: vml.H
        };
    },

    applyAttrs: function (sprite) {
        var me = this,
            vml = sprite.vml,
            group = sprite.group,
            spriteAttr = sprite.attr,
            el = sprite.el,
            dom = el.dom,
            style, name, groups, i, ln, scrubbedAttrs, font, key, bbox;

        if (group) {
            groups = [].concat(group);
            ln = groups.length;
            for (i = 0; i < ln; i++) {
                group = groups[i];
                me.getGroup(group).add(sprite);
            }
            delete sprite.group;
        }
        scrubbedAttrs = me.scrubAttrs(sprite) || {};

        if (sprite.zIndexDirty) {
            me.setZIndex(sprite);
        }

        // Apply minimum default attributes
        Ext.applyIf(scrubbedAttrs, me.minDefaults[sprite.type]);

        if (dom.href) {
            dom.href = scrubbedAttrs.href;
        }
        if (dom.title) {
            dom.title = scrubbedAttrs.title;
        }
        if (dom.target) {
            dom.target = scrubbedAttrs.target;
        }
        if (dom.cursor) {
            dom.cursor = scrubbedAttrs.cursor;
        }

        // Change visibility
        if (sprite.dirtyHidden) {
            (scrubbedAttrs.hidden) ? me.hidePrim(sprite) : me.showPrim(sprite);
            sprite.dirtyHidden = false;
        }

        // Update path
        if (sprite.dirtyPath) {
            if (sprite.type == "circle" || sprite.type == "ellipse") {
                var cx = scrubbedAttrs.x,
                    cy = scrubbedAttrs.y,
                    rx = scrubbedAttrs.rx || scrubbedAttrs.r || 0,
                    ry = scrubbedAttrs.ry || scrubbedAttrs.r || 0;
                dom.path = Ext.String.format("ar{0},{1},{2},{3},{4},{1},{4},{1}",
                            Math.round((cx - rx) * me.zoom),
                            Math.round((cy - ry) * me.zoom),
                            Math.round((cx + rx) * me.zoom),
                            Math.round((cy + ry) * me.zoom),
                            Math.round(cx * me.zoom));
                sprite.dirtyPath = false;
            }
            else if (sprite.type !== "text") {
                sprite.attr.path = scrubbedAttrs.path = me.setPaths(sprite, scrubbedAttrs) || scrubbedAttrs.path;
                dom.path = me.path2vml(scrubbedAttrs.path);
                sprite.dirtyPath = false;
            }
        }

        // Apply clipping
        if ("clip-rect" in scrubbedAttrs) {
            me.setClip(sprite, scrubbedAttrs);
        }

        // Handle text (special handling required)
        if (sprite.type == "text") {
            me.setTextAttributes(sprite, scrubbedAttrs);
        }

        // Handle fill and opacity
        if (sprite.type == 'image' || scrubbedAttrs.opacity  || scrubbedAttrs['fill-opacity'] || scrubbedAttrs.fill) {
            me.setFill(sprite, scrubbedAttrs);
        }

        // Handle stroke (all fills require a stroke element)
        if (scrubbedAttrs.stroke || scrubbedAttrs['stroke-opacity'] || scrubbedAttrs.fill) {
            me.setStroke(sprite, scrubbedAttrs);
        }
        
        //set styles
        style = spriteAttr.style;
        if (style) {
            el.setStyle(style);
        }

        sprite.dirty = false;
    },

    setZIndex: function(sprite) {
        if (sprite.el) {
            if (sprite.attr.zIndex != undefined) {
                sprite.el.setStyle('zIndex', sprite.attr.zIndex);
            }
            sprite.zIndexDirty = false;
        }
    },

    // Normalize all virtualized types into paths.
    setPaths: function(sprite, params) {
        var spriteAttr = sprite.attr;
        // Clear bbox cache
        sprite.bbox.plain = null;
        sprite.bbox.transform = null;
        if (sprite.type == 'circle') {
            spriteAttr.rx = spriteAttr.ry = params.r;
            return Ext.draw.Draw.ellipsePath(sprite);
        }
        else if (sprite.type == 'ellipse') {
            spriteAttr.rx = params.rx;
            spriteAttr.ry = params.ry;
            return Ext.draw.Draw.ellipsePath(sprite);
        }
        else if (sprite.type == 'rect' || sprite.type == 'image') {
            spriteAttr.rx = spriteAttr.ry = params.r;
            return Ext.draw.Draw.rectPath(sprite);
        }
        else if (sprite.type == 'path' && spriteAttr.path) {
            return Ext.draw.Draw.pathToAbsolute(spriteAttr.path);
        }
        return false;
    },

    setFill: function(sprite, params) {
        var me = this,
            el = sprite.el,
            dom = el.dom,
            fillEl = dom.getElementsByTagName('fill')[0],
            opacity, gradient, fillUrl, rotation, angle;

        if (fillEl) {
            dom.removeChild(fillEl);
        } else {
            fillEl = me.createNode('fill');
        }
        if (Ext.isArray(params.fill)) {
            params.fill = params.fill[0];
        }
        if (sprite.type == 'image') {
            fillEl.on = true;
            fillEl.src = params.src;
            fillEl.type = "tile";
            fillEl.rotate = true;
        } else if (params.fill == "none") {
            fillEl.on = false;
        } else {
            if (typeof params.opacity == "number") {
                fillEl.opacity = params.opacity;
            }
            if (typeof params["fill-opacity"] == "number") {
                fillEl.opacity = params["fill-opacity"];
            }
            fillEl.on = true;
            if (typeof params.fill == "string") {
                fillUrl = params.fill.match(me.fillUrlRe);
                if (fillUrl) {
                    fillUrl = fillUrl[1];
                    // If the URL matches one of the registered gradients, render that gradient
                    if (fillUrl.charAt(0) == "#") {
                        gradient = me.gradientsColl.getByKey(fillUrl.substring(1));
                    }
                    if (gradient) {
                        // VML angle is offset and inverted from standard, and must be adjusted to match rotation transform
                        rotation = params.rotation;
                        angle = -(gradient.angle + 270 + (rotation ? rotation.degrees : 0)) % 360;
                        // IE will flip the angle at 0 degrees...
                        if (angle === 0) {
                            angle = 180;
                        }
                        fillEl.angle = angle;
                        fillEl.type = "gradient";
                        fillEl.method = "sigma";
                        fillEl.colors = gradient.colors;
                    }
                    // Otherwise treat it as an image
                    else {
                        fillEl.src = fillUrl;
                        fillEl.type = "tile";
                        fillEl.rotate = true;
                    }
                }
                else {
                    fillEl.color = Ext.draw.Color.toHex(params.fill) || params.fill;
                    fillEl.src = "";
                    fillEl.type = "solid";
                }
            }
        }
        dom.appendChild(fillEl);
    },

    setStroke: function(sprite, params) {
        var me = this,
            el = sprite.el.dom,
            strokeEl = sprite.strokeEl,
            newStroke = false,
            width, opacity;

        if (!strokeEl) {
            strokeEl = sprite.strokeEl = me.createNode("stroke");
            newStroke = true;
        }
        if (Ext.isArray(params.stroke)) {
            params.stroke = params.stroke[0];
        }
        if (!params.stroke || params.stroke == "none" || params.stroke == 0 || params["stroke-width"] == 0) {
            strokeEl.on = false;
        }
        else {
            strokeEl.on = true;
            if (params.stroke && !params.stroke.match(me.fillUrlRe)) {
                // VML does NOT support a gradient stroke :(
                strokeEl.color = Ext.draw.Color.toHex(params.stroke);
            }
            strokeEl.joinstyle = params["stroke-linejoin"];
            strokeEl.endcap = params["stroke-linecap"] || "round";
            strokeEl.miterlimit = params["stroke-miterlimit"] || 8;
            width = parseFloat(params["stroke-width"] || 1) * 0.75;
            opacity = params["stroke-opacity"] || 1;
            // VML Does not support stroke widths under 1, so we're going to fiddle with stroke-opacity instead.
            if (Ext.isNumber(width) && width < 1) {
                strokeEl.weight = 1;
                strokeEl.opacity = opacity * width;
            }
            else {
                strokeEl.weight = width;
                strokeEl.opacity = opacity;
            }
        }
        if (newStroke) {
            el.appendChild(strokeEl);
        }
    },

    setClip: function(sprite, params) {
        var me = this,
            el = sprite.el,
            clipEl = sprite.clipEl,
            rect = String(params["clip-rect"]).split(me.separatorRe);
        if (!clipEl) {
            clipEl = sprite.clipEl = me.el.insertFirst(Ext.getDoc().dom.createElement("div"));
            clipEl.addCls(Ext.baseCSSPrefix + 'vml-sprite');
        }
        if (rect.length == 4) {
            rect[2] = +rect[2] + (+rect[0]);
            rect[3] = +rect[3] + (+rect[1]);
            clipEl.setStyle("clip", Ext.String.format("rect({1}px {2}px {3}px {0}px)", rect[0], rect[1], rect[2], rect[3]));
            clipEl.setSize(me.el.width, me.el.height);
        }
        else {
            clipEl.setStyle("clip", "");
        }
    },

    setTextAttributes: function(sprite, params) {
        var me = this,
            vml = sprite.vml,
            textStyle = vml.textpath.style,
            spanCacheStyle = me.span.style,
            zoom = me.zoom,
            round = Math.round,
            fontObj = {
                fontSize: "font-size",
                fontWeight: "font-weight",
                fontStyle: "font-style"
            },
            fontProp,
            paramProp;
        if (sprite.dirtyFont) {
            if (params.font) {
                textStyle.font = spanCacheStyle.font = params.font;
            }
            if (params["font-family"]) {
                textStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(me.fontFamilyRe, "") + '"';
                spanCacheStyle.fontFamily = params["font-family"];
            }

            for (fontProp in fontObj) {
                paramProp = params[fontObj[fontProp]];
                if (paramProp) {
                    textStyle[fontProp] = spanCacheStyle[fontProp] = paramProp;
                }
            }

            me.setText(sprite, params.text);
            
            if (vml.textpath.string) {
                me.span.innerHTML = String(vml.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>");
            }
            vml.W = me.span.offsetWidth;
            vml.H = me.span.offsetHeight + 2; // TODO handle baseline differences and offset in VML Textpath

            // text-anchor emulation
            if (params["text-anchor"] == "middle") {
                textStyle["v-text-align"] = "center";
            }
            else if (params["text-anchor"] == "end") {
                textStyle["v-text-align"] = "right";
                vml.bbx = -Math.round(vml.W / 2);
            }
            else {
                textStyle["v-text-align"] = "left";
                vml.bbx = Math.round(vml.W / 2);
            }
        }
        vml.X = params.x;
        vml.Y = params.y;
        vml.path.v = Ext.String.format("m{0},{1}l{2},{1}", Math.round(vml.X * zoom), Math.round(vml.Y * zoom), Math.round(vml.X * zoom) + 1);
        // Clear bbox cache
        sprite.bbox.plain = null;
        sprite.bbox.transform = null;
        sprite.dirtyFont = false;
    },
    
    setText: function(sprite, text) {
        sprite.vml.textpath.string = Ext.htmlDecode(text);
    },

    hide: function() {
        this.el.hide();
    },

    show: function() {
        this.el.show();
    },

    hidePrim: function(sprite) {
        sprite.el.addCls(Ext.baseCSSPrefix + 'hide-visibility');
    },

    showPrim: function(sprite) {
        sprite.el.removeCls(Ext.baseCSSPrefix + 'hide-visibility');
    },

    setSize: function(width, height) {
        var me = this;
        width = width || me.width;
        height = height || me.height;
        me.width = width;
        me.height = height;

        if (me.el) {
            // Size outer div
            if (width != undefined) {
                me.el.setWidth(width);
            }
            if (height != undefined) {
                me.el.setHeight(height);
            }

            // Handle viewBox sizing
            me.applyViewBox();

            me.callParent(arguments);
        }
    },

    setViewBox: function(x, y, width, height) {
        this.callParent(arguments);
        this.viewBox = {
            x: x,
            y: y,
            width: width,
            height: height
        };
        this.applyViewBox();
    },

    /**
     * @private Using the current viewBox property and the surface's width and height, calculate the
     * appropriate viewBoxShift that will be applied as a persistent transform to all sprites.
     */
    applyViewBox: function() {
        var me = this,
            viewBox = me.viewBox,
            width = me.width,
            height = me.height,
            viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight,
            relativeHeight, relativeWidth, size;

        if (viewBox && (width || height)) {
            viewBoxX = viewBox.x;
            viewBoxY = viewBox.y;
            viewBoxWidth = viewBox.width;
            viewBoxHeight = viewBox.height;
            relativeHeight = height / viewBoxHeight;
            relativeWidth = width / viewBoxWidth;

            if (viewBoxWidth * relativeHeight < width) {
                viewBoxX -= (width - viewBoxWidth * relativeHeight) / 2 / relativeHeight;
            }
            if (viewBoxHeight * relativeWidth < height) {
                viewBoxY -= (height - viewBoxHeight * relativeWidth) / 2 / relativeWidth;
            }

            size = 1 / Math.max(viewBoxWidth / width, viewBoxHeight / height);

            me.viewBoxShift = {
                dx: -viewBoxX,
                dy: -viewBoxY,
                scale: size
            };
            me.items.each(function(item) {
                me.transform(item);
            });
        }
    },

    onAdd: function(item) {
        this.callParent(arguments);
        if (this.el) {
            this.renderItem(item);
        }
    },

    onRemove: function(sprite) {
        if (sprite.el) {
            sprite.el.remove();
            delete sprite.el;
        }
        this.callParent(arguments);
    },

    // VML Node factory method (createNode)
    createNode : (function () {
        try {
            var doc = Ext.getDoc().dom;
            if (!doc.namespaces.rvml) {
                doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            }
            return function (tagName) {
                return doc.createElement("<rvml:" + tagName + ' class="rvml">');
            };
        } catch (e) {
            return function (tagName) {
                return doc.createElement("<" + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
    })(),

    render: function (container) {
        var me = this,
            doc = Ext.getDoc().dom;

        if (!me.el) {
            var el = doc.createElement("div");
            me.el = Ext.get(el);
            me.el.addCls(me.baseVmlCls);

            // Measuring span (offscrren)
            me.span = doc.createElement("span");
            Ext.get(me.span).addCls(me.measureSpanCls);
            el.appendChild(me.span);
            me.el.setSize(me.width || 10, me.height || 10);
            container.appendChild(el);
            me.el.on({
                scope: me,
                mouseup: me.onMouseUp,
                mousedown: me.onMouseDown,
                mouseover: me.onMouseOver,
                mouseout: me.onMouseOut,
                mousemove: me.onMouseMove,
                mouseenter: me.onMouseEnter,
                mouseleave: me.onMouseLeave,
                click: me.onClick
            });
        }
        me.renderAll();
    },

    renderAll: function() {
        this.items.each(this.renderItem, this);
    },

    redraw: function(sprite) {
        sprite.dirty = true;
        this.renderItem(sprite);
    },

    renderItem: function (sprite) {
        // Does the surface element exist?
        if (!this.el) {
            return;
        }

        // Create sprite element if necessary
        if (!sprite.el) {
            this.createSpriteElement(sprite);
        }

        if (sprite.dirty) {
            this.applyAttrs(sprite);
            if (sprite.dirtyTransform) {
                this.applyTransformations(sprite);
            }
        }
    },

    rotationCompensation: function (deg, dx, dy) {
        var matrix = Ext.create('Ext.draw.Matrix');
        matrix.rotate(-deg, 0.5, 0.5);
        return {
            x: matrix.x(dx, dy),
            y: matrix.y(dx, dy)
        };
    },

    extractTransform: function (sprite) {
        var me = this,
            matrix = Ext.create('Ext.draw.Matrix'), scale,
            transformstions, tranformationsLength,
            transform, i = 0,
            shift = me.viewBoxShift;

        for(transformstions = sprite.transformations, tranformationsLength = transformstions.length;
            i < tranformationsLength; i ++) {
            transform = transformstions[i];
            switch (transform.type) {
                case 'translate' :
                    matrix.translate(transform.x, transform.y);
                    break;
                case 'rotate':
                    matrix.rotate(transform.degrees, transform.x, transform.y);
                    break;
                case 'scale':
                    matrix.scale(transform.x || transform.scale, transform.y || transform.scale, transform.centerX, transform.centerY);
                    break;
            }
        }

        if (shift) {
            matrix.add(1, 0, 0, 1, shift.dx, shift.dy);
            matrix.prepend(shift.scale, 0, 0, shift.scale, 0, 0);
        }
        
        return sprite.matrix = matrix;
    },

    setSimpleCoords: function(sprite, sx, sy, dx, dy, rotate) {
        var me = this,
            matrix = sprite.matrix,
            dom = sprite.el.dom,
            style = dom.style,
            yFlipper = 1,
            flip = "",
            fill = dom.getElementsByTagName('fill')[0],
            kx = me.zoom / sx,
            ky = me.zoom / sy,
            rotationCompensation;
        if (!sx || !sy) {
            return;
        }
        dom.coordsize = Math.abs(kx) + ' ' + Math.abs(ky);
        style.rotation = rotate * (sx * sy < 0 ? -1 : 1);
        if (rotate) {
            rotationCompensation = me.rotationCompensation(rotate, dx, dy);
            dx = rotationCompensation.x;
            dy = rotationCompensation.y;
        }
        if (sx < 0) {
            flip += "x"
        }
        if (sy < 0) {
            flip += " y";
            yFlipper = -1;
        }
        style.flip = flip;
        dom.coordorigin = (dx * -kx) + ' ' + (dy * -ky);
        if (fill) {
            dom.removeChild(fill);
            rotationCompensation = me.rotationCompensation(rotate, matrix.x(sprite.x, sprite.y), matrix.y(sprite.x, sprite.y));
            fill.position = rotationCompensation.x * yFlipper + ' ' + rotationCompensation.y * yFlipper;
            fill.size = sprite.width * Math.abs(sx) + ' ' + sprite.height * Math.abs(sy);
            dom.appendChild(fill);
        }
    },

    transform : function (sprite) {
        var me = this,
            el = sprite.el,
            skew = sprite.skew,
            dom = el.dom,
            domStyle = dom.style,
            matrix = me.extractTransform(sprite).clone(),
            split, zoom = me.zoom,
            fill = dom.getElementsByTagName('fill')[0],
            isPatt = !String(sprite.fill).indexOf("url("),
            offset, c;


        // Hide element while we transform

        if (sprite.type != "image" && skew && !isPatt) {
            // matrix transform via VML skew
            skew.matrix = matrix.toString();
            // skew.offset = '32767,1' OK
            // skew.offset = '32768,1' Crash
            // M$, R U kidding??
            offset = matrix.offset();
            if (offset[0] > 32767) {
                offset[0] = 32767;
            } else if (offset[0] < -32768) {
                offset[0] = -32768
            }
            if (offset[1] > 32767) {
                offset[1] = 32767;
            } else if (offset[1] < -32768) {
                offset[1] = -32768
            }
            skew.offset = offset;
        } else {
            if (skew) {
                skew.matrix = "1 0 0 1";
                skew.offset = "0 0";
            }
            split = matrix.split();
            if (split.isSimple) {
                domStyle.filter = '';
                me.setSimpleCoords(sprite, split.scaleX, split.scaleY, split.translateX, split.translateY, split.rotate / Math.PI * 180);
            } else {
                domStyle.filter = matrix.toFilter();
                var bb = me.getBBox(sprite),
                    dx = bb.x - sprite.x,
                    dy = bb.y - sprite.y;
                dom.coordorigin = (dx * -zoom) + ' ' + (dy * -zoom);
                if (fill) {
                    dom.removeChild(fill);
                    fill.position = dx + ' ' + dy;
                    fill.size = sprite.width * sprite.scale.x + ' ' + sprite.height * 1.1;
                    dom.appendChild(fill);
                }
            }
        }
    },

    createItem: function (config) {
        return Ext.create('Ext.draw.Sprite', config);
    },

    getRegion: function() {
        return this.el.getRegion();
    },

    addCls: function(sprite, className) {
        if (sprite && sprite.el) {
            sprite.el.addCls(className);
        }
    },

    removeCls: function(sprite, className) {
        if (sprite && sprite.el) {
            sprite.el.removeCls(className);
        }
    },

    /**
     * Adds a definition to this Surface for a linear gradient. We convert the gradient definition
     * to its corresponding VML attributes and store it for later use by individual sprites.
     * @param {Object} gradient
     */
    addGradient: function(gradient) {
        var gradients = this.gradientsColl || (this.gradientsColl = Ext.create('Ext.util.MixedCollection')),
            colors = [],
            stops = Ext.create('Ext.util.MixedCollection');

        // Build colors string
        stops.addAll(gradient.stops);
        stops.sortByKey("ASC", function(a, b) {
            a = parseInt(a, 10);
            b = parseInt(b, 10);
            return a > b ? 1 : (a < b ? -1 : 0);
        });
        stops.eachKey(function(k, v) {
            colors.push(k + "% " + v.color);
        });

        gradients.add(gradient.id, {
            colors: colors.join(","),
            angle: gradient.angle
        });
    },

    destroy: function() {
        var me = this;
        
        me.callParent(arguments);
        if (me.el) {
            me.el.remove();
        }
        delete me.el;
    }
});

