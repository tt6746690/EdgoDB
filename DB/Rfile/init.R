library(data.table)

pdf("./sink/mutant_allele_collection_analysis.pdf")
sink("./sink/mutant_allele_collection_analysis.txt")

collection_path = file.path(getwd(), 'data', 'Mutant_allele_collection_all.csv')
collection_DT <- data.table(read.csv(collection_path, header = TRUE))



# basic statistics on mutant distribution
# number of mutant   1    2    3    4
# number of genes   388  358  444 1692
# Majority of genes selected have 4 missense mutations
# summary(factor(Symbolcut[,Symbol.count]))

# gene related attribute matches
Symbolcut <- collection_DT[, Symbol.count := .N, by=Symbol]
CCSB_ORF_IDcut <- collection_DT[, CCSB_ORF_ID.count := .N, by=CCSB_ORF_ID]
Ref_ORFSeqcut <- collection_DT[, Ref_ORFSeq.count := .N, by=Ref_ORFSeq]
ORF_lengcut <- collection_DT[, ORF_leng.count := .N, by=ORF_leng]
ENTREZ_GENE_IDcut <- collection_DT[, ENTREZ_GENE_ID.count := .N, by=ENTREZ_GENE_ID]
# print(identical(Symbolcut[,Symbol.count], CCSB_ORF_IDcut[,CCSB_ORF_ID.count]))  # -> returns true
# print(identical(Symbolcut[,Symbol.count], Ref_ORFSeqcut[, Ref_ORFSeq.count]))   # -> returns true
# print(identical(Symbolcut[,Symbol.count], ORF_lengcut[, ORF_leng.count]))       # -> return false
# print(identical(Symbolcut[,Symbol.count], ENTREZ_GENE_IDcut[, ENTREZ_GENE_ID.count])) # -> returns trues

print('331 AA_change_HGMD does not match HGSV_protein')
# 331 AA_change_HGMD does not match HGSV_protein
print(collection_DT[,V1 := grepl(AA_change_HGMD, HGVS_protein), by=AA_change_HGMD][V1==FALSE, .(Sort,Symbol, AA_change_HGMD, HGVS_protein, V1)], nrows=400)

# # returns EVERY tuple: codon_number_HGMD match AA_change_HGMD, therefore can be removed.
# print(collection_DT[,V5 := grepl(codon_number_HGMD, AA_change_HGMD), by=codon_number_HGMD][V5==TRUE,Sort,Symbol])
# # return EVERY tuple: EXP_AA, codon_number_HGMD, MUT_AA can be represented by AA_change_HGMD alone
# print(collection_DT[,V6 := paste(EXP_AA, codon_number_HGMD, MUT_AA, sep='')][V6==AA_change_HGMD,V6, AA_change_HGMD])


# # EXP_NT and MUT_NT matches exactly with HGVS_cdna
# temp <- collection_DT[,V7 := paste(EXP_NT, '-', MUT_NT, sep='')]
# print(temp[, V8:= grepl(V7, HGVS_cdna), by=V7][V8==TRUE, .(Sort,Symbol,V7,HGVS_cdna)])

print('347 DNA_MUT_POS_mapped_to_ORFeome position does not match hgvs_cnda')
# HOWEVER 347 DNA_MUT_POS_mapped_to_ORFeome position does not match hgvs_cnda
temp <- collection_DT[,V3 := paste(DNA_MUT_POS_mapped_to_ORFeome, EXP_NT, '-', MUT_NT, sep='')]
print(temp[, V4:= grepl(V3, HGVS_cdna), by=V3][V4==FALSE, .(Sort, Symbol, V3, HGVS_cdna, V4)], nrows=400)

dev.off()
