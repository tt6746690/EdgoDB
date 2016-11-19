

_standard error for plotting expression graph_

```SQL
SELECT STD(LOG(2, EXPRESSION_RATIO))/COUNT(*) AS standard_error,
FROM Variant join LUMIERMeasurementMUT using(VARIANT_ID)
where MUT_HGVS_NT_ID = 'NM_017436:c.287G>A'

```
_update exac frequency; some are missing_

```sql
select MUT_HGVS_NT_ID, DBSNP_ID, CHR_COORDINATE_HG19, EXAC_ALLELE_FREQUENCY
from Variant
  join VariantProperty using(VARIANT_ID)
WHERE EXAC_ALLELE_FREQUENCY IS NULL AND DBSNP_ID != '';
```


---

__CODE REMINDER__


_JOIN semantics_

```sql
--- THETA style
SELECT * FROM film, film_actor WHERE film.film_id = film_actor.film_id AND actor_id = 17 AND film.length
--- ANSI style
SELECT * FROM film JOIN film_actor ON (film.film_id = film_actor.film_id) WHERE actor_id = 17 AND film.length > 120
--- USING -> short cut when join tables on columns with same names
SELECT * FROM film JOIN film_actor USING (film_id) WHERE actor_id = 17 AND film.length > 120
```

_For INNER JOINS: use renaming to remove table specific prefixes_

```sql
SELECT
    a.Name AS CountryNane, b.Name AS CityName, c.*
FROM
    Country a
        JOIN
    City b ON a.Code = b.CountryCode
        JOIN
    CountryLanguage c ON a.Code = c.CountryCode;
```

(_Joining more than 2 tables_](http://stackoverflow.com/questions/347551/what-tool-to-use-to-draw-file-tree-diagram)

```sql
SELECT *
FROM table1 INNER JOIN table2 ON
     table1.primaryKey=table2.table1Id INNER JOIN --- makes a temporary table
     table3 ON table1.primaryKey=table3.table1Id
```



_mysql does not support intersect and minus: use left join instead_

```sql
SELECT a.x, a.y
FROM table_a a LEFT JOIN table_b b
ON a.x = b.x AND a.y = b.y
WHERE b.x IS NULL;
```





```
SELECT 'Entrez Gene Id', 'OMIM ID', 'BioGrid ID', 'Ensembl Gene ID',
'Uniprot Swissprot ID', 'Uniprot Protein Name', 'Uniprot protein length',
'Uniprot protein localization', 'Protein atlas localization', 'Chromosome name' ,
'description', 'Hugo Gene symbol', 'CCSB ID', 'ORF length', 'ORF CDS sequence'
UNION ALL
SELECT
  g.ENTREZ_GENE_ID, g.OMIM_ID, g.BIOGRID_ID, g.ENSEMBL_GENE_ID,
  g.UNIPROT_SWISSPROT_ID, g.UNIPROT_PROTEIN_LENGTH, g.UNIPROT_PROTEIN_LENGTH,
  g.UNIPROT_PROTEIN_LOCALIZATION, g.PROTEIN_ATLAS_LOCALIZATION, g.CHROMOSOME_NAME,
  g.DESCRIPTION, g.HUGO_GENE_SYMBOL, orf.CCSB_ORF_ID, orf.ORF_LENGTH, orf.CDS_ORFEOME_SEQ
FROM Gene AS g  
    LEFT JOIN ORFeome AS orf USING(ENTREZ_GENE_ID)
WHERE g.ENTREZ_GENE_ID IS NOT NULL

INTO OUTFILE '/tmp/Gene.csv'
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```


```
SELECT 'Entrez Gene ID', 'Hugo Gene symbol', 'CCSB mutation ID', "DBSNP ID", 'Refseq', 'HGVS mutation NT', 'HGVS mutation NT ID',
'HGVS mutation AA', 'HGVS mutation AA ID', 'Chr (Hg18)', 'Chr (Hg19)', 'Disroder probability', 'Pfam present', 'In Pfam?', 'In motif?', 'Polyphen score', 'Polyphen class', 'solvent accessibility', 'Conservation index', 'hydrophobicity decrease', 'protein chemical interface', 'FOLDX value', 'Clinvar ID', 'Clinvar significant?', 'MUT Orfeome NT', 'MUT Orfeome AA', 'HGMD ID', 'MUT HGMD AA', 'HGMD variant class', 'Exac allele frequency', 'PMID', 'Disease Name', 'Inheritance pattern', 'Y2H Edgotype'
UNION ALL
SELECT g.ENTREZ_GENE_ID, g.HUGO_GENE_SYMBOL, v.CCSB_MUTATION_ID, v.DBSNP_ID, v.REFSEQ_ID, v.MUT_HGVS_NT,        v.MUT_HGVS_NT_ID, v.MUT_HGVS_AA, v.MUT_HGVS_AA_ID, v.CHR_COORDINATE_HG18, v.CHR_COORDINATE_HG19,
  vp.DISORDER_PROBABILITY, vp.PFAM_PRESENT, vp.IN_PFAM, vp.IN_MOTIF, vp.POLYPHEN_SCORE, vp.POLYPHEN_CLASS,
  vp.SOLVENT_ACCESSIBILITY, vp.CONSERVATION_INDEX, vp.HYDROPHOBICITY_DECREASE, vp.PROTEIN_CHEMICAL_INTERFACE, vp.FOLDX_VALUE, vp.CLINVAR_ID, vp.CLINVAR_CLINICAL_SIGNIFICANCE, vp.MUT_ORFEOME_NT, vp.MUT_ORFEOME_AA, vp.HGMD_ACCESSION, vp.MUT_HGMD_AA, vp.HGMD_VARIANT_CLASS, vp.EXAC_ALLELE_FREQUENCY, vp.PMID, vp.DISEASE_NAME, vp.INHERITANCE_PATTERN, vp.Y2H_EDGOTYPE

FROM  
  Gene AS g
    INNER JOIN Variant AS v ON g.ENTREZ_GENE_ID = v.ENTREZ_GENE_ID
    INNER JOIN VariantProperty AS vp ON v.VARIANT_ID = vp.VARIANT_ID
WHERE g.ENTREZ_GENE_ID IS NOT NULL
ORDER BY v.ENTREZ_GENE_ID ASC

INTO OUTFILE '/tmp/Variant.csv'
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';    

```
