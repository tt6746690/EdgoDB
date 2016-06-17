#!/bin/bash
echo "---------------------"
echo "This is a shell script"
echo "---------------------"
echo "building mysql schema"
echo "---------------------"
cd DB
mysql < ./mysql/DBinit.sql

echo "---------------------"
echo "populating data from excel file"
echo "---------------------"
python loadData.py

echo "---------------------"
echo "annotate with biomart"
echo "---------------------"
cd Rannotate
Rscript annotate.R

echo "---------------------"
echo "annotate with scrapy"
echo "---------------------"
cd ../Pyannotate
scrapy crawl exac


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
