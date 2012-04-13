/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*
 * @class Ext.draw.Matrix
 * @private
 */
Ext.define('Ext.draw.Matrix', {

    /* Begin Definitions */

    requires: ['Ext.draw.Draw'],

    /* End Definitions */

    constructor: function(a, b, c, d, e, f) {
        if (a != null) {
            this.matrix = [[a, c, e], [b, d, f], [0, 0, 1]];
        }
        else {
            this.matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        }
    },

    add: function(a, b, c, d, e, f) {
        var me = this,
            out = [[], [], []],
            matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
            x,
            y,
            z,
            res;

        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                res = 0;
                for (z = 0; z < 3; z++) {
                    res += me.matrix[x][z] * matrix[z][y];
                }
                out[x][y] = res;
            }
        }
        me.matrix = out;
    },

    prepend: function(a, b, c, d, e, f) {
        var me = this,
            out = [[], [], []],
            matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
            x,
            y,
            z,
            res;

        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                res = 0;
                for (z = 0; z < 3; z++) {
                    res += matrix[x][z] * me.matrix[z][y];
                }
                out[x][y] = res;
            }
        }
        me.matrix = out;
    },

    invert: function() {
        var matrix = this.matrix,
            a = matrix[0][0],
            b = matrix[1][0],
            c = matrix[0][1],
            d = matrix[1][1],
            e = matrix[0][2],
            f = matrix[1][2],
            x = a * d - b * c;
        return new Ext.draw.Matrix(d / x, -b / x, -c / x, a / x, (c * f - d * e) / x, (b * e - a * f) / x);
    },

    clone: function() {
        var matrix = this.matrix,
            a = matrix[0][0],
            b = matrix[1][0],
            c = matrix[0][1],
            d = matrix[1][1],
            e = matrix[0][2],
            f = matrix[1][2];
        return new Ext.draw.Matrix(a, b, c, d, e, f);
    },

    translate: function(x, y) {
        this.prepend(1, 0, 0, 1, x, y);
    },

    scale: function(x, y, cx, cy) {
        var me = this;
        if (y == null) {
            y = x;
        }
        me.add(1, 0, 0, 1, cx, cy);
        me.add(x, 0, 0, y, 0, 0);
        me.add(1, 0, 0, 1, -cx, -cy);
    },

    rotate: function(a, x, y) {
        a = Ext.draw.Draw.rad(a);
        var me = this,
            cos = +Math.cos(a).toFixed(9),
            sin = +Math.sin(a).toFixed(9);
        me.add(cos, sin, -sin, cos, x, y);
        me.add(1, 0, 0, 1, -x, -y);
    },

    x: function(x, y) {
        var matrix = this.matrix;
        return x * matrix[0][0] + y * matrix[0][1] + matrix[0][2];
    },

    y: function(x, y) {
        var matrix = this.matrix;
        return x * matrix[1][0] + y * matrix[1][1] + matrix[1][2];
    },

    get: function(i, j) {
        return + this.matrix[i][j].toFixed(4);
    },

    toString: function() {
        var me = this;
        return [me.get(0, 0), me.get(0, 1), me.get(1, 0), me.get(1, 1), 0, 0].join();
    },

    toSvg: function() {
        var me = this;
        return "matrix(" + [me.get(0, 0), me.get(1, 0), me.get(0, 1), me.get(1, 1), me.get(0, 2), me.get(1, 2)].join() + ")";
    },

    toFilter: function() {
        var me = this;
        return "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',FilterType=bilinear,M11=" + me.get(0, 0) +
            ", M12=" + me.get(0, 1) + ", M21=" + me.get(1, 0) + ", M22=" + me.get(1, 1) +
            ", Dx=" + me.get(0, 2) + ", Dy=" + me.get(1, 2) + ")";
    },

    offset: function() {
        var matrix = this.matrix;
        return [(matrix[0][2] || 0).toFixed(4), (matrix[1][2] || 0).toFixed(4)];
    },

    // Split matrix into Translate Scale, Shear, and Rotate
    split: function () {
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = Math.sqrt(norm(a));
            a[0] /= mag;
            a[1] /= mag;
        }
        var matrix = this.matrix,
            out = {
                translateX: matrix[0][2],
                translateY: matrix[1][2]
            },
            row;

        // scale and shear
        row = [[matrix[0][0], matrix[0][1]], [matrix[1][0], matrix[1][1]]];
        out.scaleX = Math.sqrt(norm(row[0]));
        normalize(row[0]);

        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

        out.scaleY = Math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaleY;

        // rotation
        out.rotate = Math.asin(-row[0][1]);

        out.isSimple = !+out.shear.toFixed(9) && (out.scaleX.toFixed(9) == out.scaleY.toFixed(9) || !out.rotate);

        return out;
    }
});

