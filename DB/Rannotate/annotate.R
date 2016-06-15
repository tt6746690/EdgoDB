library("biomaRt")
library("RMySQL")
source("./util/methods.R")

# connect to local mysql database
con <- dbConnect(MySQL(), user="public",
        dbname="EdgoDB", host="localhost")
tables <- dbListTables(con)

# create mart object for query
ensembl <- useMart("ensembl",dataset="hsapiens_gene_ensembl")
filters <- listFilters(ensembl)
attributes <- listAttributes(ensembl)

# find attributes using grepl
attributes[grepl('ref', attributes[[1]]),]

populate.omim.id(con)
populate.ensembl.gene.id(con)
populate.uniprot.id(con)


dbDisconnect(con)  # closing connection
