const cp = require('child_process');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const _ = require('lodash');
const util = require('util');
const utils = require('../util/utils');
const Constants = require('../util/constants');
let env = Constants.RESERVED.ENV_DEV;
const os = require('os');
const cpus = {};
const pomelo = require('../pomelo');

class Starter
{
    /**
     * Run all servers
     *
     * @param {Object} app current application  context
     * @return {Void}
     */
	static runServers(app)
    {
		let server, servers;
		const condition = app.startId || app.type;
		switch (condition)
        {
		case Constants.RESERVED.MASTER:
			break;
		case Constants.RESERVED.ALL:
			{
				servers = app.ServersFromConfig;
				for (const serverId in servers)
                {
					this.run(app, servers[serverId]);
				}
				break;
			}
		default:
			{
				server = app.getServerFromConfig(condition);
				if (server)
                {
					this.run(app, server);
				}
				else
                {
					servers = app.get(Constants.RESERVED.SERVERS)[condition];
					for (let i = 0; i < servers.length; i++)
                    {
						this.run(app, servers[i]);
					}
				}
			}
		}
	}
    
    /**
     * Run server
     *
     * @param {Object} app current application context
     * @param {Object} server
     * @return {Void}
     */
	static run(app, server, cb)
    {
		env = app.get(Constants.RESERVED.ENV);
		let cmd, key;
		if (utils.isLocal(server.host))
        {
			let options = [];
			if (server.args)
            {
				if (typeof server.args === 'string')
                {
					options.push(server.args.trim());
				}
				else
                {
					options = options.concat(server.args);
				}
			}
			cmd = app.get(Constants.RESERVED.MAIN);
			options.push(cmd);
			options.push(util.format('env=%s', env));
			for (key in server)
            {
				if (key === Constants.RESERVED.CPU)
                {
					cpus[server.id] = server[key];
				}
				options.push(util.format('%s=%s', key, server[key]));
			}
			Starter.localrun(process.execPath, null, options, cb);
		}
		else
        {
			cmd = util.format('cd "%s" && "%s"', app.Base, process.execPath);
			const arg = server.args;
            // todo 待測試
			if (!_.isUndefined(arg))
            {
				cmd += arg;
			}
			cmd += util.format(' "%s" env=%s ', app.get(Constants.RESERVED.MAIN), env);
			for (key in server)
            {
				if (key === Constants.RESERVED.CPU)
                {
					cpus[server.id] = server[key];
				}
				cmd += util.format(' %s=%s ', key, server[key]);
			}
			Starter.sshrun(cmd, server.host, cb);
		}
	}

    /**
     * Bind process with cpu
     *
     * @param {String} sid server id
     * @param {String} pid process id
     * @param {String} host server host
     * @return {Void}
     */
	static bindCpu(sid, pid, host)
    {
		if (os.platform() === Constants.PLATFORM.LINUX && !_.isUndefined(cpus[sid]))
        {
			if (utils.isLocal(host))
            {
				const options = [];
				options.push('-pc');
				options.push(cpus[sid]);
				options.push(pid);
				Starter.localrun(Constants.COMMAND.TASKSET, null, options);
			}
			else
            {
				const cmd = util.format('taskset -pc "%s" "%s"', cpus[sid], pid);
				Starter.sshrun(cmd, host, null);
			}
		}
	}

    /**
     * Kill application in all servers
     *
     * @param {String} pids  array of server's pid
     * @param {String} serverIds array of serverId
     */
	static kill(pids, servers)
    {
		let cmd;
		for (let i = 0; i < servers.length; i++)
        {
			const server = servers[i];
			if (utils.isLocal(server.host))
            {
				const options = [];
				if (os.platform() === Constants.PLATFORM.WIN)
                {
					cmd = Constants.COMMAND.TASKKILL;
					options.push('/pid');
					options.push('/f');
				}
				else
                {
					cmd = Constants.COMMAND.KILL;
					options.push(-9);
				}
				options.push(pids[i]);
				Starter.localrun(cmd, null, options);
			}
			else
            {
				if (os.platform() === Constants.PLATFORM.WIN)
                {
					cmd = util.format('taskkill /pid %s /f', pids[i]);
				}
				else
                {
					cmd = util.format('kill -9 %s', pids[i]);
				}
				Starter.sshrun(cmd, server.host);
			}
		}
	}

    /**
     * Use ssh to run command.
     *
     * @param {String} cmd command that would be executed in the remote server
     * @param {String} host remote server host
     * @param {Function} cb callback function
     *
     */
	static sshrun(cmd, host, cb)
    {
		let args = [];
		args.push(host);
		const sshParams = pomelo.app.get(Constants.RESERVED.SSH_CONFIG_PARAMS);
		if (sshParams && Array.isArray(sshParams))
        {
			args = args.concat(sshParams);
		}
		args.push(cmd);

		logger.info(`Executing ${cmd} on ${host}:22`);
		StarterUtility.spawnProcess(Constants.COMMAND.SSH, host, args, cb);
		return;
	}

    /**
     * Run local command.
     *
     * @param {String} cmd
     * @param {Callback} callback
     *
     */
	static localrun(cmd, host, options, callback)
    {
		logger.info(`Executing ${cmd} ${options} locally`);
		StarterUtility.spawnProcess(cmd, host, options, callback);
	}
}

class StarterUtility
{
    /**
     * Fork child process to run command.
     *
     * @param {String} command
     * @param {String} host
     * @param {Object} options
     * @param {Function} cb
     */
	static spawnProcess(command, host, options, cb)
    {
		let child = null;

		if (env === Constants.RESERVED.ENV_DEV)
        {
			child = cp.spawn(command, options);
			const prefix = command === Constants.COMMAND.SSH ? `[${host}] ` : '';

			child.stderr.on('data', function(chunk)
            {
				const msg = chunk.toString();
				process.stderr.write(msg);
				if (cb)
                {
					cb(msg);
				}
			});

			child.stdout.on('data', function(chunk)
            {
				const msg = prefix + chunk.toString();
				process.stdout.write(msg);
			});
		}
		else
        {
			child = cp.spawn(command, options, {
				detached : true,
				stdio    : 'inherit'});
			child.unref();
		}

		child.on('exit', function(code)
        {
			if (code !== 0)
            {
				logger.warn('child process exit with error, error code: %s, executed command: %s', code, command);
			}
			if (typeof cb === 'function')
            {
				cb(code === 0 ? null : code);
			}
		});
	}
}

module.exports = Starter;