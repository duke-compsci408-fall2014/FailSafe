from flask import Flask, render_template
from mods.directory.blueprint import directory
from mods.calendar.blueprint import calendar
from mods.dashboard.blueprint import dashboard
import mods.backend.blueprint as backend_blueprint
from config import dir_app as app

app.register_blueprint(directory, url_prefix='/directory')
app.register_blueprint(calendar, url_prefix='/calendar')
app.register_blueprint(dashboard, url_prefix='/dashboard')
app.register_blueprint(backend_blueprint.backend, url_prefix='/backend')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.debug = True
    app.secret_key = "!$REGG$#GBGGA#!REFGSDFFAFAGRTG%Y$T@#R!@T$%$^T$#!%@RFDSDSB"
    app.run(host='0.0.0.0', port=7000)
