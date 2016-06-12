# -*- coding: utf-8 -*-

from scrapy.exceptions import DropItem
import MySQLdb



class ManipulateFieldPipeline(object):

    def process_item(self, item, spider):
        item['chrLocation'] = 'chr' + item['variantName'].split(' ', 1)[0]
        item['mutation'] = item['variantName'].split(' ', 1)[1].replace(' ', '').replace('/', '>')
        return item


class MySQLUpdatePipeline(object):
    def __init__(self):
        self.db = MySQLdb.connect(
                    host = settings['MYSQL_HOST'],
                    user = settings['MYSQL_USER'],
                    db = settings['MYSQL_DBNAME'],
                    passwd = settings['MYSQL_PASSWD'])
        self.c = self.db.cursor()

    @classmethod
    def from_crawler(cls, crawler):
        settings = crawler.settings

    def process_item(self, item, spider):
        try:
            self.c.execute("""UPDATE Variant SET EXAC_ALLELE_FREQUENCY = %s
                            WHERE CHR_COORDINATE_HG19 = '%s' """,
                            (item['alleleFrequency'], item['chrLocation']))
            self.db.commit()
            spider.log("Item updated in db: %s %s" % (item['alleleFrequency'], item['chrLocation']))
        except MySQLdb.Error, e:
            spider.log("Error %d: %s" % (e.args[0], e.args[1]))
        return item
# AND MUT_HGVS_NT LIKE '_%s'
