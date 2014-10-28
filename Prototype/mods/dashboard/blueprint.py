from flask import Flask, Blueprint, render_template, request, Response, jsonify, session

dashboard = Blueprint('dashboard',__name__, template_folder='templates', static_folder='static')

@dashboard.route('/', methods=['GET', 'POST'])
def show_dashboard():
    return render_template('dashboard.html')
