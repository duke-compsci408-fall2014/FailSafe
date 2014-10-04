from flask import Flask
from modules.directory.blueprint import directory
from modules.calendar.blueprint import calendar
from flaskext.mysql import MySQL

app = Flask(__name__)
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'directory'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)
   
app.register_blueprint(directory, url_prefix='/directory')
app.register_blueprint(calendar, url_prefix='/calendar')

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=8000)

@app.route('/')
def index():
    return 'Welcome to FailSafe!'
	
