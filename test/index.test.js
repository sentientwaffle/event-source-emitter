var test = require('tap').test
  , http = require('http')
  , ESE  = require('..')
  , PORT = 8765
  , host = "http://127.0.0.1:" + PORT

test("event-source-emitter", function(t) {
  var closed
  var server = http.createServer(function(req, res) {
    var es    = ESE(req, res, {onClose: onClose})
      , times = 0
    var interval = setInterval(function() {
      es.emit("update", {times: times})
      if (++times === 5) {
        es.comment("hello")
        es.end()
        t.equals(closed, true)
        clearInterval(interval)
      }
    }, 100)
  }).listen(PORT, "127.0.0.1")

  http.get(host, function(res) {
    var chunks = []
    res.on("data", chunks.push.bind(chunks))
    res.on("end", function() {
      var data = Buffer.concat(chunks).toString()
      t.equals(data, [0, 1, 2, 3, 4].map(event).join("") + ":hello\n\n")
      server.close()
      t.end()
    })
  })

  function onClose() { closed = true }
})

function event(times) {
  return "event: update\n" +
         "data: " + JSON.stringify({times: times}) + "\n\n"
}
