
module.exports = function validate(payload, required) {
  return new Promise((resolve, reject) => {
    let validated = {}
    try {
      Object.keys(payload).forEach((key) => {
        switch (key) {
          case "email":
            validated.email = parseEmailAddress(payload.email)
            break
          case "name":
            validated.name = validateName(payload.name)
            break
          case "password":
            validated.password = validatePassword(payload.password)
            break
          case "code":
            validated.code = validateVerifyCode(payload.code)
            break
          case "note_id":
            validated.note_id = validateNoteId(payload.note_id)
            break
          case "note_body":
            validated.note_body = validateNoteBody(payload.note_body)
            break
          default:
            throw new Error('Unexpected key in payload: ' + key)
        }
      });
      (required || []).forEach((key) => {
        if (! validated[key]) {
          throw new Error('missing required key: ' + key)
        }
      })
    } catch (err) { return reject(err); }
    return resolve(validated)
  })
}

// Email usernames can be just about anything,
// but check that the domain component is a valid hostname.

const EMAIL_REGEX = /(.+)@(([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+)$/

function parseEmailAddress(email) {
  if (typeof email !== 'string') {
    throw new Error('email is not a string')
  }
  if (email.length > 255) {
    throw new Error('email address too long')
  }
  let match = EMAIL_REGEX.exec(email)
  if (! match) {
    throw new Error('invalid email address')
  }
  return {
    address: match[0],
    username: match[1],
    domain: match[2]
  }
}

function validateName(name) {
  if (typeof name !== 'string') {
    throw new Error('name is not a string')
  }
  if (name.length > 255) {
    throw new Error('name is too long')
  }
  return name
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new Error('password is not a string')
  }
  if (password.length > 64) {
    throw new Error('password is too long')
  }
  return password
}

function validateVerifyCode(code) {
  if (typeof code !== 'string') {
    throw new Error('code is not a string')
  }
  if (code.length != 12) {
    throw new Error('code is not correct length')
  }
  return code
}

function validateNoteId(note_id) {
  if (typeof note_id === 'string') {
    note_id = parseInt(note_id, 10)
  }
  if (typeof note_id !== 'number') {
    throw new Error('note_id is not a number')
  }
  return note_id
}

function validateNoteBody(note_body) {
  if (typeof note_body !== 'string') {
    throw new Error('note_body is not a string')
  }
  if (note_body.length > 255) {
    throw new Error('note_body is too long')
  }
  return note_body
}
