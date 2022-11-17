import abc
import asyncio
import json
import random
import string
import time

import deepgram
import simple_websocket

from . import config

deepgram_client = deepgram.Deepgram(config.DEEPGRAM_API_KEY)


class CardFailed(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__()
        self.reason = reason


class Card(abc.ABC):
    def __init__(
        self,
        *,
        prompt: str,
        failure: str,
        options: deepgram.transcription.PrerecordedOptions,
        timeout: int,
    ) -> None:
        self.prompt = prompt
        self.failure = failure
        self.options = options
        self.timeout = timeout

    @abc.abstractmethod
    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> bool:
        pass


class TrappedFamilyCard(Card):
    def __init__(self) -> None:
        self.letter = random.choice(string.ascii_uppercase)

        super().__init__(
            prompt=f'You are trapped with family over the holidays and they want to play a game. Try to say over 10 words that start with the letter "{self.letter}"',
            failure="Failed!",
            options={},
            timeout=20,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> bool:
        channels = response["results"]["channels"]
        if not channels:
            return False

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return False

        words = alternatives[0]["words"]
        count = sum(1 for word in words if word["word"].upper().startswith(self.letter))
        return count >= 10


CARDS: list[type[Card]] = []


def play(ws: simple_websocket.Server) -> None:
    cards = [c() for c in CARDS]
    random.shuffle(cards)

    score = 0
    while cards:
        card = cards.pop(0)

        ws.send(json.dumps({"type": "prompt", "message": card.prompt}))

        buffer = bytearray()
        start = time.time()
        while (timeout := card.timeout - time.time() + start) > 0:
            data = ws.receive(timeout)
            if not isinstance(data, bytes):
                break
            buffer.extend(data)

        source = {"buffer": buffer, "mimetype": "audio/x-wav"}
        response = asyncio.run(
            deepgram_client.transcription.prerecorded(source, card.options)
        )

        if not card.validate_response(response):
            ws.send(
                json.dumps({"type": "failure", "message": card.failure, "score": score})
            )
            return
        score += 1

    ws.send({"type": "success"})
