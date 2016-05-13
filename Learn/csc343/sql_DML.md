#### SQL: a data manipulation language

__Basic DML__

_Simple projection and selection_  

```sql
# πname (σdept=”csc” (Course))
SELECT name
FROM Course
WHERE dept = ‘CSC’;
```

_Joining multiple relations_    

```sql
# πname (σdept=”csc” (Course × Offering × Took))
SELECT name
FROM Course, Offering, Took
WHERE dept = ‘CSC’;
```

_Transient renaming_  

```sql
SELECT e.name, d.name
FROM employee e, department d
WHERE d.name = ‘marketing’
AND e.name = ‘Horton’;
```

_Self joining requires renaming_  

```sql
SELECT e1.name, e2.name
FROM employee e1, employee e2
WHERE e1.salary < e2.salary;
```

_`*` means all in `SELECT`_  

```sql
SELECT *
FROM Course
WHERE dept = ‘CSC’;
```

_Use `AS new_name` to rename attributes_  

```sql
SELECT name AS title, dept
FROM Course
WHERE breadth;
```

_Complex condition in `WHERE`_  

operators (`<> is not equal`)
Examples

_3rd and 4th year CSC courses_  

```sql
SELECT *
FROM Offering
WHERE dept = ‘CSC’ AND cnum >= 300;
```

_Ordering Tuples with `ORDER BY <<attribute list>> [DESC]`_  

```sql
# ORDER BY can include expressions such as addition/multiplication
```

_Case sensitivity_  

```sql
SELECT surName    # keywords like select is not case sensitive
FROM Student      # relation identifier Student is not case sensitive
WHERE campus = 'StG';  # strings are case sensitive and requries single quotes
```

_Expression is allowed and evaluated in `SELECT` clause_  

```sql
SELECT sid, grade-10 AS adjusted  # arithmetic operation
FROM Took;

SELECT dept||cnum                 # string operation
FROM course;
```

_Expression can be a constant_  

```sql
SELECT sID,
 ‘satisfies’ AS breadthRequirement
FROM Course
WHERE breadth;
```

_Pattern operator_  
+ `«attribute» LIKE «pattern»`
+ `«attribute» NOT LIKE «pattern» `
where `%` represents any string; '\_' means any single character

```sql
SELECT *
FROM Course
WHERE name LIKE ‘%Comp%’;
```

---

[__Aggregation demo__](http://www.cdf.toronto.edu/~csc343h/winter/demos/w4/group-by.txt)  

_Aggregation: Computing on a column_   

+ `SUM`, `AVG`, `COUNT`, `MIN`, and `MAX` can be applied
to a column in a `SELECT` clause.
+ `COUNT(*)` counts the number of tuples
+ To stop duplicates from contributing to
the aggregation, use `DISTINCT` inside the
brackets.

```sql
SELECT COUNT(DISTINCT oid)
FROM took;
```

_Grouping with `GROUP BY <<attributes>>`_  
Any aggregation gives a single value per group

```sql
-- sid  | grade
-- -------+-------
--    157 |    99
--    157 |    82
--    157 |    59
--    157 |    72
--    157 |    89
--    157 |    39
--    157 |    90
--    157 |    98
--    157 |    59
--    157 |    71
--    157 |    71
--    157 |    91
--    157 |    82
--    157 |    62
--    157 |    75
--  11111 |    40
--  11111 |     0
--  11111 |    17
--  11111 |    46
--  11111 |    45
--  98000 |    82
--  98000 |    89
--  98000 |    72
--  . . . etc.

SELECT sID, avg(grade)
FROM Took
GROUP BY sID;
-- sid  |         avg         
-- -------+---------------------
-- 11111 | 29.6000000000000000
-- 98000 | 83.2000000000000000
-- 99132 | 76.2857142857142857
-- 99999 | 84.5833333333333333
--  157 | 75.9333333333333333
-- (5 rows)
```

Keep in mind that for aggregation, element in `SELECT` clause must either be
1. aggregated (using `AVG`, etc)  
2. an attributes in the `GROUP BY` clause

[__Having demo__](http://www.cdf.toronto.edu/~csc343h/winter/demos/w4/having.txt)

_Having keep groups that satisfy the condition, similar to `WHERE`_   
`GROUP BY «attributes» HAVING «condition»`

```sql
SELECT oID, AVG(grade), COUNT(*)
FROM Took
GROUP BY oID
HAVING MIN(grade) < 50;   # only refer to aggregated attributes

-- oid |         avg         | count
-- -----+---------------------+-------
--  14 | 59.0000000000000000 |     3
--  34 | 60.6666666666666667 |     3
--  17 | 69.5000000000000000 |     4
--  15 | 31.0000000000000000 |     2
--  11 | 79.0000000000000000 |     4
--  16 | 73.5000000000000000 |     4
-- (6 rows)
```

It is important to note that the `HAVING` clause can only refer to attributes that is either aggregated or is an attribute in the `GROUP BY` clause, similar to aggregation.

---

__Set operations__

By default, duplicate values are kept within a relation, as getting rid of them is expensive. SQL treats tables as `bags` rather than `sets` or `multisets`, which is just like sets other than the fact it allows duplicates.

_Union, intersect, and difference_

`(«subquery») UNION («subquery»)`    
`(«subquery») INTERSECT («subquery»)`    
`(«subquery») EXCEPT («subquery»)`

```sql
(SELECT sid
 FROM Took
 WHERE grade > 95)
 UNION
(SELECT sid
 FROM Took
 WHERE grade < 50);
```

```sql
-- P
a |  b  
-- ---+-----
-- 1 | 151
-- 2 | 123
-- 3 | 432
-- 1 | 333
-- 1 | 345
-- 4 | 912
-- 5 | 123
-- (7 rows)

-- Q
-- a | c  
-- ---+----
-- 1 | 44
-- 3 | 88
-- 3 | 12
-- 9 | 12
-- (4 rows)

# SELECT, a singe occurence of a value for a in Q wipes out all occurences of it from P
(SELECT a FROM P) EXCEPT (SELECT a FROM Q)

-- a
-- ---
-- 2
-- 4
-- 5
-- (3 rows)

# EXCEPT ALL, match one by one;
# every 1 value in P is removed as a result of a single 1 value in Q

(SELECT a FROM P) EXCEPT ALL (SELECT a FROM Q)

-- a
-- ---
-- 1
-- 1
-- 2
-- 4
-- 5
-- (5 rows)
```

_In the context of bags, consider m,n as number of duplicate tuple t in table R and S_  

| Operations     |   Number of duplicates |   
| :------------- | :------------- |
| R Intersect S     | min(m,n)      |
| R Union S | m + n |
| R - S | max(m - n, 0) |


_Controling duplicate elimination with `SELECT DISTINCT ...`_


```sql
-- oid
-- -----
--   1
--  11
--  11
--  13
--  13
--  14
--  16
--  16
--  22
--  39
-- (10 rows)

SELECT DISTINCT oID   # bag >> set
FROM Took
WHERE grade > 95
ORDER BY oID;

-- oid
-- -----
--   1
--  11
--  13
--  14
--  16
--  22
--  39
-- (7 rows)
```
`DISTINCT` works on the level of the row and not individual cells, therefore only one `DISTINCT` is allowed.

> In essence, `DISTINCT` turns the query result from a bag to a set

_Set VS Bag: Semantics Convention_  

__For__ `SELECT-FROM-WHERE`, bag semantics are used by default  

```sql
-- sid  | grade
-- -------+-------
--   157 |    39          <-- There are repeated sids, such as 157
--   157 |    59          <-- There are repeated grades per sid, ie., entire repeated rows.
--   157 |    59
--   157 |    72
-- 98000 |    54
-- 98000 |    72          <-- There are grades, such as 72, that are repeated across sids
-- 98000 |    78              -- (i.e., repeats that are in the grades column only)

SELECT DISTINCT sID, grade
FROM Took
ORDER BY sID, grade;

# There is still duplicate sID using DISTINCT, because bag semantics are used

-- sid  | grade
-- -------+-------
--  157 |    39          <-- We still have repeated sids, such as 157
--  157 |    59           
--  157 |    72
-- 98000 |    54
-- 98000 |    72          <-- We still have grades, such as 72, that are repeated across sids
```

__For__ set operations, set semantics are used by default, where duplicates are eliminated from results


```sql
SELECT sID
FROM Took
WHERE grade > 95;
--
--   sid  
-- -------
--  99132
--  99132
--  98000
--  98000
--  99999
--  99999
--  99999
--  99999
--    157
--    157
-- (10 rows)

SELECT sID
FROM Took
WHERE grade < 50;

--   sid  
-- -------
--  99132
--    157
--  11111
--  11111
--  11111
--  11111
--  11111
-- (7 rows)

-- But when we do union, we don't get all 17 rows.  The duplicates are
-- eliminated, by default.
(SELECT sid
 FROM Took
 WHERE grade > 95)
 UNION
(SELECT sid
 FROM Took
 WHERE grade < 50);

--   sid  
-- -------
--  98000
--  99132
--  99999
--    157
--  11111
-- (5 rows)

```

_Forcing set operation to be a bag using `ALL`_

```sql
(SELECT sid
 FROM Took
 WHERE grade > 95)
 UNION ALL
(SELECT sid
 FROM Took
 WHERE grade < 50);

--  sid  
-- -------
-- 99132
-- 99132
-- 98000
-- 98000
-- 99999
-- 99999
-- 99999
-- 99999
--  157
--  157
-- 99132
--  157
-- 11111
-- 11111
-- 11111
-- 11111
-- 11111
-- (17 rows)
```

---

__View__
A view is a relation defined in terms of stored tables (called base tables) and other views used to break down a large query into manageable components
+ virtual view: no tuples are stored; view is just a query for constructing the relation when needed.
+ materialized view: actually constructed and stored. Expensive to maintain

_Define a virtual view_

```sql
-- A view for students who earned an 80 or higher in a CSC course.
CREATE VIEW topresults as
SELECT firstname, surname, cnum
FROM Student, Took, Offering
WHERE
 Student.sid = Took.sid AND
 Took.oid = Offering.oid AND
 grade >= 80 AND dept = 'CSC';
```

---

__Outer Joins__     
Possible within `FROM` clause or stand-alone queries

| Expression | Meaning   |
| :------------- | :------------- |
| A,B or A CROSS JOIN B    | cartesian product      |
|A NATURAL {LEFT,RIGHT,FULL} JOIN B ON C|natural join |
|R JOIN {LEFT,RIGHT,FULL} S ON C|theta join|

Natural joins are dangerous, because its a shortcut that implies relations sharing same attributes; this assumption leads to limitations. For example, tuples lacking a matching attribute name or _Dangling tuples_ are out of luck.

_Outer Join preserves dangling tuples by padding with `NULL` in the other relation_  
+ `LEFT OUTER JOIN`: preserves dangling couple from LHS by padding `NULL` on the RHS
+ `RIGHT OUTER JOIN`: the reverse
+ `FULL OUTER JOIN`: does both
Note that `OUTER` is not necessary because outer join is implied if `LEFT`, `RIGHT`, `FULL` is used.

_Inner Join is the default behaviour, where `NULL` will not be padded_


_Null values_

Represent missing information with a special value
+ if age is unknown use `0`  
+ if SIN is unknown use `99999999`
+ or just use `NULL`, which is not within domain of any data type

Check for `NULL` with `IS NULL` or `IS NOT NULL`

```sql
SELECT *
FROM Course
WHERE breadth IS NULL;
```

Since no `NULL` value is known, therefore if one or more operands to a comparison is `NULL`, comparison will evaluate to `UNKNOWN` because each of `NULL` is unknown.

+ `TRUE` = 1
+ `FALSE` = 0
+ `UNKNOWN` = 0.5
+ `AND` is min
+ `OR` is max
+ `NOT x` is 1-x

Truth table

| A / B    | A and B     | A or B |
| :------------- | :------------- | :--|
| T / U     | U       | T|
| F / U     | F       | U|
| U / U     | U       | U|

_Implications for a 3-valued logic_   
+ `AND` is commutative
+ `(p or (NOT p))` might not be `TRUE` --- see example below
+ `(0*x)` might not be `0`


_Impact of null values on `WHERE`_  
A tuple is in the query result iff the `WHERE` is TRUE; `UNKNOWN` is not good enough. Therefore to select non null tuples, just evaluates `WHERE Attribute or NOT Attribute`

```sql
-- cnum |              name              | dept | breadth
-- ------+--------------------------------+------+---------
--  296 | Black Freedom                  | HIS  | t
--  222 | COBOL programming              | CSC  | f
--  100 | CSC for Future Prime Ministers | CSC  |

# null not selected in breadth or NOT breadth, a tautology
SELECT * FROM Course WHERE breadth

-- cnum |       name        | dept | breadth
-- ------+-------------------+------+---------
--  296 | Black Freedom     | HIS  | t

SELECT * FROM Course WHERE NOT breadth

-- cnum |           name            | dept | breadth
-- ------+---------------------------+------+---------
--  222 | COBOL programming         | CSC  | f

```


_Impact of null values on `DISTINCT`_   

```sql
-- a | b
-- ---+---
-- 1 | 2
--   | 3
--   | 4
-- (3 rows)

SELECT a from X;  # see 2 null because relation is treated as a bag

-- a
-- ---
-- 1
--  
--  
-- (3 rows)

SELECT DISTINCT a from X;   # NULL tuples are collapsed to one,
                            # DISTINCT removes duplicate NULL

-- a
-- ---
--  1
--   
-- (2 rows)
```

_Impact of null values on Aggregation_  
Aggregation ignores `NULL`
+ `NULL` does not contribute to sum, average, or count
+ never be the minimum or maximum, unless there are no non-`NULL` values in a column
+ `COUNT` of an empty set is 0
+ `COUNT(*)` counts Tuples and therefore include every one, regardless of any nulls


```sql
-- name  | age | grade
-- -------+-----+-------
-- diane |     |     8
-- will  |     |     8
-- cate  |     |     1
-- tom   |     |      
-- micah |     |     1
-- grace |     |     2
-- (6 rows)

SELECT MIN(grade), MAX(grade), SUM(grade), AVG(grade), COUNT(grade), COUNT(*)
FROM Runnymede

-- min | max | sum |        avg         | count | count
-- -----+-----+-----+--------------------+-------+-------
--    1 |   8 |  20 | 4.0000000000000000 |     5 |     6
-- (1 row)

SELECT MIN(age), MAX(age), SUM(age), AVG(age), COUNT(age), COUNT(*)
FROM Runnymede

--  min | max | sum | avg | count | count
-- -----+-----+-----+-----+-------+-------
--      |     |     |     |     0 |     6

```
