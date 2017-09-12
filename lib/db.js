
const path = require('path')
const sqlite3 = require('sqlite3')

const DATA_DIR = path.normalize((path.join(__dirname, '..', 'db')))


module.exports = {
  open
}


function open(name) {
  let dbPath = path.normalize(path.join(DATA_DIR, name ".db"))
  // Check we're not accidentally writing outside data directory.
  if (path.dirname(dbPath) !== DATA_DIR) {
    throw new Error('invalid db name: ' + name)
  }
  console.log("OPEN", dbPath)
  let c = new sqlite3.Database(dbPath)
  return {

    run: function run(query, params) {
      return new Promise((resolve, reject) => {
        c.run(query, params || [], function(err) {
          if (err) return reject(err)
          return resolve(this)
        })
      })
    },

    get: function get(query, params) {
      return new Promise((resolve, reject) => {
        c.get(query, params || [], function(err, row) {
          if (err) return reject(err)
          return resolve(row)
        })
      })
    },

    all: function all(query, params) {
      return new Promise((resolve, reject) => {
        c.all(query, params || [], function(err, rows) {
          if (err) return reject(err)
          return resolve(rows)
        })
      })
    }

  }
}
