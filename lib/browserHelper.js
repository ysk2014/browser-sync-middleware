
module.exports = function(opts) {
    var handler = {};

    handler.init = function() {
        return initAutoReload();
    };

    var initAutoReload = function() {
        handler.es = new EventSource(opts.host + '/sse/autoload');

        var firstConnect = false;
        handler.es.addEventListener('connect', function(e) {
            if (JSON.parse(e.data) == 'ok' && firstConnect) {
                firstConnect = true;
                return window.location.reload();
            }
            firstConnect = true;
        });
        
        return handler.es.addEventListener('fileModified', function(e) {
            var path = JSON.parse(e.data);
            console.log(">> fileModified: " + path);

            var reloadElem = function(el, key) {
                var body, scrollTop;
                if (el[key].indexOf('?') === -1) {
                    el[key] += '?autoReload=0';
                } else {
                    if (el[key].indexOf('autoReload') > -1) {
                        el[key] = el[key].replace(/autoReload=(\d+)/, function(m, p) {
                        return 'autoReload=' + (+p + 1);
                        });
                    } else {
                        el[key] += '&autoReload=0';
                    }
                }
                body = document.body;
                scrollTop = body.scrollTop;
                body.style.display = 'none';
                body.offsetHeight;

                return setTimeout(function() {
                    body.style.display = 'block';
                    return body.scrollTop = scrollTop;
                }, 50);
            };

            var each = function(el, callback) {
                var elems = document.querySelectorAll(el);
                return Array.prototype.slice.apply(elems).forEach(callback);
            }

            if (!path) {
                return window.location.reload();
            }
            var m = path.match(/\.[^.]+$/);
            var isFound = false;

            switch (m && m[0]) {
                case '.js':
                    each('script', function(el) {
                        if (el.src.indexOf(path) > -1) {
                            isFound = true;
                            return location.reload();
                        }
                    });
                    break;
                case '.css': 
                    each('link', function(el) {
                        if (el.href.indexOf(path) > -1) {
                            isFound = true;
                            return reloadElem(el, 'href');
                        }
                    });
                    break;
                case '.jpg':
                case '.gif':
                case '.png':
                    each('img', function(el) {
                        if (el.src.indexOf(path) > -1) {
                            isFound = true;
                            return reloadElem(el, 'src');
                        }
                    });
                    break;
            }

            if (!isFound) {
                return window.location.reload();
            }
        });
    }

    handler.init();

    return handler;
}