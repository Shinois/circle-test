require('dotenv').load({ silent: true });

const uuid = require('uuid');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const db = require('../../../src/modules/db');
const createModule = require('../../../src/queues/create');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE}` || '';

const smsTemplate = {
  appId: uuid.v4(),
  name: 'test-name',
  text: 'test-text',
  data: {
    doUrl: {
      phoneNumber: '+331234321',
      action: 'outgoing-call',
      culture: 'fr'
    }
  }
};

describe('Create template method', () => {
  before(async () => {
    this.mongo = await db.connect();
    this.createSmsTemplate = createModule.handleMsg(this.mongo);
    this.templates = [];
  });

  after(async () => {
    const doc = await this.mongo
      .collection(collectionName)
      .deleteMany({ _id: { $in: this.templates } });
    assert.equal(doc.result.n, this.templates.length);
    db.disconnect();
  });

  it('should be able to create new sms template and return it', async () => {
    const res = await this.createSmsTemplate(smsTemplate, this.mongo);
    assert(res);
    assert(res.success);
    assert.equal(res.meta.msg, smsTemplate);
    assert.equal(res.data.document.appId, smsTemplate.appId);
    assert.equal(res.data.document.name, smsTemplate.name);
    assert.equal(res.data.document.text, smsTemplate.text);
    assert.deepEqual(res.data.document.data, smsTemplate.data);
    this.templates.push(new ObjectId(res.data.document._id));
  });

  it('should be able to create new sms template [without data field] and return it', async () => {
    const res = await this.createSmsTemplate({
      appId: smsTemplate.appId,
      name: 'test-name',
      text: 'test-text',
    }, this.mongo);

    assert(res);
    assert(res.success);
    assert.equal(res.data.document.appId, smsTemplate.appId);
    assert.equal(res.data.document.name, smsTemplate.name);
    assert.equal(res.data.document.text, smsTemplate.text);
    this.templates.push(new ObjectId(res.data.document._id));
  });

  it('should not be able to create sms template [missing mandatory field(s)]', async () => {
    const res = await this.createSmsTemplate({ appId: smsTemplate.appId }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
    assert.equal(res.data.error.code, 'ERR_ASSERTION');
  });
});
