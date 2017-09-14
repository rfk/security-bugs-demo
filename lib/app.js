
const path = require('path')
const crypto = require('crypto')

const express = require('express')

const app = module.exports = express()

app.use(require('body-parser').urlencoded())

app.use(require('cookie-session')({ secret: crypto.randomBytes(8).toString('hex') }))

app.engine('handlebars', require('express-handlebars')({
  defaultLayout: 'main'
}))
app.set('views', path.join(__dirname, '..', 'views'))
app.set('view engine', 'handlebars')

app.use('/static', express.static(path.join(__dirname, '..', 'static')))

require('./routes')(app)
