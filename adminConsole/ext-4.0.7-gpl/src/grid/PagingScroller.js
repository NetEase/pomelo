/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.grid.PagingScroller
 * @extends Ext.grid.Scroller
 */
Ext.define('Ext.grid.PagingScroller', {
    extend: 'Ext.grid.Scroller',
    alias: 'widget.paginggridscroller',
    //renderTpl: null,
    //tpl: [
    //    '<tpl for="pages">',
    //        '<div class="' + Ext.baseCSSPrefix + 'stretcher" style="width: {width}px;height: {height}px;"></div>',
    //    '</tpl>'
    //],
    /**
     * @cfg {Number} percentageFromEdge This is a number above 0 and less than 1 which specifies
     * at what percentage to begin fetching the next page. For example if the pageSize is 100
     * and the percentageFromEdge is the default of 0.35, the paging scroller will prefetch pages
     * when scrolling up between records 0 and 34 and when scrolling down between records 65 and 99.
     */
    percentageFromEdge: 0.35,

    /**
     * @cfg {Number} scrollToLoadBuffer This is the time in milliseconds to buffer load requests
     * when scrolling the PagingScrollbar.
     */
    scrollToLoadBuffer: 200,

    activePrefetch: true,

    chunkSize: 50,
    snapIncrement: 25,

    syncScroll: true,

    initComponent: function() {
        var me = this,
            ds = me.store;

        ds.on('guaranteedrange', me.onGuaranteedRange, me);
        me.callParent(arguments);
    },

    onGuaranteedRange: function(range, start, end) {
        var me = this,
            ds = me.store,
            rs;
        // this should never happen
        if (range.length && me.visibleStart < range[0].index) {
            return;
        }

        ds.loadRecords(range);

        if (!me.firstLoad) {
            if (me.rendered) {
                me.invalidate();
            } else {
                me.on('afterrender', me.invalidate, me, {single: true});
            }
            me.firstLoad = true;
        } else {
            // adjust to visible
            // only sync if there is a paging scrollbar element and it has a scroll height (meaning it's currently in the DOM)
            if (me.scrollEl && me.scrollEl.dom && me.scrollEl.dom.scrollHeight) {
                me.syncTo();
            }
        }
    },

    syncTo: function() {
        var me            = this,
            pnl           = me.getPanel(),
            store         = pnl.store,
            scrollerElDom = this.scrollEl.dom,
            rowOffset     = me.visibleStart - store.guaranteedStart,
            scrollBy      = rowOffset * me.rowHeight,
            scrollHeight  = scrollerElDom.scrollHeight,
            clientHeight  = scrollerElDom.clientHeight,
            scrollTop     = scrollerElDom.scrollTop,
            useMaximum;
            

        // BrowserBug: clientHeight reports 0 in IE9 StrictMode
        // Instead we are using offsetHeight and hardcoding borders
        if (Ext.isIE9 && Ext.isStrict) {
            clientHeight = scrollerElDom.offsetHeight + 2;
        }

        // This should always be zero or greater than zero but staying
        // safe and less than 0 we'll scroll to the bottom.
        useMaximum = (scrollHeight - clientHeight - scrollTop <= 0);
        this.setViewScrollTop(scrollBy, useMaximum);
    },

    getPageData : function(){
        var panel = this.getPanel(),
            store = panel.store,
            totalCount = store.getTotalCount();

        return {
            total : totalCount,
            currentPage : store.currentPage,
            pageCount: Math.ceil(totalCount / store.pageSize),
            fromRecord: ((store.currentPage - 1) * store.pageSize) + 1,
            toRecord: Math.min(store.currentPage * store.pageSize, totalCount)
        };
    },

    onElScroll: function(e, t) {
        var me = this,
            panel = me.getPanel(),
            store = panel.store,
            pageSize = store.pageSize,
            guaranteedStart = store.guaranteedStart,
            guaranteedEnd = store.guaranteedEnd,
            totalCount = store.getTotalCount(),
            numFromEdge = Math.ceil(me.percentageFromEdge * pageSize),
            position = t.scrollTop,
            visibleStart = Math.floor(position / me.rowHeight),
            view = panel.down('tableview'),
            viewEl = view.el,
            visibleHeight = viewEl.getHeight(),
            visibleAhead = Math.ceil(visibleHeight / me.rowHeight),
            visibleEnd = visibleStart + visibleAhead,
            prevPage = Math.floor(visibleStart / pageSize),
            nextPage = Math.floor(visibleEnd / pageSize) + 2,
            lastPage = Math.ceil(totalCount / pageSize),
            snap = me.snapIncrement,
            requestStart = Math.floor(visibleStart / snap) * snap,
            requestEnd = requestStart + pageSize - 1,
            activePrefetch = me.activePrefetch;

        me.visibleStart = visibleStart;
        me.visibleEnd = visibleEnd;
        
        
        me.syncScroll = true;
        if (totalCount >= pageSize) {
            // end of request was past what the total is, grab from the end back a pageSize
            if (requestEnd > totalCount - 1) {
                me.cancelLoad();
                if (store.rangeSatisfied(totalCount - pageSize, totalCount - 1)) {
                    me.syncScroll = true;
                }
                store.guaranteeRange(totalCount - pageSize, totalCount - 1);
            // Out of range, need to reset the current data set
            } else if (visibleStart <= guaranteedStart || visibleEnd > guaranteedEnd) {
                if (visibleStart <= guaranteedStart) {
                    // need to scroll up
                    requestStart -= snap;
                    requestEnd -= snap;
                    
                    if (requestStart < 0) {
                        requestStart = 0;
                        requestEnd = pageSize;
                    }
                }
                if (store.rangeSatisfied(requestStart, requestEnd)) {
                    me.cancelLoad();
                    store.guaranteeRange(requestStart, requestEnd);
                } else {
                    store.mask();
                    me.attemptLoad(requestStart, requestEnd);
                }
                // dont sync the scroll view immediately, sync after the range has been guaranteed
                me.syncScroll = false;
            } else if (activePrefetch && visibleStart < (guaranteedStart + numFromEdge) && prevPage > 0) {
                me.syncScroll = true;
                store.prefetchPage(prevPage);
            } else if (activePrefetch && visibleEnd > (guaranteedEnd - numFromEdge) && nextPage < lastPage) {
                me.syncScroll = true;
                store.prefetchPage(nextPage);
            }
        }

        if (me.syncScroll) {
            me.syncTo();
        }
    },

    getSizeCalculation: function() {
        // Use the direct ownerCt here rather than the scrollerOwner
        // because we are calculating widths/heights.
        var me     = this,
            owner  = me.ownerGrid,
            view   = owner.getView(),
            store  = me.store,
            dock   = me.dock,
            elDom  = me.el.dom,
            width  = 1,
            height = 1;

        if (!me.rowHeight) {
            me.rowHeight = view.el.down(view.getItemSelector()).getHeight(false, true);
        }

        // If the Store is *locally* filtered, use the filtered count from getCount.
        height = store[(!store.remoteFilter && store.isFiltered()) ? 'getCount' : 'getTotalCount']() * me.rowHeight;

        if (isNaN(width)) {
            width = 1;
        }
        if (isNaN(height)) {
            height = 1;
        }
        return {
            width: width,
            height: height
        };
    },

    attemptLoad: function(start, end) {
        var me = this;
        if (!me.loadTask) {
            me.loadTask = Ext.create('Ext.util.DelayedTask', me.doAttemptLoad, me, []);
        }
        me.loadTask.delay(me.scrollToLoadBuffer, me.doAttemptLoad, me, [start, end]);
    },

    cancelLoad: function() {
        if (this.loadTask) {
            this.loadTask.cancel();
        }
    },

    doAttemptLoad:  function(start, end) {
        var store = this.getPanel().store;
        store.guaranteeRange(start, end);
    },

    setViewScrollTop: function(scrollTop, useMax) {
        var me = this,
            owner = me.getPanel(),
            items = owner.query('tableview'),
            i = 0,
            len = items.length,
            center,
            centerEl,
            calcScrollTop,
            maxScrollTop,
            scrollerElDom = me.el.dom;

        owner.virtualScrollTop = scrollTop;

        center = items[1] || items[0];
        centerEl = center.el.dom;

        maxScrollTop = ((owner.store.pageSize * me.rowHeight) - centerEl.clientHeight);
        calcScrollTop = (scrollTop % ((owner.store.pageSize * me.rowHeight) + 1));
        if (useMax) {
            calcScrollTop = maxScrollTop;
        }
        if (calcScrollTop > maxScrollTop) {
            //Ext.Error.raise("Calculated scrollTop was larger than maxScrollTop");
            return;
            // calcScrollTop = maxScrollTop;
        }
        for (; i < len; i++) {
            items[i].el.dom.scrollTop = calcScrollTop;
        }
    }
});

