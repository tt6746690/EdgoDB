from scrapy.item import Item, Field
from scrapy.loader import ItemLoader
from scrapy.loader.processors import TakeFirst, MapCompose, Join, Compose
from w3lib.html import remove_tags
import scrapy


class ExacItem(Item):
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


class UniprotItem(Item):
    uniprotAccession = Field(   # Use MapCompose since a list is returned as default
        input_processor = MapCompose(lambda x: x.split('/')[-1]),
        output_processor = TakeFirst()
    )
    proteinName = Field(
        input_processor = MapCompose(remove_tags, lambda x: x.strip('()')),
        output_processor = TakeFirst()
    )
    uniprotProteinLength = Field(
        input_processor = MapCompose(remove_tags, lambda x: x.strip('()')),
        output_processor = TakeFirst()
    )
    uniprotLocalization = Field(
        input_processor = MapCompose(lambda x: (',').join(x)),
        output_processor = TakeFirst()
    )


class PfamItem(Item):
    proteinName = Field(
        input_processor = MapCompose(lambda x: x.split('/')[-1]),
        output_processor = TakeFirst()
    )
    pfamAccession = Field(
        input_processor = MapCompose(lambda x: x.split('_')[-1]),
        output_processor = TakeFirst()
    )
    pfamID = Field(
        input_processor = MapCompose(remove_tags),
        output_processor = TakeFirst()
    )
    sequenceStart = Field(
        input_processor = MapCompose(remove_tags, lambda x: int(x)),
        output_processor = TakeFirst()
    )
    sequenceEnd = Field(
        input_processor = MapCompose(remove_tags, lambda x: int(x)),
        output_processor = TakeFirst()
    )
    proteinLength = Field(
        input_processor = MapCompose(remove_tags, lambda x: int(x.strip().split(' ')[0])),
        output_processor = TakeFirst()
    )
