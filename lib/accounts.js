
const path = require('path')
const crypto = require('crypto')
const scrypt = require('scrypt-js')

const db = require('./db')
const mailer = require('./mailer')


module.exports = {
  create,
  verify,
  checkPassword,
  remove
}


const Q_INITIALIZE = '' +
  'CREATE TABLE IF NOT EXISTS accounts (' +
  '  email VARCHAR(255) NOT NULL PRIMARY KEY,' +
  '  name VARCHAR(255) NOT NULL,' +
  '  passwordHash BLOB(32) NOT NULL,' +
  '  createdAt INTEGER NOT NULL,' +
  '  verifyCode VARCHAR(12) NOT NULL,' +
  '  verified BOOLEAN NOT NULL DEFAULT FALSE' +
  ')'

let dbPromise = null

function getDB() {
  if (dbPromise === null) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        let c = db.open('accounts')
        c.run(Q_INITIALIZE).then((db) => {
          return resolve(c)
        }).catch((err) => {
          return reject(err)
        })
      } catch (err) {
        return reject(err)
      }
    })
  }
  return dbPromise
}


const Q_CREATE = '' +
  'INSERT INTO accounts (email, name, passwordHash, createdAt, verifyCode, verified)' +
  '  VALUES ($email, $name, $passwordHash, $createdAt, $verifyCode, $verified)'

const Q_REPLACE_UNVERIFIED = '' +
  'UPDATE accounts SET name = $name, passwordHash = $passwordHash,' +
  '  createdAt = $createdAt, verifyCode = $verifyCode ' +
  '  WHERE email = $email AND NOT verified'

function create(email, name, password) {
  const verifyCode = crypto.randomBytes(6).toString('hex').toUpperCase()
  return getDB().then((db) => {
    return hashPassword(email, password).then((passwordHash) => {
      return db.run(Q_CREATE, {
        $email: email,
        $name: name,
        $passwordHash: passwordHash,
        $createdAt: Date.now(),
        $verifyCode: verifyCode,
        $verified: false
      }).catch((err) => {
        if (err.code !== 'SQLITE_CONSTRAINT') { throw err }
        // Account already exists.  If unverified, replace it.
        return db.run(Q_REPLACE_UNVERIFIED, {
          $email: email,
          $name: name,
          $passwordHash: passwordHash,
          $createdAt: Date.now(),
          $verifyCode: verifyCode,
        }).then((res) => {
          if (res.changes == 0) {
            throw new Error('account already exists: ' + email)
          }
        })
      })
    })
  }).then(() => {
    return mailer.sendConfirmationCode(email, name, verifyCode)
  })
}


const Q_VERIFY = '' +
  'UPDATE accounts' +
  '  SET verified = 1' +
  '  WHERE email = $email' +
  '  AND verifyCode = $verifyCode' +
  '  AND createdAt > $now - 3600000' // expire after 5 minutes

function verify(email, verifyCode) {
  return getDB().then((db) => {
    return db.run(Q_VERIFY, {
      $email: email,
      $verifyCode: verifyCode.toUpperCase(),
      $now: Date.now()
    })
  }).then((res) => {
    if (res.changes > 0) {
      return true
    }
    // XXX TODO: better error message here
    throw new Error('failed to verify account')
  })
}


const Q_CHECK_PASSWORD = '' +
  'SELECT email, name, createdAt' +
  ' FROM accounts WHERE' +
  '  email = $email' +
  '  AND passwordHash = $passwordHash' +
  '  AND verified'

function checkPassword(email, password) {
  return getDB().then((db) => {
    return hashPassword(email, password).then((passwordHash) => {
      return db.get(Q_CHECK_PASSWORD, {
        $email: email,
        $passwordHash: passwordHash,
      })
    })
  }).then((row) => {
    if (! row) {
      throw new Error('failed to log in')
    }
  })
}


function hashPassword(email, password) {
  let buf = Buffer.from(password, 'utf8')
  let salt = Buffer.from(email, 'utf8')
  return new Promise((resolve, reject) => {
    scrypt(buf, salt, 1024, 8, 1, 32, function(err, _, key) {
      if (err) {
        return reject(err)
      } else if (key) {
        return resolve(Buffer.from(key))
      } else {
        // ths also gets called to report progress; do nothing
      }
    })
  })
}

const Q_REMOVE = 'DELETE FROM accounts WHERE email = $email'

function remove(email) {
  return getDB().then((db) => {
    return db.run(Q_REMOVE, {
      $email: email,
    })
  }).then((res) => {
    if (res.changes === 0) {
      throw new Error('no such account: ' + email)
    }
  })
}
