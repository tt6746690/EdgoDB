

#### Entity/Relationship (ER) Model

_Conceptualizing the real world_

Modelling: map entities and relationships of the world in the concepts of a database, usually by sketching key components.   
+ sketch schema design  
+ express as many constraints as possible  
+ convert to relational DB once client is happy  



_Visual data model (diagram-based)_  

> _entities_ and their _relationships_, along with _attributes_ describing them

_Entity Sets_  

+ An entity set (City, Department, Employee...) represents a category of objects that have properties in common and an autonomous existence.   
+ An entity (Toronto is a City) is an instance of an entity set
+ represented by rectangular box

_Relationship Sets_

+ A relationship set is an association between 2+ entity sets (e.g., Residence is a relationship set between entity sets City and Employee)  
+ A relationship is an instance of a relationship set (eg., the pair <Peter, Toronto> is an instance of relationship Residence)
+ represented by diamond shape.  

_Recursive Relationships_
Recursive relationships relate an entity set to itself. (Relationship set Collegue refers to entity sets Employee). Recursive relationship may or may not be symmetric (eg, Relatioship succession and entity sovereign)  

_Ternary Relationships_
Relationship connected to more than 2 entities...



_Attributes_  
+ Describe elementary properties of entities or relationships (eg., name, salary, age are attributes of Employee).  
+ represented by circles connected to entities they are affliated with

_Composite attributes_
+ grouped attributes of the same entity or relationship that have closely connected meaning or uses.  
+ represented by round rectangle box  

_Cardinalities_
Each entity set participates in a relationship set with a minimum(min) and a maximum(max) cardinality. Cardinalities constrain how entity instances participate in relationship instances. There have to be pairs of (min, max) values for each entity set participating in a relationship set.

For (n, N) such that n <= N,  
+ if n = 0, entity participation in a relationship is optional  
+ if n = 1, entity participation in a relationship is mandatory  
+ If N = 1, each instance of entity is associated at most with a single instance of the relationship  
+ If N = N, each instance of the entity is associated with many instances of the relationship  


```sql
Order -(0,1)-> Sale <-(1,1)- Invoice
Person -(1,1)-> Residence <-(0,N)-City
Tourist -(1,N)-> Reservation <- (0, N)-Voyage
```

_Multiplicity of relationships_
If entities E1 and E2 participate in relationship R with cardinalities (n1, N1) and (n2, N2) then the multiplicity of R is N1-to-N2  

_Cardinalities of attributes_
Describe min/max number of values an attribute can have.  
+ When the cardinality of an attribute is __(1,1)__ it can be omitted. (single-valued attributes)  
+ The value of an attribute may also be null or have several values (multi-valued attributes) __(0, N)__. In this case, multi-valued attributes often represent situations that can be modeled with additional entities.

_Keys in E/R_
Keys consist of minimal sets of attributes which uniquely identify instances of an entity set.  
+ In most cases, a key is formed by one or more attributes of the entity itself (internal key)   
+ Sometimes an entity doesn't have a key among its attributes. This is called a __weak entity__, which often contain keys of related entities brought in to help with identification(_foreign keys_).   
+ A key for a relationship consists of the keys of the entities it relates.  
+ A key is usually represented as a filled circle.   
+ A key may consist of one or more attributes, provided that each of the attributes has (1, 1) cardinality.  
+ A foreign key can involve one or more entities, provided that each of the is member of a relationship to which the entity to be identified participates in the relationship with cardinality equal to (1, 1)  
+ A foreign key may involve an entity that has itself a foreign key, as long as cycles are not generated.  
+ Each entity set must have at least one (internal or foreign) key




_Challenges with modelling the real world_
+ Life is arbitrarily complex
+ design choice
+ limitations of ER model
+ parsimony: as complex as necesary but no more

__From ER model to database schema__

_Restructuring an E/R model_

Based on:  
+ redundancies
+ choosing entity set vs attribute
+ limiting use of weak entity sets
+ selection of keys
+ creating entity sets to replace attributes with cardinality greater than 1

_Entity set versus attributes_
an entity set should satisfy at least one of the following conditions:
+ it is more than the name of something; it has at least one non-key attribute
+ it is the 'many' in a many-one or many-many relationship  

_When to use weak entity sets_
+ No global authority capable of creating unique IDs  (ex. unlikely there could be an agreement to assign unique ID across all students in the world)
+ However weak entity set should not be overused


_Selecting primary key_
+ Every relation must have a primary key
+ the criteria for this decision are as follows:
      + attributes with null values cannot form primary keys
      + one/few attributes is preferable to many attributes
      + internal keys preferable to external ones (weak entities depend for their existence on other entities)
      + a key that is used by many operations to access instances of an entity is preferable to others.

_Keeping keys simple_
As multi-attribute and or string/keys are
+ wasteful  ex Movies(movieID INT) > Movies(title, year,...)
+ break encapsulation ex. patient(fname, lname, phone...) expose privacy hole just use patientID

_Attributes with cardinality > 1_


__Translating an ER model into a DB schema__

_General Idea_  
+ Each entity set becomes a relation its attributes are attributes of the entity set
+ Each relationship becomes a relation, it's attributes are the keys of the entity sets that it connects, plus the attributes of the relationship itself.  
+ ...
