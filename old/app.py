import json
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def menu():
    return render_template('index.html')

@app.route('/about')
def serial_management():
    return render_template('about.html')

@app.route('/item_management')
def item_management():
    return render_template('item_management.html')

@app.route('/user_management')
def user_management():
    return render_template('user_management.html')

if __name__ == '__main__':
    app.debug = True
    app.run()