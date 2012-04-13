/**
 * This file is included by your test/unit/index.html file and is used to apply settings before 
 * the tests are run.
 */

Ext.ns('fixtures');

//Stops the Application from being booted up automatically
Ext.Application.prototype.bindReady = Ext.emptyFn;
