var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EdgoDB' });
});

router.get('/Contact', function(req, res, next){
  res.render('contact')
})

router.get('/About', function(req, res, next){
  res.render('about')
})


module.exports = router;
