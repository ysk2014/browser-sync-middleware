var ignoreRoot = require('ignore-by-default').directories();
var objectAssign = require('object-assign');
var path = require('path');

var browser = require('./lib/browserHelper');
var watch = require('./lib/watcher');
var bus = require('./lib/bus');
var sse = require('./lib/sse')();

var config = {};

var defaults = {
    watch: ['*.*'],
    ignored: ignoreRoot,
    static: 'public',
    host: '',
    verbose: false
}

bus.on('reset', function() {
    config = defaults;
})

var browserHelper = function(opts) {
    var helper = browser.toString();
    var optsStr = JSON.stringify({
      host: config.host
    });
    var js = "if (!window.browserAutoload) window.browserAutoload = (" + helper + ")(" + optsStr + ");\n";
    return "\n\n<!-- Browser Autoload Helper -->\n<script type=\"text/javascript\">\n" + js + "\n</script>\n\n";
}

var middleware = function(req,res,next) {
    var end = res.end;

    res.end = function() {
        var args = Array.prototype.slice.call(arguments);
        var type = res.get('Content-Type') && res.get('Content-Type').indexOf('html') !== -1;

        if (type) {
            if (Buffer.isBuffer(args[0]) && req.method!='HEAD') {
                var chunk = args[0].toString() + browserHelper(config);
                res.set('Content-Length', chunk.length);
                return end.call(this, chunk, args[1]);
            } else {
                return end.apply(this, arguments);
            }
        } else {
            return end.apply(this, arguments);
        }
    }
    if (req.path == '/sse/autoload') {
        sse(req, res);
    } else {
        next();
    }
}

module.exports = function(opts) {
    bus.emit('reset');

    config = objectAssign(defaults,opts);

    bus.on('fileModified', function(file) {
        file = file.substring(config.static.length);
        console.log('>> fileModified: '+file);
        sse.emit('fileModified', file);
    });

    watch(config);

    return middleware;
}