import scrapy
import MySQLdb
from scrapy.loader import ItemLoader
from scrapy.selector import Selector
from annotatePy.items import PfamItem
from config import MYSQL_USER, MYSQL_HOST, MYSQL_PASSWD, MYSQL_DBNAME



class UniprotSpider(scrapy.Spider):
    name = "pfam"
    allowed_domains = ["http://pfam.xfam.org/"]

    def getUrls():
        """generate urls with pfam accessions"""
        db = MySQLdb.connect(
                    host = MYSQL_HOST,
                    user = MYSQL_USER,
                    db = MYSQL_DBNAME,
                    passwd = MYSQL_PASSWD)
        c = db.cursor()
        try:
            c.execute("""SELECT UNIPROT_PROTEIN_NAME FROM Gene WHERE UNIPROT_PROTEIN_NAME IS NOT NULL;""")
            res = c.fetchall()
            return ['http://pfam.xfam.org/protein/' + n[0] for n in res if n[0] is not None]
            db.commit()
        except MySQLdb.Error, e:
            spider.log("Error %d: %s" % (e.args[0], e.args[1]))


    start_urls = getUrls()

    # for testing purposes
    # start_urls = ['http://pfam.xfam.org/protein/S39A4_HUMAN',
    #                 'http://pfam.xfam.org/protein/KLH10_HUMAN']


    def parse(self, response):

        sel = Selector(response)
        table = sel.xpath("//*[@id='imageKey']/tbody/tr")

        for tr in table:
            l = ItemLoader(item=PfamItem(), selector=tr)
            l.add_value('proteinName', response.url)
            l.add_xpath('pfamAccession', "./td[position() = 1 and text() = 'Pfam']/@class")
            l.add_xpath('pfamID', "./td[2]/a/text()")
            l.add_xpath('sequenceStart', "./td[3]/text()")
            l.add_xpath('sequenceEnd', "./td[4]/text()")
            l.add_xpath('proteinLength', '//*[@id="proteinSummaryBlock"]/div[2]/table[1]/tbody/tr[3]/td[2]/text()')
            yield l.load_item()
