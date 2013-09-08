# coding:utf-8
import sys,os
import web
import json
from sqlobject import *

dbhost   = '<your database host>'
dbname   = '<your database name>'
dbuser   = '<your database user>'
dbparams = 'charset=utf8'

# URL Mapping
urls = (
	'/applications', 'GetApplications',
	'/application/(.*)', 'GetApplicationDetail'
)

# Database 
application = web.application(urls, globals()).wsgifunc()
connection = connectionForURI("mysql://%s@%s/%s?%s" % (dbuser, dbhost, dbname, dbparams))
sqlhub.processConnection = connection

# OR Mapper
class Application(SQLObject):
	class sqlmeta:
		table = "applications"
		fromDatabase = True;

class GetApplications:
	def GET(self):
		jsons = []
		for eapps in Application.selectBy(deleted = 0):
			datum = {
				'id': eapps.id,
				'name': eapps.name,
			}
			jsons.append(datum)
		web.header('Content-Type', 'application/json; charset=utf-8')
		return json.dumps(jsons, ensure_ascii=False)

class GetApplicationDetail:
	def GET(self, id):
		jsons = []
		for eapps in Application.selectBy(id = id, deleted = 0):
			datum = {
				'name': eapps.name,
				'description': eapps.description,
			}
			jsons.append(datum)
		web.header('Content-Type', 'application/json; charset=utf-8')
		return json.dumps(jsons, ensure_ascii=False)
