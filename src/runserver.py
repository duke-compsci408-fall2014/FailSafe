from flask import Flask, render_template, session, request
from directory_view.blueprint import directory, ensure_user_exists
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
    try:
        # return  str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
        session['user_netid'] = str(request.environ['REMOTE_USER'][:request.environ['REMOTE_USER'].index('@')])
        ensure_user_exists(session['user_netid'])
        return render_template('index.html')
    except Exception as a:
        return str(a)

app.secret_key = "!$REGG$#GBGGA#!REFGSDFFAFAGRTG%Y$T@#R!@T$%$^T$#!%@RFDSDSB"
if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5003)
