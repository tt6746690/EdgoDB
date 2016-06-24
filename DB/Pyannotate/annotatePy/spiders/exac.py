# -*- coding: utf-8 -*-
import scrapy
import MySQLdb
from scrapy.loader import ItemLoader
from annotatePy.items import ExacItem
from config import MYSQL_USER, MYSQL_HOST, MYSQL_PASSWD, MYSQL_DBNAME


class ExacSpider(scrapy.Spider):
    name = "exac"
    allowed_domains = ["http://exac.broadinstitute.org/"]


    def getUrls():
        """generate urls with pfam accessions"""
        db = MySQLdb.connect(
                    host = MYSQL_HOST,
                    user = MYSQL_USER,
                    db = MYSQL_DBNAME,
                    passwd = MYSQL_PASSWD)
        c = db.cursor()
        try:
            c.execute("""SELECT CHR_COORDINATE_HG19, MUT_HGVS_NT_ID
                         FROM Variant WHERE CHR_COORDINATE_HG19 IS NOT NULL;""")
            urls = ['http://exac.broadinstitute.org/variant/' +
                    i[0].split(':')[0].replace('chr', '') + '-' +
                    i[0].split(':')[1] + '-' + i[1][-3:].replace('>', '-')
                    for i in c.fetchall()]
            return urls
            db.commit()
        except MySQLdb.Error, e:
            spider.log("Error %d: %s" % (e.args[0], e.args[1]))


    start_urls = getUrls()

    # for testing purposes
    # start_urls = ['http://exac.broadinstitute.org/variant/5-148206885-C-T']

    def parse(self, response):

        l = ItemLoader(item=ExacItem(), response=response)
        l.add_xpath('variantName', '/html/body/div[1]/div[1]/div[1]/h1/text()')
        l.add_xpath('alleleFrequency', '/html/body/div[1]/div[2]/div[1]/dl/dd[3]/text()')
        yield l.load_item()
