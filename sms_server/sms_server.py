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

@app.route("/", methods=['GET', 'POST'])
def hello_monkey():
    """Respond and greet the caller by name."""
    print("PT A")
    from_number = request.values.get('From', None)
    message = str(request.values.get('Body', None)).lower()
    print(message)
    print(request.values)
    if message[:3] == "add" or message[:3] == "set":
        print("1")
        if from_number not in callers:
            callers[from_number] = {}
        card = message[3:]
        card_info = card.split(":")
        callers[from_number][card_info[0]] = card_info[1]

        message = "Added! Front:" + str(card_info[0]) + "\nBack: " +  str(callers[from_number][card_info[0]])
    elif message[:4] == "stahp":
        message = "Stopping."
        callers_on[from_number] = -1
    elif message[:5] == "clear":
        callers[from_number]={}
        message = "Cleared!"
    elif message[:4] == "quiz" or message[:4] == "test" or callers_on[from_number]>-1:
        if from_number in callers_on and callers_on[from_number] == 1:
           if callers_last[from_number] == message:
               message = "CORRECT! "
           else:
               message = "INCORRECT! Back: " + str(callers_last[from_number]) + " "
        else:
            message = ""
        callers_on[from_number] = 1
        num_of_cards = len(callers[from_number].keys())
        print(num_of_cards)
        print(callers[from_number].keys())
        card=[0,0]
        index = random.randint(0,num_of_cards-1)
        card[1] = callers[from_number][callers[from_number].keys()[index]]
        card[0] = callers[from_number].keys()[index]
        print(card)
        message += "Front: " + str(card[0])
        print(message)
        callers_last[from_number] = card[1]

    message = client.messages.create(to=from_number, from_="+14138533700",
                                     body=message)
    return str(resp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
