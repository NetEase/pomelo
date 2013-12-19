module.exports = {
  KeyWords: {
    BEFORE_FILTER: '__befores__',
    AFTER_FILTER: '__afters__',
   	GLOBAL_BEFORE_FILTER: '__globalBefores__',
 	  GLOBAL_AFTER_FILTER: '__globalAfters__',
 	  ROUTE: '__routes__',
 	  BEFORE_STOP_HOOK: '__beforeStopHook__',
 	  MODULE: '__modules__',
 	  SERVER_MAP: '__serverMap__',
    RPC_BEFORE_FILTER: '__rpcBefores__',
    RPC_AFTER_FILTER: '__rpcAfters__'
 },

  FilePath: {
    MASTER: '/config/master.json',
    SERVER: '/config/servers.json',
    CRON: '/config/crons.json',
    LOG: '/config/log4js.json',
    SERVER_PROTOS: '/config/serverProtos.json',
    CLIENT_PROTOS: '/config/clientProtos.json',
    MASTER_HA: '/config/masterha.json',
    LIFECYCLE: '/lifecycle.js',
    SERVER_DIR: '/app/servers/'
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
    AUTO_RESTART: 'auto-restart',
    CLUSTER_COUNT: 'clusterCount',
    CLUSTER_PREFIX: 'cluster-server-',
    CLUSTER_SIGNAL: '++'
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
  },

  LIFECYCLE: {
   BEFORE_STARTUP: 'beforeStartup',
   BEFORE_SHUTDOWN: 'beforeShutdown',
   AFTER_STARTUP: 'afterStartup',
   AFTER_STARTALL: 'afterStartAll'
 }
};