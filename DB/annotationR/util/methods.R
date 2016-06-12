query <- function(con, sql.str){
  # return query data
  rs <- dbSendQuery(con, sql.str)
  data <- dbFetch(rs, n=-1)
  dbClearResult(rs)
  return(data)
}


checkGeneDuplicates <- function(df){
  row <- nrow(df)
  print(row)
  print(df[duplicated(df$entrezgene),1])
}


populate.omim.id <- function(con){
  # query
  sql.str <- 'SELECT ENTREZ_GENE_ID FROM Gene;'
  entrez.gene.id <- query(con, sql.str)$ENTREZ_GENE_ID

  # fetch annotation from ensembl
  attr <- c('entrezgene', 'mim_gene_accession')
  omim.id <- getBM(attributes=attr, filters='entrezgene', values=entrez.gene.id, mart=ensembl)

  # checkGeneDuplicates(omim.id) return 6513 manually check to delete one entry
  correct.omim.id <- omim.id[-c(which(omim.id$mim_gene_accession == 143090)),]
  # remove entrys where mim_gene_accession is NA
  correct.omim.id <- correct.omim.id[!is.na(correct.omim.id$mim_gene_accession),]
  # correct nrow output
  rownames(correct.omim.id) <- NULL

  constructGeneTableUpdates <- function(x, y){
    sql.str <- paste('UPDATE Gene SET OMIM_ID =', y ,'WHERE ENTREZ_GENE_ID =', x)
    dbSendQuery(con, sql.str)
  }
  mapply(constructGeneTableUpdates, correct.omim.id$entrezgene, correct.omim.id$mim_gene_accession)
}


populate.ensembl.gene.id <- function(con){
  # query
  sql.str <- 'SELECT ENTREZ_GENE_ID FROM Gene;'
  entrez.gene.id <- query(con, sql.str)$ENTREZ_GENE_ID

  # fetch annotation from ensembl
  attr <- c('entrezgene', 'ensembl_gene_id', 'chromosome_name', 'description')
  ensembl.id <- getBM(attributes=attr, filters='entrezgene', values=entrez.gene.id, mart=ensembl)

  # there is one-many mapping between entrez and ensembl. remove redundant ones
  correct.ensembl.id <- ensembl.id[!grepl("^.{3,}$", ensembl.id$chromosome_name),]
  correct.ensembl.id <- correct.ensembl.id[-c(which(correct.ensembl.id$ensembl_gene_id == 'ENSG00000243627'), which(correct.ensembl.id$ensembl_gene_id == 'ENSG00000282883')),]
  # remove sources from description
  correct.ensembl.id$description <- lapply(correct.ensembl.id$description, function(x){strsplit(x, '\\[(.*?)\\]')[1]})
  rownames(correct.ensembl.id) <- NULL

  constructGeneTableUpdates <- function(a, b, c, d){
    sql.str <- sprintf('UPDATE Gene SET ENSEMBL_GENE_ID = "%s", CHROMOSOME_NAME = "%s", DESCRIPTION = "%s" WHERE ENTREZ_GENE_ID = %i', b, c, d, a)
    dbSendQuery(con, sql.str)
  }
  mapply(constructGeneTableUpdates, correct.ensembl.id$entrezgene, correct.ensembl.id$ensembl_gene_id, correct.ensembl.id$chromosome_name, correct.ensembl.id$description)

  # manual update
  sql.str <- sprintf('UPDATE Gene SET CHROMOSOME_NAME = "%s", DESCRIPTION = "%s" WHERE ENTREZ_GENE_ID = %i', '22', 'glutathione S-transferase theta 1', 2952)
  dbSendQuery(con, sql.str)

}

populate.uniprot.id <- function(con){
  sql.str <- 'SELECT ENTREZ_GENE_ID FROM Gene;'
  entrez.gene.id <- query(con, sql.str)$ENTREZ_GENE_ID

  # fetch annotation from ensembl
  attr <- c('entrezgene', 'uniprot_swissprot')
  uniprot.id <- getBM(attributes=attr, filters='entrezgene', values=entrez.gene.id, mart=ensembl)
  correct.uniprot.id <- uniprot.id[uniprot.id$uniprot_swissprot != '',]
  correct.uniprot.id <- correct.uniprot.id[-c(which(correct.uniprot.id$uniprot_swissprot == 'A8MWV9'), which(correct.uniprot.id$uniprot_swissprot == 'Q06430'), which(correct.uniprot.id$uniprot_swissprot == 'Q8NFS9'), which(correct.uniprot.id$uniprot_swissprot == 'Q5JWF2'), which(correct.uniprot.id$uniprot_swissprot == 'P84996'), which(correct.uniprot.id$uniprot_swissprot == 'O95467')),]
  rownames(correct.uniprot.id) <- NULL


  constructGeneTableUpdates <- function(a, b){
    sql.str <- sprintf('UPDATE Gene SET UNIPROT_SWISSPROT_ID = "%s" WHERE ENTREZ_GENE_ID = %i', b, a)
    dbSendQuery(con, sql.str)
  }
  mapply(constructGeneTableUpdates, correct.uniprot.id$entrezgene, correct.uniprot.id$uniprot_swissprot)

  # manually adding 4 missing uniprot id..
  manualUpdate <- data.frame(entrezgene=c(12, 344, 4485, 10866), uniprot_swissprot=c('P01011', 'P02655', 'P26927', 'Q6MZN7'))
  mapply(constructGeneTableUpdates, manualUpdate$entrezgene, manualUpdate$uniprot_swissprot)
}
