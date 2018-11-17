require('logtify-bugsnag')();
require('logtify-logstash')();
const { logger } = require('logtify')({ presets: ['dial-once', 'prefix'] });

module.exports.logger = logger;
