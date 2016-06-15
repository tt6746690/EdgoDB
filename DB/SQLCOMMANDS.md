


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
