var express = require('express');
var router = express.Router();
var pool = require('../app.js')

router.get('/', function(req, res, next){
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
    connection.query(sqlstr, [req.params.geneid], function(err, rows) {
      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      console.log(result)
      res.render('gene', {gene: result})
      connection.release();
    });
  });
})


module.exports = router;
