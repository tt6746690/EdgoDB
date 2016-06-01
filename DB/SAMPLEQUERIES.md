
__Get ORF sequence of transcript with refseq ID (NM_001613)__

```sql
SELECT ORFeome.CDS_ORFEOME_SEQ
FROM ORFeome JOIN Transcript USING (ENTREZ_GENE_ID)
WHERE (REFSEQ_ID = "NM_001613");
```


__Get a list of genes with a given disease (Hypospadias)__

```sql
SELECT Gene.HUGO_GENE_SYMBOL
FROM Gene JOIN Transcript USING (ENTREZ_GENE_ID)
          JOIN Variant USING(REFSEQ_ID)
          JOIN Disease USING(VARIANT_ID)
WHERE (Disease.DISEASE_NAME = "Hypospadias");
```
