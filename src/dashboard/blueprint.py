from flask import Flask, Blueprint, render_template, request, Response, jsonify, session
from directory.blueprint import get_all_staff
from calendar.blueprint import get_user_days_oncall
dashboard = Blueprint('dashboard',__name__, template_folder='templates', static_folder='static')

@dashboard.route('/', methods=['GET', 'POST'])
def show_dashboard():
    if 'user_netid' in session:
        netID = session['user_netid']
        user = get_all_staff()[netID]
        oncall_days = get_user_days_oncall(netID, 5)
        return render_template('dashboard.html', user=user, oncall_days=oncall_days)
    return render_template('dashboard.html')
