/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.header.DropZone
 * @extends Ext.dd.DropZone
 * @private
 */
Ext.define('Ext.grid.header.DropZone', {
    extend: 'Ext.dd.DropZone',
    colHeaderCls: Ext.baseCSSPrefix + 'column-header',
    proxyOffsets: [-4, -9],

    constructor: function(headerCt){
        this.headerCt = headerCt;
        this.ddGroup = this.getDDGroup();
        this.callParent([headerCt.el]);
    },

    getDDGroup: function() {
        return 'header-dd-zone-' + this.headerCt.up('[scrollerOwner]').id;
    },

    getTargetFromEvent : function(e){
        return e.getTarget('.' + this.colHeaderCls);
    },

    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: "col-move-top",
                html: "&#160;"
            }, true);
        }
        return this.topIndicator;
    },

    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: "col-move-bottom",
                html: "&#160;"
            }, true);
        }
        return this.bottomIndicator;
    },

    getLocation: function(e, t) {
        var x      = e.getXY()[0],
            region = Ext.fly(t).getRegion(),
            pos, header;

        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        } else {
            pos = "before";
        }
        return {
            pos: pos,
            header: Ext.getCmp(t.id),
            node: t
        };
    },

    positionIndicator: function(draggedHeader, node, e){
        var location = this.getLocation(e, node),
            header = location.header,
            pos    = location.pos,
            nextHd = draggedHeader.nextSibling('gridcolumn:not([hidden])'),
            prevHd = draggedHeader.previousSibling('gridcolumn:not([hidden])'),
            region, topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX;

        // Cannot drag beyond non-draggable start column
        if (!header.draggable && header.getIndex() == 0) {
            return false;
        }

        this.lastLocation = location;

        if ((draggedHeader !== header) &&
            ((pos === "before" && nextHd !== header) ||
            (pos === "after" && prevHd !== header)) &&
            !header.isDescendantOf(draggedHeader)) {

            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            var allDropZones = Ext.dd.DragDropManager.getRelated(this),
                ln = allDropZones.length,
                i  = 0,
                dropZone;

            for (; i < ln; i++) {
                dropZone = allDropZones[i];
                if (dropZone !== this && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }


            this.valid = true;
            topIndicator = this.getTopIndicator();
            bottomIndicator = this.getBottomIndicator();
            if (pos === 'before') {
                topAnchor = 'tl';
                bottomAnchor = 'bl';
            } else {
                topAnchor = 'tr';
                bottomAnchor = 'br';
            }
            topXY = header.el.getAnchorXY(topAnchor);
            bottomXY = header.el.getAnchorXY(bottomAnchor);

            // constrain the indicators to the viewable section
            headerCtEl = this.headerCt.el;
            minX = headerCtEl.getLeft();
            maxX = headerCtEl.getRight();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            // adjust by offsets, this is to center the arrows so that they point
            // at the split point
            topXY[0] -= 4;
            topXY[1] -= 9;
            bottomXY[0] -= 4;

            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();
        // invalidate drop operation and hide indicators
        } else {
            this.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },

    onNodeOver: function(node, dragZone, e, data) {
        if (data.header.el.dom !== node) {
            this.positionIndicator(data.header, node, e);
        }
        return this.valid ? this.dropAllowed : this.dropNotAllowed;
    },

    hideIndicators: function() {
        this.getTopIndicator().hide();
        this.getBottomIndicator().hide();
    },

    onNodeOut: function() {
        this.hideIndicators();
    },

    onNodeDrop: function(node, dragZone, e, data) {
        if (this.valid) {
            this.invalidateDrop();
            var hd = data.header,
                lastLocation = this.lastLocation,
                fromCt  = hd.ownerCt,
                fromIdx = fromCt.items.indexOf(hd), // Container.items is a MixedCollection
                toCt    = lastLocation.header.ownerCt,
                toIdx   = toCt.items.indexOf(lastLocation.header),
                headerCt = this.headerCt,
                groupCt,
                scrollerOwner;

            if (lastLocation.pos === 'after') {
                toIdx++;
            }

            // If we are dragging in between two HeaderContainers that have had the lockable
            // mixin injected we will lock/unlock headers in between sections. Note that lockable
            // does NOT currently support grouped headers.
            if (fromCt !== toCt && fromCt.lockableInjected && toCt.lockableInjected && toCt.lockedCt) {
                scrollerOwner = fromCt.up('[scrollerOwner]');
                scrollerOwner.lock(hd, toIdx);
            } else if (fromCt !== toCt && fromCt.lockableInjected && toCt.lockableInjected && fromCt.lockedCt) {
                scrollerOwner = fromCt.up('[scrollerOwner]');
                scrollerOwner.unlock(hd, toIdx);
            } else {
                // If dragging rightwards, then after removal, the insertion index will be one less when moving
                // in between the same container.
                if ((fromCt === toCt) && (toIdx > fromCt.items.indexOf(hd))) {
                    toIdx--;
                }

                // Remove dragged header from where it was without destroying it or relaying its Container
                if (fromCt !== toCt) {
                    fromCt.suspendLayout = true;
                    fromCt.remove(hd, false);
                    fromCt.suspendLayout = false;
                }

                // Dragged the last header out of the fromCt group... The fromCt group must die
                if (fromCt.isGroupHeader) {
                    if (!fromCt.items.getCount()) {
                        groupCt = fromCt.ownerCt;
                        groupCt.suspendLayout = true;
                        groupCt.remove(fromCt, false);
                        fromCt.el.dom.parentNode.removeChild(fromCt.el.dom);
                        groupCt.suspendLayout = false;
                    } else {
                        fromCt.minWidth = fromCt.getWidth() - hd.getWidth();
                        fromCt.setWidth(fromCt.minWidth);
                    }
                }

                // Move dragged header into its drop position
                toCt.suspendLayout = true;
                if (fromCt === toCt) {
                    toCt.move(fromIdx, toIdx);
                } else {
                    toCt.insert(toIdx, hd);
                }
                toCt.suspendLayout = false;

                // Group headers acquire the aggregate width of their child headers
                // Therefore a child header may not flex; it must contribute a fixed width.
                // But we restore the flex value when moving back into the main header container
                if (toCt.isGroupHeader) {
                    hd.savedFlex = hd.flex;
                    delete hd.flex;
                    hd.width = hd.getWidth();
                    // When there was previously a flex, we need to ensure we don't count for the
                    // border twice.
                    toCt.minWidth = toCt.getWidth() + hd.getWidth() - (hd.savedFlex ? 1 : 0);
                    toCt.setWidth(toCt.minWidth);
                } else {
                    if (hd.savedFlex) {
                        hd.flex = hd.savedFlex;
                        delete hd.width;
                    }
                }


                // Refresh columns cache in case we remove an emptied group column
                headerCt.purgeCache();
                headerCt.doLayout();
                headerCt.onHeaderMoved(hd, fromIdx, toIdx);
                // Emptied group header can only be destroyed after the header and grid have been refreshed
                if (!fromCt.items.getCount()) {
                    fromCt.destroy();
                }
            }
        }
    }
});

