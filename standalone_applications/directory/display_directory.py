from flask import Flask, request
from flask import render_template
from flask import jsonify
from flaskext.mysql import MySQL
from flask import Response

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'mysqldb'
app.config['MYSQL_DATABASE_DB'] = 'directory'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)


@app.route('/')
def index():
    return 'Index Page'


@app.route('/directory')
def show_directory(newstaff = None):
	con = mysql.connect()
	cursor = con.cursor()	
	person_list = list();

	# add new staff based on the form
	if newstaff is not None:
		sql_query = "INSERT INTO tblUser (UserID, Role, IsAdministrator, FirstName, \
			LastName, CellPhone, HomePhone, PagerNumber, NetID) VALUES ('', " + \
				"'" + newstaff['role'] + "', " + \
				"'" + newstaff['admin'] + "', " + \
				"'" + newstaff['firstName'] + "', " + \
				"'" + newstaff['lastName'] + "', " + \
				"'" + newstaff['cellNumber'] + "', " + \
				"'" + newstaff['homeNumber'] + "', " + \
				"'" + newstaff['pager'] + "', " + \
				"'" + newstaff['netID'] + "' )"
		# print sql_query
		try:
			cursor.execute(sql_query)
			con.commit()
		except:
			con.rollback()

	
	cursor.execute("SELECT * from tblUser")
	data = cursor.fetchall()
	for d in data: 
		person_data = list()
		for i in range(len(d)):
			person_data.append(d[i])
		person_list.append(person_data)

	return render_template('user_group.html', person_list=person_list)


# Add a staff to the directory
@app.route('/addStaff', methods = ['POST'])
def add_staff():
	return show_directory(request.json)
	

if __name__ == '__main__':
    app.run(debug=True)