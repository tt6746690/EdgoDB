
#### DATABASE

- [ ] construction of relational database
  - [ ] set up of mysql server and initial design and creation of schemas  
  - [ ] importing of initial data from excel to the database
  - [ ] optimize by eliminating anomalies and reinforce constraints
- [ ] update attributes from [ExAC Browser](http://exac.broadinstitute.org/) to identify rare alleles

---

#### BACKEND

- [ ] deploy using [nginx](http://nginx.org/en/)
  - [ ] set up CA-SSL and nginx configs as well as server to allow for https
  - [ ] allow for static file serving for compressed data files
  - [ ] use [PM2](http://pm2.keymetrics.io/) for persisting node processes
---l

#### FRONTEND

- [ ]

-----

#### EXPLORE and NON-MINIMAL GOALS

- [ ] Explore [GEMINI](http://gemini.readthedocs.io/en/latest/) in pulling data from [OMIM](http://www.omim.org/) [dbSNP](http://www.ncbi.nlm.nih.gov/SNP/) and [ExAC Browser](http://exac.broadinstitute.org/). possible follow up include:  
  - [ ] extraction of relevant attributes and update/replace existing data
- [ ] Explore the use of [GATK](https://www.broadinstitute.org/gatk/)
- [ ] Try to implement server load balancing...

-----

#### FAQ

[_Appropriate to store info from VCF to mysql?_](https://www.biostars.org/p/65920/)    
[_What is VCF?_](http://gatkforums.broadinstitute.org/gatk/discussion/1268/what-is-a-vcf-and-how-should-i-interpret-it)    
[_How to create an SSL certificate on nginx?_](https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04)    

----

#### LEARN

[_Stanford DB mini courses_](https://lagunita.stanford.edu/courses/DB/2014/SelfPaced/about)  
[_WIKIbooks: Data Management in Bioinformatics/Data Querying_](https://en.wikibooks.org/wiki/Data_Management_in_Bioinformatics/Data_Querying)
