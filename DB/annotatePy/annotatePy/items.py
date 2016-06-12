from scrapy.item import Item, Field
from scrapy.loader import ItemLoader
from scrapy.loader.processors import TakeFirst, MapCompose, Join
from w3lib.html import remove_tags
import scrapy


class VariantAnnotationItem(Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    variantName = Field(
        input_processor = MapCompose(remove_tags),
        output_processor = TakeFirst()
    )
    alleleFrequency = Field(
        input_processor = MapCompose(remove_tags, lambda x: float(x)),
        output_processor = TakeFirst()
    )
    chrLocation = Field()
    mutation = Field()
