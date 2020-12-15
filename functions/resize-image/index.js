const express = require('express');
const { setupDev } = require('firewebkit-functions');
const resizeMiddleware = require('./router/resize');

const app = express();
app.use(express.json());

app.use('/', resizeMiddleware);

// this is for development - run [yarn start]
setupDev(app, [
  {
    path: '/*',
    rewrites: {
      '^/': '/',
    },
    logLevel: 'debug',
    rewritePostBody: true,
  },
]);

module.exports = app;
