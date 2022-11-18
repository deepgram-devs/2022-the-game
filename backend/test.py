import json
import mimetypes
import sys

import simple_websocket


def main(path: str) -> None:
    audio = open(path, "rb").read()
    mimetype = mimetypes.guess_type(path)[0]

    ws = simple_websocket.Client("ws://localhost:8080/play")
    while True:
        data = json.loads(ws.receive())
        print(f"Got message: {data}")
        if data["type"] == "new_card":
            ws.send(json.dumps({"type": "audio_start", "mimetype": mimetype}))
            ws.send(audio)
            ws.send(json.dumps({"type": "audio_stop"}))
        elif data["type"] == "success":
            pass
        elif data["type"] == "failure":
            pass
        elif data["type"] == "game_over":
            pass


if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except simple_websocket.ConnectionClosed:
        print("Closed.")
