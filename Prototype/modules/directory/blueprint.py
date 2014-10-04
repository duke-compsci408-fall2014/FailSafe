from flask import Flask, Blueprint, render_template, request, Response, jsonify

directory = Blueprint('directory',__name__,template_folder='directory/templates')

@directory.route('/', methods=['GET', 'POST'])
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
    con.close()
    for d in data:
        person_data = list()
        for i in range(len(d)):
            person_data.append(d[i])
        person_list.append(person_data)

    return render_template('directory.html', person_list=person_list)


# Add a staff to the directory
@directory.route('/addStaff', methods = ['POST'])
def add_staff():
	return show_directory(request.json)

# Delete a staff in the directory
@directory.route('/deleteStaff', methods = ['POST'])
def delete_staff():
    con = mysql.connect()
    cursor = con.cursor()
    print request.json['userID']
    query = "DELETE from tblUser where UserID = " + request.json['userID']
    try:
        cursor.execute(query)
        con.commit()
    except:
        con.rollback()
    con.close()
    return show_directory()
