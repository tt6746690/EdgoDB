# -*- coding: utf-8 -*-
from annotatePy.items import UniprotItem, ExacItem, PfamItem
from scrapy.exceptions import DropItem
import MySQLdb
from utils import convertBP


class ManipulateFieldPipeline(object):

    def process_item(self, item, spider):
        if isinstance(item, ExacItem):
            item['chrLocation'] = 'chr' + item['variantName'].split(' ', 1)[0]
            item['mutation'] = item['variantName'].split(' ', 1)[1].replace(' ', '').replace('/', '>')
            return item

        if isinstance(item, UniprotItem):
            print item
            return item

        if isinstance(item, PfamItem):
            return item

class MySQLUpdatePipeline(object):

    def __init__(self, settings):
        self.settings = settings
        self.db = MySQLdb.connect(
                    host = settings['MYSQL_HOST'],
                    user = settings['MYSQL_USER'],
                    db = settings['MYSQL_DBNAME'],
                    passwd = settings['MYSQL_PASSWD'],
                    charset="utf8")
        self.c = self.db.cursor()

    @classmethod
    def from_crawler(cls, crawler):
        settings = crawler.settings
        return cls(settings)

    def process_item(self, item, spider):

        if isinstance(item, ExacItem):
            inverseMut = convertBP(item['mutation'])
            try:
                self.c.execute("""UPDATE VariantProperty
                                      JOIN Variant USING(VARIANT_ID)
                                  SET EXAC_ALLELE_FREQUENCY = %s
                                  WHERE CHR_COORDINATE_HG19 = %s AND
                                    (MUT_HGVS_NT_ID LIKE %s OR
                                    MUT_HGVS_NT_ID LIKE %s)""",
                                (item['alleleFrequency'],
                                item['chrLocation'],
                                '%' + item['mutation'],
                                '%' + inverseMut))
                self.db.commit()
            except MySQLdb.Error, e:
                spider.log("Error %d: %s" % (e.args[0], e.args[1]))
            return item

        if isinstance(item, UniprotItem):
            try:
                self.c.execute("""UPDATE Gene
                                SET UNIPROT_PROTEIN_NAME = %s
                                WHERE UNIPROT_SWISSPROT_ID = %s;""",
                                (item['proteinName'],
                                item['uniprotAccession']))
                self.db.commit()
            except MySQLdb.Error, e:
                spider.log("Error %d: %s" % (e.args[0], e.args[1]))

            try:
                self.c.execute("""UPDATE Gene
                                SET UNIPROT_PROTEIN_LOCALIZATION = %s
                                WHERE UNIPROT_SWISSPROT_ID = %s;""",
                                (item['uniprotLocalization'],
                                item['uniprotAccession']))
                self.db.commit()
            except MySQLdb.Error, e:
                spider.log("Error %d: %s" % (e.args[0], e.args[1]))

            try:
                self.c.execute("""UPDATE Gene
                                SET UNIPROT_PROTEIN_LENGTH = %s
                                WHERE UNIPROT_SWISSPROT_ID = %s;""",
                                (item['uniprotProteinLength'],
                                item['uniprotAccession']))
                self.db.commit()
            except MySQLdb.Error, e:
                spider.log("Error %d: %s" % (e.args[0], e.args[1]))
            return item



        if isinstance(item, PfamItem):
            # here 5 is number of item in PfamItem
            # therefore filters anb aborts incomplete extractions
            if len(item) == 6:
                try:
                    sqlstr = """INSERT INTO PfamDomain (PFAM_DOMAIN_ID, PFAM_ACCESSION,
                                PFAM_ID, PROTEIN_LENGTH, SEQ_START, SEQ_END, UNIPROT_PROTEIN_NAME)
                                VALUES (0, %s, %s, %s, %s, %s, %s)"""
                    inserts = (item['pfamAccession'], item['pfamID'], item['proteinLength'],
                        item['sequenceStart'], item['sequenceEnd'], item['proteinName'])
                    self.c.execute(sqlstr, inserts)
                    self.db.commit()
                except MySQLdb.Error, e:
                    spider.log("Error %d: %s" % (e.args[0], e.args[1]))
            return item
