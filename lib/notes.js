
const path = require('path')

const db = require('./db')

module.exports = {
  fetch,
  append,
  remove
}


const Q_INITIALIZE = '' +
  'CREATE TABLE IF NOT EXISTS notes (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  body TEXT NOT NULL' +
  ')'

function getDB(email) {
  return new Promise((resolve, reject) => {
    try {
      let c =  db.open("notes-" + email)
      c.run(Q_INITIALIZE).then(() => {
        resolve(c)
      }).catch((err) => {
        reject(err)
      })
    } catch (err) {
      return reject(err)
    }
  })
}


const Q_FETCH = 'SELECT id, body FROM notes'

function fetch(email) {
  return getDB(email).then((db) => {
    return db.all(Q_FETCH)
  })
}


const Q_APPEND = 'INSERT INTO notes (body) VALUES ($body)'

function append(email, body) {
  return getDB(email).then((db) => {
    return db.run(Q_APPEND, { $body: body })
  })
}


const Q_REMOVE = 'DELETE FROM notes WHERE id = $id'

function remove(email, id) {
  return getDB(email).then((db) => {
    return db.run(Q_REMOVE, { $id: id })
  })
}
