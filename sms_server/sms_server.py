from flask import Flask, request, redirect, url_for
import twilio.twiml, random
from twilio.rest import TwilioRestClient
import datetime
from httplib2 import Http
from urllib import urlencode
import requests

# Find these values at https://twilio.com/user/account
account_sid = "AC8ec001dd37e80c10a9bf5e47794b6501"
auth_token = "b0a47efa254507764caa06b8949c788b"
client = TwilioRestClient(account_sid, auth_token)
app = Flask(__name__)

# Try adding your own number to this list!
callers = {}
callers_on = {}
callers_last = {}
@app.route("/1")
def test_test():
    return "hello world"

@app.route("/test_send_sms")
def test_send_sms():
    message = client.messages.create(to="+13175653154", from_="+14138533700", body="Hello world!")
    return "message sent!"

@app.route("/test_reply_sms", methods=['GET', 'POST'])
def test_reply_sms():
    resp = twilio.twiml.Response()
    resp.message("Failsafe has received your sms!")
    return str(resp)

@app.route("/test_group_sms")
def test_group_sms():
    numbers = ['+19197978781', '+18473469673', '+13175653154']
    for i in numbers:
        message = client.messages.create(to=i, from_="+14138533700", body="JEFF IS AWESOME!")
    return "messages sent to " + str(numbers)

@app.route("/test_custom_group_sms/<custom_message>")
def test_custom_group_sms(custom_message = "Failsafe is awesome!"):
    numbers = ['+19197978781', '+18473469673', '+13175653154']
    for i in numbers:
        message = client.messages.create(to=i, from_="+14138533700", body=custom_message)
    return "message \"" + custom_message + "\"  sent to " + str(numbers)

@app.route("/test_send_template_sms", methods=['GET', 'POST'])
def test_send_template_sms():
    print "+----------+"
    custom_message = "[%s] ETA: %dmin\nLOCATION: %s\nTYPE: %s\nMESSAGE: %s" % (str(datetime.datetime.now())[:19], int(request.form.get('eta')), request.form.get('location'), request.form.get('type'), request.form.get('msg'))
    message = client.messages.create(to="+13175653154", from_="+14138533700", body=custom_message)
    return "message sent: " + custom_message

@app.route("/test_prep_template_sms")
def test_prep_template_sms():
    data = {'eta': 5, 'location': "David's room", 'type': "PARTY!!", "msg": "TIME TO GET DIS PARTY STARTEDDDDDD!!!!"}
    print "------------"
    r = requests.post("http://colab-sbx-131.oit.duke.edu:5001/test_send_template_sms", params=data)
    return "yay"

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5001)
