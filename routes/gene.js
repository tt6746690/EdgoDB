var express = require('express');
var router = express.Router();
var pool = require('../app.js')

router.get('/', function(req, res, next){
  console.log('here')
  pool.getConnection(function(err, connection) {
    connection.query( 'SELECT * FROM Gene;', function(err, rows) {
      res.render('geneList', { rows: rows });
      connection.release();
    });
  });
  // connection.end();    maybe integrate this with user specific access
});

router.get('/:geneid', function(req, res, next){
  pool.getConnection(function(err, connection) {
    sqlstr = "SELECT * FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN Variant USING (REFSEQ_ID) WHERE ENTREZ_GENE_ID = ?;"
    connection.query( sqlstr, [req.params.geneid], function(err, rows) {
      console.log(rows)
      res.locals.queryresult = rows
      connection.release();
    });
  });
  console.log(res.locals.queryresult)
  res.render('gene', {gene: res.locals.queryresult})
  // res.render('gene', { gene: rows });
})


module.exports = router;
