require('dotenv').load({ silent: true });

const assert = require('assert');
const { ObjectId } = require('mongodb');
const uuid = require('uuid');
const readModule = require('../../../src/queues/read');
const db = require('../../../src/modules/db');

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

const validatereadTemplate = (res, doc) => {
  assert(doc);
  assert(res);
  assert.equal(res.appId, doc.appId);
  assert.equal(res.name, doc.name);
  assert.equal(res.text, doc.text);
};

async function createTemplate(mongo) {
  const doc = await mongo
    .collection(collectionName)
    .insertOne(smsTemplate);

  assert(doc);
  return { id: doc.insertedId, appId: doc.ops[0].appId };
}

describe('read template method', () => {
  before(async () => {
    this.mongo = await db.connect();
    this.readSmsTemplate = readModule.handleMsg(this.mongo);
    this.template = await createTemplate(this.mongo);
  });

  after(async () => {
    const doc = await this.mongo
      .collection(collectionName)
      .deleteOne({ _id: new ObjectId(this.template.id) });

    assert.equal(doc.result.n, true);
    db.disconnect();
  });

  it('should be able to read sms template by id and return it', async () => {
    const doc = await this.mongo
      .collection(collectionName)
      .findOne({ _id: this.template.id });

    const res = await this.readSmsTemplate({ id: this.template.id }, this.mongo);
    assert(res.success);
    validatereadTemplate(res.data.document[0], doc);
  });

  it('should be able to read sms template by appId and return it', async () => {
    const doc = await this.mongo
      .collection(collectionName)
      .find({ appId: this.template.appId })
      .toArray();

    const res = await this.readSmsTemplate({ appId: this.template.appId }, this.mongo);
    assert(res.success);
    assert.deepEqual(res.data.document, doc);
  });

  it('should not be able to read sms template [invalid id]', async () => {
    const res = await this.readSmsTemplate({ id: 'invalid id' });
    assert(res);
    assert.equal(res.success, false);
  });

  it('should not be able to read sms template [invalid appId]', async () => {
    const res = await this.readSmsTemplate({ appId: 'invalid appId' });
    assert(res);
    assert.equal(res.success, false);
  });

  it('should not be able to read sms template [id not found]', async () => {
    const res = await this.readSmsTemplate({ id: new ObjectId() }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
  });
});
