import flask
import flask_sock
import os
from . import config

app = flask.Flask(__name__, static_folder="/build")
sock = flask_sock.Sock(app)


# Serve react app
@app.route("/")
def serve_root():
    return flask.redirect(flask.url_for("serve_app"))


@app.route('/app', defaults={'path': ''})
@app.route('/app/<path:path>')
def serve_app(path: str) -> flask.Response:
    if path == "":
        return flask.send_from_directory(app.static_folder, "index.html")
    elif os.path.exists(os.path.join(app.static_folder, path)):
        return flask.send_from_directory(app.static_folder, path)
    return flask.Response("Not found", 404)


# WebSocket endpoint
@sock.route("/play")
def play(ws):
    pass


app.run(host='0.0.0.0', port=config.APP_PORT, debug=config.APP_DEBUG)
