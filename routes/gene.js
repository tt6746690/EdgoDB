var express = require('express');
var router = express.Router();
var pool = require('../app.js')
var async = require('async')
var Excel = require('exceljs')

router.get('/', function(req, res, next){
  pool.getConnection(function(err, connection) {
    connection.query( 'SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID FROM Gene;', function(err, rows) {
      if (err) throw err;

      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }
      res.render('geneList', { geneList: result});
      connection.release();
    });
  });
});




router.get('/:geneid/download', function(req, res, next){
  pool.getConnection(function(err, connection) {
    var sqlstr = "SELECT * \
                  FROM Gene \
                    JOIN Variant USING(ENTREZ_GENE_ID)\
                    JOIN VariantProperty USING(VARIANT_ID)\
                  WHERE HUGO_GENE_SYMBOL = ?"
    connection.query(sqlstr, [req.params.geneid], function(err, rows) {
      if (err) throw err;
      connection.release();

      var result = []
      for (var i = 0; i < rows.length; i++){
        result.push(JSON.parse(JSON.stringify(rows))[i])
      }

      var workbook = new Excel.Workbook()
      var worksheet = workbook.addWorksheet('sheet 1')

      worksheet.columns = Object.keys(result[0]).map(function(d){
        return {
          header: d,
          key: d
        }
      })
      result.forEach(function(row){
        worksheet.addRow(row)
      })

      res.set({'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', "Content-Disposition":"attachment; filename=\"download.xlsx\""});
      workbook.xlsx.write(res).then(function(){
        res.end()
      })

    });
  });
});


router.get('/:geneid', function(req, res, next){
  pool.getConnection(function(err, connection) {
    async.parallel({
      links: function(callback){
        var sqlstr = "SELECT CONCAT(ENTREZ_GENE_ID, '_0') AS source, \
                              CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, \
                              Y2H_SCORE AS score \
                       FROM Gene \
                          JOIN Y2HWTInteractor USING (ENTREZ_GENE_ID) \
                       WHERE HUGO_GENE_SYMBOL = ? \
                       UNION \
                       SELECT CONCAT(ENTREZ_GENE_ID, '_', MUT_HGVS_AA) AS source, \
                       CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS target, \
                       Y2H_SCORE AS score \
                       FROM Gene \
                          JOIN Variant USING(ENTREZ_GENE_ID) \
                          JOIN Y2HMUTInteractor USING (VARIANT_ID) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid, req.params.geneid], function(err, rows){
          if (err) throw err;
          var links = []
          for (var i = 0; i < rows.length; i++){
            links.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, links)
        })
      },
      nodes: function(callback){
        var sqlstr = "SELECT \
                      DISTINCT CONCAT(ENTREZ_GENE_ID, '_0') AS ID, \
                      HUGO_GENE_SYMBOL AS Name \
                  FROM Gene \
                      JOIN Y2HWTInteractor USING(ENTREZ_GENE_ID) \
                  WHERE HUGO_GENE_SYMBOL = ? \
                  UNION \
                  SELECT \
                      DISTINCT CONCAT(INTERACTOR_ENTREZ_GENE_ID, '_0') AS ID, \
                      (SELECT g.HUGO_GENE_SYMBOL \
                      FROM Gene AS g \
                      WHERE g.ENTREZ_GENE_ID = INTERACTOR_ENTREZ_GENE_ID) AS Name \
                  FROM Gene \
                      JOIN Y2HWTInteractor USING(ENTREZ_GENE_ID) \
                  WHERE HUGO_GENE_SYMBOL = ? \
                  UNION \
                  SELECT DISTINCT CONCAT(ENTREZ_GENE_ID, '_', MUT_HGVS_AA) AS ID, \
                      MUT_HGVS_AA AS Name \
                  FROM Gene \
                      JOIN Variant USING(ENTREZ_GENE_ID) \
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
                                                LEFT JOIN Variant USING(ENTREZ_GENE_ID) \
                                             WHERE HUGO_GENE_SYMBOL = ?)"
        connection.query(sqlstr, [req.params.geneid, req.params.geneid, req.params.geneid, req.params.geneid], function(err, rows){
          if (err) throw err;
          var nodes = []
          for (var i = 0; i < rows.length; i++){
            nodes.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, nodes)
        })
      },
      gene: function(callback){
        var sqlstr = "SELECT HUGO_GENE_SYMBOL, ENTREZ_GENE_ID, OMIM_ID, \
                       UNIPROT_SWISSPROT_ID, UNIPROT_PROTEIN_LENGTH, \
                       ENSEMBL_GENE_ID, DESCRIPTION, CCSB_ORF_ID, ORF_LENGTH, \
                       UNIPROT_PROTEIN_LOCALIZATION, PROTEIN_ATLAS_LOCALIZATION\
                       FROM Gene \
                        JOIN ORFeome USING(ENTREZ_GENE_ID)\
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}

          var gene = []
          for (var i = 0; i < rows.length; i++){
            gene.push(JSON.parse(JSON.stringify(rows))[i])
          }

          gene = gene[0]
          console.log(gene)
          var composeGene = {
            symbol: gene.HUGO_GENE_SYMBOL,
            description: gene.DESCRIPTION,
            uniprot_id: gene.UNIPROT_SWISSPROT_ID,
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
              },
              "Uniprot localization": {
                display: gene.UNIPROT_PROTEIN_LOCALIZATION
              },
              "ProteinAtlas Localization": {
                display: gene.PROTEIN_ATLAS_LOCALIZATION
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

          // sort variant based on mutation position ascending
          variant.sort(function(a, b){
            var aInt = parseInt(a.MUT_HGVS_AA.match(/\d+/))
            var bInt = parseInt(b.MUT_HGVS_AA.match(/\d+/))
            if(aInt < bInt){
              return -1
            }
            if(aInt > bInt){
              return 1
            }
            return 0
          })

          callback(null, variant)
        });
      },
      variantInfo: function(callback){
        var sqlstr = "SELECT MUT_HGVS_AA, DISEASE_NAME, INHERITANCE_PATTERN, \
                      CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, DBSNP_ID, HGMD_ACCESSION, \
                      HGMD_VARIANT_CLASS, PMID, EXAC_ALLELE_FREQUENCY, POLYPHEN_SCORE, \
                      POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY, CONSERVATION_INDEX, Y2H_EDGOTYPE\
                      FROM Variant \
                        JOIN Gene USING(ENTREZ_GENE_ID) \
                        JOIN VariantProperty USING(VARIANT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ?"

        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          var variantBox = []
          for (var i = 0; i < rows.length; i++){
            variantBox.push(JSON.parse(JSON.stringify(rows))[i])
          }

          composeVariant = []
          variantBox.forEach(function(d){
            composeVariant.push({
               "symbol": d.MUT_HGVS_AA,
               "links": {
                 "Disease": {
                   "display": d.DISEASE_NAME
                 },
                 "Inheritance": {
                   display: d.INHERITANCE_PATTERN
                 },
                 "ClinVar Accession": {
                   "display": d.CLINVAR_CLINICAL_SIGNIFICANCE,
                   "link": 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + d.CLINVAR_ID
                 },
                 "dbSNP": {
                   "display": d.DBSNP_ID,
                   "link": 'http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=' + d.DBSNP_ID
                 },
                 "HGMD Accession": {
                   display: d.HGMD_ACCESSION
                 },
                 "HGMD mutation": {
                   display: d.HGMD_VARIANT_CLASS
                 },
                 "Pubmed": {
                   "display": d.PMID,
                   "link": 'http://www.ncbi.nlm.nih.gov/pubmed/' + d.PMID
                 },
                 "Exac Frequency": {
                   "display": d.EXAC_ALLELE_FREQUENCY
                 },
                 "Polyphen": {
                   "display": d.POLYPHEN_SCORE + '(' + d.POLYPHEN_CLASS + ')'
                 },
                 "Solvent accessibility": {
                   "display": d.SOLVENT_ACCESSIBILITY
                 },
                 "Conservation index": {
                   "display": d.CONSERVATION_INDEX
                 },
                 "Y2H Edgotype": {
                   "display": d.Y2H_EDGOTYPE
                 }
               } // link
             }) // push
          }) // forEach
          callback(null, composeVariant)
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
      },
      domainRegion: function(callback){
        var sqlstr = "SELECT PFAM_ID AS name, SEQ_START AS start, SEQ_END AS end, PROTEIN_LENGTH AS proteinLength \
                       FROM PfamDomain \
                          LEFT JOIN Gene USING (UNIPROT_PROTEIN_NAME) \
                       WHERE HUGO_GENE_SYMBOL = ?;"
        connection.query(sqlstr, [req.params.geneid], function(err, rows) {
          if (err) {return next(err)}
          // if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}

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
          // if (rows.length == 0) {return next(new Error('Entry unavailable in database'))}

          var domainRegion = []
          for (var i = 0; i < rows.length; i++){
            domainRegion.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, domainRegion)
        });
      },
      pdbInfo: function(callback){
        var sqlstr = "SELECT DISTINCT PDB_ID \
                      FROM Gene JOIN ProteinDataBank USING(UNIPROT_SWISSPROT_ID) \
                      WHERE HUGO_GENE_SYMBOL = ?;"

        connection.query(sqlstr, [req.params.geneid], function(err, rows){
          if (err) {return next(err)}
          var pdbInfo = []
          for (var i = 0; i < rows.length; i++){
            pdbInfo.push(JSON.parse(JSON.stringify(rows))[i])
          }
          callback(null, pdbInfo)
        })
      }
    }, function(err, results){
      if (err) {return next(err)}
      connection.release()
      console.log(results)

      var proteinL = typeof results.domainRegion === 'undefined' ? 500: results.domainRegion[0].proteinLength
      res.render('gene', {
        gene: results.gene,
        variant: results.variant,   // variant ID that falls under this gene
        variantInfo: results.variantInfo,
        domainChartData:{         // data for proteinDomain Graph
          proteinLength: proteinL,
          region: results.domainRegion,
          mutation: results.mutationPosition // later be filled with info from variant client side
        },
        y2hChartData: {
          links: results.links,
          nodes: results.nodes
        },
        radarChartData: results.radarChart, // needs post processing to [[{axis, value, grp}, ...], ...]
        expressionChartData: results.expressionChart,
        pdbInfo: results.pdbInfo
      })
    });


  })
})


module.exports = router;
