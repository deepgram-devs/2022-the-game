import flask
import os
from . import config

app = flask.Flask(__name__, static_folder="/build")


# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return flask.send_from_directory(app.static_folder, path)
    else:
        return flask.send_from_directory(app.static_folder, 'index.html')


app.run(host='0.0.0.0', port=8080, debug=True)
