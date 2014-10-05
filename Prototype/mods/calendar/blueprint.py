from flask import Flask, Blueprint, request, render_template, json, jsonify, Response
import config

calendar = Blueprint('calendar',__name__,template_folder='templates',static_folder='static')

@calendar.route('/')
def default():
	return render_template('day_view.html')

@calendar.route('/day')
def day_view():
    return render_template('day_view.html')

@calendar.route('/month')
def month_view(newevent = None):
    con = config.mysql.connect()
    cursor = con.cursor()
    call_list = list()

    cursor.execute("SELECT * from OnCall")
    data = cursor.fetchall()
    for d in data:
        call_data = list()
        for i in range(len(d)):
            call_data.append(d[i])
        call_list.append(call_data)

    return render_template('month_view.html', call_list=call_list)

@calendar.route('/addCall', methods=['POST'])
def add_call():
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

