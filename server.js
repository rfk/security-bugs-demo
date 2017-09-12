
const app = require('./lib/app')

app.get('/', function(req, res) {
  res.send(200, 'hi there!')
})

app.listen(8083, function() {
  console.log("Running!")
})

