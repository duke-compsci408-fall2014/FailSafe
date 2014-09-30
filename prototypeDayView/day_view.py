from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash
from contextlib import closing
	 
from flaskext.mysql import MySQL
app = Flask(__name__)
app.config.from_object(__name__)
	 
@app.route('/')
def day_view():
    return render_template('day_view.html')
	
'''    g.db.execute('insert into OnCall (startTime, endTime, faculty, fellow, rn1, rn2, tech1, tech2) values (?, ?, ?, ?, ?, ?, ?, ?)',
                 [request.form['start'], request.form['end'], request.form['faculty'], request.form['fellow'], 
				 request.form['rn1'], request.form['rn2'], request.form['tech1'], request.form['tech2']])
	cursor.execute("SELECT name from category")
    print dir(cursor)
    print dir(mysql.connect())
    data = cursor.fetchall()
    return_string = ""
    for i in data:
        return_string += "," + i[0]
    cursor.close()
    conn.commit()
    conn.close()
    if data is None:
		return "Username or Password is wrong"
    else:
        return return_string[1:]'''

if __name__ == '__main__':
	app.run()