
// Run the server locally on port 8083.
// We expect it to be fronted by e.g. an nginx reverse proxy.

const app = require('./lib/app')

app.listen(8083, function() {
  console.log("Running!")
})

