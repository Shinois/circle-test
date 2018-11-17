const chai = require('chai');
const assert = require('assert');
const crudQueues = require('../../../src/queues/index');

const { expect } = chai;

describe('CRUD queues', () => {
  it('should have create, delete, read, update properties', () => {
    expect(crudQueues).to.have.property('create');
    assert.equal(typeof crudQueues.create.handleMsg, 'function');
    expect(crudQueues).to.have.property('remove');
    assert.equal(typeof crudQueues.remove.handleMsg, 'function');
    expect(crudQueues).to.have.property('read');
    assert.equal(typeof crudQueues.read.handleMsg, 'function');
    expect(crudQueues).to.have.property('update');
    assert.equal(typeof crudQueues.update.handleMsg, 'function');
  });
});
