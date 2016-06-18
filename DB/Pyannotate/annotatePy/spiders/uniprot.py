import scrapy
import MySQLdb
from scrapy.loader import ItemLoader
from annotatePy.items import UniprotItem
from config import MYSQL_USER, MYSQL_HOST, MYSQL_PASSWD, MYSQL_DBNAME

class UniprotSpider(scrapy.Spider):
    name = "uniprot"
    allowed_domains = ["http://www.uniprot.org/"]

    def getUrls():
        """generate urls with uniprot accessions"""
        db = MySQLdb.connect(
                    host = MYSQL_HOST,
                    user = MYSQL_USER,
                    db = MYSQL_DBNAME,
                    passwd = MYSQL_PASSWD)
        c = db.cursor()
        try:
            c.execute("""SELECT UNIPROT_SWISSPROT_ID FROM Gene;""")
            res = c.fetchall()
            return ['http://www.uniprot.org/uniprot/' + acc[0] for acc in res if acc[0] is not None]
            db.commit()
        except MySQLdb.Error, e:
            spider.log("Error %d: %s" % (e.args[0], e.args[1]))


    start_urls = getUrls()

    # for testing purposes
    # start_urls = ['http://www.uniprot.org/uniprot/P01023',
    #                 'http://www.uniprot.org/uniprot/P18440']


    def parse(self, response):
        l = ItemLoader(item=UniprotItem(), response=response)
        l.add_xpath('proteinName', "//*[@id='page-header']/h2/span/text()")
        l.add_value('uniprotAccession', response.url)
        yield l.load_item()
