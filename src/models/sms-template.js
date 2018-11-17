/**
 * A base class for sms template.
 * @typedef SMSTemplate
 * @class SMSTemplate
 */
class SMSTemplate {
  /**
   * Model of sms templates
   * @param {string} appId - the application id.
   * @param {string} name  - the template name.
   * @param {string} text  - the template text.
   * @param {Object} data  - an object with informations about the sms provider.
   */
  constructor(appId, name, text, data = {}) {
    this.appId = appId;
    this.name = name;
    this.text = text;
    this.data = data;
  }
}

module.exports = SMSTemplate;
