var express = require('express');
var router = express.Router();
var pool = require('../app.js')


router.get('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    var wtInteraction = []
    var mutInteraction = []
    sqlstr = "SELECT CONCAT(ENTREZ_GENE_ID, '_0') AS SOURCE, CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS TARGET FROM Gene JOIN Transcript USING(ENTREZ_GENE_ID) JOIN Y2HWTInteractor USING (REFSEQ_ID);"
    connection.query(sqlstr, function(err, rows) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++){
        wtInteraction.push(JSON.parse(JSON.stringify(rows))[i])
      }
      console.log(wtInteraction)
    });
    sqlstr = "SELECT CONCAT(ENTREZ_GENE_ID, '_' , CCSB_MUTATION_ID) AS SOURCE, CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS TARGET FROM Gene JOIN Transcript USING(ENTREZ_GENE_ID) JOIN Variant USING(REFSEQ_ID) JOIN Y2HMUTInteractor USING (VARIANT_ID);"
    connection.query(sqlstr, function(err, rows) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++){
        mutInteraction.push(JSON.parse(JSON.stringify(rows))[i])
      }
      console.log(mutInteraction)
    });
    res.render('interaction', { wtInteraction: wtInteraction, mutInteraction: mutInteraction });
    connection.release();
  });
})


module.exports = router;
