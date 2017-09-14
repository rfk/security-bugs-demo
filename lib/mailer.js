const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const nodemailer = require('nodemailer')

module.exports = {
  sendConfirmationCode
}

const EMAIL_SENDER = 'verification@rfkelly.dev.lcip.org'

const RENDER_EMAIL_SUBJECT = handlebars.compile(
  '{{name}}, here is your confirmation code'
)

const RENDER_EMAIL_BODY_HTML = handlebars.compile(
  fs.readFileSync(path.join(__dirname, '..', 'views', 'email_html.handlebars')).toString()
)

const RENDER_EMAIL_BODY_TEXT = handlebars.compile(
  fs.readFileSync(path.join(__dirname, '..', 'views', 'email_txt.handlebars')).toString()
)


function sendConfirmationCode(email, name, code) {
  const mailer = nodemailer.createTransport('SMTP')
  return new Promise(function(resolve, reject) {
    mailer.sendMail({
      to: email,
      sender: EMAIL_SENDER,
      headers: {
        'Subject': RENDER_EMAIL_SUBJECT({ name: name })
      },
      html: RENDER_EMAIL_BODY_HTML({ name: name, code: code }),
      text: RENDER_EMAIL_BODY_TEXT({ name: name, code: code })
    }, function (err) {
      if (err) {
        if (err.code === 'ECONNREFUSED') {
           // No local SMTP server, just log to console.
           console.log("MAIL", email, name, code)
           return resolve(true)
        }
        return reject(err)
      } else {
        return resolve(true)
      }
    })
  })
}
