PURPOSE

Dealing with a heart attack is a time-critical operation. No more than ninety minutes should pass between the
time an incident is reported and the time that the catheter operation is completed. 
The current alert system used by Duke Hospital is unreliable. 
Contact information and shift substitutions are recorded by pen and paper 
and are subject to being lost or becoming out of date. 
The pagers that the doctors use are similarly antiquated;
several minutes can pass between the time an operator sends a page and a doctor receives it. 
Sometimes, pages are missed entirely, and one or more members of the six-person team can miss the operation entirely.
This is unacceptable. 
Our application seeks to both centralize critical contact and scheduling information for the ICU 
and reduce the time taken to notify oncall medical teams of an emergency. 
This should allow emergency operations to start sooner and thus increase the probability of a patient’s survival.

DEPLOYMENT - INSTALL INSTRUCTIONS

Please see the TechnicalGuide (TechnicalGuide.pdf) for complete instructions.
Basic instructions are as follows:

1) Create a server running on Ubuntu 14
2) Install Flask.
3) Download the FailSafe source code from GitHub.
4) Add Apache/Mod WSGI to the server for compatibility.
5) Order an SSL certificate to confirm the security of your webpage.
6) Set up Duke Shibboleth for authorization/authentication.
7) Install MySQL for database management.
8) Set up databases for the calendar and directory portions of FailSafe.
9) Test everything!

VERSIONS OF UTILIZED SOFTWARE

Ubuntu 14.04.1
Python 2.7
Flask 0.10.1
JavaScript 1.8.5
jQuery 1.11.1
Twilio API version 2010-04-01
Moment.js 2.8.4
CSS3 & HTML5