
__Functional dependency__  
X and Y are subsets of attributes of R.
+ X -> Y asserts that if two tuples agree on all the attribute in set X they must also agree on all attributes in set Y  
+ we say that X -> Y holds in R or X functionally determines Y
+ or formally

> there exists t1, t2: (t1[A] = t2[A]) => t1[B] = t2[B]

Value of Y _depends_ on X because there is a _function_ that takes a value for X and gives a _unique_ value for Y. Here the function refers to lookup. There may be equivalent but different sets of functional dependencies

_FD and keys_  
Functional dependencies is related to keys. Functional dependency is a generalization of keys

> K, a set of attributes for relation R, is a super key for R
    iff
  K functionally determines all attributes of R

_FD inference rules_  
+ Splitting rules (RHS only)
  > A -> B, C, D   =>  A -> B AND A -> C AND A -> D
    A, B, C -> D   NOT => A -> D or B -> D, C -> D

+ Combining rules
  > A -> B AND A -> C AND A -> D   =>   A -> B, C, D

+ Transitive rules
  > A -> B AND B -> C  =>  A -> C


_Closure test: Prove any FD LHS -> RHS_  
+ Assume LHS attributes are known and try to figure out everything else that is determined by _computing the closure of LHS_  


```
# Y is a set of attributes, S is a set of FDs.
# Return the closure of Y under S.

Attribute_closure(Y, S):
  Initialize Y+ to Y
  Repeat until no more changes occur:
    If there is an FD LHS → RHS in S
    such that LHS is in Y+:
      Add RHS to Y+
  Return Y +
```

+ If LHS+ includes RHS attributes, then you know LHD -> RHS

```
# S is a set of FDs; LHS → RHS is a single FD.
# Return true iff LHS → RHS follows from S.

FD_follows(S, LHS → RHS):
  Y+ = Attribute_closure(LHS, S)
  return (RHS is in Y+)
```

example

```
Prove A → BC and A → B, A → C equivalent.

Assume that A → BC.
– Under this assumption, A+ = ABC.
– Therefore A → B, and A → C.

Assume that A → B, and A → C.
– Under this assumption, A+ = ABC.
– Therefore A → BC.

Therefore each set of FDs follows from the other. They are equivalent.
```


_Projecting FDs_  
Allows us to understand what FDs hold in new smaller relations when we decompose relations (normalization)

```
# S is a set of FDs; L is a set of attributes.
# Return the projection of S onto L:
# all FDs that follow from S and involve only attributes from L.

Project(S, L):
  Initialize T to {}.
  For each subset X of L:   # find closures of subsets of the attributes of the smaller relation
    Compute X+ Close X
    For every attribute A in X+:
      If A is in L:     # X → A is only relevant if A is in L (we know X is).
        add X → A to T.
   Return T.


ex. for A → C, C → E, E → BD, project FD onto attributes of ABC

A+ = ABCDE, therefore A -> BC since only A,B,C is in the smaller set ABC
B+ = B, no FD
C+ = BCDE, therefore C -> B since only B, C is in the smaller set ABC
AB+ and AC+ will yield A -> BC since they are supersets of A+
BC+ = BCDE, yield no new FD
therefore the projection of the FDs onto ABC is: {A → BC, C → B}.
```

_Speed up tips_
+ X -> A where A is in X is a trivial FD and can be ignored
+ X+ -> all attributes implies that all superset of X functionally determines all attributes
  + therefore compute closure of single attributes, and then expand to pairs, etc..
  + supersets are always weaker
+ Use of _Minimal Bias_, where we rewrite the set of FDs that is  
  + equivalent
  + contains no redundant FDs
  + and no FDs with unnecessary attributes on LHS



```
# S is a set of FDs. Return a minimal basis for S.

Minimal_basis(S):
  1. Split the RHS of each FD    # with splitting rule
  2. For each FD with 2+ attributes on the left:
    If you can remove an attribute from the LHS
    and get an FD that follows from the rest:
    Do so! (It’s a stronger FD.)
  3. Remove FDs that are implied by the rest.
    By finding the closure of each FD subsets and see if everything is implied

```

ex.  Find a minimal basis for this set of FDs:  
    S = {ABF → G, BC → H, BCH → EG, BE → GH}

```
1. split RHS and reducing LHS

ABF → G   # cant be reduced since A+->A, B+->B, F+->F, AB+->AB,
          # AF+ -> AF, BF+ -> BF. None of them yield G.
BC → H    # cant be reduced since B+->B, C+->C
BCH → E   # BC+ = BCHEG. therefore can reduce LHS to BC -> E
BCH → G   # reduce to BC -> E
BE → G    # cant be reduced
BE → H.   # cant be reduced

2. After reducing LHS

ABF → G   # ABF+ -> ABF if ABF -> G is eliminated, therefore needed
BC → H    # BC+  -> BCEGH (= BC -> H) if BC -> H is eliminated, therefore can be removed
BC → E    # BC+  -> BCG if BC -> E and BC -> H is eliminated, therefore cannot be removed
BC → G    # BC+  -> BCEGH (= BC -> G) if BC -> G and BC -> H is eliminated, therefore can be removed
BE → G    # BE+ -> BEH if BC -> G and BC -> H and BE -> G is eliminated, therefore cannot be removed
BE → H    # BE+ -> BEG if BC -> G and BC -> H and BE -> H is eliminated, therefore cannot be removed

```

+ _step 3_ After you identify a redundant FD, you must not use it when computing any subsequent closures (as you consider whether other FDs are redundant).
+ there are multiple minimal bias possible  
+ _step 1_ When you are computing closures to decide whether the LHS of an FD can be simplified, continue to use that FD.


__Database design__

_Decomposition_
To improve a badly-designed schema R(A1, A2, …, An), we will decompose it into smaller relations S(B1, B2, …, Bm) and T(C1, C2, … Ck) such that:
  + S = πB1, B2, …, Bn (R)
  + T = πC1, C2, … Ck (R)
  + {A1, A2, …, An} = {B1, B2, …, Bm} U {C1, C2, … Ck}
  + S natural join T = R

_Boyce-Codd Normal Form (BCNF)_   
+ guarantees that the decomposed relations does not exhibit anomalies.
  + or that there is no redundant information stored
+ We say a relation R is in BCNF if
  > for every nontrivial FD X →Y that holds in R, X is a superkey.

+ In other words, BCNF requires that: Only things that FD everything can FD anything.


```
# R is a relation; F is a set of FDs.
# Return the BCNF decomposition of R, given these FDs.

BCNF_decomp(R, F):
  If an FD X → Y in F violates BCNF
    Compute X+
    Replace R by two relations with schemas:
      R1 = X+
      R2 = R – (X+ – X )
    Project the FD’s F onto R1 and R2.
    Recursively decompose R1 and R2 into BCNF
```

Decomposition has many possibilities depending on which violating FD is used for decomposition   

_Speed up_
+ Only super keys matter, don't need to know any keys  
+ Don't need to know _all_ superkeys, only need to check if whether LHS of each FD is a superkey using the closure test
+ After projecting FD onto a smaller, new relation, check if FD violates BCNF, if so abort the projection, as this relation is about to be decomposed even further.

_Goals achieved via decomposition_
+ No anomalies
+ Lossless joins: It should be possible to
  + project the original relations onto the decomposed schema
  + then reconstruct the original by joining to get back exactly the original tuples.
  + For any joins,  `r ⊆ r1 ⋈ ... ⋈ rn` (we can get every tuple back) is satisfied but we may get additional spurious tuple such that `r ⊇r1 ⋈ ... ⋈ rn`. This is considered a _lossy join_
+ Dependency preservation
  + all original FD are satisfied

BCNF decomposition guarantees no anomalies, lossless joins, but not dependency preservation.  
+ Other methods of decomposition may not guarantee lossless joins, therefore have to check if lossless join is achieved.
+ It may be possible to generate an instance that satisfies FD in the final schema but violates one of the original FDs


_Third Normal Form (3NF)_  
+ 3rd Normal Form (3NF) modifies the BCNF condition to be less strict.
+ An attribute is prime if it is a member of any key.  

> X → A violates 3NF iff X is not a superkey and A is not prime.

+ it’s ok if X is not a superkey as long as A is prime.


```
# F is a set of FDs; L is a set of attributes.
# Synthesize and return a schema in 3rd Normal Form.

3NF_synthesis(F, L):
  Construct a minimal basis M for F.
  For each FD X →Y in M
    Define a new relation with schema X ∪ Y.
  If no relation is a superkey for L
    Add a relation whose schema is some key.
```

_3NF synthesis doesn’t “go too far”_  
BCNF decomposition doesn’t stop decomposing until in all relations:
  + if X → A then X is a superkey.   

3NF generates relations where:
  + X → A and yet X is not a superkey, but A is at least prime.


A Good Schema satisfy 2 out of 3 requirements:

|  | BCNF decomposition   | 3NF synthesis |
| :------------- | :------------- |
| No anomalies      | yes     | no|
|Lossless Joins|yes|yes|
|Dependency preservation |no|yes|
|summary |decompose too far cant enforce all FD|not far enough can have redundancy|
|strategy|break down a bad schema|build up a schema from nothing|


_Test for lossless joins: The Chase Test_
The algorithm
1.  If two rows agree in the left side of a FD,make their right sides agree too.
2.  Always replace a subscripted symbol by the corresponding unsubscripted one, if possible.
3.  If we ever get a completely unsubscripted row, we know any tuple in the project-join is in the original (i.e., the join is lossless).
4.  Otherwise, the final tableau is a counterexample (i.e., the join is lossy).


[_Clarification on different normal forms_](http://www.bkent.net/Doc/simple5.htm)  

_1st Normal Form_ must satisfy that all occurrences of a record type must contain the same number of fields.

> Under second and third normal form, a non-key field must provide a fact about the key.

_2nd Normal Form_ is violated when a non-key field is a fact about a subset of a key, which is only relevant if the key consists of more than 1 fields.  

_3rd Normal Form_ is violated when a non-key field is a fact about another non-key field

> forth and fifth normal forms deal with multi-valued facts

_4th Normal Form_ does not contain two or more independent multi-vallued facts about an entity (key)  

_5th Normal Form_

[_Simple guid to 5 normal forms_](http://www.cpcstech.com/pdf/simple-guide-to-five-normal-forms-in-relational-database-theory.pdf)


_Tricks to find all keys of a Relation with FD_

May be tempting to find closures of all subsets of relation but there are tricks:

+ If A is not anywhere in FD or that it appears in FD but never on the RHS, A has to be in every key possible.  
+ If A only appears on the RHS of FD, never LHS, it is no help to us in computing closures. A cannot be in any key.
