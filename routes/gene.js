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
        var sqlstr = "SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID, OMIM_ID, \
                       UNIPROT_SWISSPROT_ID, UNIPROT_PROTEIN_LENGTH, \
                       ENSEMBL_GENE_ID, DESCRIPTION, CCSB_ORF_ID, ORF_LENGTH \
                       FROM Gene JOIN ORFeome USING(ENTREZ_GENE_ID)\
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var gene = []
          for (var i = 0; i < rows.length; i++){
            gene.push(JSON.parse(JSON.stringify(rows))[i])
          }

          gene = gene[0]
          var composeGene = {
            symbol: gene.HUGO_GENE_SYMBOL,
            description: gene.DESCRIPTION,
            links: {
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
                display: gene.UNIPROT_SWISSPROT_ID + ' ('+ gene.UNIPROT_PROTEIN_LENGTH + 'AA)'
              },
              ProteinAtlas: {
                link: 'http://www.proteinatlas.org/' + gene.ENSEMBL_GENE_ID,
                display: gene.ENSEMBL_GENE_ID
              },
              ProteinDB: {
                link: 'https://www.proteomicsdb.org/proteomicsdb/#human/search/query?protein_name=' + gene.HUGO_GENE_SYMBOL,
                display: gene.HUGO_GENE_SYMBOL
              },
              PDB: {
                link: 'http://www.rcsb.org/pdb/protein/' + gene.UNIPROT_SWISSPROT_ID,
                display: gene.UNIPROT_SWISSPROT_ID
              },
              Omim: {
                link: 'http://www.omim.org/entry/' + gene.OMIM_ID,
                display: gene.OMIM_ID
              },
              ExAC: {
                link: 'http://exac.broadinstitute.org/gene/' + gene.ENSEMBL_GENE_ID,
                display: gene.ENSEMBL_GENE_ID
              },
              ORFeome: {
                link: 'http://horfdb.dfci.harvard.edu/index.php?page=showdetail&orf=' + gene.CCSB_ORF_ID,
                display: gene.CCSB_ORF_ID + ' ('+ gene.ORF_LENGTH / 3+ 'AA)'
              }
            }
          }
          callback(null, composeGene)
        });
      },
      variant: function(callback){
        var sqlstr = "SELECT MUT_HGVS_NT_ID, MUT_HGVS_NT, MUT_HGVS_AA \
                       FROM Gene \
                          LEFT JOIN Variant USING (ENTREZ_GENE_ID) \
                          LEFT JOIN VariantProperty USING (VARIANT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var variant = []
          for (var i = 0; i < rows.length; i++){
            variant.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, variant)
        });
      },
      radarChart: function(callback){
        var sqlstr = "SELECT INTERACTOR AS axis, INTERACTION_Z_SCORE AS value, HUGO_GENE_SYMBOL AS grp, HUGO_GENE_SYMBOL AS link \
                       FROM Gene \
                         LEFT JOIN LUMIERMeasurementWT USING(ENTREZ_GENE_ID) \
                       WHERE HUGO_GENE_SYMBOL = ? AND INTERACTOR IS NOT NULL AND INTERACTION_Z_SCORE IS NOT NULL\
                       UNION \
                       SELECT INTERACTOR AS axis, INTERACTION_Z_SCORE AS value, MUT_HGVS_AA AS grp, MUT_HGVS_AA_ID AS link\
                       FROM Gene \
                         LEFT JOIN Variant USING(ENTREZ_GENE_ID) \
                         LEFT JOIN LUMIERMeasurementMUT USING(VARIANT_ID) \
                       WHERE HUGO_GENE_SYMBOL = ?\
                         AND INTERACTOR IS NOT NULL \
                         AND INTERACTOR IS NOT NULL"
        connection.query(sqlstr, [req.params.geneid, req.params.geneid], function(err, rows) {
          if (err) {return next(err)}

          var radarChart = []
          for (var i = 0; i < rows.length; i++){
            radarChart.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, radarChart)
        });
      },
      expressionChart: function(callback){
        var sqlstr = "SELECT wt.EXPRESSION_ELISA AS expression, \
                      wt.INTERACTOR AS interactor, HUGO_GENE_SYMBOL AS grp\
                      FROM Gene AS g \
                        JOIN LUMIERMeasurementWT AS wt USING(ENTREZ_GENE_ID) \
                      WHERE HUGO_GENE_SYMBOL = ? \
                      UNION \
                      SELECT mut.EXPRESSION_ELISA AS expression, \
                      mut.INTERACTOR as interactor, v.MUT_HGVS_AA AS grp \
                      FROM Gene AS g \
                        JOIN Variant AS v USING(ENTREZ_GENE_ID) \
                        JOIN LUMIERMeasurementMUT AS mut USING(VARIANT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ?"
        connection.query(sqlstr, [req.params.geneid, req.params.geneid], function(err, rows){
          if (err) {return next(err)}

          var expressionChart = []
          for (var i = 0; i < rows.length; i++){
            expressionChart.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, expressionChart)
        })

      }
    }, function(err, results){
      if (err) {return next(err)}
      connection.release()
      console.log(results)

      res.render('gene', {
        gene: results.gene,
        variant: results.variant,   // variant ID that falls under this gene
        // forceGraphData: {
        //   links: results.links,
        //   nodes: results.nodes
        // },
        radarChartData: results.radarChart, // needs post processing to [[{axis, value, grp}, ...], ...]
        expressionChartData: results.expressionChart
      })
    });


  })
})


router.get('/:geneid/domainGraph', function(req, res, next){
  pool.getConnection(function(err, connection){
    async.parallel({
      domainRegion: function(callback){
        var sqlstr = "SELECT PFAM_ID AS name, SEQ_START AS start, SEQ_END AS end, PROTEIN_LENGTH AS proteinLength \
                       FROM PfamDomain \
                          LEFT JOIN Gene USING (UNIPROT_PROTEIN_NAME) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}

          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      },
      mutationPosition: function(callback){
        var sqlstr = "SELECT MUT_HGVS_AA AS name \
                       FROM Gene \
                         LEFT JOIN Variant USING (ENTREZ_GENE_ID) \
                         LEFT JOIN VariantProperty USING (VARIANT_ID) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}

          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      }
    }, function(err, results){
      if (err) {return next(err)}
      connection.release()
      // console.log(results)
      var proteinL = typeof results.domainRegion === 'undefined' ? 500: results.domainRegion[0].proteinLength
      res.send({
        proteinDomainData:{         // data for proteinDomain Graph
          proteinLength: proteinL,
          region: results.domainRegion,
          mutation: results.mutationPosition // later be filled with info from variant client side
        }
      })
    })
  })
})



router.get('/:geneid/variantBoxAjax', function(req, res, next){
  pool.getConnection(function(err, connection){
    async.parallel({
      variantInfo: function(callback){
        var sqlstr = "SELECT MUT_HGVS_AA, DISEASE_NAME, INHERITANCE_PATTERN, \
                      CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, DBSNP_ID, HGMD_ACCESSION, \
                      HGMD_VARIANT_CLASS, PMID, EXAC_ALLELE_FREQUENCY, POLYPHEN_SCORE, \
                      POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY, CONSERVATION_INDEX, Y2H_EDGOTYPE\
                      FROM Variant \
                        JOIN Gene USING(ENTREZ_GENE_ID) \
                        JOIN VariantProperty USING(VARIANT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ? AND \
                        MUT_HGVS_AA = ?"

        connection.query(sqlstr, [req.params.geneid, req.query.variant_aa_id], function(err, rows) {
          if (err) {return next(err)}
          var variantBox = []
          for (var i = 0; i < rows.length; i++){
            variantBox.push(JSON.parse(JSON.stringify(rows))[i])
          }

          variantBox = variantBox[0]
          composeVariant = {
            "symbol": variantBox.MUT_HGVS_AA,
            "links": {
              "Disease": {
                "display": variantBox.DISEASE_NAME
              },
              "Inheritance": {
                display: variantBox.INHERITANCE_PATTERN
              },
              "ClinVar Accession": {
                "display": variantBox.CLINVAR_CLINICAL_SIGNIFICANCE,
                "link": 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + variantBox.CILNVAR_ID
              },
              "dbSNP": {
                "display": variantBox.DBSNP_ID,
                "link": 'http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=' + variantBox.DBSNP_ID
              },
              "HGMD Accession": {
                display: variantBox.HGMD_ACCESSION
              },
              "HGMD mutation": {
                display: variantBox.HGMD_VARIANT_CLASS
              },
              "Pubmed": {
                "display": variantBox.PMID,
                "link": 'http://www.ncbi.nlm.nih.gov/pubmed/' + variantBox.PMID
              },
              "Exac Frequency": {
                "display": variantBox.EXAC_ALLELE_FREQUENCY
              },
              "Polyphen score": {
                "display": variantBox.POLYPHEN_SCORE
              },
              "Polyphen class": {
                "display": variantBox.POLYPHEN_CLASS
              },
              "Solvent accessibility": {
                "display": variantBox.SOLVENT_ACCESSIBILITY
              },
              "Conservation index": {
                "display": variantBox.CONSERVATION_INDEX
              },
              "Y2H Edgotype": {
                "display": variantBox.Y2H_EDGOTYPE
              }
            }
          }
          callback(null, composeVariant) // only one will match... so take the first object
        });
      }
    }, function(err, results){
      if (err) {return next(err)}
      connection.release()
      // console.log(results)

      res.render('variantBox', {
        variantInfo: results.variantInfo
      })
    })
  })
})




module.exports = router;
