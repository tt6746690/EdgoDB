# -*- coding: utf-8 -*-
import scrapy
from scrapy.loader import ItemLoader
from annotatePy.items import VariantAnnotationItem


class ExacSpider(scrapy.Spider):
    name = "exac"
    allowed_domains = ["http://exac.broadinstitute.org/"]
    start_urls = (
        'http://exac.broadinstitute.org/variant/22-46615880-T-C',           # this is in the database
        'http://exac.broadinstitute.org/variant/15-40509781-G-C'
    )

    def parse(self, response):

        l = ItemLoader(item=VariantAnnotationItem(), response=response)
        l.add_xpath('variantName', '/html/body/div[1]/div[1]/div[1]/h1/text()')
        l.add_xpath('alleleFrequency', '/html/body/div[1]/div[2]/div[1]/dl/dd[3]/text()')
        yield l.load_item()
