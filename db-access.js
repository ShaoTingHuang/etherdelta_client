
var mongojs = require('mongojs');

class DbAccess {

  constructor() {
    this.connectionString = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}` +
    `@ds249575.mlab.com:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`;
  }

  connect() {
    this.db = mongojs(connectionString);
  }
}