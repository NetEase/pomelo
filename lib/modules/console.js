/* !
 * Pomelo -- consoleModule serverStop stop/kill
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const countDownLatch = require('../util/countDownLatch');
const utils = require('../util/utils');
const Constants = require('../util/constants');
const starter = require('../master/starter');
const exec = require('child_process').exec;

module.exports = (opts) =>
{
	return new Module(opts);
};

module.exports.moduleId = '__console__';

class Module
{
	constructor(opts)
    {
		opts = opts || {};
		this.app = opts.app;
		this.starter = opts.starter;
	}

	monitorHandler(agent, msg, cb)
    {
		const serverId = agent.id;
		switch (msg.signal)
        {
		case 'stop':
			if (agent.type === Constants.RESERVED.MASTER)
            {
				return;
			}
			this.app.stop(true);
			break;
		case 'list':
			{
				const serverType = agent.type;
				const pid = process.pid;
				const heapUsed = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);
				const rss = (process.memoryUsage().rss / (1024 * 1024)).toFixed(2);
				const heapTotal = (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2);
				const uptime = (process.uptime() / 60).toFixed(2);
				utils.invokeCallback(cb, {
					serverId : serverId,
					body     : {
						serverId   : serverId,
						serverType : serverType,
						pid        : pid,
						rss        : rss,
						heapTotal  : heapTotal,
						heapUsed   : heapUsed,
						uptime     : uptime
					}
				});
				break;
			}
		case 'kill':
			{
				utils.invokeCallback(cb, serverId);
				if (agent.type !== 'master')
                {
					setTimeout(() =>
                    {
						process.exit(-1);
					}, Constants.TIME.TIME_WAIT_MONITOR_KILL);
				}
				break;
			}
		case 'addCron':
			this.app.addCrones([msg.cron]);
			break;
		case 'removeCron':
			this.app.removeCrones([msg.cron]);
			break;
		case 'blacklist':
			{
				if (this.app.isFrontend())
                {
					const connector = this.app.components.__connector__;
					connector.blacklist = connector.blacklist.concat(msg.blacklist);
				}
				break;
			}
		case 'restart':
			{
				if (agent.type === Constants.RESERVED.MASTER)
                {
					return;
				}
				const self = this;
				const server = this.app.get(Constants.RESERVED.CURRENT_SERVER);
				utils.invokeCallback(cb, server);
				process.nextTick(() =>
                {
					self.app.stop(true);
				});
				break;
			}
		default:
			logger.error('receive error signal: %j', msg);
			break;
		}
	}

	clientHandler(agent, msg, cb)
    {
		const app = this.app;
		switch (msg.signal)
        {
		case 'kill':
			ConsoleUtility.kill(app, agent, msg, cb);
			break;
		case 'stop':
			ConsoleUtility.stop(app, agent, msg, cb);
			break;
		case 'list':
			ConsoleUtility.list(agent, msg, cb);
			break;
		case 'add':
			ConsoleUtility.add(app, msg, cb);
			break;
		case 'addCron':
			ConsoleUtility.addCron(app, agent, msg, cb);
			break;
		case 'removeCron':
			ConsoleUtility.removeCron(app, agent, msg, cb);
			break;
		case 'blacklist':
			ConsoleUtility.blacklist(agent, msg, cb);
			break;
		case 'restart':
			ConsoleUtility.restart(app, agent, msg, cb);
			break;
		default:
			utils.invokeCallback(cb, new Error('The command cannot be recognized, please check.'), null);
			break;
		}
	}

}

class ConsoleUtility
{
	static kill(app, agent, msg, cb)
    {
		let sid, record;
		const serverIds = [];
		const count = utils.size(agent.idMap);
		const latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_MASTER_KILL}, isTimeout =>
        {
			if (!isTimeout)
            {
				utils.invokeCallback(cb, null, {code: 'ok'});
			}
			else
            {
				utils.invokeCallback(cb, null, {
					code      : 'remained',
					serverIds : serverIds
				});
			}
			setTimeout(() =>
            {
				process.exit(-1);
			}, Constants.TIME.TIME_WAIT_MONITOR_KILL);
		});

		const agentRequestCallback = msg =>
        {
			for (let i = 0; i < serverIds.length; ++i)
            {
				if (serverIds[i] === msg)
                {
					serverIds.splice(i, 1);
					latch.done();
					break;
				}
			}
		};

		for (sid in agent.idMap)
        {
			record = agent.idMap[sid];
			serverIds.push(record.id);
			agent.request(record.id, module.exports.moduleId, {signal: msg.signal}, agentRequestCallback);
		}
	}

	static stop(app, agent, msg, cb)
    {
		const serverIds = msg.ids;
		if (serverIds && serverIds.length)
        {
			const servers = app.Servers;
			app.set(Constants.RESERVED.STOP_SERVERS, serverIds);
			for (let i = 0; i < serverIds.length; i++)
            {
				const serverId = serverIds[i];
				if (!servers[serverId])
                {
					utils.invokeCallback(cb, new Error('Cannot find the server to stop.'), null);
				}
				else
                {
					agent.notifyById(serverId, module.exports.moduleId, {signal: msg.signal});
				}
			}
			utils.invokeCallback(cb, null, {status: 'part'});
		}
		else
        {
			agent.notifyAll(module.exports.moduleId, {signal: msg.signal});
			setTimeout(() =>
            {
				app.stop(true);
				utils.invokeCallback(cb, null, {status: 'all'});
			}, Constants.TIME.TIME_WAIT_STOP);
		}
	}

	static restart(app, agent, msg, cb)
    {
		let successFlag;
		const successIds = [];
		const serverIds = msg.ids;
		const type = msg.type;
		let servers;
		if (!serverIds.length && Boolean(type))
        {
			servers = app.getServersByType(type);
			if (!servers)
            {
				utils.invokeCallback(cb, new Error(`restart servers with unknown server type: ${type}`));
				return;
			}
			for (let i = 0; i < servers.length; i++)
            {
				serverIds.push(servers[i].id);
			}
		}
		else if (!serverIds.length)
        {
			servers = app.Servers;
			for (const key in servers)
            {
				serverIds.push(key);
			}
		}
		const count = serverIds.length;
		const latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, function()
        {
			if (!successFlag)
            {
				utils.invokeCallback(cb, new Error('all servers start failed.'));
				return;
			}
			utils.invokeCallback(cb, null, utils.arrayDiff(serverIds, successIds));
		});

		const request = id =>
        {
			return (() =>
            {
				agent.request(id, module.exports.moduleId, {signal: msg.signal}, (msg) =>
                {
					if (!utils.size(msg))
                    {
						latch.done();
						return;
					}
					setTimeout(() =>
                    {
						ConsoleUtility.runServer(app, msg, function(err, status)
                        {
							if (err)
                            {
								logger.error(`restart ${id} failed.`);
							}
							else
                            {
								successIds.push(id);
								successFlag = true;
							}
							latch.done();
						});
					}, Constants.TIME.TIME_WAIT_RESTART);
				});
			})();
		};

		for (let j = 0; j < serverIds.length; j++)
        {
			request(serverIds[j]);
		}
	}

	static list(agent, msg, cb)
    {
		let sid, record;
		const serverInfo = {};
		const count = utils.size(agent.idMap);
		const latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, () =>
        {
			utils.invokeCallback(cb, null, {msg: serverInfo});
		});

		const callback = (msg) =>
        {
			serverInfo[msg.serverId] = msg.body;
			latch.done();
		};
		for (sid in agent.idMap)
        {
			record = agent.idMap[sid];
			agent.request(record.id, module.exports.moduleId, {signal: msg.signal}, callback);
		}
	}

	static add(app, msg, cb)
    {
		if (ConsoleUtility.checkCluster(msg))
        {
			ConsoleUtility.startCluster(app, msg, cb);
		}
		else
        {
			ConsoleUtility.startServer(app, msg, cb);
		}
		ConsoleUtility.reset(ServerInfo);
	}

	static addCron(app, agent, msg, cb)
    {
		const cron = ConsoleUtility.parseArgs(msg, CronInfo, cb);
		ConsoleUtility.sendCronInfo(cron, agent, msg, CronInfo, cb);
	}

	static removeCron(app, agent, msg, cb)
    {
		const cron = ConsoleUtility.parseArgs(msg, RemoveCron, cb);
		ConsoleUtility.sendCronInfo(cron, agent, msg, RemoveCron, cb);
	}

	static blacklist(agent, msg, cb)
    {
		const ips = msg.args;
		for (let i = 0; i < ips.length; i++)
        {
			if (!(new RegExp(/(\d+)\.(\d+)\.(\d+)\.(\d+)/g).test(ips[i])))
            {
				utils.invokeCallback(cb, new Error(`blacklist ip: ${ips[i]} is error format.`), null);
				return;
			}
		}
		agent.notifyAll(module.exports.moduleId, {
			signal    : msg.signal,
			blacklist : msg.args});
		process.nextTick(() =>
        {
			cb(null, {status: 'ok'});
		});
	}

	static checkPort(server, cb)
    {
		if (!server.port && !server.clientPort)
        {
			utils.invokeCallback(cb, 'leisure');
			return;
		}

		let p = server.port || server.clientPort;
		const host = server.host;
		let cmd = 'netstat -tln | grep ';
		if (!utils.isLocal(host))
        {
			cmd = `ssh ${host} ${cmd}`;
		}

		exec(cmd + p, (err, stdout, stderr) =>
        {
			if (err)
            {
				logger.error(`exec ${err} failed.`);
			}
			if (stdout || stderr)
            {
				utils.invokeCallback(cb, 'busy');
			}
			else
            {
				p = server.clientPort;
				exec(cmd + p, (err, stdout, stderr) =>
                {
					if (err)
                    {
						logger.error(`exec ${err} failed.`);
					}
					if (stdout || stderr)
                    {
						utils.invokeCallback(cb, 'busy');
					}
					else
                    {
						utils.invokeCallback(cb, 'leisure');
					}
				});
			}
		});
	}

	static parseArgs(msg, info, cb)
    {
		const rs = {};
		const args = msg.args;
		for (let i = 0; i < args.length; i++)
        {
			if (args[i].indexOf('=') < 0)
            {
				cb(new Error('Error server parameters format.'), null);
				return;
			}
			const pairs = args[i].split('=');
			const key = pairs[0];
			if (info[key])
            {
				info[key] = 1;
			}
			rs[pairs[0]] = pairs[1];
		}
		return rs;
	}

	static sendCronInfo(cron, agent, msg, info, cb)
    {
		if (info && (cron.serverId || cron.serverType))
        {
			if (cron.serverId)
            {
				agent.notifyById(cron.serverId, module.exports.moduleId, {
					signal : msg.signal,
					cron   : cron});
			}
			else
            {
				agent.notifyByType(cron.serverType, module.exports.moduleId, {
					signal : msg.signal,
					cron   : cron});
			}
			process.nextTick(() =>
            {
				cb(null, {status: 'ok'});
			});
		}
		else
        {
			cb(new Error('Miss necessary server parameters.'), null);
		}
		ConsoleUtility.reset(info);
	}

	static startServer(app, msg, cb)
    {
		const server = ConsoleUtility.parseArgs(msg, ServerInfo, cb);
		if (ConsoleUtility.isReady(ServerInfo))
        {
			ConsoleUtility.runServer(app, server, cb);
		}
		else
        {
			cb(new Error('Miss necessary server parameters.'), null);
		}
	}

	static runServer(app, server, cb)
    {
		ConsoleUtility.checkPort(server, (status) =>
        {
			if (status === 'busy')
            {
				utils.invokeCallback(cb, new Error('Port occupied already, check your server to add.'));
			}
			else
            {
				starter.run(app, server, function(err)
                {
					if (err)
                    {
						utils.invokeCallback(cb, new Error(err), null);
						return;
					}
				});
				process.nextTick(() =>
                {
					utils.invokeCallback(cb, null, {status: 'ok'});
				});
			}
		});
	}

	static startCluster(app, msg, cb)
    {
		const serverMap = {};
		const fails = [];
		let successFlag;
		const serverInfo = ConsoleUtility.parseArgs(msg, ClusterInfo, cb);
		utils.loadCluster(app, serverInfo, serverMap);
		const count = utils.size(serverMap);
		const latch = countDownLatch.createCountDownLatch(count, () =>
        {
			if (!successFlag)
            {
				utils.invokeCallback(cb, new Error('all servers start failed.'));
				return;
			}
			utils.invokeCallback(cb, null, fails);
		});

		const start = (server) =>
        {
			return (() =>
            {
				ConsoleUtility.checkPort(server, (status) =>
                {
					if (status === 'busy')
                    {
						fails.push(server);
						latch.done();
					}
					else
                    {
						starter.run(app, server, (err) =>
                        {
							if (err)
                            {
								fails.push(server);
								latch.done();
							}
						});
						process.nextTick(() =>
                        {
							successFlag = true;
							latch.done();
						});
					}
				});
			})();
		};
		for (const key in serverMap)
        {
			const server = serverMap[key];
			start(server);
		}
	}

	static checkCluster(msg)
    {
		let flag = false;
		const args = msg.args;
		for (let i = 0; i < args.length; i++)
        {
			if (utils.startsWith(args[i], Constants.RESERVED.CLUSTER_COUNT))
            {
				flag = true;
			}
		}
		return flag;
	}

	static isReady(info)
    {
		for (const key in info)
        {
			if (info[key])
            {
				return false;
			}
		}
		return true;
	}

	static reset(info)
    {
		for (const key in info)
        {
			info[key] = 0;
		}
	}
}

const ServerInfo = {
	host       : 0,
	port       : 0,
	id         : 0,
	serverType : 0
};

const CronInfo = {
	id     : 0,
	action : 0,
	time   : 0
};

const RemoveCron = {
	id : 0
};

const ClusterInfo = {
	host         : 0,
	port         : 0,
	clusterCount : 0
};