-- show databases
SHOW DATABASES;

-- make new database
CREATE DATABASE test;
-- Use a database
USE test;


-- declare keys with PRIMARY KEY or UNIQUE
# 1. relation schema
# 2. additional declaration (have to be used when >2 attributes used as keys)
-- By declaring a key, inserts/updates cannot generate keys identical to ones already in the database
-- PRIMARY KEY does not allow for NULL; while UNIQUE does, therefore possible to have multiple NULL as UNIQUE keys.


-- CREATE TABLE
CREATE TABLE Movies (
  title CHAR(100),
  year INT,
  length INT,
  genre CHAR(10),
  studioName CHAR(30),
  producerC INT,
  PRIMARY KEY (title, year)
);

CREATE TABLE MovieStar (
  name CHAR(30),
  address VARCHAR(255),
  gender CHAR(1) DEFAULT '?',
  birthday DATE,
  PRIMARY KEY (name)
);

CREATE TABLE StarsIn (
  movieTitle CHAR(100),
  movieYear INT,
  starName VARCHAR(255)
);

-- alter table: adding/removing attributes
ALTER TABLE Movies ADD phone CHAR(30) DEFAULT 'unlisted';
ALTER TABLE MovieStar DROP birthday;

INSERT INTO Movies VALUES ("Gravity", 2014, 179, "scifi", "dreamworks", 001, 123231923);
INSERT INTO Movies VALUES ("The Birdman", 2015, 180, "drama", "dreamworks", 001, 12541923);
INSERT INTO Movies VALUES ("The Revenant", 2016, 230, "thriller", "dreamworks", 002, 23432923);

-- SHOW TABLES fSCHEMA
DESCRIBE Movies;
DESCRIBE MovieStar;

SELECT m1.title, m2.title , m1.length, m2.length
FROM Movies m1, Movies m2
WHERE m1.length < m2.length;


SELECT title, length, 'movies' AS Type
FROM Movies
WHERE length >=180 AND title LIKE '%an_'
ORDER BY length DESC;

-- DROP DATABASE
DROP DATABASE test;
