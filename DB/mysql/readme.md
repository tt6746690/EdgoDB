
make dumps

```
mysqldump -u root -p -h localhost EdgoDB > EdgoDB_backup.sql
```

restore db

```
mysql -u root -p EdgoDB < EdgoDB_backup.sql
```
