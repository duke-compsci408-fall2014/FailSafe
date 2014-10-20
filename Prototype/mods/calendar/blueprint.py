from flask import Flask, Blueprint, request, render_template, jsonify, Response
from flask.json import JSONEncoder
import calendar
from datetime import datetime
from datetime import date
from flaskext.mysql import MySQL

calendar = Blueprint('calendar',__name__,template_folder='templates',static_folder='static')

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, datetime.date):
                return obj.year + "-" + obj.month + "-" + obj.day
            if isinstance(obj, datetime):
                return obj.year + "-" + obj.month + "-" + obj.day
            if isinstance(obj, date):
                return obj.year + "-" + obj.month + "-" + obj.day
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)

app = Flask(__name__)
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'calendar'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)

@calendar.route('/')
def default():
    return render_template('day_view.html')

@calendar.route('/day')
def day_view():
    return render_template('day_view.html')

@calendar.route('/testGet')
def test_get():
    return jsonify(results=[{'a': 'foo', 'b': 'bar'}, {'a': 'FOO', 'b': 'BAR'}])

@calendar.route('/schedule')
def get_schedule():
    con = mysql.connect()
    cursor = con.cursor()
    call_list = list()

    cursor.execute("SELECT * from OnCall")
    data = cursor.fetchall()
    for d in data:
        call_data = list()
        for i in range(len(d)):
            if(isinstance(d[i], date)):
                call_data.append(str(d[i].year) + "-" + str(d[i].month) + "-" + str(d[i].day));
            else:
                call_data.append(d[i])
        call_list.append(call_data)
    return call_list;

@calendar.route('/jsonSchedule')
def get_json_schedule():
   return jsonify(results=get_schedule())

@calendar.route('/month')
def month_view():
    return render_template('month_view.html', call_list=get_schedule())

@calendar.route('/addCall', methods=['POST'])
def addCall():
    con = mysql.connect()
    cursor = con.cursor()

    callData = request.json
    sql_query = "INSERT INTO OnCall (Day, Faculty, Fellow, RN1, \
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
    return redirect(url_for('month_view'))

