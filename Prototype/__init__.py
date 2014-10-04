from flask import Flask
from directory import directory_blueprint
from calendar import calendar_blueprint

app = Flask(__name__)
   
app.register_blueprint(directory_blueprint, url_prefix='/directory')
app.register_blueprint(calendar_blueprint, url_prefix='/calendar')

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=8000)