# -*- coding: utf-8 -*-
import scrapy


class ExacSpiderSpider(scrapy.Spider):
    name = "exac_spider"
    allowed_domains = ["http://exac.broadinstitute.org/"]
    start_urls = (
        'http://www.http://exac.broadinstitute.org//',
    )

    def parse(self, response):
        pass
