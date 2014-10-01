
import os
from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash


# create our little application :)
app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'failsafe.db'),
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='FailSafeAdmin',
    PASSWORD='Efasliaf'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/home')
@app.route('/calendar/day_view')
def day_view_calendar():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    cur = db.execute(
        """SELECT * FROM tblDayViewCalendar
            WHERE ShiftHour = STR_TO_DATE(?, '%Y,%m,%dT%h,%i,%s')""",
            [request.form['datevalue']]
    )
    entries = cur.fetchall()
    return render_template('day_view_calendar.html', entries=entries)

#Uploads all of the information for the month view html page
@app.route('/calendar/month_view')
def show_month_view_calendar():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    cur = db.execute(
        """SELECT * FROM tblMonthViewCalendar
            WHERE Day = STR_TO_DATE(?, '%Y,%m,%dT')""",
            [request.form['datevalue']]
    )
    entries = cur.fetchall()
    return render_template('month_view_calendar.html', entries=entries)

#Inserts a new contact into the user database
@app.route('/contacts/add_contact', methods=['POST'])
def add_user():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    db.execute(
        """INSERT INTO tblUser (Role, IsAdministrator, FirstName, LastName, CellPhone, HomePhone, PagerNumber)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
        [request.form['user_role'],
         request.form['user_admin_status'],
         request.form['user_first_name'],
         request.form['user_last_name'],
         request.form['user_cell_phone'],
         request.form['user_home_phone'],
         request.form['user_pager_num']
        ]
    )
    db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_users'))

#Retrives all contacts inside of the database
@app.route('/contacts')
def show_users():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    cur = db.execute(
        """SELECT FirstName, LastName, UserID FROM tblUser"""
    )
    entries = cur.fetchall()
    return render_template('contacts.html', entries=entries)

#Routes to the login page for OIT
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)

#Routes to a logout page message and sends you back to login page
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('login.html'))


"""Database Setup/Shutdown"""

#Connecting to the database
def connect_db():
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

#Initializing the database
def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

#Create the database tables
@app.cli.command('initdb')
def initdb_command():
    init_db()
    print('Initialized the database.')

#Create database connection if there isn't any
def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

#Close the database
@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

#Runs the webpage
if __name__ == '__main__':
  app.run()
