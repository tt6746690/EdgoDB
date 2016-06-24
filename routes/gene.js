var express = require('express');
var router = express.Router();
var pool = require('../app.js')
var async = require('async')

router.get('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    connection.query( 'SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID FROM Gene;', function(err, rows) {
      if (err) throw err;
      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      // result => {[HUGO_GENE_SYMBOL, ENTREZ_GENE_ID], ...}
      res.render('geneList', { geneList: result});
      connection.release();
    });
  });
});


router.get('/:geneid', function(req, res, next){
  pool.getConnection(function(err, connection) {
    async.parallel({
      // links: function(callback){
      //   var sqlstr1 = "SELECT CONCAT(ENTREZ_GENE_ID, '_0') AS source, \
      //                         CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, \
      //                         Y2H_SCORE AS score \
      //                  FROM Gene \
      //                     LEFT JOIN Transcript USING(ENTREZ_GENE_ID) \
      //                     LEFT JOIN Y2HWTInteractor USING (REFSEQ_ID) \
      //                  WHERE HUGO_GENE_SYMBOL = ? \
      //                  UNION \
      //                  SELECT CONCAT(ENTREZ_GENE_ID, '_', CCSB_MUTATION_ID) AS source, \
      //                  CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, \
      //                  Y2H_SCORE AS score \
      //                  FROM Gene \
      //                     LEFT JOIN Transcript USING(ENTREZ_GENE_ID) \
      //                     LEFT JOIN Variant USING(REFSEQ_ID) \
      //                     LEFT JOIN Y2HMUTInteractor USING (VARIANT_ID) \
      //                  WHERE HUGO_GENE_SYMBOL = ?;"
      //   connection.query(sqlstr1, [req.params.geneid, req.params.geneid], function(err, rows){
      //     if (err) throw err;
      //     var links = []
      //     for (var i = 0; i < rows.length; i++){
      //       links.push(JSON.parse(JSON.stringify(rows))[i])
      //     }
      //     callback(null, links)
      //   })
      // },
      // nodes: function(callback){
      //   var sqlstr2 = "SELECT \
      //                 DISTINCT CONCAT(ENTREZ_GENE_ID, '_0') AS ID, \
      //                 HUGO_GENE_SYMBOL AS Name \
      //             FROM Gene \
      //                 LEFT JOIN Transcript USING(ENTREZ_GENE_ID) \
      //                 LEFT JOIN Y2HWTInteractor USING(REFSEQ_ID) \
      //             WHERE HUGO_GENE_SYMBOL = ? \
      //             UNION \
      //             SELECT \
      //                 DISTINCT CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS ID, \
      //                 (SELECT g.HUGO_GENE_SYMBOL \
      //                 FROM Gene AS g \
      //                 WHERE g.ENTREZ_GENE_ID = INTERACTOR_ENTREZ_GENE_ID) AS Name \
      //             FROM Gene LEFT JOIN Transcript USING(ENTREZ_GENE_ID) \
      //                 LEFT JOIN Y2HWTInteractor USING(REFSEQ_ID) \
      //             WHERE HUGO_GENE_SYMBOL = ? \
      //             UNION \
      //             SELECT DISTINCT CONCAT(ENTREZ_GENE_ID, '_', CCSB_MUTATION_ID) AS ID, \
      //                 MUT_HGVS_NT_ID AS Name \
      //             FROM Gene \
      //                 LEFT JOIN Transcript USING(ENTREZ_GENE_ID) \
      //                 LEFT JOIN Variant USING(REFSEQ_ID) \
      //                 LEFT JOIN Y2HMUTInteractor USING(VARIANT_ID) \
      //             WHERE HUGO_GENE_SYMBOL = ? \
      //             UNION \
      //             SELECT DISTINCT CONCAT(g.ENTREZ_GENE_ID, '_0') AS ID, \
      //                 g.HUGO_GENE_SYMBOL AS Name \
      //             FROM Gene AS g \
      //                 LEFT JOIN Y2HMUTInteractor AS y2h \
      //                     ON g.ENTREZ_GENE_ID = y2h.INTERACTOR_ENTREZ_GENE_ID \
      //             WHERE y2h.VARIANT_ID = ANY(SELECT VARIANT_ID \
      //                                        FROM Gene \
      //                                           LEFT JOIN Transcript USING (ENTREZ_GENE_ID) \
      //                                           LEFT JOIN Variant USING(REFSEQ_ID) \
      //                                        WHERE HUGO_GENE_SYMBOL = ?)"
      //   connection.query(sqlstr2, [req.params.geneid, req.params.geneid, req.params.geneid, req.params.geneid], function(err, rows){
      //     if (err) throw err;
      //     var nodes = []
      //     for (var i = 0; i < rows.length; i++){
      //       nodes.push(JSON.parse(JSON.stringify(rows))[i])
      //     }
      //     callback(null, nodes)
      //   })
      // },
      gene: function(callback){
        var sqlstr3 = "SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID, OMIM_ID, UNIPROT_SWISSPROT_ID, ENSEMBL_GENE_ID, DESCRIPTION \
                       FROM Gene \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr3, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}
          var gene = []
          for (var i = 0; i < rows.length; i++){
            gene.push(JSON.parse(JSON.stringify(rows))[i])
          }
          // console.log(gene[0])              // data in the Gene table
          //   name: results.gene.HUGO_GENE_SYMBOL,
          //   links: {
          //     Description: results.gene.DESCRIPTION
          //   }
          gene = gene[0]
          var composeGene = {
            symbol: gene.HUGO_GENE_SYMBOL,
            links: {
              Description: {
                link: 'http://www.uniprot.org/uniprot/' + gene.UNIPROT_SWISSPROT_ID,
                display: gene.DESCRIPTION
              },
              Entrez: {
                link: 'http://www.ncbi.nlm.nih.gov/gene/' + gene.ENTREZ_GENE_ID,
                display: gene.ENTREZ_GENE_ID
              },
              Ensembl: {
                link: 'http://useast.ensembl.org/Homo_sapiens/Gene/Summary?g=' + gene.ENSEMBL_GENE_ID,
                display: gene.ENSEMBL_GENE_ID
              },
              Uniprot: {
                link: 'http://www.uniprot.org/uniprot/' + gene.UNIPROT_SWISSPROT_ID,
                display: gene.UNIPROT_SWISSPROT_ID
              },
              Omim: {
                link: 'http://www.omim.org/entry/' + gene.OMIM_ID,
                display: gene.OMIM_ID
              }
            }
          }
          callback(null, composeGene)
        });
      },
      variant: function(callback){
        var sqlstr4 = "SELECT MUT_HGVS_NT_ID, MUT_HGVS_NT, MUT_HGVS_AA \
                       FROM Gene \
                          LEFT JOIN Variant USING (ENTREZ_GENE_ID) \
                          LEFT JOIN VariantProperty USING (VARIANT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr4, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var variant = []
          for (var i = 0; i < rows.length; i++){
            variant.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, variant)
        });
      },
      domainRegion: function(callback){
        var sqlstr5 = "SELECT PFAM_ID AS name, SEQ_START AS start, SEQ_END AS end, PROTEIN_LENGTH AS proteinLength \
                       FROM PfamDomain \
                          LEFT JOIN Gene USING (UNIPROT_PROTEIN_NAME) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr5, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      },
      mutationPosition: function(callback){
        var sqlstr6 = "SELECT MUT_HGVS_AA AS name \
                       FROM Gene \
                         LEFT JOIN Variant USING (ENTREZ_GENE_ID) \
                         LEFT JOIN VariantProperty USING (VARIANT_ID) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr6, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
     },
      radarChart: function(callback){
        var sqlstr7 = "SELECT INTERACTOR AS axis, INTERACTION_Z_SCORE AS value, HUGO_GENE_SYMBOL AS grp, HUGO_GENE_SYMBOL AS link \
                       FROM Gene \
                         LEFT JOIN LUMIERMeasurementWT USING(ENTREZ_GENE_ID) \
                       WHERE HUGO_GENE_SYMBOL = ? AND INTERACTOR IS NOT NULL AND INTERACTION_Z_SCORE IS NOT NULL\
                       UNION \
                       SELECT INTERACTOR AS axis, INTERACTION_Z_SCORE AS value, MUT_HGVS_NT_ID AS grp, MUT_HGVS_AA_ID AS link\
                       FROM Gene \
                         LEFT JOIN Variant USING(ENTREZ_GENE_ID) \
                         LEFT JOIN LUMIERMeasurementMUT USING(VARIANT_ID) \
                       WHERE HUGO_GENE_SYMBOL = ?\
                         AND INTERACTOR IS NOT NULL \
                         AND INTERACTOR IS NOT NULL"
        connection.query(sqlstr7, [req.params.geneid, req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var radarChart = []
          for (var i = 0; i < rows.length; i++){
            radarChart.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, radarChart)
        });
      }
    }, function(err, results){
      if (err) {return next(err)}
      connection.release()
      console.log(results)
      res.render('gene', {
        gene: results.gene,
        variant: results.variant,   // variant ID that falls under this gene
        proteinDomainData:{         // data for proteinDomain Graph
          length: results.domainRegion[0].proteinLength,
          region: results.domainRegion,
          mutation: results.mutationPosition // later be filled with info from variant client side
        },
        // forceGraphData: {
        //   links: results.links,
        //   nodes: results.nodes
        // },
        radarChartData: results.radarChart // needs post processing to [[{axis, value, grp}, ...], ...]
      })
    });


  })
})

module.exports = router;
