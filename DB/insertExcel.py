import MySQLdb
import Config
import csv
from collections import defaultdict

header = []
dic = defaultdict(list)

with open("./origExcel/csvMutCollection.csv", 'r') as csvfile:
    data = csv.reader(csvfile)
    for index,row in enumerate(data):
        if index == 0:  # first row
            header = row
        else:            # other rows
            for i,v in enumerate(header):
                dic[v].append(row[i])

def subsetCols(colList):
    """
    subset the columns of imported csv data

    @param colList list: list containing column name specified in header
    @return list(tuple): returns a unique subset of table
    """
    sort = [int(v) - 1 for v in dic["Sort"]]
    subset =  [tuple([dic[colname][i] for colname in colList]) for i in sort]
    return list(set(subset))



# Returns Connection object
db = MySQLdb.connect(Config.DB_HOST, Config.DB_USER, Config.DB_PASS, Config.DB_NAME)
# A Cursor object execute queries
cursor = db.cursor()


try:
    cursor.executemany("""INSERT INTO Gene (ENTREZ_GENE_ID, HUGO_GENE_SYMBOL)
                        VALUES (%s, %s)""", subsetCols(['Entrez_Gene_ID', 'Symbol']))
    db.commit()
except:
    db.rollback()

# close db connection
db.close()
