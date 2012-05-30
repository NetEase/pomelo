/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
 * @extends {WebInspector.Panel}
 */
WebInspector.AuditsPanel = function()
{
    WebInspector.Panel.call(this, "audits");
    this.registerRequiredCSS("panelEnablerView.css");
    this.registerRequiredCSS("auditsPanel.css");

    this.createSplitViewWithSidebarTree();
    this.auditsTreeElement = new WebInspector.SidebarSectionTreeElement("", {}, true);
    this.sidebarTree.appendChild(this.auditsTreeElement);
    this.auditsTreeElement.listItemElement.addStyleClass("hidden");

    this.auditsItemTreeElement = new WebInspector.AuditsSidebarTreeElement();
    this.auditsTreeElement.appendChild(this.auditsItemTreeElement);

    this.auditResultsTreeElement = new WebInspector.SidebarSectionTreeElement(WebInspector.UIString("RESULTS"), {}, true);
    this.sidebarTree.appendChild(this.auditResultsTreeElement);
    this.auditResultsTreeElement.expand();

    this.clearResultsButton = new WebInspector.StatusBarButton(WebInspector.UIString("Clear audit results."), "clear-status-bar-item");
    this.clearResultsButton.addEventListener("click", this._clearButtonClicked, this);

    this.viewsContainerElement = this.splitView.mainElement;

    this._constructCategories();

    this._launcherView = new WebInspector.AuditLauncherView(this.initiateAudit.bind(this), this.terminateAudit.bind(this));
    for (var id in this.categoriesById)
        this._launcherView.addCategory(this.categoriesById[id]);

    WebInspector.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.OnLoad, this._didMainResourceLoad, this);
}

WebInspector.AuditsPanel.prototype = {
    get toolbarItemLabel()
    {
        return WebInspector.UIString("Audits");
    },

    get statusBarItems()
    {
        return [this.clearResultsButton.element];
    },

    get categoriesById()
    {
        return this._auditCategoriesById;
    },

    addCategory: function(category)
    {
        this.categoriesById[category.id] = category;
        this._launcherView.addCategory(category);
    },

    getCategory: function(id)
    {
        return this.categoriesById[id];
    },

    _constructCategories: function()
    {
        this._auditCategoriesById = {};
        for (var categoryCtorID in WebInspector.AuditCategories) {
            var auditCategory = new WebInspector.AuditCategories[categoryCtorID]();
            auditCategory._id = categoryCtorID;
            this.categoriesById[categoryCtorID] = auditCategory;
        }
    },

    _executeAudit: function(categories, resultCallback)
    {
        var resources = WebInspector.networkLog.resources;

        var rulesRemaining = 0;
        for (var i = 0; i < categories.length; ++i)
            rulesRemaining += categories[i].ruleCount;

        this._progressMonitor.setTotalWork(rulesRemaining);

        var results = [];
        var mainResourceURL = WebInspector.inspectedPageURL;

        function ruleResultReadyCallback(categoryResult, ruleResult)
        {
            if (this._progressMonitor.canceled)
                return;

            if (ruleResult && ruleResult.children)
                categoryResult.addRuleResult(ruleResult);

            --rulesRemaining;
            this._progressMonitor.worked(1);

            if (this._progressMonitor.done() && resultCallback)
                resultCallback(mainResourceURL, results);
        }

        if (this._progressMonitor.done()) {
            resultCallback(mainResourceURL, results);
            return;
        }

        for (var i = 0; i < categories.length; ++i) {
            var category = categories[i];
            var result = new WebInspector.AuditCategoryResult(category);
            results.push(result);
            category.run(resources, ruleResultReadyCallback.bind(this, result), this._progressMonitor);
        }
    },

    _auditFinishedCallback: function(launcherCallback, mainResourceURL, results)
    {
        var children = this.auditResultsTreeElement.children;
        var ordinal = 1;
        for (var i = 0; i < children.length; ++i) {
            if (children[i].mainResourceURL === mainResourceURL)
                ordinal++;
        }

        var resultTreeElement = new WebInspector.AuditResultSidebarTreeElement(results, mainResourceURL, ordinal);
        this.auditResultsTreeElement.appendChild(resultTreeElement);
        resultTreeElement.revealAndSelect();
        if (!this._progressMonitor.canceled && launcherCallback)
            launcherCallback();
    },

    initiateAudit: function(categoryIds, progressElement, runImmediately, launcherCallback)
    {
        if (!categoryIds || !categoryIds.length)
            return;

        this._progressMonitor = new WebInspector.AuditProgressMonitor(progressElement);

        var categories = [];
        for (var i = 0; i < categoryIds.length; ++i)
            categories.push(this.categoriesById[categoryIds[i]]);

        function initiateAuditCallback(categories, launcherCallback)
        {
            this._executeAudit(categories, this._auditFinishedCallback.bind(this, launcherCallback));
        }

        if (runImmediately)
            initiateAuditCallback.call(this, categories, launcherCallback);
        else
            this._reloadResources(initiateAuditCallback.bind(this, categories, launcherCallback));

        WebInspector.userMetrics.AuditsStarted.record();
    },

    terminateAudit: function(launcherCallback)
    {
        this._progressMonitor.canceled = true;
        launcherCallback();
    },

    _reloadResources: function(callback)
    {
        this._pageReloadCallback = callback;
        PageAgent.reload(false);
    },

    _didMainResourceLoad: function()
    {
        if (this._pageReloadCallback) {
            var callback = this._pageReloadCallback;
            delete this._pageReloadCallback;
            callback();
        }
    },

    showResults: function(categoryResults)
    {
        if (!categoryResults._resultView)
            categoryResults._resultView = new WebInspector.AuditResultView(categoryResults);

        this.visibleView = categoryResults._resultView;
    },

    showLauncherView: function()
    {
        this.visibleView = this._launcherView;
    },

    get visibleView()
    {
        return this._visibleView;
    },

    set visibleView(x)
    {
        if (this._visibleView === x)
            return;

        if (this._visibleView)
            this._visibleView.detach();

        this._visibleView = x;

        if (x)
            x.show(this.viewsContainerElement);
    },

    wasShown: function()
    {
        WebInspector.Panel.prototype.wasShown.call(this);
        if (!this._visibleView)
            this.auditsItemTreeElement.select();
    },

    _clearButtonClicked: function()
    {
        this.auditsItemTreeElement.revealAndSelect();
        this.auditResultsTreeElement.removeChildren();
    }
}

WebInspector.AuditsPanel.prototype.__proto__ = WebInspector.Panel.prototype;

/**
 * @constructor
 */
WebInspector.AuditCategory = function(displayName)
{
    this._displayName = displayName;
    this._rules = [];
}

WebInspector.AuditCategory.prototype = {
    get id()
    {
        // this._id value is injected at construction time.
        return this._id;
    },

    get displayName()
    {
        return this._displayName;
    },

    get ruleCount()
    {
        this._ensureInitialized();
        return this._rules.length;
    },

    addRule: function(rule, severity)
    {
        rule.severity = severity;
        this._rules.push(rule);
    },

    run: function(resources, callback, progressMonitor)
    {
        this._ensureInitialized();
        for (var i = 0; i < this._rules.length; ++i)
            this._rules[i].run(resources, callback, progressMonitor);
    },

    _ensureInitialized: function()
    {
        if (!this._initialized) {
            if ("initialize" in this)
                this.initialize();
            this._initialized = true;
        }
    }
}

/**
 * @constructor
 */
WebInspector.AuditRule = function(id, displayName)
{
    this._id = id;
    this._displayName = displayName;
}

WebInspector.AuditRule.Severity = {
    Info: "info",
    Warning: "warning",
    Severe: "severe"
}

WebInspector.AuditRule.SeverityOrder = {
    "info": 3,
    "warning": 2,
    "severe": 1
}

WebInspector.AuditRule.prototype = {
    get id()
    {
        return this._id;
    },

    get displayName()
    {
        return this._displayName;
    },

    set severity(severity)
    {
        this._severity = severity;
    },

    run: function(resources, callback, progressMonitor)
    {
        if (progressMonitor.canceled)
            return;

        var result = new WebInspector.AuditRuleResult(this.displayName);
        result.severity = this._severity;
        this.doRun(resources, result, callback, progressMonitor);
    },

    doRun: function(resources, result, callback, progressMonitor)
    {
        throw new Error("doRun() not implemented");
    }
}

/**
 * @constructor
 */
WebInspector.AuditCategoryResult = function(category)
{
    this.title = category.displayName;
    this.ruleResults = [];
}

WebInspector.AuditCategoryResult.prototype = {
    addRuleResult: function(ruleResult)
    {
        this.ruleResults.push(ruleResult);
    }
}

/**
 * @constructor
 * @param {boolean=} expanded
 * @param {string=} className
 */
WebInspector.AuditRuleResult = function(value, expanded, className)
{
    this.value = value;
    this.className = className;
    this.expanded = expanded;
    this.violationCount = 0;
    this._formatters = {
        r: WebInspector.AuditRuleResult.linkifyDisplayName
    };
    var standardFormatters = Object.keys(String.standardFormatters);
    for (var i = 0; i < standardFormatters.length; ++i)
        this._formatters[standardFormatters[i]] = String.standardFormatters[standardFormatters[i]];
}

WebInspector.AuditRuleResult.linkifyDisplayName = function(url)
{
    return WebInspector.linkifyURLAsNode(url, WebInspector.displayNameForURL(url));
}

WebInspector.AuditRuleResult.resourceDomain = function(domain)
{
    return domain || WebInspector.UIString("[empty domain]");
}

WebInspector.AuditRuleResult.prototype = {
    /**
     * @param {boolean=} expanded
     * @param {string=} className
     */
    addChild: function(value, expanded, className)
    {
        if (!this.children)
            this.children = [];
        var entry = new WebInspector.AuditRuleResult(value, expanded, className);
        this.children.push(entry);
        return entry;
    },

    addURL: function(url)
    {
        return this.addChild(WebInspector.AuditRuleResult.linkifyDisplayName(url));
    },

    addURLs: function(urls)
    {
        for (var i = 0; i < urls.length; ++i)
            this.addURL(urls[i]);
    },

    addSnippet: function(snippet)
    {
        return this.addChild(snippet, false, "source-code");
    },

    /**
     * @param {string} format
     * @param {...*} vararg
     */
    addFormatted: function(format, vararg)
    {
        var substitutions = Array.prototype.slice.call(arguments, 1);
        var fragment = document.createDocumentFragment();

        var formattedResult = String.format(format, substitutions, this._formatters, fragment, this._append).formattedResult;
        if (formattedResult instanceof Node)
            formattedResult.normalize();
        return this.addChild(formattedResult);
    },

    _append: function(a, b)
    {
        if (!(b instanceof Node))
            b = document.createTextNode(b);
        a.appendChild(b);
        return a;
    }
}

/**
 * @constructor
 * @param {Element} progressElement
 */
WebInspector.AuditProgressMonitor = function(progressElement)
{
    this._element = progressElement;
    this.setTotalWork(WebInspector.AuditProgressMonitor.INDETERMINATE);
}

WebInspector.AuditProgressMonitor.INDETERMINATE = -1;

WebInspector.AuditProgressMonitor.prototype = {
    setTotalWork: function(total)
    {
        if (this.canceled || this._total === total)
            return;
        this._total = total;
        this._value = 0;
        this._element.max = total;
        if (total === WebInspector.AuditProgressMonitor.INDETERMINATE)
            this._element.removeAttribute("value");
        else
            this._element.value = 0;
    },

    worked: function(items)
    {
        if (this.canceled || this.indeterminate || this.done())
            return;
        this._value += items;
        if (this._value > this._total)
            this._value = this._total;
        this._element.value = this._value;
    },

    get indeterminate()
    {
        return this._total === WebInspector.AuditProgressMonitor.INDETERMINATE;
    },

    done: function()
    {
        return !this.indeterminate && (this.canceled || this._value === this._total);
    },

    get canceled()
    {
        return !!this._canceled;
    },

    set canceled(x)
    {
        if (this._canceled === x)
            return;
        if (x)
            this.setTotalWork(WebInspector.AuditProgressMonitor.INDETERMINATE);
        this._canceled = x;
    }
}

/**
 * @constructor
 * @extends {WebInspector.SidebarTreeElement}
 */
WebInspector.AuditsSidebarTreeElement = function()
{
    this.small = false;

    WebInspector.SidebarTreeElement.call(this, "audits-sidebar-tree-item", WebInspector.UIString("Audits"), "", null, false);
}

WebInspector.AuditsSidebarTreeElement.prototype = {
    onattach: function()
    {
        WebInspector.SidebarTreeElement.prototype.onattach.call(this);
    },

    onselect: function()
    {
        WebInspector.panels.audits.showLauncherView();
    },

    get selectable()
    {
        return true;
    },

    refresh: function()
    {
        this.refreshTitles();
    }
}

WebInspector.AuditsSidebarTreeElement.prototype.__proto__ = WebInspector.SidebarTreeElement.prototype;

/**
 * @constructor
 * @extends {WebInspector.SidebarTreeElement}
 */
WebInspector.AuditResultSidebarTreeElement = function(results, mainResourceURL, ordinal)
{
    this.results = results;
    this.mainResourceURL = mainResourceURL;

    WebInspector.SidebarTreeElement.call(this, "audit-result-sidebar-tree-item", String.sprintf("%s (%d)", mainResourceURL, ordinal), "", {}, false);
}

WebInspector.AuditResultSidebarTreeElement.prototype = {
    onselect: function()
    {
        WebInspector.panels.audits.showResults(this.results);
    },

    get selectable()
    {
        return true;
    }
}

WebInspector.AuditResultSidebarTreeElement.prototype.__proto__ = WebInspector.SidebarTreeElement.prototype;

// Contributed audit rules should go into this namespace.
WebInspector.AuditRules = {};

// Contributed audit categories should go into this namespace.
WebInspector.AuditCategories = {};
