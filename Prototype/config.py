from flask import Flask
from flaskext.mysql import MySQL
dir_app = Flask(__name__)
dir_mysql = MySQL()
dir_app.config['MYSQL_DATABASE_USER'] = 'failsafe'
dir_app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
dir_app.config['MYSQL_DATABASE_DB'] = 'directory'
dir_app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
dir_mysql.init_app(dir_app)

cal_app = Flask(__name__)
cal_mysql = MySQL()
cal_app.config['MYSQL_DATABASE_USER'] = 'failsafe'
cal_app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
cal_app.config['MYSQL_DATABASE_DB'] = 'calendar'
cal_app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
cal_mysql.init_app(cal_app)

