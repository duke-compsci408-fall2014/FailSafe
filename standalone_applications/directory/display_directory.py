from flask import Flask, request
from flask import render_template
from flask import jsonify
from flaskext.mysql import MySQL
from flask import Response

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'directory'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)


@app.route('/')
def index():
    return 'Index Page'


@app.route('/directory', methods=['GET', 'POST'])
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

	return render_template('directory.html', person_list=person_list)


# Add a staff to the directory
@app.route('/addStaff', methods = ['POST'])
def add_staff():
	return show_directory(request.json)

# Delete a staff in the directory
@app.route('/deleteStaff', methods = ['POST'])
def delete_staff():
    con = mysql.connect()
    cursor = con.cursor()
    print 'hi'
    print request.json['userID']
    query = "DELETE from tblUser where UserID = " + request.json['userID']
    try:
        cursor.execute(query)
        con.commit()
    except:
        con.rollback()

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=7000)
