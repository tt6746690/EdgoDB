var express = require('express');
var router = express.Router();
var pool = require('../app.js')

router.get('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    sqlstr = 'SELECT ??, ??, ??, ??, ??, ??, ?? FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN Variant USING (REFSEQ_ID)'
    projectionList = ['ENTREZ_GENE_ID', 'HUGO_GENE_SYMBOL', 'MUT_HGVS_NT_ID', 'MUT_HGVS_AA_ID',
    'MUT_ORFEOME_NT', 'MUT_ORFEOME_AA', 'CHR_COORDINATE_HG18']
    connection.query(sqlstr, projectionList, function(err, rows) {
      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      res.render('variantList', { variant: result });
      connection.release();
    });
  });
  // connection.end();    maybe integrate this with user specific access
});

router.get('/:variantid', function(req, res, next){
  pool.getConnection(function(err, connection) {
    sqlstr = "SELECT * FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN \
    Variant USING (REFSEQ_ID) JOIN VariantProperty USING(VARIANT_ID)  \
    WHERE MUT_HGVS_NT_ID = ?;"
    connection.query(sqlstr, [req.params.variantid], function(err, rows) {
      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      console.log(result)
      res.render('variant', {variant: result})
      connection.release();
    });
  });
})

module.exports = router;
