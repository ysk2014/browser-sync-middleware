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


## License

Copyright © 2014-2015 ysk2014
Released under the MIT license.