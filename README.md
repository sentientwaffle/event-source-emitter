# event-source-emitter

Server-side events with [EventSource](http://www.w3.org/TR/eventsource/).

# Example

```javascript
var http        = require('http')
  , eventSource = require('event-source-emitter')
http.createServer(function(req, res) {
  var es    = eventSource(req, res, {keepAlive: true})
    , times = 0
  var interval = setInterval(function() {
    es.emit("update", {time: Date.now()})
    if (times++ > 10) {
      es.end()
      clearInterval(interval)
    }
  }, 1000)
}).listen(8765)
```

    $ curl -v 127.0.0.1:8765

To connect to the EventSource server, use the browser's
[EventSource](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events) interface.

# API

## `EventSource(req, res, {keepAlive, onClose})`

  * `keepAlive` - Boolean, default: `false`. If `true`, send a comment every
    15 seconds to guard against timeouts.
  * `onClose`   - Function, called when the connection is terminated.

## `EventSource.emit(event, data)`

Send an event down the event stream.

## `EventSource.end()`

Close the connection.

## `EventSource.comment(text)`

Send a message down the event stream. It will be ignored by the receiver.
