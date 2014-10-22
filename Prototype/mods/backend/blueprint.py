from flask import Flask, redirect, url_for, Blueprint, render_template, request, Response, jsonify
import config
import twilio.twiml, random
from twilio.rest import TwilioRestClient
import urllib2, datetime
from httplib2 import Http
from urllib import urlencode
import requests
from flaskext.mysql import MySQL
import time

backend = Blueprint('backend', __name__, template_folder='templates', static_folder='static')

# Find these values at https://twilio.com/user/account
account_sid = "AC8ec001dd37e80c10a9bf5e47794b6501"
auth_token = "b0a47efa254507764caa06b8949c788b"
client = TwilioRestClient(account_sid, auth_token)

app = Flask(__name__)
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'failsafe'
app.config['MYSQL_DATABASE_PASSWORD'] = 'efasliaf'
app.config['MYSQL_DATABASE_DB'] = 'directory'
app.config['MYSQL_DATABASE_HOST'] = 'colab-sbx-131.oit.duke.edu'
mysql.init_app(app)

# Try adding your own number to this list!
callers = {}
callers_on = {}
callers_last = {}

numbers = ['+19197978781', '+18473469673', '+13175653154', '+14806486560']
mynumber = ['+14806486560']
others_numbers = ['+19197978781', '+18473469673', '+13175653154']
default_from_phone = '+14138533700'
loop_breaker_dictionary = {}

for x in mynumber:
    loop_breaker_dictionary[x] = False

emergency_url = 'http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately%20and%20let%20the%20operator%20know%20that%20you%20are%20on%20your%20way.&'
twimlet_default = 'http://twimlets.com/message?Message%5B0%5D='

def send_sms(receiving_number, message):
    message = client.messages.create(to=receiving_number, from_=default_from_phone, body=message)
    print "sent message"

def send_smss(receiving_numbers, message):
    for i in receiving_numbers:
        send_sms(i, message)

def page_all(users, message):
    for i in users:
        send_sms(users[i].pagerNumber, message)

def text_all(users, message):
    for i in users:
        send_sms(users[i].cellPhone, message)

def make_call(receiving_number, message):
    message = str(urllib2.quote(message)) + "&"
    message = client.calls.create(to=receiving_number, from_=default_from_phone, url=twimlet_default+message)
    print "made call"

def make_calls(receiving_numbers, message):
    for i in receiving_numbers:
        make_call(i, message)

def call_all_home(users, message):
    for i in users:
        make_call(users[i].homePhone, message)

def call_all_cell(users, message):
    for i in users:
        make_call(users[i].cellPhone, message)

def loop(receiving_number, message, delay, repeats): #delay in seconds
    for i in range(repeats):
        make_call(receiving_number, message)
        time.sleep(delay)
        send_sms(receiving_number, message)
        time.sleep(delay)
    return "Loop Ended"

def loop_all(receiving_numbers, message, delay, repeats): #delay in seconds
    for i in range(repeats):
        make_calls(receiving_numbers, message)
        time.sleep(delay)
        send_smss(receiving_numbers, message)
        time.sleep(delay)
    return "Loop Ended"

def loop_break_check():
    from_number = request.values.get('From', None)
    if from_number in mynumber:
	message = callers[from_number] + ", thanks for the message!"
	loop_breaker_dictionary[from_number] = True
    else:
	message = "Thanks for the message."
    resp = twilio.twiml.Response()
    resp.message(message)
    return str(resp)

@backend.route("/test_loop_break_check", methods=['GET', 'POST'])
def test_loop_break_check():
    response = request.values.get('From', None)
    if response:
	return response
    else:
    	return twilio.twiml.Response()

@backend.route("/response", methods=['GET', 'POST'])
def sms_response():
    from_number = request.values.get('From', None)
    if from_number in mynumbers:
        loop_breaker_dictionary[from_number]=True
    message = str(request.values.get('Body', None)).lower()
    message = client.messages.create(to=from_number, from_=default_from_phone, body="Thanks for the message, bro. Your number is " + from_number + ".")
    return "done"

@backend.route("/")
def index():
    return "Hello World"

def loop_user(netID, message, delay, repeats):
    user = get_all_users()[netID]
    for i in range(repeats):
        send_sms(user.pagerNumber, message)
        time.sleep(delay)
        send_sms(user.cellPhone, message)
        time.sleep(delay)
        make_call(user.cellPhone, message)
        time.sleep(delay)
        make_call(user.homePhone, message)
        time.sleep(delay)

def loop_users(netIDs, message, delay, repeats):
    users = get_all_users()
    for i in range(repeats):
        page_all(users, message)
        time.sleep(delay)
        text_all(users, message)
        time.sleep(delay)
        call_all_users(users, message)
        time.sleep(delay)
        call_all_home(users, message)

@backend.route("/")
def test_test():
    resp = twilio.twiml.Response()
    resp.message("Hi, we got your response!")
    return str(resp)

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

def get_all_users():
    con = mysql.connect()
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

@backend.route("/sandbox")
def sandbox():
    print get_all_users()
    return ""

@backend.route("/test_send_call", strict_slashes=False)
def test_send_call():
    call = client.calls.create(to="+14806486560", from_=default_from_phone, body="One call has been made.", url=emergency_url)
    return "Call made!"

@backend.route("/test_reply_sms", methods=['GET', 'POST'], strict_slashes=False)
def test_reply_sms():
    resp = twilio.twiml.Response()
    resp.message("Failsafe has received your sms!")
    return str(resp)

@backend.route("/test_send_sms")
def test_send_sms():
    message = client.messages.create(to="+13175653154", from_="+14138533700", body="Hello world!")
    return "message sent!"

@backend.route("/test_group_calls", strict_slashes=False)
def test_group_calls():
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=emergency_url)
    return "Calls made to: " + str(numbers)

@backend.route('/test_custom_call/<custom_message>', strict_slashes=False)
def test_custom_call(custom_message = 'There is an emergency at the hospital.'):
    original_message = custom_message
    custom_message = str(urllib2.quote(custom_message)) + "&"
    print original_message
    print custom_message
    message = client.calls.create(to="+13175653154", from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)

@backend.route('/test_custom_group_call/<custom_message>', strict_slashes=False)
def test_custom_group_call(custom_message = 'There is an emergency at the hospital.'):
    original_message = custom_message
    custom_message = str(urllib2.quote(custom_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)

@backend.route("/test_custom_group_call", strict_slashes=False)
def test_custom_group_call_with_default():
    original_message = 'There is an emergency at the hospital.'
    custom_message = str(urllib2.quote(original_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)


if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=5001)
