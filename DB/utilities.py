from loadData import LoadData

if __name__ == "__main__":
    ld = LoadData()
    ld.importCSV("./origExcel/csvMutCollection.csv")
    # ld.generateExacVariantUrlForAnnotatePy()
    ld.exportOneColtoJSON('Gene', 'HUGO_GENE_SYMBOL')
    ld.exportOneColtoJSON('Variant', 'MUT_HGVS_NT_ID')

    ld.exportOneColtoJSON('VariantProperty', 'CLINVAR_CLINICAL_SIGNIFICANCE')
    ld.exportOneColtoJSON('VariantProperty', 'PFAM_PRESENT')
    ld.exportOneColtoJSON('VariantProperty', 'IN_PFAM')
    ld.exportOneColtoJSON('VariantProperty', 'IN_MOTIF')
    ld.exportOneColtoJSON('Variant', 'CCSB_MUTATION_ID')
    ld.exportOneColtoJSON('Variant', 'DBSNP_ID')
    ld.exportOneColtoJSON('Variant', 'CHR_COORDINATE_HG19')
    ld.exportOneColtoJSON('Variant', 'MUT_HGVS_AA_ID')
    ld.exportOneColtoJSON('Variant', 'HGMD_VARIANT_CLASS')
    ld.exportOneColtoJSON('Gene', 'OMIM_ID')
    ld.exportOneColtoJSON('Gene', 'ENTREZ_GENE_ID')
    ld.exportOneColtoJSON('Gene', 'UNIPROT_SWISSPROT_ID')
    ld.exportOneColtoJSON('Gene', 'CHROMOSOME_NAME')
