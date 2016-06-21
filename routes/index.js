var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EdgoDB' });
});

module.exports = router;





// SELECT GENE.HUGO_GENE_SYMBOL, Transcript.REFSEQ_ID, Variant.MUT_HGVS_NT_ID
// FROM Gene
//           LEFT JOIN ORFeome
//             ON Gene.ENTREZ_GENE_ID = ORFeome.ENTREZ_GENE_ID
//           LEFT JOIN Transcript
//             ON Gene.ENTREZ_GENE_ID = Transcript.ENTREZ_GENE_ID
//           LEFT JOIN Variant
//             ON Transcript.REFSEQ_ID = Variant.REFSEQ_ID
//           LEFT JOIN VariantProperty
//             ON Variant.VARIANT_ID = VariantProperty.VARIANT_ID
//           LEFT JOIN Disease
//             ON Variant.VARIANT_ID = Disease.VARIANT_ID
// WHERE
