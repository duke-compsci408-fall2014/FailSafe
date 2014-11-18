from flask import Blueprint, request, session, escape
import urllib2
import time
from datetime import datetime
from fs_twilio.config import *
from directory_view.blueprint import get_all_staff, get_user_from_number
from calendar_view.blueprint import get_oncall_team
from util.logger import log

backend = Blueprint('backend', __name__, template_folder='templates', static_folder='static')

@backend.route("/response_actual", methods=['GET', 'POST'])
def process_response():
    from_number = request.values.get('From', None)
    message_body = str(request.values.get('Body', None)).lower()
    if True:
        log("sender valid")
        command_string = message_body.split()[0]
        if command_string == "eta":
            log("sender reporting eta")
            client.messages.create(to=from_number, from_=default_from_phone, body="Thank you for your response. You said your eta is " + str(message_body.split()[1]))
        elif command_string == "status":
            log("sender requesting team status")
            client.messages.create(to=from_number, from_=default_from_phone, body="Your text has been received. You requested status.")
        else:
            log("invalid command")
            client.messages.create(to=from_number, from_=default_from_phone, body="Your text is invalid. Please type \"eta X\" or \"status\"")
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
    send_page("9199707723", "PAGING WORKSSSSSS")
    log(get_oncall_team())
    return "a"

'''
@purpose calendar calls this method to alert all on-call individuals
'''
@backend.route("/on_call", methods=['POST'])
def alert_oncall():
    loop_users(get_oncall_team().values(), format_message(request.json), 30, 5)
    return ""

'''
@purpose makes calendar-passed information for on-call emergency notification
         python compatible
'''
def format_message(message_json):
    message = "[{}] ETA: {}, TYPE: {}, LOCATION: {}, MSG: {}".format(str(datetime.now())[:-7], message_json['eta'], message_json['type'], message_json['location'], message_json['msg'])
    return message
