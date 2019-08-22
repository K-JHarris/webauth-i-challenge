const db = require('./dbConfig');

function getUsers() {
  return db('users');
}

function addUser(user) {
  return db('users')
    .insert(user);
}

module.exports = {
  getUsers,
  addUser
}