#### SQL: a data definition language

_Built-in types_  
Table attributes have types
+ `CHAR(n)`  
  + fixed length string of n characters, padded with space if necessary
  + must use single quotes
+ `VARCHAR(n)` - variable-length string of up to n characters  
+ `TEXT` - variable-length, unlimited. Not in SQL standard but psql supports it
+ `INT` = `INTEGER`
+ `FLOAT` = `REAL`
+ `BOOLEAN`
  + `True` or `False`  
+ `DATE`; `TIME`; `TIMESTAMP`  
  + `2011-09-22`
  + `15:00:02`  
  + `Jan-12-2011 10:25`

_User-defined types_  
Defined in terms of built-in types; can define constraints or default values

```sql
CREATE DOMAIN Grade AS INT
DEFAULT NULL
CHECK (VALUE>=0 and VALUE <=100);

CREATE DOMAIN Campus AS VARCHAR(4)
DEFAULT ‘StG’
CHECK (VALUE IN ('StG','UTM','UTSC'));
```

_Type constraints and default values_  
Constraints are checked every time a value is assigned to an attribute of that type.
The default value for a type is used when no value has been specified.
+ Attribute default: for that one attribute in that one table
+ type default: for every attribute defined to be of that type  


__Keys and Foreign Keys__  

_Key constraints_  
Declaring that a set of one or more attributes are the `PRIMARY KEY` for a relation means that they form a key (unique and no subset) and that their value will never be `NULL`. Searches in DBMS can be optimized by choosing appropriate set of attributes as keys.

_Declaring primary keys_
For single-attribute key, can be part of the attribute definition

```sql
CREATE TABLE Blah (
  ID INTEGER PRIMARY KEY,
  name VARCHAR(25)
);

```

Or can be at the end of the table definition

```sql
CREATE TABLE Blah (
  ID INTEGER,
  name VARCHAR(25),
  PRIMARY KEY (ID)
);
```

_Uniqueness constraints_

Declaring that a set of one or more attributes is `UNIQUE` for a relation means that they form a key and that their values can be `NULL`. More than one set of attributes can be `UNIQUE`.

_Declaring UNIQUE_

if only one attributes is involved, can be part of the attribute definition

```sql
CREATE TABLE Blah (
  ID INTEGER UNIQUE,
  name VARCHAR(25)
);
```

OR at the end of the data definition

```sql
CREATE TABLE Blah (
  ID INTEGER,
  name VARCHAR(25),
  UNIQUE (ID)
);

```

_Foreign key constraints_

```sql
FOREIGN KEY (sID) REFERENCES Student
```

Here the `sID` in this table is a foreign key that reference the `primary key` of table `Student` such that every value for `sID` in this table must actually occur in the Student table. The requirement for a foreign key is that it must either be a primary key or unique in the `home` table; However, the attribute that foreign key reference may not be primary key, as long as they are unique.

```sql
CREATE TABLE People (
  SIN INTEGER PRIMARY KEY,  
  name TEXT,
  OHIP TEXT UNIQUE);

CREATE TABLE Volunteers (
email TEXT PRIMARY KEY,
OHIPnum TEXT REFERENCES People(OHIP));
```

_enforcing foreign key constraint is equivalent to enforcing referential integrity_

[_here is a good explanation on using foreign key_](https://www.sitepoint.com/mysql-foreign-keys-quicker-database-development/)


_check constraint_

```sql
create domain Grade as smallint  
default null
check (value>=0 and value <=100);
```

Beyond a user-defined domain constraint, check constraint can be enforced on an attribute, on tuples of a relation, or across relations.

_Attribute based check constraint_
+ Defined with a single attribute and constrain its value in every tuple.   
+ can only refer to that attribute
+ can include a subquery

```sql
create table Student (
  sID integer,
  program varchar(5)
    check (program in (select post from P)),  
  firstName varchar(15) not null, ...
);
```

Only when a tuple is inserted into that relation, or its value for that attribute is updated will the attribute based constraint be checked. If a change somewhere else violates the constraint, the DBMS will not notice.  
+ If a student’s program changes to something not in table P, we get an error  
+ But if table P drops a program that some student has, there is no error


_not null constraint_  

```sql
create table Course(
  cNum integer,
  name varchar(40) not null,  
  dept Department,
  wr boolean,
  primary key (cNum, dept));
```

_Tuple-based “check” constraints_

Defined as a separate element of the table schema, so can refer to any attributes of the table. Again, this is checked whenever a tuple is inserted into that relation, or updated. Changes that occur elsewhere that violates the constraints will not be detected.

```sql
create table Student (
  sID integer,
  age integer,
  year integer,  
  college varchar(4),
  check (year = age - 18),  
  check college in  
        (select name from Colleges));
```

Null affect 'check' constraint differently than it does to where clause

say `check (age > 0)` vs `where age > 0`

| age    | value of condition    | CHECK outcome| WHERE outcome|
| :------------- | :------------- |:---|:---|
|19    | TRUE  | pass|pass |
|-5|FALSE|fail|fail|
|NULL|unknown|pass|fail|


Here `('hello', null)` can be inserted since null pass the constraint check. add `not null` to prevent this.

```sql
create table Frequencies(  
  word varchar(10),
  num integer,
  check (num > 5));
```

_Naming constraints_
Naming constraint helps with debugging.  

```sql
constraint <<name>>
check <<condition>>
```

example

```sql
create domain Grade as smallint
  default null
  constraint gradeInRange
     check (value>=0 and value <=100);

create domain Campus as varchar(4)
  not null
  constraint validCampus
    check (value in ('StG', 'UTM', 'UTSC'));

create table Offering(...
  constraint validCourseReference
    foreign key (cNum, dept) references Course);
```

[_the sql naming style guide may be helpful in naming constraints_](http://leshazlewood.com/software-engineering/sql-style-guide/)

name according to `<tablename>_<columnname>_<suffix>` syntax where suffix could be

| constraints   | suffix   |
| :------------- | :------------- |
|primary key|	_pk|
|foreign key|	_fk|
|check|	_ck|
|not null|	_nn|
|unique	|_uq|
|index|	_idx|

```sql
create table objects
(
    id    char(36)
          constraint objects_pk primary key,

    name  varchar(100)
          constraint objects_name_nn not null
);

create table object_1_object_2_maps
(
    object_1_id       char(36)
                      constraint object_1_object_2_maps_long_table_1_id_fk
                          references objects(id),

    object_2_id       char(36)
                      constraint long_table_1_long_table_2_maps_long_table_1_id_fk
                          references objects(id),

    long_column_name  varchar(255)
                      constraint object_1_object_2_maps_some_long_column_name_nn not null
                      default 'some string',

    constraint        long_table_1_long_table_2_maps_pk
                          primary key(long_table_1_id, long_table_2_id)

);

```

__Assertions__

`Check constraints` apply to an attribute or table. They can’t express constraints across tables, Therefore assertions are schema elements at the top level used to express cross-table constraints:  
+ Every loan has at least one customer, who has an account with at least $1,000.  
+ For each branch, the sum of all loan amounts < the sum of all account balances.  

  `create assertion (<name>) check (<predicate>);`

Assertions are powerful in that predicate expression can be evaluate efficiently. However, assertions are costly because they have to be checked upon every database update. Therefore use with diligence.


__Triggers__

A compromise between assertions and check constraints. Triggers are cross-table constraints, as powerful as assertions, and are able to be controlled over when they are applied. 3 things can be specified:

1. event: Some type of database action
  `AFTER DELETE on Courses` or `BEFORE UPDATE of grade on Took`  
2. condition: A boolean-valued expression
  `WHEN grade > 95`  

3. action: any SQL statements
  `INSERT INTO Winners VALUES (sID)`



#### SQL schema
Everything defined (tables, types, etc.) goes into one big pot. Schemas let you create different namespaces, which is useful for logical organization, and for avoiding name clashes.

_Create schema_

```sql
-- create a user-defined schemas
create schema University;

-- refer to things inside a particular schema, use dot notation
create table University.Student (...);  
  select * from University.Student;
```
