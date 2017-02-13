'use strict';

const async = require('async');
const plog = require('pomelo-logger');

const utils = require('../../util/utils');
const logger = plog.getLogger('pomelo', __filename);
const trxLogger = plog.getLogger('transaction-log', __filename);
const trxErrorLogger = plog.getLogger('transaction-error-log', __filename);

const manager = module.exports;

manager.transaction = function(name, conditions, handlers, retry) {
  if (retry === undefined) {
    retry = 1;
  }

  if (typeof name !== 'string') {
    logger.error('transaction name is error format, name: %s.', name);
    return;
  }

  if (typeof conditions !== 'object' || typeof handlers !== 'object') {
    logger.error('transaction conditions parameter is error format, ' +
                 'conditions: %j, handlers: %j.', conditions, handlers);
    return;
  }

  const cmethods = [];
  const cnames = [];
  let key;
  for (key in conditions) {
    if (typeof key !== 'string' ||
        typeof conditions[key] !== 'function') {
      logger.error('transaction conditions parameter is error format, ' +
                   'condition name: %s, condition function: %j.',
                   key, conditions[key]);
      return;
    }
    cnames.push(key);
    cmethods.push(conditions[key]);
  }

  const dmethods = [];
  const dnames = [];
  let i = 0;
  // execute conditions
  async.forEachSeries(cmethods, (method, cb) => {
    method(cb);
    trxLogger.info('[%s]:[%s] condition is executed.',
                   name, cnames[i]);
    i++;
  }, (err) => {
    if (err) {
      process.nextTick(() => {
        trxLogger.error('[%s]:[%s] condition is executed with err: %j.',
                        name, cnames[--i], err.stack);
        const log = {
          name: name,
          method: cnames[i],
          time: Date.now(),
          type: 'condition',
          description: err.stack
        };
        trxErrorLogger.error(JSON.stringify(log));
      });
      return;
    } else {
      // execute handlers
      process.nextTick(() => {
        let key;
        for (key in handlers) {
          if (typeof key !== 'string' ||
              typeof handlers[key] !== 'function') {
            logger.error('transcation handlers parameter is error format,' +
                         'handler name: %s, handler function: %j.',
                         key, handlers[key]);
            return;
          }
          dnames.push(key);
          dmethods.push(handlers[key]);
        }

        let flag = true;
        const times = retry;

        // do retry if failed util retry times
        async.whilst(
          () => {
            return retry > 0 && flag;
          },
          (callback) => {
            let j = 0;
            retry--;
            async.forEachSeries(dmethods, (method, cb) => {
              method(cb);
              trxLogger.info('[%s]:[%s] handler is executed.',
                             name, dnames[j]);
              j++;
            }, (err) => {
              if (err) {
                process.nextTick(() => {
                  trxLogger.error('[%s]:[%s]:[%s] handler is executed ' +
                                  'with err: %j.', name, dnames[--j],
                                  times - retry, err.stack);
                  const log = {
                    name: name,
                    method: dnames[j],
                    retry: times - retry,
                    time: Date.now(),
                    type: 'handler',
                    description: err.stack
                  };
                  trxErrorLogger.error(JSON.stringify(log));
                  utils.invokeCallback(callback);
                });
                return;
              }
              flag = false;
              utils.invokeCallback(callback);
              process.nextTick(() => {
                trxLogger.info('[%s] all conditions and handlers ' +
                               'are executed successfully.', name);
              });
            });
          },
          (err) => {
            if (err) {
              logger.error('transaction process is executed with error: %j',
                           err);
            }
            // callback will not pass error
          }
        );
      });
    }
  });
};
