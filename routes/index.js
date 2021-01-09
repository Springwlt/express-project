const express = require('express');
const router = express.Router();

// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.use('/', require('./users'));
router.use('/', require('./projects'));
router.use('/', require('./WapPush'));

module.exports = router;
