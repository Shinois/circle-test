require('dotenv').load({ silent: true });

const db = require('./modules/db');
const { logger } = require('./modules/logger');
const { consumer } = require('bunnymq')({ host: process.env.AMQP_URL });
const {
  create,
  update,
  remove,
  read
} = require('./queues/index');

let database;

/**
 * Consume a message from a specify queue
 * to create, read, update or remove a sms template.
 */
module.exports = async () => {
  database = await db.connect();

  consumer.consume('sms:template:create', create.handleMsg(database));
  consumer.consume('sms:template:read', read.handleMsg(database));
  consumer.consume('sms:template:update', update.handleMsg(database));
  consumer.consume('sms:template:delete', remove.handleMsg(database));
  logger.info('Module listening on sms:template queues');
};

const gracefulShutdown = () => {
  if (database) db.disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (err) => {
  logger.error(err);
});
process.on('unhandledRejection', (reason) => {
  logger.error(reason);
});

