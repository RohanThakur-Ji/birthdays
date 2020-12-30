import os
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

BIRTHDAYS = dict()
date = []

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        name = request.form.get("name")
        month = request.form.get("month")
        day = request.form.get("day")
        date = [month, day]
        
        print(name, date)

        return redirect("/")
    else:
        # TODO
        return render_template("index.html", birthdays=BIRTHDAYS)
    
    

