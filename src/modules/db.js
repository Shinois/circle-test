require('dotenv').config();

const { MongoClient } = require('mongodb');

let mongoClient = {};

module.exports = {
  /**
   * Create an instance of mongo database and returns it.
   *
   * @return an instance of mongo database.
   */
  async connect() {
    mongoClient = await MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true });
    return mongoClient.db(process.env.MONGO_DB || 'dialonce');
  },

  disconnect() {
    if (mongoClient) {
      mongoClient.close();
    }
  }
};
