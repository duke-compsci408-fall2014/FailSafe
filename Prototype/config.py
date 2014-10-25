from flask import Flask
from flaskext.mysql import MySQL
app = Flask(__name__)
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'directory'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)

cal_app = Flask(__name__)
cal_mysql = MySQL()
cal_app.config['MYSQL_DATABASE_USER'] = 'failsafe'
cal_app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
cal_app.config['MYSQL_DATABASE_DB'] = 'calendar'
cal_app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
cal_mysql.init_app(cal_app)

