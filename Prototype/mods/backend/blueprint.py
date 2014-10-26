from flask import Flask, redirect, url_for, Blueprint, render_template, request, Response, jsonify, session, escape
from config import dir_mysql, cal_mysql
import twilio.twiml, random
from twilio.rest import TwilioRestClient
import urllib2, datetime
from httplib2 import Http
from urllib import urlencode
import requests
import future
import time
from datetime import datetime
from fs_twilio.config import *
from mods.directory.blueprint import get_all_staff, User, reverse_lookup
backend = Blueprint('backend', __name__, template_folder='templates', static_folder='static')

# Try adding your own number to this list!
callers = {}
callers_on = {}
callers_last = {}
mynumber = ['+14806486560']
numbers = ['+19197978781', '+18473469673', '+13175653154', '+14806486560']
david_test_numbers = ['+14806486560', '+19037764658']
default_from_phone = '+14138533700'
loop_breaker_dictionary = {}

for x in mynumber:
    loop_breaker_dictionary[x] = False

#default emergency url sent to the individual callers
emergency_url = 'http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately%20and%20let%20the%20operator%20know%20that%20you%20are%20on%20your%20way.&'
#normal beginning string for message generation
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

@backend.route("/response", methods=['GET', 'POST'])
def sms_response():
    print "sms started"
    from_number = request.values.get('From', None)
    if from_number in numbers:
        loop_breaker_dictionary[from_number]=True
    message = str(request.values.get('Body', None)).lower()
    sender = reverse_lookup(from_number)
    if sender == None:
        message = client.messages.create(to=from_number, from_=default_from_phone, body="Thanks for the message, anon.")
    else:
        message = client.messages.create(to=from_number, from_=default_from_phone, body="Thanks for the message, bro. Your netID is " + sender.netID + ".")

    return "done"

@backend.route("/")
def index():
    if 'user_netid' not in session:
        return "Hello, Anon. ;)"
    return "Hello, {}".format(escape(session['user_netid']))

@backend.route("/user/<user_netid>")
def switch_user(user_netid=""):
    session['user_netid'] = user_netid
    return "User {} logged in.".format(user_netid)

def loop_user(netID, message, delay, repeats):
    user = get_all_staff()[netID]
    if loop_breaker_dictionary[user.cellPhone] != True:
        for i in range(repeats):
            #send_sms(user.pagerNumber, message)
            #time.sleep(delay)
            send_sms(user.cellPhone, message)
            time.sleep(delay)
            make_call(user.cellPhone, message)
            time.sleep(delay)
            #make_call(user.homePhone, message)
            #time.sleep(delay)

def loop_users(netIDs, message, delay, repeats):
    users = get_all_staff()
    for i in range(repeats):
        page_all(users, message)
        time.sleep(delay)
        text_all(users, message)
        time.sleep(delay)
        call_all_users(users, message)
        time.sleep(delay)
        call_all_home(users, message)

@backend.route("/sandbox")
def sandbox():
    loop_user('dpc22', 'Hospital has a big emergency', 30, 5)
    return ""

@backend.route("/on_call", methods=['POST'])
def alert_oncall():
    #send_sms("+18473469673", format_message(request.json))
    send_sms("+13175653154", format_message(request.json))
    return ""

def format_message(message_json):
    message = "[{}] ETA: {}, TYPE: {}, LOCATION: {}, MSG: {}".format(str(datetime.now())[:-7], message_json['eta'], message_json['type'], message_json['location'], message_json['msg'])
    return message
