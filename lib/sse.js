
/**
 * A Server-Sent Event Manager.
 */

var sse = function(opts) {
    var self;
    if (opts == null) {
        opts = {};
    }
    if (opts.retry == null) {
        opts.retry = 1000;
    }

    /**
     * The sse middleware for http handler.
     * @param {http.IncomingMessage} req Also supports Express.js.
     * @param {http.ServerResponse} res Also supports Express.js.
     */
    var self = function(req, res) {
        var session = self.create(req, res);
        self.sessions.push(session);
    };

    /**
     * The sessions of connected clients.
     * @type {Array}
     */
    self.sessions = [];

    /**
     * Broadcast a event to all clients.
     * @param {String} event The event name.
     * @param {Object | String} msg The data you want to emit to session.
     * @param {String} [path] The namespace of target sessions. If not set,
     * broadcast to all clients.
     */
    self.emit = function(event, msg) {
        self.sessions.forEach(function(session) {
            session.emit(event, msg)
        });
    };

    /**
     * Create a sse session.
     * @param {http.IncomingMessage} req Also supports Express.js.
     * @param {http.ServerResponse} res Also supports Express.js.
     * @return {SSESession}
     */
    self.create = function(req, res) {

        /**
         * A session object is something like:
         * ```js
         * {
         *  req,  // The http req object.
         *  res   // The http res object.
         * }
         * ```
         */
        var session = {
            req: req,
            res: res
        };
        req.socket.setTimeout(0);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        /**
         * Emit message to client.
         * @param  {String} event The event name.
         * @param  {Object | String} msg The message to send to the client.
         */
        session.emit = function(event, msg) {
            if (msg == null) {
                msg = '';
            }
            msg = JSON.stringify(msg);
            return res.write("id: " + (Date.now()) + "\nevent: " + event + "\nretry: " + opts.retry + "\ndata: " + msg + "\n\n");
        };

        req.on('close', function() {
            return self.sessions.splice(self.sessions.indexOf(session), 1);
        });
        session.emit('connect', 'ok');
        return session;
    };
    return self;
};

module.exports = sse;
