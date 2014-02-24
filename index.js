///
/// This is a server-side implementation of the EventSource API.
///
/// Resources:
///
///   * http://www.w3.org/TR/eventsource/
///   * https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events
///
/// req     - ServerRequest
/// res     - ServerResponse
/// options - (optional)
///   * onClose   - Function
///   * keepAlive - Boolean, default: false. If true, send some comment data
///     down the socket every 15 seconds to keep the connection from timing out.
///
module.exports = function(req, res, options) {
  return new EventSource(req, res, options || {})
}

function EventSource(req, res, options) {
  this.res      = res
  this._onClose = options.onClose || noop

  var onClose = this.onClose.bind(this)
  req.on("aborted", onClose)
     .on("error",   onClose)
  res.on("aborted", onClose)
     .on("error",   onClose)
     .on("close",   onClose)
     .on("end",     onClose)

  res.writeHead(200,
    { "Content-Type":  "text/event-stream"
    , "Cache-Control": "no-cache"
    })

  // Emit an initial chunk to ensure that the headers are sent.
  // Then, send additional data every 15 seconds to keep the connection alive.
  if (options.keepAlive) {
    this.alive()
    this.interval = setInterval(this.alive.bind(this), 15000)
  }
}

// Send an 'event' down the event stream.
//
// type - String
// data - A JSON.stringify-able thing.
//
EventSource.prototype.emit = function(type, data) {
  this.res.write( "event: " + type + "\n"
                + "data: "  + JSON.stringify(data)
                + "\n\n" )
}

// Send a comment down the event stream.
//
// text - String
//
EventSource.prototype.comment = function(text) {
  this.res.write(":" + text + "\n\n")
}

// Excerpt from the W3 EventSource spec:
//
// > Legacy proxy servers are known to, in certain cases, drop HTTP connections
// > after a short timeout. To protect against such proxy servers, authors can
// > include a comment line (one starting with a ':' character) every 15
// > seconds or so.
//
// The text of the comment is not important.
//
EventSource.prototype.alive = function() { this.comment("keepalive") }

// Gracefully close the connection.
EventSource.prototype.end = function() {
  this.res.end()
  this.onClose()
}

// Clean up the connection.
EventSource.prototype.onClose = function() {
  this.interval && clearInterval(this.interval)
  this._onClose && this._onClose()
  this.interval = this._onClose = null
}

function noop() {}
