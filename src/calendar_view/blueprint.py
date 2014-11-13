from flask import Flask, Blueprint, request, render_template, jsonify, Response
from flask.json import JSONEncoder
import calendar
from datetime import datetime
from datetime import date
from flaskext.mysql import MySQL
import directory_view as directory
from config import cal_mysql, dir_mysql
from directory_view.blueprint import User, get_all_staff, get_user_from_netID
from util.mysql import run_query, run_query_with_commit
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
    return run_query(dir_mysql, "SELECT * from tblUser")

@calendar.route('/monthSchedule')
def get_month_schedule(month, year):
    return get_default_schedule_for_month(month, year)

@calendar.route('/jsonMonthSchedule')
def get_json_month_schedule():
    return jsonify(results=get_month_schedule(request.args.get('month'), request.args.get('year')))

@calendar.route('/daySchedule')
def get_day_schedule(day, month, year):
    return get_default_schedule_for_date(day, month, year)

@calendar.route('/jsonDaySchedule')
def get_json_day_schedule():
    return jsonify(results=get_day_schedule(request.args.get('day'), request.args.get('month'), request.args.get('year')))

def get_sub_schedule(day, month, year):
    return get_substitutions_schedule_for_date(day, month, year)

def get_default_schedule_for_month(month, year):
    data = run_query(cal_mysql, "SELECT * FROM schedule WHERE MONTH(Day)={} AND YEAR(Day)={}".format(month, year))
    processed_schedules = []
    for i in data:
        processed_schedule = []
        date = str(i[0])
        processed_schedule.append(date)
        for j in range(6):
            user = get_user_from_netID(i[j + 1])
            shift_message = '<b>{}</b> {}'.format(user.lastName, user.netID)
            processed_schedule.append(shift_message)
        processed_schedules.append(processed_schedule)
    return processed_schedules

def get_default_schedule_for_date(day, month, year):
    data = run_query(cal_mysql, "SELECT * FROM schedule WHERE DAY(Day)={} AND MONTH(Day)={} AND YEAR(Day)={}".format(day, month, year))
    schedule = data[0]
    processed_schedule = [[]]
    date = str(schedule[0])
    processed_schedule[0].append(date)
    for i in range(6):
        user = get_user_from_netID(schedule[i + 1])
        shift_message = '<b>{}</b> {}'.format(user.lastName, user.netID)
        processed_schedule[0].append(shift_message)
    return processed_schedule

def get_substitutions_schedule_for_date(day, month, year):
    data = run_query(cal_mysql, "SELECT * FROM substitutions WHERE DAY(StartTime)={} AND MONTH(StartTime)={} AND YEAR(StartTime)={}".format(day, month, year))
    shifts = []
    for i in data:
        shift = []
        shift.append(i[0])      #uid
        shift.append(str(i[1])) #start time
        shift.append(str(i[2])) #end time
        shift.append(i[3])      #role
        user = get_user_from_netID(i[4])
        shift_message = '<b>{}</b> {}'.format(user.lastName, user.netID)
        shift.append(shift_message)
        shifts.append(shift)
    return shifts

def getNameForID(netID):
    return run_query(dir_mysql, "SELECT * FROM tblUser WHERE NetID = '{netID}'".format(netID = netID))

@calendar.route('/jsonSubSchedule')
def get_json_sub_schedule():
    return jsonify(results=get_sub_schedule(request.args.get('day'), request.args.get('month'), request.args.get('year')))

def get_oncall_team():
    con = cal_mysql.connect()
    cursor = con.cursor()
    roles = ['Faculty', 'Fellow', 'RN1', 'RN2', 'Tech1', 'Tech2']
    oncall_team = {}
    for i in roles:
        cursor.execute("SELECT {role} from schedule WHERE DATE(CONVERT_TZ(NOW(), '-1:00', '-5:00'))=Day".format(role = i))
        data = cursor.fetchall()
        if len(data) > 0:
            oncall_team[i] = str(data[0][0])  #first zero for first entry from fetchall, second zero for the actual value of (netID, )
    for i in roles:
        cursor.execute("SELECT * FROM substitutions WHERE CONVERT_TZ(NOW(), '-1:00', '-5:00') > StartTime AND CONVERT_TZ(NOW(), '-1:00', '-5:00') < EndTime AND Role = '{role}'".format(role=i))
        data = cursor.fetchall()
        if len(data) == 0:
            pass
        else:
            oncall_team[i] = str(data[0][4]) #data[0][4] refers to the fourth column of the first entry of the fetchall. the fourth column is the netID of the sub
    print oncall_team
    return oncall_team

"""
    Gets the days user with netID $netID is on call in the future, up to $numLimit days.
"""
def get_user_days_oncall(netID, numLimit):
    con = cal_mysql.connect()
    cursor = con.cursor()
    user = get_all_staff()[netID]
    roles = ['Faculty', 'Fellow', 'Nurse', 'Tech']
    if user.role == 'Faculty' or user.role == 'Fellow':
        cursor.execute("SELECT Day FROM schedule WHERE {role} = '{netID}' AND Day >= DATE(NOW()) ORDER BY Day ASC".format(role = user.role, netID = user.netID))
    elif user.role == 'Tech':
        cursor.execute("SELECT Day FROM schedule WHERE (Tech1 = '{netID}' OR Tech2 = '{netID}') AND Day >= DATE(NOW()) ORDER BY Day ASC".format(netID = user.netID))
    else:
        cursor.execute("SELECT Day FROM schedule WHERE (RN1 = '{netID}' OR RN2 = '{netID}' OR Tech1 = '{netID}' OR Tech2 = '{netID}') AND Day >= DATE(NOW()) ORDER BY Day ASC".format(netID = user.netID))
    data = cursor.fetchall()[:numLimit]
    days = []
    for i in range(len(data)):
        days.append(data[i][0])
    return days

@calendar.route('/json_datetime_schedule')
def json_datetime_schedule():
    queryDate = request.args.get('datetime');
    sql_query = "SELECT * FROM schedule WHERE Day = '" + queryDate + "'";

    data = run_query(cal_mysql, sql_query)
    schedule = []
    for d in data:
        call_data = list()
        for i in range(len(d)):
            detail = d[i]
            if(isinstance(detail, datetime) or isinstance(detail, date)):
                call_data.append(str(detail))
            else:
	        call_data.append(detail)
        schedule.append(call_data)
    return jsonify(results=schedule)

@calendar.route('/json_datetime_substitute')
def json_datetime_substitute():
    time = request.args.get('datetime');
    role = request.args.get('role');
    sql_query = "SELECT * FROM substitutions WHERE '" + time + "' BETWEEN StartTime AND EndTime AND Role='" + role + "'";

    data = run_query(cal_mysql, sql_query)
    schedule = []
    for d in data:
        sub_data = list()
        for i in range(len(d)):
            detail = d[i]
            if(isinstance(detail, datetime) or isinstance(detail, date)):
                sub_data.append(str(detail))
            else:
	        sub_data.append(detail)
        schedule.append(sub_data)
    return jsonify(results=schedule)


@calendar.route('/delete_call', methods=['DELETE'])
def delete_call():
    date = request.json
    sql_query = "DELETE FROM schedule WHERE Day = '" + date['date'] + "'";
    run_query_with_commit(cal_mysql, sql_query)
    return ""

@calendar.route('/delete_substitute', methods=['DELETE'])
def delete_substitute():
    time = request.json
    sql_query = "DELETE FROM substitutions WHERE '" +  time['time'] +  "' BETWEEN StartTime AND EndTime";
    run_query_with_commit(cal_mysql, sql_query)
    return ""

@calendar.route('/updateCall', methods=['PUT'])
def updateCall():
    callData = request.json
    sql_query = "UPDATE schedule \
        SET Faculty='{faculty}', Fellow='{fellow}', RN1='{rn1}', RN2='{rn2}', Tech1='{tech1}', Tech2='{tech2}' \
        WHERE Day='{date}'".format(faculty=callData['faculty'], fellow=callData['fellow'],
        rn1=callData['rn1'], rn2=callData['rn2'], tech1=callData['tech1'], tech2=callData['tech2'],
        date=callData['date']);
    run_query_with_commit(cal_mysql, sql_query)
    return ""

@calendar.route('/addCall', methods=['POST'])
def addCall():
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
    run_query_with_commit(cal_mysql, sql_query)
    return ""

@calendar.route('/addSub', methods=['POST'])
def addSub():
    callData = request.json
    sql_query = "INSERT INTO substitutions (StartTime, EndTime, Role, SubID \
            ) VALUES (" + \
            "'" + callData['start'] + "', " + \
            "'" + callData['end'] + "', " + \
            "'" + callData['role'] + "', " + \
            "'" + callData['sub'] + "')"
    run_query_with_commit(cal_mysql, sql_query)
    return ""
