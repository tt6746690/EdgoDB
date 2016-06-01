
#### DATABASE

- [x] construction of relational database
  - [x] set up of mysql server and initial design and creation of schemas  
  - [x] importing of initial data from excel to the database
  - [x] optimize by eliminating anomalies and reinforce constraints
  - [ ] set up ssl login for db access
- [ ] update attributes from [ExAC Browser](http://exac.broadinstitute.org/) to identify rare alleles

---

#### BACKEND

- [ ] deploy using [nginx](http://nginx.org/en/)
  - [ ] set up CA-SSL and nginx configs as well as server to allow for https
  - [ ] allow for static file serving for compressed data files
  - [ ] use [PM2](http://pm2.keymetrics.io/) for persisting node processes

---

#### FRONTEND

- [ ]

-----

#### EXPLORE and NON-MINIMAL GOALS

- [ ] Explore [GEMINI](http://gemini.readthedocs.io/en/latest/) in pulling data from [OMIM](http://www.omim.org/) [dbSNP](http://www.ncbi.nlm.nih.gov/SNP/) and [ExAC Browser](http://exac.broadinstitute.org/). possible follow up include:   
  - [ ] extraction of relevant attributes and update/replace existing data
- [ ] Explore the use of [GATK](https://www.broadinstitute.org/gatk/)
- [ ] Try to implement server load balancing...
- [ ] perhaps use [bioDBnet](https://biodbnet-abcc.ncifcrf.gov/db/db2db.php) to convert IDs.


----

#### LEARN

[_Stanford DB mini courses_](https://lagunita.stanford.edu/courses/DB/2014/SelfPaced/about)   
[_WIKIbooks: Data Management in Bioinformatics/Data Querying_](https://en.wikibooks.org/wiki/Data_Management_in_Bioinformatics/Data_Querying)   
[_CSC343: INTRO to database_](http://www.cdf.toronto.edu/~csc343h/winter/)  

---


#### DBs

[_CCSB: ORFeome_](http://horfdb.dfci.harvard.edu/index.php?page=orfsearch)   
  + data in compressed fasta downloadable     

[_HGMD: The Human Gene Mutation Database_](http://www.hgmd.cf.ac.uk/ac/index.php)         
  + cant bulk download data pw: HGMD364869   
  + `curl -d "username=pq.w869" -c tempCookie http://www.hgmd.cf.ac.uk/ac/gene.php?gene=A4GALT`  

[_HGNC: Human Gene Nomenclature Committee_](http://www.genenames.org/help/rest-web-service-help)             
  + good RESTful api, queriable    

[_HGVS: Human Genome Variation Society_](http://www.hgvs.org/mutnomen/)           
[_1000Genomes_](http://www.1000genomes.org/data)   
[_OMIM_](http://www.omim.org/)  


---

#### Useful packages/libraries and resources

[_BiomaRt_](https://bioconductor.org/packages/release/bioc/html/biomaRt.html)  
[_Ensembl VEP_](http://rest.ensembl.org/#Variation)  
[_Python: HGVS_](http://hgvs.readthedocs.io/en/0.4.x/)   
[_Polyphen2_](http://genetics.bwh.harvard.edu/pph2/dokuwiki/faq#automated_batch_submission)  
[_FoldX_](http://foldxsuite.crg.eu/)  
[_Suspect_](http://www.sbg.bio.ic.ac.uk/~suspect/)    
[_MySQL DOCs_](https://dev.mysql.com/doc/)  
[_MySQLdb_](http://mysql-python.sourceforge.net/MySQLdb-1.2.2/), [_brief summary_](http://mysql-python.sourceforge.net/MySQLdb.html) and [_short tutorial_](http://www.tutorialspoint.com/python/python_database_access.htm)  
[_Google Fonts_](https://www.google.com/fonts)   
[_Stylus Docs_](http://stylus-lang.com/try.html#?code=body%20%7B%0A%20%20font%3A%2014px%2F1.5%20Helvetica%2C%20arial%2C%20sans-serif%3B%0A%20%20%23logo%20%7B%0A%20%20%20%20border-radius%3A%205px%3B%0A%20%20%7D%0A%7D)    
[_Jade/Pug Docs_](http://jade-lang.com/reference/) and [_cheatsheet_](https://naltatis.github.io/jade-syntax-docs/)  



-----

#### FAQ

[_How to create an SSL certificate on nginx?_](https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04)    
[_What self joining accomplish_](http://www.programmerinterview.com/index.php/database-sql/what-is-a-self-join/)   
[_Differences between identifying and non-identifying relationship_](http://stackoverflow.com/questions/762937/whats-the-difference-between-identifying-and-non-identifying-relationships)  
[_What is mySQL varchar max size?_](http://stackoverflow.com/questions/13506832/what-is-the-mysql-varchar-max-size)  
[_How to implement one-to-many relationship in SQL_](http://stackoverflow.com/questions/7296846/how-to-implement-one-to-one-one-to-many-and-many-to-many-relationships-while-de)    
[_What is SQL Server Indexing_](http://odetocode.com/Articles/70.aspx)  
[_What column generally makes good indices_](http://stackoverflow.com/questions/107132/what-columns-generally-make-good-indexes)     
[_Ensembl vs. Entez IDs_](https://www.biostars.org/p/16505/)  
[_CSS structural naming_](http://sixrevisions.com/css/css-tips/css-tip-2-structural-naming-convention-in-css/)  
[_Retrieve mutation position and ID given mutation in HGVS format_](https://www.biostars.org/p/107493/)  
[_What Is The Difference Between A Snp And An Entry In A Mutation Database?_](https://www.biostars.org/p/2812/)  
[_How does cBioPortal SQL database look like?_](https://github.com/cBioPortal/cbioportal/tree/master/core/src/main/resources/db)  
[_Baking Bootstrap Snippets with Jade_](Baking Bootstrap Snippets with Jade)  
[_What is Bootstrap and how do I use it?_](https://www.taniarascia.com/what-is-bootstrap-and-how-do-i-use-it/)
[_Normalizejs: A modern alternative to CSS reset_](https://github.com/necolas/normalize.css)   
[_Use app.locals to pass common data to all Jade templates_](http://stackoverflow.com/questions/23494839/layout-jade-navigation-bar)  
[_How to get disease-causing gene from OMIM_](https://www.biostars.org/p/118566/)  
[_How to set up nginx as reverse proxy on node application_](https://gist.github.com/joemccann/644282)  
[_Which Type Of Database Systems Are More Appropriate For Storing Information Extracted From Vcf Files_](https://www.biostars.org/p/65920/)  
[_Do people import VCF files into databases_](https://www.biostars.org/p/7372/)  
[_GATK: What is VCF and how should I interpret it_](http://gatkforums.broadinstitute.org/gatk/discussion/1268/what-is-a-vcf-and-how-should-i-interpret-it)
[_Database development mistakes made by application developers_](http://stackoverflow.com/questions/621884/database-development-mistakes-made-by-application-developers)  
[_How is javascript asynchronous and single-threaded_](http://www.sohamkamani.com/blog/2016/03/14/wrapping-your-head-around-async-programming/)  
[_The small tools manifesto for Bioinformatics_](https://github.com/pjotrp/bioinformatics)  
[_What are dbSNP rs accession number_](http://www.ncbi.nlm.nih.gov/SNP/get_html.cgi?whichHtml=how_to_submit#REFSNP)  
[_How to insert into multiple tables with foreign keys_](http://www.rndblog.com/insert-into-multiple-mysql-tables-linked-by-a-foreign-key/)  
[_What is the purpose of python with statement_](http://effbot.org/zone/python-with-statement.htm)  
[_How to create a python dictionary with list as defaults?_](http://stackoverflow.com/questions/28194184/how-do-i-create-a-dictionary-with-keys-from-a-list-and-values-separate-empty-lis)  
[_Useful nodejs and mysql tutorial on connection pooling_](http://stackoverflow.com/questions/6731214/node-mysql-connection-pooling)
