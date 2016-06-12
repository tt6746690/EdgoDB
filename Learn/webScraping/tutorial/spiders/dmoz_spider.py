import scrapy
from tutorial.items import DmozItem


class DmozSpider(scrapy.Spider):
    # identifies the Spider. It must be unique
    name = "dmoz"
    allowed_domains = ["dmoz.org"]

    # a list of URLs where the Spider will begin to crawl from.
    # for each url, a scrapy.Request object will be assigned
    start_urls = [
        "http://www.dmoz.org/Computers/Programming/Languages/Python/"
    ]

    def parse(self, response):
        '''called with the downloaded Response object of each start URL.
        process the response and return scraped data (as Item objects)
        and more URLs to follow (as Request objects).

        @rtype: scrapy.http.Response
        '''
        for href in response.css("ul.directory.dir-col > li > a::attr('href')"):
            url = response.urljoin(href.extract())
            yield scrapy.Request(url, callback=self.parse_dir_contents)

    def parse_dir_contents(self, response):
        for sel in response.xpath('//ul/li'):
            item = DmozItem()
            item['title'] = sel.xpath('a/text()').extract()
            item['link'] = sel.xpath('a/@href').extract()
            item['desc'] = sel.xpath('text()').extract()
            yield item
