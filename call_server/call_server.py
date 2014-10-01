from flask import Flask, request, redirect
import twilio.twiml, random
from twilio.rest import TwilioRestClient
import urllib2

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
default_from_phone = '+14138533700'
emergency_url = 'http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately%20and%20let%20the%20operator%20know%20that%20you%20are%20on%20your%20way.&'
twimlet_default = 'http://twimlets.com/message?Message%5B0%5D='

@app.route("/")
def test_test():
    return "hello world"

@app.route("/test_send_call")
def test_send_call():
    call = client.calls.create(to="+14806486560", from_=default_from_phone, body="One call has been made.", url=emergency_url)
    return "Call made!"

@app.route("/test_reply_sms", methods=['GET', 'POST'])
def test_reply_sms():
    resp = twilio.twiml.Response()
    resp.message("Failsafe has received your sms!")
    return str(resp)

@app.route("/test_group_calls")
def test_group_calls():
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=emergency_url)
    return "Calls made to: " + str(numbers)

@app.route('/test_custom_group_call/<custom_message>')
def test_custom_group_call(custom_message = 'There is an emergency at the hospital.'):
    original_message = custom_message
    custom_message = str(urllib2.quote(custom_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)

@app.route("/test_custom_group_call")
def test_custom_group_call_with_default():
    original_message = 'There is an emergency at the hospital.'
    custom_message = str(urllib2.quote(original_message)) + "&"
    for i in numbers:
        message = client.calls.create(to=i, from_=default_from_phone, body="Calls have been made to the team.", url=twimlet_default+custom_message)
    return "Call with message: \"" + original_message + "\"  sent to " + str(numbers)


if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=5002)
