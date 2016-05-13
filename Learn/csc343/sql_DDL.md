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
