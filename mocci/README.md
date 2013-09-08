Mocci WebAPI
====

## 環境
### AWS
* EC2(Ubuntu-12.04; Tokyo Region) + Elastic IP(固定グローバル)
* RDS(MySQL-5.6)

### 構成
* Apache2(2.22) + WSGI + python
* Framework: webpy (http://webpy.org/)

## インストール
### apt
    apt-get install python-mysqldb
    apt-get install python-sqlobject
    apt-get install apache2-mpm-prefork 
    apt-get install libapache2-mod-wsgi

### web.py
    web.py(http://webpy.org/install) を参照

## データベース作成
### DB作成
```
CREATE DATABASE moccidb DEFAULT CHARACTER set utf8
```
### ユーザー追加
```SQL
/* moccidb に mocciuser（パスワード無し）のユーザーを作る */
GRANT ALL ON moccidb.* TO mocciuser IDENTIFIED BY "";
FLUSH PRIVILEGES;
```
### テーブル作成
```SQL
CREATE TABLE moccidb.applications (
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL DEFAULT '',
	description TEXT,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	deleted INT DEFAULT 0, 
	PRIMARY KEY (id)
) ENGINE = InnoDB CHARACTER SET = utf8
```
## Apacheの設定（例）
### /etc/apache2/sites-available/mocci 
```
WSGIScriptAlias /v1 /var/www/mocci/v1/mocciapi.py

<Directory /var/www/mocci/v1>
	SetHandler wsgi-script

	Order deny,allow
	Allow from all
</Directory>
```
### 設定
```
cd /etc/apache2/sites-available/
sudo a2ensite mocci
```
