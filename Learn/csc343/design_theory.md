
__Functional dependency__  
X and Y are subsets of attributes of R.
+ X -> Y asserts that if two tuples agree on all the attribute in set X they must also agree on all attributes in set Y  
+ we say that X -> Y holds in R or X functionally determines Y
+ or formally

> there exists t1, t2: (t1[A] = t2[A]) => t1[B] = t2[B]

Value of Y depends on X because there is a function that takes a value for X and gives a _unique_ value for Y. Here the function refers to lookup. There may be equivalent but different sets of functional dependencies 

_FD and keys_  
Functional dependencies is related to keys. Functional dependency is a generalization of keys

> K, a set of attributes for relation R, is a super key for R
    iff
  K functionally determines all of R

_FD inference rules_  
+ A -> B AND B -> C  =>  A -> C
+
