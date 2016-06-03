import MySQLdb
import csv
from collections import defaultdict
from Config import DB_HOST, DB_USER, DB_PASS, DB_NAME
import json



SORT = "Sort"
# Gene
REFSEQ_ID = "Mutation_RefSeq_NT"
HUGO_GENE_SYMBOL = "Symbol"
ENTREZ_GENE_ID = "Entrez_Gene_ID"
# ORFeome
CCSB_ORF_ID = "CCSB_ORF_ID"
ORF_LENGTH = "ORF_length"
CDS_ORFEOME_SEQ = "CDS_HORFeome_8.1"
# Variant
CCSB_MUTATION_ID = "Allele_ID"
DBSNP_ID = "dbSNP_ID"
MUT_HGVS_NT_ID = "Mutation_RefSeq_NT"
MUT_HGVS_AA_ID = "Mutation_RefSeq_AA"
MUT_ORFEOME_NT = "Mutation_HORFeome_8.1_NT"
MUT_ORFEOME_AA = "Mutation_HORFeome_8.1_AA"
CHR_COORDINATE_HG18 = "Chromosome_coordinate_hg18"
PMID = "pmid"
HGMD_ACCESSION = "HGMD_accession"
MUT_HGMD_AA = "Mutation_HGMD_AA"
HGMD_VARIANT_CLASS = "HGMD_variant_class"
# Disease
DISEASE_NAME = "Disease"
INHERITANCE_PATTERN = 'Inheritance'
# VariantProperty
DISORDER_PROBABILITY = "Disorder_probability"
PFAM_PRESENT = "Pfam_present"
IN_PFAM = "In_Pfam"
IN_MOTIF = "In_motif"
POLYPHEN_SCORE = "PolyPhen_2_score"
POLYPHEN_CLASS = "PolyPhen_class"
SOLVENT_ACCESSIBILITY = "Solvent_accessibility"
CONSERVATION_INDEX = "Conservation_index"
HYDROPHOBICITY_DECREASE = "Hydrophobicity_decrease"
PROTEIN_CHEMICAL_INTERFACE = "Protein_chemical_interface"
FOLDX_VALUE = "FoldX_value"
CLINVAR_ID = "ClinVar_ID"
CLINVAR_CLINICAL_SIGNIFICANCE = "ClinVar_clinical_significance"
# LocalCollection
ENTRY_CLONE_PLATE = "Ph1Mut_PLA"
ENTRY_CLONE_WELL = "Ph1Mut_POS"
FLAG_CLONE_ID = "3xFLAG_clone_ID"
FLAG_CHECK = "3xFLAG_BsrGI_check"
# SummaryStatistics
WT_ELISA_AVERAGE = "Average ELISA wt"
MUT_ELISA_AVERAGE = "Average ELISA mut"
ELISA_RATIO_AVERAGE = "Average ELISA ratio"
ELISA_LOG2_RATIO_AVERAGE = "Average ELISA log2 ratio"
ELISA_LOG2_RATIO_SE = "Average ELISA log2 ratio SE"
ELISA_LOG2_RATIO_P_VALUE = "ELISA log2 ratio p-value"

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

### Importing files
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
        with index of tuples as keys"; mostly to see if a column has empty str"""
        dic = defaultdict(int)
        for item in listoftuples:
            for i, v in enumerate(item):
                if v == '':
                    dic[str(i)] += 1
        return dic

    def exportToJSON(self, colName):
        """exporting specific columns to json format"""
        data = self.data[colName]
        with open(colName +'.txt', 'w') as outfile:
            json.dump(data, outfile)

### Loading methods

    def loadGeneTable(self):
        inserts = self.subsetCols([ENTREZ_GENE_ID, HUGO_GENE_SYMBOL])
        sqlstr = """INSERT INTO Gene (ENTREZ_GENE_ID, HUGO_GENE_SYMBOL)
                VALUES (%s, %s);"""
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
                                    PMID, HGMD_ACCESSION, MUT_HGMD_AA,
                                    HGMD_VARIANT_CLASS, REFSEQ_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = list(set([(t[0].split('_')[1], t[1],t[2], t[3], t[4], t[5],
            t[6], t[7] if t[7] else 0, t[8], t[9], t[10], t[11].split(':')[0]) for t in inserts]))
        sqlstr = """INSERT INTO Variant(VARIANT_ID, CCSB_MUTATION_ID, DBSNP_ID, MUT_HGVS_NT_ID,
                                    MUT_HGVS_AA_ID, MUT_ORFEOME_NT,
                                    MUT_ORFEOME_AA, CHR_COORDINATE_HG18,
                                    PMID, HGMD_ACCESSION, MUT_HGMD_AA,
                                    HGMD_VARIANT_CLASS, REFSEQ_ID)
                VALUES (0, %s, %s, %s, %s, %s, %s, %s, %s, NULLIF(%s, ''), %s, %s, %s);"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insertion to Variant table failed'
            raise e
            self.db.rollback()

    def loadDiseaseTable(self):
        subsets = self.subsetCols([DISEASE_NAME, INHERITANCE_PATTERN, MUT_HGVS_NT_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        sqlstr = """INSERT INTO Disease (DISEASE_ID, DISEASE_NAME, INHERITANCE_PATTERN, VARIANT_ID)
                VALUES (0, %s, %s, (SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s))
                """
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert to disease table failed'
            raise e
            self.db.rollback()

    def loadVariantPropertyTable(self):
        subsets = self.subsetCols([DISORDER_PROBABILITY, PFAM_PRESENT, IN_PFAM,
                IN_MOTIF, POLYPHEN_SCORE, POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY,
                CONSERVATION_INDEX, HYDROPHOBICITY_DECREASE, PROTEIN_CHEMICAL_INTERFACE,
                FOLDX_VALUE, CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, MUT_HGVS_NT_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = list(set([(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7],
            t[8], t[9], t[10], t[11] if t[11] else 0, t[12], t[13]) for t in inserts]))
        # add nullif statement to any colname that is decimal or boolean (anything non-string)
        # in this case NULL represent empty cell otherwise '' represeent empty cell
        # for ids stored as INT, 0 represent empty cell
        sqlstr = """INSERT INTO VariantProperty (VARIANT_PROPERTY_ID,
                DISORDER_PROBABILITY, PFAM_PRESENT, IN_PFAM, IN_MOTIF,
                POLYPHEN_SCORE, POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY,
                CONSERVATION_INDEX, HYDROPHOBICITY_DECREASE, PROTEIN_CHEMICAL_INTERFACE,
                FOLDX_VALUE, CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, VARIANT_ID)
                VALUES (0, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''),
                NULLIF(%s, ''), %s, %s, NULLIF(%s, ''), NULLIF(%s, ''), %s, NULLIF(%s, ''),
                %s, %s,
                (SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into VariantProperty table failed'
            raise e
            self.db.rollback()


    def loadLocalCollectionTable(self):
        subsets = self.subsetCols([ENTRY_CLONE_PLATE, ENTRY_CLONE_WELL,
                                   FLAG_CLONE_ID,
                                   FLAG_CHECK, MUT_HGVS_NT_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        # "".spilt('@')[0] returns "" but "".spilt('@')[1] returns index out of range
        inserts = [(t[0], t[1], t[2].split('@')[0] if t[2] else '',
                t[2].split('@')[1] if t[2] else '', t[3], t[4]) for t in inserts]
        sqlstr = """INSERT INTO LocalCollection (LOCAL_COLLECTION_ID, ENTRY_CLONE_PLATE,
                    ENTRY_CLONE_WELL, DESTINATION_CLONE_PLATE, DESTINATION_CLONE_WELL,
                    FLAG_CHECK, VARIANT_ID)
                    VALUES (0, %s, %s, %s, %s, %s,
                    (SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into LocalCollection table failed'
            raise e
            self.db.rollback()

    def loadMeasurementTable(self):
        """ wrapper around loadOneMeasurement"""
        Interactors = ["HSP90AB1", "HSPA8", "BAG2", "STUB1", "PSMD2", "HSPA5", "HSP90B1"]
        [self.loadOneMeasurement(i) for i in Interactors]


    def loadOneMeasurement(self, interactor):
        """helper function to load the measurement table"""

        # create namespace for excel colnames
        INTERACTOR = interactor
        INTERACTION_WT_Z_SCORE = interactor + ' wt'
        INTERACTION_MUT_Z_SCORE = interactor + ' mut'
        INTERACTION_DIFF = interactor + ' diff Z'
        INTERACTION_SIGNIFICANT = interactor + ' Significant?'
        EXPRESSION_WT_ELISA = interactor + ' wt ELISA'
        EXPRESSION_MUT_ELISA = interactor + ' mut ELISA'
        EXPRESSION_RATIO = interactor + ' ratio E'

        subsets = self.subsetCols([MUT_HGVS_NT_ID, INTERACTION_WT_Z_SCORE,
        INTERACTION_MUT_Z_SCORE, INTERACTION_DIFF, INTERACTION_SIGNIFICANT,
        EXPRESSION_WT_ELISA, EXPRESSION_MUT_ELISA, EXPRESSION_RATIO])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = [(t[0], interactor, t[1], t[2], t[3], 1 if t[4]=='hit' else 0, t[5], t[6], t[7]) for t in inserts]
        sqlstr = """INSERT INTO Measurement (VARIANT_ID, INTERACTOR, INTERACTION_WT_Z_SCORE,
                    INTERACTION_MUT_Z_SCORE, INTERACTION_DIFF, INTERACTION_SIGNIFICANT,
                    EXPRESSION_WT_ELISA, EXPRESSION_MUT_ELISA, EXPRESSION_RATIO)
                    VALUES ((SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s),
                    %s, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), %s,
                    NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into LocalCollection table failed'
            raise e
            self.db.rollback()

    def loadSummaryStatisticsTable(self):
        subsets = self.subsetCols([MUT_HGVS_NT_ID, WT_ELISA_AVERAGE, MUT_ELISA_AVERAGE,
        ELISA_RATIO_AVERAGE, ELISA_LOG2_RATIO_AVERAGE, ELISA_LOG2_RATIO_SE,
        ELISA_LOG2_RATIO_P_VALUE])
        inserts = self.replaceNullwithEmptyString(subsets)
        sqlstr = """INSERT INTO SummaryStatistics (VARIANT_ID, WT_ELISA_AVERAGE,
                    MUT_ELISA_AVERAGE, ELISA_RATIO_AVERAGE, ELISA_LOG2_RATIO_AVERAGE,
                    ELISA_LOG2_RATIO_SE,ELISA_LOG2_RATIO_P_VALUE)
                    VALUES ((SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s),
                    NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''),
                    NULLIF(%s, ''), NULLIF(%s, ''))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into LocalCollection table failed'
            raise e
            self.db.rollback()

    def loadTables(self):
        """
        master function which controls individual insertion
        """
        self.loadGeneTable()
        self.loadTranscriptTable()
        self.loadORFeomeTable()
        self.loadVariantTable()
        self.loadVariantPropertyTable()
        self.loadLocalCollectionTable()
        self.loadMeasurementTable()
        self.loadSummaryStatisticsTable()


if __name__ == "__main__":
    ld = LoadData()
    ld.importCSV("./origExcel/csvMutCollection.csv")
    ld.loadTables()
