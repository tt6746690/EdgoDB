

_Problems with using interactive SQL: NOT Turing-complete_  
There is no loops or recursions to execute complex queries. It is typical to combine SQL with a conventional language to overcome this limitation. Usually, tuples are fed from SQL to other language one at a time and attribute values into a particular variable

_Approach_
+ Stored Procedures
+ Statement-level Interface
+ Call-level interface


_Stored Procedures_
SQL standard include a language (SQL/PSM) for defining stored procedures that have parameters and can return values, use local variables, loops, execute SQL queries...



```sql
# Stored procedures
CREATE FUNCTION BandW(y INT, s CHAR(15)) RETURNS BOOLEAN
IF NOT EXISTS
 (SELECT *
 FROM Movies
 WHERE year = y AND studioName = s)
THEN RETURN TRUE;
ELSIF 1 <=
 (SELECT COUNT(*)
 FROM Movies
 WHERE year = y AND studioName = s AND
 genre = ‘comedy’)
THEN RETURN TRUE;
ELSE RETURN FALSE;
END IF;

# Calling function
SELECT StudioName
FROM Studios
WHERE BandW(2010, StudioName);

```

_Statement-level interface (SLI)_  
Embed SQL statements into code in a conventional language like C or Java; Use preprocessor to replace the SQL with alls written in the host language to functions defined in an SQL library.

```java
void printNetWorth() {
 EXEC SQL BEGIN DECLARE SECTION;
 char studioName[50];
 int presNetWorth;
 char SQLSTATE[6]; // Status of most recent SQL stmt
 EXEC SQL END DECLARE SECTION;
 /* OMITTED: Get value for studioName from the user. */
 EXEC SQL SELECT netWorth
 INTO :presNetWorth
 FROM Studio, MovieExec
 WHERE Studio.name = :studioName;
 /* OMITTED: Report back to the user */
}
```


_Call-level interface (CLI)_  
Instead of using a pre-processor to replace embedded SQL with calls to library functions,
write those calls yourself.This eliminates the need to preprocess. Each language has its own set of library functions for this   
+ for C, it’s called SQL/CLI  
+ for Java, it’s called JDBC  
+ for PHP, it’s called PEAR DB  


```java
/* Get ready to execute queries. */
import java.sql.*;
/* A static method of the Class class. It loads the
 specified driver */
Class.forName(“org.postgresql.jdbc.Driver”);
Connection conn = DriverManager.getConnection(
 jdbc:postgresql://localhost:5432/csc343h-dianeh,
 dianeh,
 “”);
 /* Execute a query and iterate through the resulting
  tuples. */
 PreparedStatement execStat = conn.prepareStatement(
  “SELECT netWorth FROM MovieExec”);
 ResultSet worths = execStat.executeQuery();
 while (worths.next()) {
  int worth = worths.getInt(1);
  /* If the tuple also had a float and another int
  attribute, you’d get them by calling
  worths.getFloat(2) and worths.getInt(3).
  Or you can look up values by attribute name.
  Example: worths.getInt(netWorth)
  */
  /* OMITTED: Process this net worth */
 }

```

Or just build the query in a string

```java
Statement stat = conn.createStatement();
String query =
 “SELECT networth
 FROM MovieExec
 WHERE execName like ‘%Spielberg%’;
 ”
ResultSet worths = stat.executeQuery(query);
```
