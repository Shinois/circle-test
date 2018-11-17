require('dotenv').load({ silent: true });

const uuid = require('uuid');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const db = require('../../../src/modules/db');
const removeModule = require('../../../src/queues/delete');

const collectionName = `SMSTemplate${process.env.LOCAL_QUEUE}` || '';

const templateToDelete = {
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

async function createTemplate(mongo) {
  const doc = await mongo
    .collection(collectionName)
    .insertOne(templateToDelete);

  assert(doc);
  return { id: doc.insertedId };
}

describe('Delete template method', () => {
  before(async () => {
    this.mongo = await db.connect();
    this.removeSmsTemplate = removeModule.handleMsg(this.mongo);
    this.template = await createTemplate(this.mongo);
  });

  after(() => { db.disconnect(); });

  it('should be able to delete sms template', async () => {
    const res = await this.removeSmsTemplate({ id: this.template.id }, this.mongo);
    assert(res);
    assert(res.success);
    assert.equal(res.data.id, this.template.id);
    const checkInDatabase = await this.mongo.collection(collectionName).findOne({ id: this.template.id });
    assert.equal(checkInDatabase, null);
  });

  it('should not be able to delete sms template [missing id]', async () => {
    const res = await this.removeSmsTemplate({ appId: uuid.v4() }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
  });

  it('should no be able to delete sms template [id not found]', async () => {
    const res = await this.removeSmsTemplate({ id: new ObjectId() }, this.mongo);
    assert(res);
    assert.equal(res.success, false);
  });
});
