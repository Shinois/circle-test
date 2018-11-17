require('dotenv').load({ silent: true });

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./delete');

/**
 * A module of crud method to handle sms template
 */
module.exports = {
  create,
  read,
  update,
  remove
};
