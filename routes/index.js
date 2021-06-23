var express = require('express');
var router = express.Router();

var storeData = require('../controllers/storeData');
var initDB = require('../controllers/init');
initDB.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

router.post('/', function (req,res,next){
  let userData = req.body;
  res.setHeader('Content-Type', 'application/json');
  res.json(userData);
});

module.exports = router;