#!/bin/bash

echo "/===== This is a shell script =====/"

echo "/===== building mysql schema =====/"
cd DB
mysql < ./mysql/DBinit.sql
mysql EdgoDB< ./mysql/customFunction.sql

echo "/===== populating data from excel file =====/"
python loadData.py

echo "/===== generating JSON for typeahead search =====/"
python utilities.py
mv -f *.json ../dist/data/


echo "/===== annotate with biomart =====/"
cd Rannotate
Rscript annotate.R

echo "/===== annotate with scrapy =====/"
cd ../Pyannotate
scrapy crawl exac
scrapy crawl uniprot
scrapy crawl pfam

echo "---------------------"
echo "stopping previous forever instances"
echo "---------------------"
cd ../../
forever stopall

echo "---------------------"
echo "starting running forever"
echo "---------------------"
HTTP_PORT=8888 forever start app.js


echo "---------------------"
echo "restarting nginx"
echo "---------------------"
service nginx restart
