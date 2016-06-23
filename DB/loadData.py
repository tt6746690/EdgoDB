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
CHR_COORDINATE_HG18 = "Chromosome_coordinate_hg18"
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
MUT_ORFEOME_NT = "Mutation_HORFeome_8.1_NT"
MUT_ORFEOME_AA = "Mutation_HORFeome_8.1_AA"
PMID = "pmid"
HGMD_ACCESSION = "HGMD_accession"
MUT_HGMD_AA = "Mutation_HGMD_AA"
HGMD_VARIANT_CLASS = "HGMD_variant_class"
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

# Y2H data
ALLELE_ID = "Allele_ID"
INTERACTOR_ENTREZ_GENE_ID = "Interactor_Gene_ID"
INTERACTOR_HUGO_GENE_SYMBOL = "Interactor_symbol"
Y2H_SCORE = "Y2H_score"



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
        self.data.clear()
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

    def generateExacVariantUrlForAnnotatePy(self):
        """generate url for scrapy start_urls"""
        try:
            self.c.execute("""SELECT CHR_COORDINATE_HG19, MUT_HGVS_NT_ID
                            FROM Variant WHERE CHR_COORDINATE_HG19 IS NOT NULL""")
            urls = ['http://exac.broadinstitute.org/variant/' +
                    i[0].split(':')[0].replace('chr', '') + '-' +
                    i[0].split(':')[1] + '-' + i[1][-3:].replace('>', '-')
                    for i in self.c.fetchall()]
            with open('exacVariantUrls.txt', 'w') as f:
                for url in urls:
                    f.write(url + '\n')
        except MySQLdb.Error, e:
            raise e

    def exportOneColtoJSON(self, tblName, colName):
        """ export just one column in one table to json"""
        try:
            sqlstr = """SELECT DISTINCT {} FROM {}""".format(colName, tblName)
            self.c.execute(sqlstr)
            # query return tuple as defult
            # have to conver to list[str] first
            result = [i[0] for i in self.c.fetchall()]
            with open(tblName + '.' + colName + '.json', 'w') as f:
                json.dump(result, f)
        except MySQLdb.Error, e:
            raise e

            # self.c.execute()
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
        subsets = self.subsetCols([CCSB_MUTATION_ID,         #0
                                    DBSNP_ID,                #1
                                    MUT_HGVS_NT_ID,          #2
                                    MUT_HGVS_AA_ID,          #3
                                    CHR_COORDINATE_HG18,     #4
                                    ENTREZ_GENE_ID])         #5
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = list(set([(t[0].split('_')[1], t[1],t[2].split(':')[0], t[2], t[3],
            t[2].split('.')[-1], t[3].split('.')[-1], t[4], t[5]) for t in inserts]))
        sqlstr = """INSERT INTO Variant(VARIANT_ID, CCSB_MUTATION_ID, DBSNP_ID,
                                    REFSEQ_ID, MUT_HGVS_NT_ID,
                                    MUT_HGVS_AA_ID, MUT_HGVS_NT,
                                    MUT_HGVS_AA, CHR_COORDINATE_HG18,
                                    ENTREZ_GENE_ID)
                VALUES (0, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insertion to Variant table failed'
            raise e
            self.db.rollback()

    def loadVariantPropertyTable(self):
        subsets = self.subsetCols([DISORDER_PROBABILITY, PFAM_PRESENT, IN_PFAM,
                IN_MOTIF, POLYPHEN_SCORE, POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY,
                CONSERVATION_INDEX, HYDROPHOBICITY_DECREASE, PROTEIN_CHEMICAL_INTERFACE,
                FOLDX_VALUE, CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, MUT_ORFEOME_NT,
                MUT_ORFEOME_AA, HGMD_ACCESSION, MUT_HGMD_AA, HGMD_VARIANT_CLASS,
                PMID, DISEASE_NAME, INHERITANCE_PATTERN, MUT_HGVS_NT_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = list(set([(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7],
            t[8], t[9], t[10], t[11] if t[11] else 0, t[12], t[13], t[14], t[15],
            t[16], t[17], t[18] if t[18] else 0, t[19], t[20], t[21]) for t in inserts]))
        # add nullif statement to any colname that is decimal or boolean (anything non-string)
        # in this case NULL represent empty cell otherwise '' represeent empty cell
        # for ids stored as INT, 0 represent empty cell
        sqlstr = """INSERT INTO VariantProperty (VARIANT_PROPERTY_ID,
                DISORDER_PROBABILITY, PFAM_PRESENT, IN_PFAM, IN_MOTIF,
                POLYPHEN_SCORE, POLYPHEN_CLASS, SOLVENT_ACCESSIBILITY,
                CONSERVATION_INDEX, HYDROPHOBICITY_DECREASE, PROTEIN_CHEMICAL_INTERFACE,
                FOLDX_VALUE, CLINVAR_ID, CLINVAR_CLINICAL_SIGNIFICANCE, MUT_ORFEOME_NT,
                MUT_ORFEOME_AA, HGMD_ACCESSION, MUT_HGMD_AA, HGMD_VARIANT_CLASS,
                PMID, DISEASE_NAME, INHERITANCE_PATTERN, VARIANT_ID)
                VALUES (0, NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''),
                NULLIF(%s, ''), %s, %s, NULLIF(%s, ''), NULLIF(%s, ''), %s, NULLIF(%s, ''),
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
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
        """ wrapper around loadLUMIERMeasurement(WT|MUT)Table"""
        Interactors = ["HSP90AB1", "HSPA8", "BAG2", "STUB1", "PSMD2", "HSPA5", "HSP90B1"]
        [self.loadLUMIERMeasurementWTTable(i) for i in Interactors]
        [self.loadLUMIERMeasurementMUTTable(i) for i in Interactors]


    def loadLUMIERMeasurementWTTable(self, interactor):
        """helper function to load the measurement table"""

        # create namespace for excel colnames
        INTERACTOR = interactor
        INTERACTION_Z_SCORE = interactor + ' wt'
        EXPRESSION_ELISA = interactor + ' wt ELISA'

        subsets = self.subsetCols([INTERACTION_Z_SCORE, EXPRESSION_ELISA, ENTREZ_GENE_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        # remove rows that does not contain the required data
        inserts = [t for t in inserts if t[0] and t[1] is not '']
        inserts = list(set([(interactor, t[0], t[1], t[2]) for t in inserts]))
        sqlstr = """INSERT INTO LUMIERMeasurementWT (LUMIER_MEASUREMENT_WT_ID,
                    INTERACTOR, INTERACTION_Z_SCORE, EXPRESSION_ELISA, ENTREZ_GENE_ID)
                    VALUES (0, %s, %s, %s, %s)"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into LUMIERMeasurementWT table failed'
            raise e
            self.db.rollback()

    def loadLUMIERMeasurementMUTTable(self, interactor):
        """helper function to load the measurement table"""

        # create namespace for excel colnames
        INTERACTOR = interactor
        INTERACTION_Z_SCORE = interactor + ' mut'
        INTERACTION_DIFFERENCE = interactor + ' diff Z'
        INTERACTION_SIGNIFICANT = interactor + ' Significant?'
        EXPRESSION_ELISA = interactor + ' mut ELISA'
        EXPRESSION_RATIO = interactor + ' ratio E'

        subsets = self.subsetCols([INTERACTION_Z_SCORE, INTERACTION_DIFFERENCE,
        INTERACTION_SIGNIFICANT, EXPRESSION_ELISA, EXPRESSION_RATIO, MUT_HGVS_NT_ID])
        inserts = self.replaceNullwithEmptyString(subsets)
        # remove rows that does not contain the required data
        inserts = [t for t in inserts if t[0] and t[1] and t[3] and t[4] is not '']
        inserts = [(interactor, t[0], t[1], 1 if t[2]=='hit' else 0, t[3], t[4], t[5]) for t in inserts]
        sqlstr = """INSERT INTO LUMIERMeasurementMUT (LUMIER_MEASUREMENT_MUT_ID,
                    INTERACTOR, INTERACTION_Z_SCORE, INTERACTION_DIFFERENCE,
                    INTERACTION_SIGNIFICANT, EXPRESSION_ELISA, EXPRESSION_RATIO, VARIANT_ID)
                    VALUES (0 , %s, %s, %s, %s, %s, %s,
                    (SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into LUMIERMeasurementMUT table failed'
            raise e
            self.db.rollback()

    def loadLUMIERSummaryTable(self):
        subsets = self.subsetCols([MUT_HGVS_NT_ID, WT_ELISA_AVERAGE, MUT_ELISA_AVERAGE,
        ELISA_RATIO_AVERAGE, ELISA_LOG2_RATIO_AVERAGE, ELISA_LOG2_RATIO_SE,
        ELISA_LOG2_RATIO_P_VALUE])
        inserts = self.replaceNullwithEmptyString(subsets)
        sqlstr = """INSERT INTO LUMIERSummary (VARIANT_ID, WT_ELISA_AVERAGE,
                    MUT_ELISA_AVERAGE, ELISA_RATIO_AVERAGE, ELISA_LOG2_RATIO_AVERAGE,
                    ELISA_LOG2_RATIO_SE,ELISA_LOG2_RATIO_P_VALUE)
                    VALUES ((SELECT VARIANT_ID FROM Variant WHERE MUT_HGVS_NT_ID = %s),
                    NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''), NULLIF(%s, ''),
                    NULLIF(%s, ''), NULLIF(%s, ''))"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into loadLUMIERSummary table failed'
            raise e
            self.db.rollback()

    def updateChrFromHg18ToHg19(self):
        # there is 78 missing chr location for variants
        # 2 additional chr location cannot be mapped with liftover

        from pyliftover import LiftOver
        lo = LiftOver('hg18ToHg19.over.chain.gz')

        def lifting(chrPosition):
            chromosome = chrPosition.split(':')[0]
            position = int(chrPosition.split(':')[1])
            convert = lo.convert_coordinate(chromosome, position)
            if len(convert) != 1:
                print('liftover failed to convert one-to-one at {}:{}'
                        .format(chromosome, position))
                return ''
            rs = ':'.join((str(convert[0][0]), str(convert[0][1])))
            return rs


        subsets = self.subsetCols([MUT_HGVS_NT_ID, CHR_COORDINATE_HG18])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = [t for t in inserts if t[1] != '']
        inserts = [(lifting(t[1]), t[0]) for t in inserts]

        sqlstr = """UPDATE Variant
                    SET CHR_COORDINATE_HG19 = NULLIF(%s, '')
                    WHERE MUT_HGVS_NT_ID = %s;"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'update hg18 to hg19 failed'
            raise e
            self.db.rollback()

    def loadTables(self):
        """
        master function which controls individual insertion
        """
        self.loadGeneTable()
        self.loadORFeomeTable()
        self.loadVariantTable()
        self.loadVariantPropertyTable()
        self.loadLocalCollectionTable()
        self.loadMeasurementTable()
        self.loadLUMIERSummaryTable()
        self.updateChrFromHg18ToHg19()

    def loadY2HInteractorTable(self):
        """ populate Y2HWTInteractor and Y2HMUTInteractor table with data
        contained in mmc3.csv"""
        subsets = self.subsetCols([ALLELE_ID, INTERACTOR_ENTREZ_GENE_ID, Y2H_SCORE])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = [(t[0].split('_')[0], t[0].split('_')[1], t[1], t[2]) for t in inserts]
        WTinserts = [t for t in inserts if t[1] == "0"]
        WTinserts = [(t[2], t[3], t[0]) for t in WTinserts]
        MUTinserts = [t for t in inserts if t[1] != "0"]
        MUTinserts = [(t[2], t[3], t[1]) for t in MUTinserts]

        sqlstr = """INSERT INTO Y2HWTInteractor (Y2H_WT_INTERACTOR_ID,
                    INTERACTOR_ENTREZ_GENE_ID, Y2H_SCORE, ENTREZ_GENE_ID)
                    VALUES (0, %s, %s, %s);"""

        try:
            self.c.executemany(sqlstr, WTinserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into WTInteractor table failed'
            raise e
            self.db.rollback()

        sqlstr = """INSERT INTO Y2HMUTInteractor (Y2H_MUT_INTERACTOR_ID,
                    INTERACTOR_ENTREZ_GENE_ID, Y2H_SCORE, VARIANT_ID)
                    VALUES (0, %s, %s, (SELECT VARIANT_ID FROM Variant
                    WHERE CCSB_MUTATION_ID = %s LIMIT 1));"""
        try:
            self.c.executemany(sqlstr, MUTinserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'insert into MUTInteractor table failed'
            raise e
            self.db.rollback()

    def addInteractorToGeneTable(self):
        """ add target interactor in Y2HInteractor to Gene tabe using mmc3.csv
        this is required for generating nodes for force directed graph"""
        subsets = self.subsetCols([INTERACTOR_ENTREZ_GENE_ID, INTERACTOR_HUGO_GENE_SYMBOL])
        inserts = self.replaceNullwithEmptyString(subsets)
        inserts = [(int(t[0]), t[1]) for t in inserts]
        sqlstr = """INSERT IGNORE INTO Gene
                    SET ENTREZ_GENE_ID = %s, HUGO_GENE_SYMBOL = %s;"""
        try:
            self.c.executemany(sqlstr, inserts)
            self.db.commit()
        except MySQLdb.Error, e:
            print 'adding interactor to Gene table failed'
            raise e
            self.db.rollback()


if __name__ == "__main__":
    ld = LoadData()
    ld.importCSV("./origExcel/csvMutCollection.csv")
    ld.loadTables()
    ld.importCSV("./origExcel/mmc3.csv")
    ld.loadY2HInteractorTable()
    ld.addInteractorToGeneTable()
    # ld.generateExacVariantUrlForAnnotatePy()
