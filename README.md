# browser-sync-middleware

> This module is only concerned with the mechanisms to connect a browser client to a express server & receive updates.

## install

```sh
$ npm i browser-sync-middleware --save
```

## Use middleware

```js
var browserSyncMiddleware = require('browser-sync-middleware');

app.use(browserSyncMiddleware({
    watch: ['./public/**']
}))
```

## Parameters

-----

## watch
 (string or array of strings). Paths to files, dirs to be watched recursively, or glob patterns.

## ignored

(anymatch-compatible definition) Defines files/paths to be ignored. The whole relative or absolute path is tested, not just filename. If a function with two arguments is provided, it gets called twice per path - once with a single argument (the path), second time with two arguments (the path and the fs.Stats object of that path).

## static
this is a static path name. default `public`. for example:
```js
app.use(express.static(path.join(__dirname, 'static')));
app.use(browserSyncMiddleware({
    watch: ['./static/**']
    static: 'static'
}))
```

## License

Copyright © 2014-2015 ysk2014
Released under the MIT license.