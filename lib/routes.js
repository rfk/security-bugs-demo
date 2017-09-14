
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
    return validate(req.body, ['email', 'password']).then((validated) => {
      let name = validated.name || validated.email.username
      return accounts.create(validated.email.address, name, validated.password).then(() => {
        return res.render('confirm_account', {
          email: validated.email.address,
          name: name
        })
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
    return validate(req.body, ['email', 'code']).then((validated) => {
      return accounts.verify(validated.email.address, validated.code)
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
    return validate(req.body, ['email', 'password']).then((validated) => {
      return accounts.checkPassword(validated.email.address, validated.password)
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
    return validate(req.body).then(() => {
      if (! req.session.email) { throw new Error('not logged in') }
      return accounts.remove(req.session.email)
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
    return notes.fetch(email).then((notes) => {
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
    return validate(req.body, ['note_body']).then((validated) => {
      return notes.append(email, validated.note_body)
    }).then(() => {
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
    return validate(req.body, ['note_id']).then((validated) => {
      return notes.remove(email, validated.note_id)
    }).then(() => {
      return res.redirect('notes')
    }).catch((err) => {
      return res.render('error', {
        email: email,
        error: err
      })
    })
  })

}
