from flask import Flask, Blueprint, request, render_template, jsonify, Response
from flask.json import JSONEncoder
import calendar
from datetime import datetime
from datetime import date
from flaskext.mysql import MySQL
import mods.directory as directory
from config import cal_mysql, dir_mysql
from mods.directory.blueprint import User

calendar = Blueprint('calendar',__name__,template_folder='templates',static_folder='static')

@calendar.route('/')
def default():
    return render_template('month_view.html', directory_list=get_directory_list())

@calendar.route('/day')
def day_view():
    return render_template('day_view.html', directory_list=get_directory_list())

@calendar.route('/month')
def month_view():
    return render_template('month_view.html', directory_list=get_directory_list())

def get_directory_list():
    dir_con = dir_mysql.connect()
    dir_cursor = dir_con.cursor()
    directory_list = list()

    dir_cursor.execute("SELECT * from tblUser")
    dir_data = dir_cursor.fetchall()
    for d in dir_data:
        directory_list.append(d)
    return directory_list

@calendar.route('/monthSchedule')
def get_month_schedule(month, year):
    return get_any_schedule("schedule", "Day", None, month, year)

@calendar.route('/jsonMonthSchedule')
def get_json_month_schedule():
    return jsonify(results=get_month_schedule(request.args.get('month'), request.args.get('year')))

@calendar.route('/daySchedule')
def get_day_schedule(day, month, year):
    return get_any_schedule("schedule", "Day", day, month, year)

@calendar.route('/jsonDaySchedule')
def get_json_day_schedule():
    return jsonify(results=get_day_schedule(request.args.get('day'), request.args.get('month'), request.args.get('year')))

def get_sub_schedule(day, month, year):
    return get_any_schedule("substitutions", "StartTime", day, month, year)

def get_any_schedule(table, dateColumn, day, month, year):
    con = cal_mysql.connect()
    cursor = con.cursor()
    call_list = list()

    if(day != None):
	    cursor.execute("SELECT * FROM {table} WHERE DAY({col}) = {day} \
            AND MONTH({col}) = {month} AND YEAR({col}) = {year}" \
            .format(table=table, col=dateColumn, day=day, month=month, year=year))
    else:
	    cursor.execute("SELECT * FROM {table} WHERE \
            MONTH({dateColumn}) = {month} AND YEAR({dateColumn}) = {year}" \
            .format(table=table, dateColumn=dateColumn, month=month, year=year))
    data = cursor.fetchall()
    for d in data:
        call_data = list()
        for i in range(len(d)):
            if(isinstance(d[i], datetime) or isinstance(d[i], date)):
                call_data.append(str(d[i]))
            else:
                #get name from netID
		userInfo = getNameForID(d[i])
                if len(userInfo) == 0: #if couldn't find name, use whatever we have
                    call_data.append(d[i])
                else:
                    firstNameColumn = 3
                    lastNameColumn = 4
                    call_data.append('<b>' + userInfo[0][lastNameColumn] + '</b>' + ' ' + d[i])
        call_list.append(call_data)
    return call_list;

def getNameForID(netID):
    dir_con = dir_mysql.connect()
    dir_cursor = dir_con.cursor()

    dir_cursor.execute("SELECT * FROM tblUser WHERE NetID = '{netID}'".format(netID = netID))
    userInfo = dir_cursor.fetchall()
    return userInfo



@calendar.route('/jsonSubSchedule')
def get_json_sub_schedule():
    return jsonify(results=get_sub_schedule(request.args.get('day'), request.args.get('month'), request.args.get('year')))

def get_oncall_team():
    con = cal_mysql.connect()
    cursor = con.cursor()
    roles = ['Faculty', 'Fellow', 'RN1', 'RN2', 'Tech1', 'Tech2']
    oncall_team = {}
    user = 0
    for i in roles:
        cursor.execute("SELECT {role} from schedule WHERE DATE(CONVERT_TZ(NOW(), '-1:00', '-5:00'))=Day".format(role = i))
        oncall_team[i] = str(cursor.fetchall()[user][0])
    for i in roles:
        cursor.execute("SELECT * FROM substitutions WHERE CONVERT_TZ(NOW(), '-1:00', '-5:00') > StartTime AND CONVERT_TZ(NOW(), '-1:00', '-5:00') < EndTime AND Role = '{role}'".format(role=i))
        data = cursor.fetchall()
        if len(data) == 0:
            pass
        else:
	    nameColumn = 4
            oncall_team[i] = str(data[user][nameColumn])
    print oncall_team
    return oncall_team

@calendar.route('/delete_call', methods=['DELETE'])
def delete_call():
    con = cal_mysql.connect()
    cursor = con.cursor()

    date = request.json
    sql_query = "DELETE FROM schedule WHERE Day = '" + date['date'] + "'";

    try:
        cursor.execute(sql_query)
        con.commit()
    except:
        con.rollback()
    return ""

@calendar.route('/json_datetime_schedule')
def json_datetime_schedule():
    con = cal_mysql.connect()
    cursor = con.cursor()

    queryDate = request.args.get('datetime');
    sql_query = "SELECT * FROM schedule WHERE Day = '" + queryDate + "'";
    cursor.execute(sql_query);

    data = cursor.fetchall()
    schedule = []
    for d in data:
        call_data = list()
        for i in range(len(d)):
            if(isinstance(d[i], datetime) or isinstance(d[i], date)):
                call_data.append(str(d[i]))
            else:
                #get name from netID
    	        userInfo = getNameForID(d[i])
                if len(userInfo) == 0: #if couldn't find name, use whatever we have
                    call_data.append(d[i])
                else:
                    firstNameColumn = 3
                    lastNameColumn = 4
                    call_data.append('<b>' + userInfo[0][lastNameColumn] + '</b>' + ' ' + d[i])
        schedule.append(call_data)
    return jsonify(results=schedule)

@calendar.route('/addCall', methods=['POST'])
def addCall():
    con = cal_mysql.connect()
    cursor = con.cursor()

    callData = request.json
    sql_query = "INSERT INTO schedule (Day, Faculty, Fellow, RN1, \
            RN2, Tech1, Tech2) VALUES (" + \
            "'" + callData['date'] + "', " + \
            "'" + callData['faculty'] + "', " + \
            "'" + callData['fellow'] + "', " + \
            "'" + callData['rn1'] + "', " + \
            "'" + callData['rn2'] + "', " + \
            "'" + callData['tech1'] + "', " + \
            "'" + callData['tech2'] + "')"
    try:
        cursor.execute(sql_query)
        con.commit()
    except:
        con.rollback()
    return ""

@calendar.route('/addSub', methods=['POST'])
def addSub():
    con = cal_mysql.connect()
    cursor = con.cursor()

    callData = request.json
    sql_query = "INSERT INTO substitutions (StartTime, EndTime, Role, SubID \
            ) VALUES (" + \
            "'" + callData['start'] + "', " + \
            "'" + callData['end'] + "', " + \
            "'" + callData['role'] + "', " + \
            "'" + callData['sub'] + "')"
    try:
        cursor.execute(sql_query)
        con.commit()
    except:
        con.rollback()
    return ""
