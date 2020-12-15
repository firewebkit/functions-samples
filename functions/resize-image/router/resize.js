const express = require('express');
const sharp = require('sharp');
const request = require('request');
const router = express.Router();

router.use(':mediaref(*)', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.send();
  }
  next();
});

router.use(':mediaref(*)', (req, res, next) => {
  if (isNaN(req.query.w) || isNaN(req.query.h)) {
    logger.error('w and h parameters not provided');
    return res.status(412).json({ error: 'Correct size not specified' });
  }
  logger.info('Resizing request %s', req.params.mediaref)
  next()
});

router.use(':mediaref(*)', (req, res, next) => {
  const mediaref = req.params.mediaref;
  const url = `${process.env.API_HOST}/${process.env.CLIENT_ID}/media${mediaref}`
  request({ url, encoding: null }, (err, resp, buffer) => {
    if (err) {
      return res.status(400).send(err);
    }
    if (resp.statusCode !== 200) {
      return res.status(resp.statusCode).json({ error: 'Error while querying media'});
    }
    req.imageType = resp.headers['content-type'];
    req.imageBuffer = Buffer.from(buffer, 'utf-8');
    next();
  });
})

router.use(':mediaref(*)', (req, res) => {
  sharp(req.imageBuffer)
  .resize(Number(req.query.w), Number(req.query.h))
  .toBuffer()
  .then(data => {
    res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600');
    res.set('Content-Type', req.imageType);
    res.send(data);
  })
  .catch(err => {
    logger.error('Error while resizing image %s', err)
  });
});

module.exports = router;
