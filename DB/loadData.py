import MySQLdb
import csv
from collections import defaultdict
from Config import DB_HOST, DB_USER, DB_PASS, DB_NAME

REFSEQ_ID = "Mutation_RefSeq_NT"
HUGO_GENE_SYMBOL = "Symbol"
ENTREZ_GENE_ID = "Entrez_Gene_ID"
CCSB_ORF_ID = "CCSB_ORF_ID"
ORF_LENGTH = "ORF_length"
CDS_ORFEOME_SEQ = "CDS_HORFeome_8.1"



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


    def subsetCols(self, colList):
        """
        subset the columns of imported csv data

        @param colList list: list containing column name specified in header
        @return list(tuple): returns a unique subset of table
        """
        sort = [int(v) - 1 for v in self.data["Sort"]]
        subset =  [tuple([self.data[colname][i] for colname in colList]) for i in sort]
        return list(set(subset))


    def loadTables(self):
        """
        master function which controls individual insertion
        """
        self.loadGeneTable()
        self.loadTranscriptTable()
        self.db.close()

    def loadGeneTable(self):
        inserts = self.subsetCols([ENTREZ_GENE_ID, HUGO_GENE_SYMBOL])
        sql = """INSERT INTO Gene (ENTREZ_GENE_ID, HUGO_GENE_SYMBOL)
                VALUES (%s, %s)"""
        print(inserts)
        try:
            self.c.executemany(sql, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to gene table failed'
            raise e
            self.db.rollback()


    def loadTranscriptTable(self):
        subset = self.subsetCols([REFSEQ_ID, ENTREZ_GENE_ID])
        # have to remove duplicate tuples for insertion to work properly
        inserts = list(set([(t[0].split(':')[0], t[1]) for t in subset]))
        sql = """INSERT INTO Transcript (REFSEQ_ID, ENTREZ_GENE_ID)
                VALUES (%s, %s)"""
        try:
            self.c.executemany(sql, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to transcript table failed'
            raise e
            self.db.rollback()

    def loadORFeomeTable(self):
        inserts = self.subsetCols([CCSB_ORF_ID, ORF_LENGTH, CDS_ORFEOME_SEQ, ENTREZ_GENE_ID])
        sql = """INSERT INTO ORFeome (ORFEOME_ID, CCSB_ORF_ID, ORF_LENGTH, CDS_ORFEOME_SEQ, ENTREZ_GENE_ID)
                VALUES (0, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''))"""
        try:
            self.c.executemany(sql, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to ORFeome table failed'
            raise e
            self.db.rollback()

    def loadVariantTable(self):
        


if __name__ == "__main__":
    ld = LoadData()
    ld.importCSV("./origExcel/csvMutCollection.csv")
    # ld.loadGeneTable()
    # ld.loadTranscriptTable()
    # ld.loadORFeomeTable()
