require('dotenv').load({ silent: true });

const assert = require('assert');
const { logger } = require('../modules/logger');
const SMSTemplate = require('../models/sms-template');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE || ''}`;

/**
 * Check the validity of the message consumed,
 * create a sms template from it and returns it in object.
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo.
 * @return {object}       - an object with a boolean which represents the success of the function
 *                          if true, the returned object contains the sms template created in database otherwise,
 *                          an object with an error and the provided message.
 */
const createTemplateFromMsg = mongo => async (msg) => {
  try {
    assert(msg.appId, 'No appId provided in the message');
    assert(msg.name, 'No name provided in the message');
    assert(msg.text, 'No text provided in the message');
    if (msg.data && msg.data.doUrl) {
      assert(msg.data.doUrl.phoneNumber, 'No doUrl.phoneNumber provided in the message');
      assert(msg.data.doUrl.action, 'No doUrl.action provided in the message');
      assert(msg.data.doUrl.culture, 'No doUrl.culture provided in the message');
    }
  } catch (error) {
    logger.error(error.stack);
    return ({ success: false, data: { error, msg } });
  }

  const smsTemplate = new SMSTemplate(msg.appId, msg.name, msg.text, msg.data);
  const res = await mongo
    .collection(collectionName)
    .insertOne(smsTemplate);

  if (res.result.ok !== 1) {
    logger.error('Failed to insert document in mongo database');
    return ({ success: false, error: new Error('Failed to create sms template from message'), meta: { msg } });
  }

  logger.info('Sms template created from the message consumed : ', smsTemplate);
  return ({ success: true, data: { document: smsTemplate }, meta: { msg } });
};


module.exports = { handleMsg: createTemplateFromMsg };
