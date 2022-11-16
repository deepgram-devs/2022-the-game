from flask import Flask
from . import config

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


app.run(host='0.0.0.0', port=8080, debug=True)
