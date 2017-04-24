
var chokidar = require('chokidar');
var bus = require('./bus');
var watchers = [];


bus.on('reset', resetWatchers);

function resetWatchers() {
    watchers.forEach(function (watcher) {
        watcher.close();
    });
    watchers = [];
}

function watch(config) {
    
    if (watchers.length) {
        return false;
    }

    var watchedFiles = [];

    if (typeof config.watch == 'string') {
        config.watch = [config.watch];
    }

    config.watch.forEach(function(path) {
        var watcher = chokidar.watch(path, {
            ignored: config.ignored,
            persistent: true
        });

        watcher.ready = false;

        var total = 0;

        watcher.on('change', filter);
        watcher.on('unlink', filter);
        watcher.on('add', function (file) {
            if (watcher.ready) {
                return filter(file);
            }
            watchedFiles.push(file);
            total++;
        });

        watcher.on('ready', function () {
            watcher.ready = true;
        });

        watcher.on('error', function (error) {
            if (error.code === 'EINVAL') {
                console.error('Internal watch failed. Likely cause: too many ' +
                    'files being watched (perhaps from the root of a drive?\n' +
                    'See https://github.com/paulmillr/chokidar/issues/229 for details');
            } else {
                console.error('Internal watch failed: ' + error.message);
                process.exit(1);
            }
        });

        watchers.push(watcher);
    });

    return watchedFiles;
};

function filter(files) {
    if (files.length) {
        var debouncedBus = debounce(startBus, 300);
        debouncedBus(files);
    }
}

function startBus(files) {
    return bus.emit('fileModified', files);
};

function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

module.exports = watch;