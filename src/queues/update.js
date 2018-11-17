require('dotenv').load({ silent: true });

const assert = require('assert');
const { logger } = require('../modules/logger');
const { ObjectId } = require('mongodb');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE || ''}`;

/**
 * Create an object which specify field(s) of the template sms to update and returns it
 *
 * @param  {object} msg - the message consumed.
 * @return {object}     - an object with the updated field(s) of the sms template.
 */
async function createQuery(msg) {
  let field = '';
  const updateObj = { $set: {} };
  await ['appId', 'name', 'text', 'data'].forEach((key) => {
    field = msg[key];
    if (field) {
      updateObj.$set[key] = field;
    }
  });
  return updateObj;
}

/**
 * Update a sms template from the message consumed and returns the id in an object
 *
 * @param  {object} msg   - the message consumed.
 * @param  {object} mongo - the instance of mongo
 * @return {object}       - an object with a boolean which represents the success of the function
 *                          if true, the returned object contains the id of the sms template updated in database
 *                          otherwise, an object with an error and the provided message.
 */
const updateTemplateFromMsg = mongo => async (msg) => {
  try {
    assert(msg.appId, 'No appId provided in the message');
    assert(msg.id, 'No id provided in the message');
    assert(msg.name, 'No name provided in the message');
  } catch (error) {
    logger.error(error.stack);
    return ({ success: false, error: new Error(error), meta: { msg } });
  }

  const query = await createQuery(msg);
  const res = await mongo
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(msg.id) }, query);

  if (res.result.n) {
    logger.info('Sms template updated in collection, id : ', msg.id);
    return ({ success: true, data: { id: msg.id }, meta: { msg } });
  }

  logger.error('Document not found in mongo, failed to update sms template');
  return ({ success: false, error: new Error('Failed to update sms template from message'), meta: { msg } });
};

module.exports = { handleMsg: updateTemplateFromMsg };
