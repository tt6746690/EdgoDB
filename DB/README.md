

_standard error for plotting expression graph_

```SQL
SELECT STD(LOG(2, EXPRESSION_RATIO))/COUNT(*) AS standard_error,
FROM Variant join LUMIERMeasurementMUT using(VARIANT_ID)
where MUT_HGVS_NT_ID = 'NM_017436:c.287G>A'

```
_update exac frequency; some are missing_

```sql
select MUT_HGVS_NT_ID, DBSNP_ID, CHR_COORDINATE_HG19, EXAC_ALLELE_FREQUENCY
from Variant
  join VariantProperty using(VARIANT_ID)
WHERE EXAC_ALLELE_FREQUENCY IS NULL AND DBSNP_ID != '';
```


---

__CODE REMINDER__


_JOIN semantics_

```sql
--- THETA style
SELECT * FROM film, film_actor WHERE film.film_id = film_actor.film_id AND actor_id = 17 AND film.length
--- ANSI style
SELECT * FROM film JOIN film_actor ON (film.film_id = film_actor.film_id) WHERE actor_id = 17 AND film.length > 120
--- USING -> short cut when join tables on columns with same names
SELECT * FROM film JOIN film_actor USING (film_id) WHERE actor_id = 17 AND film.length > 120
```

_For INNER JOINS: use renaming to remove table specific prefixes_

```sql
SELECT
    a.Name AS CountryNane, b.Name AS CityName, c.*
FROM
    Country a
        JOIN
    City b ON a.Code = b.CountryCode
        JOIN
    CountryLanguage c ON a.Code = c.CountryCode;
```

(_Joining more than 2 tables_](http://stackoverflow.com/questions/347551/what-tool-to-use-to-draw-file-tree-diagram)

```sql
SELECT *
FROM table1 INNER JOIN table2 ON
     table1.primaryKey=table2.table1Id INNER JOIN --- makes a temporary table
     table3 ON table1.primaryKey=table3.table1Id
```



_mysql does not support intersect and minus: use left join instead_

```sql
SELECT a.x, a.y
FROM table_a a LEFT JOIN table_b b
ON a.x = b.x AND a.y = b.y
WHERE b.x IS NULL;
```
