from flask import Flask, request, redirect, url_for
import twilio.twiml, random
from twilio.rest import TwilioRestClient
import urllib2, datetime
from httplib2 import Http
from urllib import urlencode
import requests
import time
# Find these values at https://twilio.com/user/account
account_sid = "AC8ec001dd37e80c10a9bf5e47794b6501"
auth_token = "b0a47efa254507764caa06b8949c788b"
client = TwilioRestClient(account_sid, auth_token)
app = Flask(__name__)

# Try adding your own number to this list!
callers = {}
callers_on = {}
callers_last = {}

numbers = ['+19197978781', '+18473469673', '+13175653154', '+14806486560']
mynumber = ['+14806486560']
others_numbers = ['+19197978781', '+18473469673', '+13175653154']
default_from_phone = '+14138533700'

emergency_url = 'http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately%20and%20let%20the%20operator%20know%20that%20you%20are%20on%20your%20way.&'
twimlet_default = 'http://twimlets.com/message?Message%5B0%5D='

def send_sms(receiving_number, message):
    message = client.messages.create(to=receiving_number, from_=default_from_phone, body=message)
    print "sent message"

def send_smss(receiving_numbers, message):
    for i in receiving_numbers:
        send_sms(i, message)

def make_call(receiving_number, message):
    message = str(urllib2.quote(message)) + "&"
    message = client.calls.create(to=receiving_number, from_=default_from_phone, url=twimlet_default+message)
    print "made call"

def make_calls(receiving_numbers, message):
    for i in receiving_numbers:
        make_call(i, message)

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

@app.route("/")
def test_test():
    return "hello world"

@app.route("/sandbox")
def sandbox():
    loop_all(others_numbers, "This is a loop. Loops are cool.", 30, 3)
    return ""

@app.route("/test_send_call", strict_slashes=False)
def test_send_call():
    call = client.calls.create(to="+13175653154", from_=default_from_phone, body="One call has been made.", url=emergency_url)
    return "Call made!"

@app.route("/test_reply_sms", methods=['GET', 'POST'], strict_slashes=False)
def test_reply_sms():
    resp = twilio.twiml.Response()
    resp.message("Failsafe has received your sms!")
    return str(resp)

@app.route("/test_send_sms")
def test_send_sms():
    message = client.messages.create(to="+13175653154", from_="+14138533700", body="Hello world!")
    return "message sent!"

@app.route("/test_group_calls", strict_slashes=False)
def test_group_calls():
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=emergency_url)
    return "Calls made to: " + str(numbers)

@app.route('/test_custom_call/<custom_message>', strict_slashes=False)
def test_custom_call(custom_message = 'There is an emergency at the hospital.'):
    original_message = custom_message
    custom_message = str(urllib2.quote(custom_message)) + "&"
    print original_message
    print custom_message
    message = client.calls.create(to="+13175653154", from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)

@app.route('/test_custom_group_call/<custom_message>', strict_slashes=False)
def test_custom_group_call(custom_message = 'There is an emergency at the hospital.'):
    original_message = custom_message
    custom_message = str(urllib2.quote(custom_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)

@app.route("/test_custom_group_call", strict_slashes=False)
def test_custom_group_call_with_default():
    original_message = 'There is an emergency at the hospital.'
    custom_message = str(urllib2.quote(original_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)


if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=5001)
