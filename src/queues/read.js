require('dotenv').load({ silent: true });

const assert = require('assert');
const { ObjectId } = require('mongodb');
const { logger } = require('../modules/logger');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE || ''}`;

/**
 * Fetch a sms templates which match with id and returns it in an array.
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo.
 * @return {array}        - an array of sms templates retrieved in database.
 */
async function readTemplateById(msg, mongo) {
  try {
    assert(msg.id, 'No id provided in the message');
    return [await mongo
      .collection(collectionName)
      .findOne({ _id: new ObjectId(msg.id) })];
  } catch (error) {
    logger.error(error.stack);
    throw new Error(error);
  }
}

/**
 * Fetch all sms templates which match with appId and returns it in an array
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo.
 * @return {array}        - an array of sms templates retrieved in database.
 */
async function readTemplatesByAppId(msg, mongo) {
  try {
    assert(msg.appId, 'No appId provided in the message');
    return await mongo
      .collection(collectionName)
      .find({ appId: msg.appId })
      .skip(msg.offset || parseInt(process.env.DEFAULT_OFFSET, 10))
      .limit(msg.limit || parseInt(process.env.DEFAULT_LIMIT, 10))
      .toArray();
  } catch (error) {
    logger.error(error.stack);
    throw new Error(error);
  }
}

/**
 * Read a sms template fetch by id or appId and returns it in object.
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo.
 * @return {object}       - an object with a boolean which represents the success of the function
 *                          if true, the returned object contains the sms template retrieved in database otherwise,
 *                          an object with an error and the provided message.
 */
const readTemplateFromMsg = mongo => async (msg) => {
  try {
    const smsTemplate = (msg.id) ? await readTemplateById(msg, mongo) : await readTemplatesByAppId(msg, mongo);

    if (smsTemplate && smsTemplate.length && !smsTemplate.includes(null)) {
      logger.info('Sms template found from the message consumed : ', smsTemplate);
      return ({ success: true, data: { document: smsTemplate }, meta: { msg } });
    }
    logger.error('Error with the id/appId, smsTemplate not found');
    return ({ success: false, error: new Error('Failed to read sms template from message'), meta: { msg } });
  } catch (error) {
    logger.error(error.stack);
    return ({ success: false, error: new Error(error), meta: { msg } });
  }
};

module.exports = { handleMsg: readTemplateFromMsg };
