
__Get ORF sequence of transcript with refseq ID NM_001613__

```sql
SELECT ORFeome.CDS_ORFEOME_SEQ
FROM ORFeome JOIN Transcript USING (ENTREZ_GENE_ID)
WHERE (REFSEQ_ID = "NM_001613");
```
