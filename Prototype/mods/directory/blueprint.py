from flask import Flask, Blueprint, render_template, request, Response, jsonify
import config
from mods.calendar.blueprint import User

directory = Blueprint('directory',__name__, template_folder='templates', static_folder='static')

@directory.route('/', methods=['GET', 'POST'])
def show_directory(staff = None, addstaff = False, editstaff = False):
    con = config.mysql.connect()
    cursor = con.cursor()
    person_list = list();

	# add new staff based on the form
    if staff is not None:
        if addstaff:
            sql_query = "INSERT INTO tblUser (UserID, Role, IsAdministrator, FirstName, \
                LastName, CellPhone, HomePhone, PagerNumber, NetID) VALUES ('', " + \
                    "'" + staff['role'] + "', " + \
                    "'" + staff['admin'] + "', " + \
                    "'" + staff['firstName'] + "', " + \
                    "'" + staff['lastName'] + "', " + \
                    "'" + staff['cellNumber'] + "', " + \
                    "'" + staff['homeNumber'] + "', " + \
                    "'" + staff['pager'] + "', " + \
                    "'" + staff['netID'] + "' )"
        elif editstaff:
            sql_query = "UPDATE tblUser SET Role = " + "'" + staff['role'] + "' ," + \
                    "IsAdministrator = " + "'" + staff['admin'] + "' ," + \
                    "FirstName = " + "'" + staff['firstName'] + "' ," + \
                    "LastName = " + "'" + staff['lastName'] + "' ," + \
                    "CellPhone = " + "'" + staff['cellNumber'] + "' ," + \
                    "HomePhone = " + "'" + staff['homeNumber'] + "' ," +\
                    "PagerNumber = " + "'" + staff['pager'] + "' ," + \
                    "NetID = " + "'" + staff['netID'] + "' " + \
                    "WHERE netID = " + "'" + staff['netID'] + "'"
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
	return show_directory(request.json, True, False)

# Edit a staff in the directory
@directory.route('/editStaff', methods = ['POST'])
def edit_staff():
    return show_directory(request.json, False, True)

# Delete a staff in the directory
@directory.route('/deleteStaff', methods = ['POST'])
def delete_staff():
    print "i'm here!!"
    con = config.mysql.connect()
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

def get_all_staff():
    con = config.mysql.connect()
    cursor = con.cursor()
    users = {}
    cursor.execute("SELECT * from tblUser")
    data = cursor.fetchall()
    con.close()
    for d in data:
        person_data = list()
        for i in range(len(d)):
            person_data.append(d[i])
        newUser = User(person_data)
        users[newUser.netID] = newUser
    return users
