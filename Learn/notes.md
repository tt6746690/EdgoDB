
#### Reading

[_Definition of keys!!_](http://stackoverflow.com/questions/6951052/differences-between-key-superkey-minimal-superkey-candidate-key-and-primary-k)  

---

#### [CSC343](http://www.cdf.toronto.edu/~csc343h/winter/)

[_Movie Schema example_](http://www.cdf.toronto.edu/~csc343h/winter/in_class/w1/Movies.pdf)


__TIPS__

_Regarding writing queries_
  + think only about relations without considering other stuff
  + every time there is a join, make sure matching attributes have the appropriate ID (using renaming)
  + annotate subexpression with attributes
  + its always problem regarding one tuple (can use projection to include more attributes if desired)

_specific types of query_  
  + Max: pair tuples and find that are not max, then subtract from all to find the maxes
  + k or more: make all combinations of k different tuples that satisfy the condition
  + exactly k: k or more - k+1 or more
  + every: make all combinations, subtract those that did occur to find those that didn't always occur, then subtract from all.

_FAQ_

[_What self joining accomplish_](http://www.programmerinterview.com/index.php/database-sql/what-is-a-self-join/)
