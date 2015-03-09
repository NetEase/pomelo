module.exports = {
  KEYWORDS: {
    BEFORE_FILTER: '__befores__',
    AFTER_FILTER: '__afters__',
    GLOBAL_BEFORE_FILTER: '__globalBefores__',
    GLOBAL_AFTER_FILTER: '__globalAfters__',
    ROUTE: '__routes__',
    BEFORE_STOP_HOOK: '__beforeStopHook__',
    MODULE: '__modules__',
    SERVER_MAP: '__serverMap__',
    RPC_BEFORE_FILTER: '__rpcBefores__',
    RPC_AFTER_FILTER: '__rpcAfters__',
    MASTER_WATCHER: '__masterwatcher__',
    MONITOR_WATCHER: '__monitorwatcher__'
 },

  FILEPATH: {
    MASTER: '/config/master.json',
    SERVER: '/config/servers.json',
    CRON: '/config/crons.json',
    LOG: '/config/log4js.json',
    SERVER_PROTOS: '/config/serverProtos.json',
    CLIENT_PROTOS: '/config/clientProtos.json',
    MASTER_HA: '/config/masterha.json',
    LIFECYCLE: '/lifecycle.js',
    SERVER_DIR: '/app/servers/',
    CONFIG_DIR: '/config'
  },

  DIR: {
    HANDLER: 'handler',
    REMOTE: 'remote',
    CRON: 'cron',
    LOG: 'logs',
    SCRIPT: 'scripts',
    EVENT: 'events',
    COMPONENT: 'components'
  },

  RESERVED: {
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
    TYPE: 'type',
    CLUSTER: 'clusters',
    STAND_ALONE: 'stand-alone',
    START: 'start',
    AFTER_START: 'afterStart',
    CRONS: 'crons',
    ERROR_HANDLER: 'errorHandler',
    GLOBAL_ERROR_HANDLER: 'globalErrorHandler',
    AUTO_RESTART: 'auto-restart',
    RESTART_FORCE: 'restart-force',
    CLUSTER_COUNT: 'clusterCount',
    CLUSTER_PREFIX: 'cluster-server-',
    CLUSTER_SIGNAL: '++',
    RPC_ERROR_HANDLER: 'rpcErrorHandler',
    SERVER: 'server',
    CLIENT: 'client',
    STARTID: 'startId',
    STOP_SERVERS: 'stop_servers',
    SSH_CONFIG_PARAMS: 'ssh_config_params'
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
  },

  SIGNAL: {
    FAIL: 0,
    OK: 1
  },

 TIME: {
   TIME_WAIT_STOP: 3 * 1000,
   TIME_WAIT_KILL: 5 * 1000,
   TIME_WAIT_RESTART: 5 * 1000,
   TIME_WAIT_COUNTDOWN: 10 * 1000,
   TIME_WAIT_MASTER_KILL: 2 * 60 * 1000,
   TIME_WAIT_MONITOR_KILL: 2 * 1000,
   TIME_WAIT_PING: 30 * 1000,
   TIME_WAIT_MAX_PING: 5 * 60 * 1000,
   DEFAULT_UDP_HEARTBEAT_TIME: 20 * 1000,
   DEFAULT_UDP_HEARTBEAT_TIMEOUT: 100 * 1000,
   DEFAULT_MQTT_HEARTBEAT_TIMEOUT: 90 * 1000
 }
};