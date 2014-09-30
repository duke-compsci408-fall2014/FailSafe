from flask import Flask, request
from flask import render_template
from flask import jsonify
from flaskext.mysql import MySQL
from flask import Response

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'calendar'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)

@app.route('/')
def default():
	return render_template('day_view.html')
	 
@app.route('/day')
def day_view():
    return render_template('day_view.html')
	
@app.route('/month')
def month_view():
	con = mysql.connect()
	cursor = con.cursor()
	call_list = list()
	
	cursor.execute("SELECT * from OnCall")
	data = cursor.fetchall()
	for d in data:
		call_data = list()
		for i in range(len(d)):
			call_data.append(d[i])
		call_list.append(call_data)

	return render_template('directory.html', call_list=call_list)
	

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5002)