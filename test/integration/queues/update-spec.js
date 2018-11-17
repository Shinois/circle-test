require('dotenv').load({ silent: true });

const uuid = require('uuid');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const db = require('../../../src/modules/db');
const updateModule = require('../../../src/queues/update');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE}` || '';

const smsTemplate = {
  appId: uuid.v4(),
  name: 'name',
  text: 'text',
  data: {
    doUrl: {
      phoneNumber: '+331234321',
      action: 'outgoing-call',
      culture: 'fr'
    }
  }
};

const smsUpdate = {
  appId: smsTemplate.appId,
  name: 'update-name',
  text: 'update-text',
  data: {
    doUrl: {
      phoneNumber: '+331334111',
      action: 'call',
      culture: 'en'
    }
  }
};

async function createTemplate(mongo) {
  const doc = await mongo
    .collection(collectionName)
    .insertOne(smsTemplate);

  assert(doc);
  smsUpdate.id = doc.insertedId;
  return { id: doc.insertedId };
}

describe('Update template method', () => {
  before(async () => {
    this.mongo = await db.connect();
    this.updateSmsTemplate = updateModule.handleMsg(this.mongo);
    this.template = await createTemplate(this.mongo);
  });

  after(async () => {
    const doc = await this.mongo
      .collection(collectionName)
      .deleteOne({ _id: new ObjectId(this.template.id) });
    assert.equal(doc.result.n, true);
    db.disconnect();
  });

  it('should be able to update a sms template by id', async () => {
    const res = await this.updateSmsTemplate(smsUpdate, this.mongo);
    const doc = await this.mongo.collection(collectionName).findOne({ _id: new ObjectId(this.template.id) });
    assert(res);
    assert(res.success);
    assert.equal(doc.name, smsUpdate.name);
    assert.equal(doc.text, smsUpdate.text);
    assert.deepEqual(doc.data, smsUpdate.data);
  });

  it('should not be able to update a sms template [missing mandatory field]', async () => {
    const res = await this.updateSmsTemplate({ id: this.template.id }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
  });

  it('should not be able to update a sms template [id not found]', async () => {
    const res = await this.updateSmsTemplate({
      id: new ObjectId(),
      appId: smsTemplate.appId,
      name: smsTemplate.name
    }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
  });
});
