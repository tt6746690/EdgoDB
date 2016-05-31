import MySQLdb
import csv
from collections import defaultdict
from Config import DB_HOST, DB_USER, DB_PASS, DB_NAME

SORT = "Sort"

REFSEQ_ID = "Mutation_RefSeq_NT"
HUGO_GENE_SYMBOL = "Symbol"
ENTREZ_GENE_ID = "Entrez_Gene_ID"

CCSB_ORF_ID = "CCSB_ORF_ID"
ORF_LENGTH = "ORF_length"
CDS_ORFEOME_SEQ = "CDS_HORFeome_8.1"

CCSB_MUTATION_ID = "Allele_ID"
DBSNP_ID = "dbSNP_ID"
MUT_HGVS_NT_ID = "Mutation_RefSeq_NT"
MUT_HGVS_AA_ID = "Mutation_RefSeq_AA"
MUT_ORFEOME_NT = "Mutation_HORFeome_8.1_NT"
MUT_ORFEOME_AA = "Mutation_HORFeome_8.1_AA"
CHR_COORDINATE_HG18 = "Chromosome_coordinate_hg18"
PMID = "pmid"




class LoadData:
    """
    loading data from excel to mysql using mysqldb
    """

    def __init__(self):
        """
        initiate data loading from excel
        """
        self.db = MySQLdb.connect(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        # A Cursor object execute queries
        self.c = self.db.cursor()
        self.data = defaultdict(list)


    def importCSV(self, excelPath):
        """
        import CSV file and store columns as dict[list[tuple]] in self.data
        """
        header = []
        with open(excelPath, 'r') as csvfile:
            data = csv.reader(csvfile)
            for index,row in enumerate(data):
                if index == 0:  # first row
                    header = row
                else:            # other rows
                    for i,v in enumerate(header):
                        self.data[v].append(row[i])


### Utilities
    def subsetCols(self, colList):
        """
        subset the columns of imported csv data

        @param colList list: list containing column name specified in header
        @return list(tuple): returns a unique subset of table
        """
        sort = [int(v) - 1 for v in self.data["Sort"]]
        subset =  [tuple([self.data[colname][i] for colname in colList]) for i in sort]
        return list(set(subset))

    def replaceNullwithEmptyString(self, listoftuples):
        """ replace null with empty string in list[tuple]"""
        return [[v.replace('NULL', '') for v in t] for t in listoftuples]

    def checkEmptyString(self, listoftuples):
        """check for empty string in list[tuple] and return a dictionary
        with index of tuples as keys"""
        dic = defaultdict(int)
        for item in listoftuples:
            for i, v in enumerate(item):
                if v == '':
                    dic[str(i)] += 1
        return dic

### Loading methods

    def loadTables(self):
        """
        master function which controls individual insertion
        """
        self.loadGeneTable()
        self.loadTranscriptTable()
        self.loadORFeomeTable()
        self.loadVariantTable()

    def loadGeneTable(self):
        inserts = self.subsetCols([ENTREZ_GENE_ID, HUGO_GENE_SYMBOL])
        sqlstr = """INSERT INTO Gene (ENTREZ_GENE_ID, HUGO_GENE_SYMBOL)
                VALUES (%s, %s);"""
        print(inserts)
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to gene table failed'
            raise e
            self.db.rollback()


    def loadTranscriptTable(self):
        subset = self.subsetCols([REFSEQ_ID, ENTREZ_GENE_ID])
        # have to remove duplicate tuples for insertion to work properly
        inserts = list(set([(t[0].split(':')[0], t[1]) for t in subset]))
        sqlstr = """INSERT INTO Transcript (REFSEQ_ID, ENTREZ_GENE_ID)
                VALUES (%s, %s);"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to transcript table failed'
            raise e
            self.db.rollback()

    def loadORFeomeTable(self):
        inserts = self.subsetCols([CCSB_ORF_ID, ORF_LENGTH, CDS_ORFEOME_SEQ, ENTREZ_GENE_ID])
        sqlstr = """INSERT INTO ORFeome (ORFEOME_ID, CCSB_ORF_ID, ORF_LENGTH, CDS_ORFEOME_SEQ, ENTREZ_GENE_ID)
                VALUES (0, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''));"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to ORFeome table failed'
            raise e
            self.db.rollback()

    def loadVariantTable(self):
        subsets = self.subsetCols([CCSB_MUTATION_ID, DBSNP_ID, MUT_HGVS_NT_ID,
                                    MUT_HGVS_AA_ID, MUT_ORFEOME_NT,
                                    MUT_ORFEOME_AA, CHR_COORDINATE_HG18,
                                    PMID, REFSEQ_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = list(set([(t[0].split('_')[1], t[1],t[2], t[3], t[4], t[5],
            t[6], t[7] if t[7] else 0, t[8].split(':')[0]) for t in inserts]))
        sqlstr = """INSERT INTO Variant(VARIANT_ID, CCSB_MUTATION_ID, DBSNP_ID, MUT_HGVS_NT_ID,
                                    MUT_HGVS_AA_ID, MUT_ORFEOME_NT,
                                    MUT_ORFEOME_AA, CHR_COORDINATE_HG18,
                                    PMID, REFSEQ_ID)
                VALUES (0, %s, NULLIF(%s, ''), %s, %s, %s, %s, %s, %s, %s);"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insertion to Variant table failed'
            raise e
            self.db.rollback()

    def loadDiseaseTable(self):
        subsets = self.subsetCols([DISEASE_NAME, INHERITANCE_PATTERN, REFSEQ_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts =

if __name__ == "__main__":
    ld = LoadData()
    ld.importCSV("./origExcel/csvMutCollection.csv")
    # ld.loadGeneTable()
    # ld.loadTranscriptTable()
    # ld.loadORFeomeTable()
    # ld.loadVariantTable()
    ld.loadTables()
