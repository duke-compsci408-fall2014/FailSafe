from flask import Flask, render_template
from mods.directory.blueprint import directory
from mods.calendar.blueprint import calendar
import mods.backend.blueprint as backend_blueprint
import config

app = config.app

app.register_blueprint(directory, url_prefix='/directory')
app.register_blueprint(calendar, url_prefix='/calendar')
app.register_blueprint(backend_blueprint.backend, url_prefix='/backend')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
