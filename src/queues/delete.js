require('dotenv').load({ silent: true });

const assert = require('assert');
const { ObjectId } = require('mongodb');
const { logger } = require('../modules/logger');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE || ''}`;

/**
 * Check the validity of the message consumed,
 * delete a sms template from it
 * and returns the id of the sms template deleted.
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo.
 * @return {object}       - an object with a boolean which represents the success of the function
 *                          if true, the returned object contains the id of the sms template deleted in database
 *                          otherwise, an object with an error and the provided message.
 */
const deleteTemplateFromMsg = mongo => async (msg) => {
  try {
    assert(msg.id, 'No id provided in the message');
  } catch (error) {
    logger.error(error.stack);
    return ({ success: false, error: new Error(error), meta: { msg } });
  }

  const res = await mongo
    .collection(collectionName)
    .deleteOne({ _id: new ObjectId(msg.id) });

  if (!res.result.n) {
    logger.error('Failed to delete document in mongo database');
    return ({ success: false, error: new Error('Failed to delete sms template from message'), meta: { msg } });
  }

  logger.info('Sms template deleted from the message consumed, id : ', msg.id);
  return ({ success: true, data: { id: msg.id }, meta: { msg } });
};

module.exports = { handleMsg: deleteTemplateFromMsg };
