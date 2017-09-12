
const validate = require('./validate')
const accounts = require('./accounts')
const notes = require('./notes')


module.exports = function routes(app) {


  app.get('/', function(req, res) {
    // Show notes is logged in,
    // otherwise offer to create an account.
    if (req.session.email) {
      return res.redirect('notes')
    }
    return res.redirect('create_account')
  })


  app.get('/create_account', function(req, res) {
    return res.render('create_account')
  })


  app.post('/create_account', function(req, res) {
    return Promise.resolve(null).then(() => {
      let addr = validate.parseEmailAddress(req.body.email)
      let name = req.body.name || addr.username
      return accounts.create(addr.email, name, req.body.password)
    }).then(() => {
      return res.render('confirm_account', {
        email: req.body.email
      })
    }).catch((err) => {
      return res.render('create_account', {
        email: req.body.email,
        name: req.body.name,
        error: err
      })
    })
  })


  app.post('/confirm_account', function(req, res) {
    return Promise.resolve(null).then(() => {
      let addr = validate.parseEmailAddress(req.body.email)
      let code = req.body.code
      return accounts.verify(addr.email, code)
    }).then(() => {
      req.session.email = req.body.email
      return res.redirect('notes')
    }).catch((err) => {
      return res.render('confirm_account', {
        email: req.body.email,
        name: req.body.name,
        error: err
      })
    })
  })


  app.get('/login', function(req, res) {
    return res.render('login')
  })


  app.post('/login', function(req, res) {
    return Promise.resolve(null).then(() => {
      let addr = validate.parseEmailAddress(req.body.email)
      return accounts.checkPassword(addr.email, req.body.password)
    }).then(() => {
      req.session.email = req.body.email
      return res.redirect('notes')
    }).catch((err) => {
      return res.render('login', {
        email: req.body.email,
        error: err
      })
    })
  })


  app.post('/logout', function(req, res) {
    delete req.session.email
    return res.redirect('login')
  })


  app.post('/delete_account', function(req, res) {
    return Promise.resolve(null).then(() => {
      if (! req.session.email) { throw new Error('not logged in') }
      return accounts.delete(req.session.email)
    }).then(() => {
      return res.redirect('create_account')
    }).catch((err) => {
      return res.render('error', {
        error: err
      })
    })
  })


  app.get('/notes', function(req, res) {
    const email = req.session.email
    if (! email) {
      return res.redirect('login')
    }
    console.log("NOTES FOR", req.session)
    return notes.fetch(email).then((notes) => {
      console.log("NOTES", notes)
      return res.render('notes', {
        email: email,
        notes: notes
      })
    }).catch((err) => {
      return res.render('error', {
        email: email,
        error: err
      })
    })
  })


  app.post('/append_note', function(req, res) {
    const email = req.session.email
    if (! email) {
      return res.redirect('login')
    }
    return notes.append(email, req.body.note).then(() => {
      return res.redirect('notes')
    }).catch((err) => {
      return res.render('error', {
        email: email,
        error: err
      })
    })
  })


  app.post('/remove_note', function(req, res) {
    const email = req.session.email
    if (! email) {
      return res.redirect('login')
    }
    return notes.remove(email, req.body.id).then(() => {
      return res.redirect('notes')
    }).catch((err) => {
      return res.render('error', {
        email: email,
        error: err
      })
    })
  })

}
