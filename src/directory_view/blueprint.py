from flask import Flask, Blueprint, render_template, request, Response, jsonify, session
from config import dir_mysql, cal_mysql
from util.mysql import *

class User:
    def __init__(self, row_entry):
        self.userID = int(row_entry[0])
        self.role = row_entry[1]
        self.isAdministrator = row_entry[2]
        self.firstName = row_entry[3]
        self.lastName = row_entry[4]
        self.cellPhone = str(row_entry[5])
        self.homePhone = str(row_entry[6])
        self.pagerNumber = str(row_entry[7])
        self.netID = str(row_entry[8])

directory = Blueprint('directory',__name__, template_folder='templates', static_folder='static')

@directory.route('/', methods=['GET', 'POST'])
def show_directory(staff = None, addstaff = False, editstaff = False):
    con = dir_mysql.connect()
    cursor = con.cursor()
    person_list = list()

    # get the logged in user
    user = get_logged_in_user()

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
            cursor.execute("SELECT UserID FROM tblUser WHERE netID = " + "'" + \
                    staff['prevNetid'] + "'")
            row = cursor.fetchone()
            uid = int(row[0])
            print uid
            sql_query = "UPDATE tblUser SET Role = " + "'" + staff['role'] + "' ," + \
                    "IsAdministrator = " + "'" + staff['admin'] + "' ," + \
                    "FirstName = " + "'" + staff['firstName'] + "' ," + \
                    "LastName = " + "'" + staff['lastName'] + "' ," + \
                    "CellPhone = " + "'" + staff['cellNumber'] + "' ," + \
                    "HomePhone = " + "'" + staff['homeNumber'] + "' ," +\
                    "PagerNumber = " + "'" + staff['pager'] + "' ," + \
                    "NetID = " + "'" + staff['netID'] + "' " + \
                    "WHERE UserID = " + str(uid)
        try:
            cursor.execute(sql_query)
            con.commit()
        except:
            con.rollback()

    cursor.execute("SELECT * from tblUser")
    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    con.close()
    for row in rows:
        person_list.append(dict(zip(columns, row)))
        #person_data = list()
	#person_data.append(d)
        #for i in range(len(d)):
        #    person_data.append(d[i])
        #person_list.append(person_data)

    return render_template('directory.html', person_list=person_list, user=user)

def ensure_user_exists(netID):
    if get_user_from_netID(netID) == None:
        show_directory({u'firstName': u'DEFAULT', u'netID': netID, u'admin': u'No', u'lastName': u'DEFAULT', u'homeNumber': u'+19876543210', u'role': u'Faculty', u'cellNumber': u'+19876543210', u'pager': u'+19876543210'}, True, False)

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
    con = dir_mysql.connect()
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
    con = dir_mysql.connect()
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

def get_user_from_number(number):
    con = dir_mysql.connect()
    cursor = con.cursor()
    cursor.execute("SELECT * from tblUser WHERE CellPhone = {}".format(number))
    data = cursor.fetchall()
    con.close()
    if len(data) > 0:
        person_data = list()
        for i in range(len(data[0])):
            person_data.append(data[0][i])
        newUser = User(person_data)
        return newUser
    return None

def get_user_from_netID(netID):
    try:
        data = run_query(dir_mysql, "SELECT * FROM tblUser WHERE NetID = '{netID}'".format(netID = netID))
        newUser = User(data[0])
        return newUser
    except:
        return None

def get_logged_in_user():
    session['user_netid'] = str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
    if 'user_netid' in session and session['user_netid'] in get_all_staff():
        netID = session['user_netid']
        user = get_all_staff()[netID]
    else:
        user = "user not valid"
    return user

