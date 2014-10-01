from flask import Flask, request, redirect
import twilio.twiml, random
from twilio.rest import TwilioRestClient

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

@app.route("/")
def test_test():
    return "hello world"

@app.route("/test_send_call")
def test_send_call():
    call = client.calls.create(to="+14806486560", from_="+14138533700", body="One call has been made.", url="http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately.&")
    return "Call made!"

@app.route("/test_reply_sms", methods=['GET', 'POST'])
def test_reply_sms():
    resp = twilio.twiml.Response()
    resp.message("Failsafe has received your sms!")
    return str(resp)

@app.route("/test_group_calls")
def test_group_calls():
    for i in numbers:
        message = client.calls.create(to=i, from_="+14138533700", body="Calls have been made to the team.", url="http://twimlets.com/message?Message%5B0%5D=There%20is%20an%20emergency%20at%20the%20hospital.%20Please%20go%20there%20immediately.&")
    return "Calls made to: " + str(numbers)

@app.route("/test_custom_group_sms/<custom_message>")
def test_custom_group_sms(custom_message = "Failsafe is awesome!"):
    for i in numbers:
        message = client.messages.create(to=i, from_="+14138533700", body=custom_message)
    return "message \"" + custom_message + "\"  sent to " + str(numbers)

if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=5002)
