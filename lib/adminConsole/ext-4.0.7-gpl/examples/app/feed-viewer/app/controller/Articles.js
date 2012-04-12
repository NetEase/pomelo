/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define('FV.controller.Articles', {
    extend: 'Ext.app.Controller',

    stores: ['Articles'],

    models: ['Article'],

    views: ['article.Grid', 'article.Preview'],

    refs: [{
        ref: 'feedShow',
        selector: 'feedshow'
    }, {
    	ref: 'viewer',
    	selector: 'viewer'
    }, {
    	ref: 'articlePreview',
    	selector: 'articlepreview'
    }, {
        ref: 'articleTab',
        xtype: 'articlepreview',
        closable: true,
        forceCreate: true,
        selector: 'articlepreview'
    }],

    init: function() {
        this.control({
            'articlegrid': {
                selectionchange: this.previewArticle
            },
            'articlegrid > tableview': {
                itemdblclick: this.loadArticle,
                refresh: this.selectArticle
            },
            'articlegrid button[action=openall]': {
                click: this.openAllArticles
            },
            'articlepreview button[action=viewintab]': {
                click: this.viewArticle
            },
            'articlepreview button[action=gotopost]': {
                click: this.openArticle
            }
        });
    },

    selectArticle: function(view) {
        var first = this.getArticlesStore().getAt(0);
        if (first) {
            view.getSelectionModel().select(first);
        }
    },

    /**
     * Loads the given article into the preview panel
     * @param {FV.model.Article} article The article to load
     */
    previewArticle: function(grid, articles) {
        var article = articles[0],
            articlePreview = this.getArticlePreview();

        if (article) {
            articlePreview.article = article;
    		articlePreview.update(article.data);
        }
    },

    openArticle: function(btn) {
        window.open(btn.up('articlepreview').article.get('link'));
    },
    
    openAllArticles: function() {
        var articles = [],
            viewer = this.getViewer();
            
        this.getArticlesStore().each(function(article) {
            articles.push(this.loadArticle(null, article, true));
        }, this);
        
        viewer.add(articles);
        viewer.setActiveTab(articles[articles.length-1]);
    },

    viewArticle: function(btn) {
        this.loadArticle(null, btn.up('articlepreview').article);
    },

    /**
     * Loads the given article into a new tab
     * @param {FV.model.Article} article The article to load into a new tab
     */
    loadArticle: function(view, article, preventAdd) {
        var viewer = this.getViewer(),
            title = article.get('title'),
            articleId = article.id;
            
        tab = viewer.down('[articleId=' + articleId + ']');
        if (!tab) {
            tab = this.getArticleTab();
            tab.down('button[action=viewintab]').destroy();
        }

        tab.setTitle(title);
        tab.article = article;
        tab.articleId = articleId;
        tab.update(article.data);

        if (preventAdd !== true) {
            viewer.add(tab);
            viewer.setActiveTab(tab);            
        }
        
        return tab;
    }
});

