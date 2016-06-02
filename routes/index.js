var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // pool.getConnection(function(err, connection) {
  //   sqlstr = 'SELECT * FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN Variant USING (REFSEQ_ID) WHERE '
  //   connection.query(sqlstr, [], function(err, rows) {
  //     var result = []
  //     for (var i = 0; i < rows.length; i++){
  //       result.push(JSON.parse(JSON.stringify(rows))[i])
  //     }
  //     console.log(result)
  //     res.render('gene', {gene: result})
  //     connection.release();
  //   });
  // });
  res.render('index', { title: 'EdgoDB' });

});




module.exports = router;
