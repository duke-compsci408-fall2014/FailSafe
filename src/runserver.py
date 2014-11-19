from flask import Flask, render_template, session
from directory_view.blueprint import directory
from calendar_view.blueprint import calendar
from dashboard_view.blueprint import dashboard
import backend.blueprint as backend_blueprint
from config import dir_app as app
app.register_blueprint(directory, url_prefix='/directory')
app.register_blueprint(calendar, url_prefix='/calendar')
app.register_blueprint(dashboard, url_prefix='/dashboard')
app.register_blueprint(backend_blueprint.backend, url_prefix='/backend')

@app.route('/')
def index():
    session['user_netid'] = str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
    return render_template('index.html')

if __name__ == '__main__':
    app.debug = True
    app.secret_key = "!$REGG$#GBGGA#!REFGSDFFAFAGRTG%Y$T@#R!@T$%$^T$#!%@RFDSDSB"
    app.run(host='0.0.0.0', port=5001)
