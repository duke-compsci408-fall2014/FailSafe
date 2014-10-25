from flask import Flask, Blueprint, request, render_template, jsonify, Response
from flask.json import JSONEncoder
import calendar
from datetime import datetime
from datetime import date
from flaskext.mysql import MySQL
import mods.directory as directory
import config

calendar = Blueprint('calendar',__name__,template_folder='templates',static_folder='static')

app = Flask(__name__)
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'calendar'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)

@calendar.route('/')
def default():
    return render_template('month_view.html', directory_list=get_directory_list())
	
@calendar.route('/day')
def day_view():
    return render_template('day_view.html')

@calendar.route('/month')
def month_view():
    return render_template('month_view.html', directory_list=get_directory_list())
	
def get_directory_list():
    dir_con = config.mysql.connect()
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
  
@calendar.route('/subSchedule')
def get_sub_schedule(day, month, year):
    return get_any_schedule("substitutions", "StartTime", day, month, year)

def get_any_schedule(table, dateColumn, day, month, year):
    con = mysql.connect()
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
                call_data.append(d[i])
        call_list.append(call_data)
    return call_list;


@calendar.route('/jsonSubSchedule')
def get_json_sub_schedule():
    return jsonify(results=get_sub_schedule(request.args.get('day'), request.args.get('month'), request.args.get('year')))
   

@calendar.route('/addCall', methods=['POST'])
def addCall():
    con = mysql.connect()
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
	
@calendar.route('/addSub', methods=['POST'])
def addSub():
    con = mysql.connect()
    cursor = con.cursor()

    callData = request.json
    sql_query = "INSERT INTO substitutions (StartTime, EndTime, Role, SubName \
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
