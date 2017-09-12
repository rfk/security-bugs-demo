
module.exports = {
  parseEmailAddress
}

// Email usernames can be just about anything,
// but check that the domain component is a valid hostname.

const EMAIL_REGEX = /(.+)@(([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+)$/

function parseEmailAddress(email) {
  if (email.length > 255) {
    throw new Error('email address too long')
  }
  let match = EMAIL_REGEX.exec(email)
  if (! match) {
    throw new Error('invalid email address')
  }
  return {
    email: match[0],
    username: match[1],
    domain: match[2]
  }
}
