# -*- coding: utf-8 -*-
import scrapy
import MySQLdb
from scrapy.loader import ItemLoader
from annotatePy.items import ExacItem
from config import MYSQL_USER, MYSQL_HOST, MYSQL_PASSWD, MYSQL_DBNAME


class ExacSpider(scrapy.Spider):
    name = "exac"
    allowed_domains = ["http://exac.broadinstitute.org/"]

    start_urls = []
    with open('exacVariantUrls.txt') as f:
        for url in f:
            start_urls.append(url.strip())

    def parse(self, response):

        l = ItemLoader(item=ExacItem(), response=response)
        l.add_xpath('variantName', '/html/body/div[1]/div[1]/div[1]/h1/text()')
        l.add_xpath('alleleFrequency', '/html/body/div[1]/div[2]/div[1]/dl/dd[3]/text()')
        yield l.load_item()
