from flask import Blueprint, request, session, escape, jsonify
import urllib2
import time
from datetime import datetime
from fs_twilio.config import *
from directory_view.blueprint import get_all_staff, get_user_from_number, get_user_from_netID
from calendar_view.blueprint import get_oncall_team
from util.logger import log
import os
import cgi, cgitb

backend = Blueprint('backend', __name__, template_folder='templates', static_folder='static')

@backend.route("/response_actual", methods=['GET', 'POST'])
def process_response():
    global oncall_eta, team_status
    from_number = request.values.get('From', None)
    message_body = str(request.values.get('Body', None)).lower()
    user = get_user_from_number(from_number)
    if user != None and user.netID in get_oncall_team().values():
        log("sender valid")
        command_string = message_body.split()[0]
        if command_string == "eta":
            log("sender reporting eta")
            try:
                oncall_eta[user.netID] = int(message_body.split()[1])
                team_status[user.netID] = -1
                client.messages.create(to=from_number, from_=default_from_phone, body="Thank you for your response. You said your eta is " + str(message_body.split()[1]) + " minutes.")
            except:
                client.messages.create(to=from_number, from_=default_from_phone, body="Your text is invalid. Please type \"eta X\" where X is a whole number.")
        elif command_string == "status":
            log("sender requesting team status")
            client.messages.create(to=from_number, from_=default_from_phone, body="Your text has been received. You requested status.")
        else:
            log("invalid command")
            client.messages.create(to=from_number, from_=default_from_phone, body="Your text is invalid. Please type \"eta X\" or \"status\"")
    else:
        log("sender invalid")
        client.messages.create(to=from_number, from_=default_from_phone, body="")
    return ""
    # check to see if the number is valid
    # check to see if the message is valid
    # if the message is an ETA update
    #   update ETA of the individual
    # if the message is a status request
    #   update send the text to the sender with status updates

@backend.route("/")
def index():
    if 'user_netid' not in session:
        return "Hello, Anon. ;)"
    return "Hello, {}".format(escape(session['user_netid']))

'''
    Login
'''
@backend.route("/user/<user_netid>")
def switch_user(user_netid=""):
    session['user_netid'] = user_netid
    return "User {} logged in.".format(user_netid)

'''
@purpose runs through the entire list of users retruend from alert so that they are
           each given a feedback loop which they can break by responding

@param-netIDs  list of strings contacts to be notified
@param-message string          the message that needs to be sent to the users
@param-delay   integer         number of seconds between each call/page/text
@param-repeats integer         number of times to repeat the full cycle
'''
def loop_users(netIDs, message, delay, repeats):
    print netIDs
    users = get_all_staff()
    print users
    valid_users = {}
    for i in users:
        if i in netIDs:
            valid_users[i] = users[i]
    users = valid_users
    print users
    for i in range(repeats):
        # page_all(users, message)
        # time.sleep(delay)
        send_group_sms_users(users, message)
        time.sleep(delay)
        make_multiple_calls_cell(users, message)
        time.sleep(delay)
        make_multiple_calls_home(users, message)


@backend.route("/sandbox")
def sandbox():
    return str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
'''
@purpose calendar calls this method to alert all on-call individuals
'''
@backend.route("/on_call", methods=['POST'])
def alert_oncall():
    loop_users(get_oncall_team().values(), format_message(request.json), 30, 5)
    return ""

@backend.route("/start_alert", methods=['POST'])
def start_alert():
    global team_status, alert_message, oncall_eta
    oncall_eta = {}
    alert_message = format_message(request.json)
    team_status = {}
    for i in get_oncall_team().values():
        team_status[i] = 0
    return jsonify(team_status)

@backend.route("/pending_staff", methods=['GET'])
def pending_staff():
    global team_status
    return jsonify(results=team_status)

@backend.route("/contact", methods=['POST'])
def contact():
    global team_status, alert_message
    netID = request.json['netID']
    if netID in team_status:
        user = get_user_from_netID(netID)
        if team_status[user.netID] >= 0:
            if team_status[user.netID] == 0:
                send_page(user.pagerNumber, alert_message)
            elif team_status[user.netID] == 1:
                send_sms(user.cellPhone, alert_message)
            elif team_status[user.netID] == 2:
                make_call(user.homePhone, alert_message)
            else:
                make_call(user.cellPhone, alert_message)
            team_status[user.netID] = (team_status[user.netID] + 1) % 4
            return ''
        else:
            return ''
    else:
        return ''
'''
@purpose makes calendar-passed information for on-call emergency notification
         python compatible
'''
def format_message(message_json):
    message = "[{}] ETA: {}, TYPE: {}, LOCATION: {}, MSG: {} Please respond with your personal ETA in minutes, i.e. \"eta 3\" for 3 minutes.".format(str(datetime.now())[:-7], message_json['eta'], message_json['type'], message_json['location'], message_json['msg'])
    return message
