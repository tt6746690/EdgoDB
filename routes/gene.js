var express = require('express');
var router = express.Router();
var pool = require('../app.js')
var async = require('async')

router.get('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    connection.query( 'SELECT * FROM Gene;', function(err, rows) {
      if (err) throw err;
      res.render('geneList', { rows: rows });
      connection.release();
    });
  });
  // connection.end();    maybe integrate this with user specific access
});


router.get('/:geneid', function(req, res, next){
  pool.getConnection(function(err, connection) {
    async.parallel({
      links: function(callback){
        sqlstr1 = "SELECT CONCAT(ENTREZ_GENE_ID, '_0') AS source, CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, Y2H_SCORE AS score FROM Gene JOIN Transcript USING(ENTREZ_GENE_ID) JOIN Y2HWTInteractor USING (REFSEQ_ID) WHERE HUGO_GENE_SYMBOL = ? UNION SELECT CONCAT(ENTREZ_GENE_ID, '_', CCSB_MUTATION_ID) AS source, CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, Y2H_SCORE AS score FROM Gene JOIN Transcript USING(ENTREZ_GENE_ID) JOIN Variant USING(REFSEQ_ID) JOIN Y2HMUTInteractor USING (VARIANT_ID) WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr1, [req.params.geneid, req.params.geneid], function(err, rows){
          if (err) throw err;
          var links = []
          for (var i = 0; i < rows.length; i++){
            links.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, links)
        })
      },
      nodes: function(callback){
        sqlstr2 = "SELECT \
                      DISTINCT CONCAT(ENTREZ_GENE_ID, '_0') AS ID, \
                      HUGO_GENE_SYMBOL AS Name \
                  FROM Gene \
                      JOIN Transcript USING(ENTREZ_GENE_ID) \
                      JOIN Y2HWTInteractor USING(REFSEQ_ID) \
                  WHERE HUGO_GENE_SYMBOL = ? \
                  UNION \
                  SELECT \
                      DISTINCT CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS ID, \
                      (SELECT g.HUGO_GENE_SYMBOL \
                      FROM Gene AS g \
                      WHERE g.ENTREZ_GENE_ID = INTERACTOR_ENTREZ_GENE_ID) AS Name \
                  FROM Gene JOIN Transcript USING(ENTREZ_GENE_ID) \
                      JOIN Y2HWTInteractor USING(REFSEQ_ID) \
                  WHERE HUGO_GENE_SYMBOL = ? \
                  UNION \
                  SELECT DISTINCT CONCAT(ENTREZ_GENE_ID, '_', CCSB_MUTATION_ID) AS ID, \
                      MUT_HGVS_NT_ID AS Name \
                  FROM Gene \
                      JOIN Transcript USING(ENTREZ_GENE_ID) \
                      JOIN Variant USING(REFSEQ_ID) \
                      JOIN Y2HMUTInteractor USING(VARIANT_ID) \
                  WHERE HUGO_GENE_SYMBOL = ? \
                  UNION \
                  SELECT DISTINCT CONCAT(g.ENTREZ_GENE_ID, '_0') AS ID, \
                      g.HUGO_GENE_SYMBOL AS Name \
                  FROM Gene AS g \
                      JOIN Y2HMUTInteractor AS y2h \
                          ON g.ENTREZ_GENE_ID = y2h.INTERACTOR_ENTREZ_GENE_ID \
                  WHERE y2h.VARIANT_ID = ANY(SELECT VARIANT_ID \
                                             FROM Gene \
                                                JOIN Transcript USING (ENTREZ_GENE_ID) \
                                                JOIN Variant USING(REFSEQ_ID) \
                                             WHERE HUGO_GENE_SYMBOL = ?)"
        connection.query(sqlstr2, [req.params.geneid, req.params.geneid, req.params.geneid, req.params.geneid], function(err, rows){
          if (err) throw err;
          var nodes = []
          for (var i = 0; i < rows.length; i++){
            nodes.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, nodes)
        })
      },
      gene: function(callback){
        sqlstr3 = "SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID, OMIM_ID, UNIPROT_SWISSPROT_ID, ENSEMBL_GENE_ID, DESCRIPTION \
                   FROM Gene \
                   WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr3, [req.params.geneid], function(err, rows) {
          var gene = []
          for (var i = 0; i < rows.length; i++){
            gene.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, gene)
        });
      },
      variant: function(callback){
        sqlstr4 = "SELECT * FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN Variant USING (REFSEQ_ID) JOIN VariantProperty USING (VARIANT_ID) WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr4, [req.params.geneid], function(err, rows) {
          var variant = []
          for (var i = 0; i < rows.length; i++){
            variant.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, variant)
        });
      },
      domainRegion: function(callback){
        sqlstr5 = "SELECT PFAM_ID AS name, SEQ_START AS start, SEQ_END AS end, PROTEIN_LENGTH AS proteinLength FROM PfamDomain JOIN Gene USING (UNIPROT_PROTEIN_NAME) WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr5, [req.params.geneid], function(err, rows) {
          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      },
      mutationPosition: function(callback){
        sqlstr6 = "SELECT SPLIT_STR(MUT_HGVS_AA_ID, ':p.', 2) AS name FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID) JOIN Variant USING (REFSEQ_ID) JOIN VariantProperty USING (VARIANT_ID) WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr6, [req.params.geneid], function(err, rows) {
          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      }
    }, function(err, results){
      connection.release()
      console.log(results)
      res.render('gene', {
        forceGraphData: {
          links: results.links,
          nodes: results.nodes
        },
        gene: results.gene,
        variant: results.variant,
        proteinDomainData:{
          region: results.domainRegion,
          mutation: results.mutationPosition // later be filled with info from variant client side
        }
      })
    });


  })
})

module.exports = router;
