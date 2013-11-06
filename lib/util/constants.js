module.exports = {
  KeyWords: {
    BEFORE_FILTER: '__befores__',
    AFTER_FILTER: '__afters__',
   	GLOBAL_BEFORE_FILTER: '__globalBefores__',
 	  GLOBAL_AFTER_FILTER: '__globalAfters__',
 	  ROUTE: '__routes__',
 	  BEFORE_STOP_HOOK: '__beforeStopHook__',
 	  MODULE: '__modules__',
 	  SERVER_MAP: '__serverMap__'
 },

  FilePath: {
 	  MASTER: '/config/master.json',
 	  SERVER: '/config/servers.json',
 	  CRON: '/config/crons.json',
 	  LOG: '/config/log4js.json',
 	  SERVER_PROTOS: '/config/serverProtos.json',
 	  CLIENT_PROTOS: '/config/clientProtos.json'
 },

  Dir: {
  	HANDLER: 'handler',
  	REMOTE: 'remote',
  	CRON: 'cron',
  	LOG: 'logs',
  	SCRIPT: 'scripts',
  	EVENT: 'events',
  	COMPONENT: 'components'
 },

 Reserved: {
 	 BASE: 'base',
 	 MAIN: 'main',
   MASTER: 'master',
   SERVERS: 'servers',
   ENV: 'env',
   CPU: 'cpu',
   ENV_DEV: 'development',
   ENV_PRO: 'production',
   ALL: 'all',
   SERVER_TYPE: 'serverType',
   SERVER_ID: 'serverId',
   CURRENT_SERVER: 'curServer',
   MODE: 'mode',
   CLUSTER: 'clusters',
   STAND_ALONE: 'stand-alone',
   START: 'start',
   AFTER_START: 'afterStart',
   CRONS: 'crons',
   ERROR_HANDLER: 'errorHandler',
   GLOBAL_ERROR_HANDLER: 'globalErrorHandler',
   AUTO_RESTART: 'auto-restart'
 },

 COMMAND: {
   TASKSET: 'taskset',
   KILL: 'kill',
   TASKKILL: 'taskkill',
   SSH: 'ssh'
 },

 PLATFORM: {
   WIN: 'win32',
   LINUX: 'linux'
 }
};