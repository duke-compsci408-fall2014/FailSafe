from flask import Flask, Blueprint, render_template, request, Response, jsonify, session
from directory_view.blueprint import get_all_staff
from calendar_view.blueprint import get_user_days_oncall
dashboard = Blueprint('dashboard',__name__, template_folder='templates', static_folder='static')

@dashboard.route('/', methods=['GET', 'POST'])
def show_dashboard():
    try:
        session['user_netid'] = str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
        if 'user_netid' in session and session['user_netid'] in get_all_staff():
            netID = session['user_netid']
            user = get_all_staff()[netID]
            oncall_days = get_user_days_oncall(netID, 5)
            return render_template('dashboard.html', user=user, oncall_days=oncall_days)
        return "user not valid"
    except Exception as a:
        return str(a.message)
