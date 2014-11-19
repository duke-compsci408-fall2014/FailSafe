from twilio.rest import TwilioRestClient
import urllib, urllib2
# Find these values at https://twilio.com/user/account
account_sid = "AC8ec001dd37e80c10a9bf5e47794b6501"
auth_token = "b0a47efa254507764caa06b8949c788b"
client = TwilioRestClient(account_sid, auth_token)
default_from_phone = '+14138533700'

#normal beginning string for message generation
twimlet_default = 'http://twimlets.com/message?Message%5B0%5D='

"""
    TODO: Set up paging system
"""

### SMS Functionality ##################################

def send_sms(receiving_number, message):
    try:
        client.messages.create(to=receiving_number, from_=default_from_phone, body=message)
    except:
        pass

def send_sms_user(user, message):
    send_sms(user.cellPhone, message)

def send_group_sms(receiving_numbers, message):
    for i in receiving_numbers:
        send_sms(i, message)

def send_group_sms_users(users, message):
    for user in users:
        send_sms_user(user, message)

### Call Functionality #################################

def make_call(receiving_number, message):
    try:
        message = str(urllib2.quote(message)) + "&"
        client.calls.create(to=receiving_number, from_=default_from_phone, url=twimlet_default+message)
    except:
        pass

def make_multiple_calls(receiving_numbers, message):
    for i in receiving_numbers:
        make_call(i, message)

def make_multiple_calls_home(users, message):
    for user in users:
        make_call(users[user].homePhone, message)

def make_multiple_calls_cell(users, message):
    for user in users:
        make_call(users[user].cellPhone, message)

### Paging Functionality ###############################

def send_page(number, message):
    data = {}
    data['PIN'] = number
    data['MSSG'] = message
    data['currentLength'] = len(message)
    encoded_data = urllib.urlencode(data)
    urllib2.urlopen("http://www.usamobility.net/cgi-bin/wwwpage.cgi", encoded_data)

def send_multiple_pages(receiving_numbers, message):
    for i in receiving_numbers:
        send_page(i, message)
