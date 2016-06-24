var express = require('express');
var router = express.Router();
var pool = require('../app.js')
var async = require('async')


router.post('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    sqlstr = "SELECT DISTINCT Gene.HUGO_GENE_SYMBOL, Variant.MUT_HGVS_NT_ID\
              FROM Gene \
                LEFT JOIN ORFeome \
                  ON Gene.ENTREZ_GENE_ID = ORFeome.ENTREZ_GENE_ID \
                LEFT JOIN Variant \
                  ON Gene.ENTREZ_GENE_ID = Variant.ENTREZ_GENE_ID \
                LEFT JOIN VariantProperty \
                  ON Variant.VARIANT_ID = VariantProperty.VARIANT_ID \
              WHERE Gene.HUGO_GENE_SYMBOL IS NOT NULL"
    // BUILING SQL QUERY FROM SEARCH FORM
    var cols = []
    Object.keys(req.body).forEach(function(col){
      if (req.body[col] === ''){ // if form field empty do nothing
      } else { // build query if field not empty
        sqlstr += ' AND ' + col + ' = ?'
        cols.push(req.body[col])
      }
    })
    // QUERY
    connection.query(sqlstr, cols, function(err, rows) {
      if (err) throw err;
        var result = []
        for (var i = 0; i < rows.length; i++){
          result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      data = {}
      // RESTRUCTURE QUERY RESULT => {geneid: [variants]}
      result.forEach(function(d){
        key = d.HUGO_GENE_SYMBOL
        if (data.hasOwnProperty(key)){
          data[key].push(d.MUT_HGVS_NT_ID)
        } else {
          data[key] = [d.MUT_HGVS_NT_ID]
        }
      })
      res.render('searchResult', {list: data})
      connection.release();
    });
  });

})

module.exports = router;
