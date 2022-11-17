import abc
import asyncio
import json
import logging
import random
import string
import time

import deepgram
import simple_websocket

from . import config

logger = logging.getLogger(__name__)

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
        success: str = "Success!",
        failure: str = "Failure!",
        options: deepgram.transcription.PrerecordedOptions,
        timeout: int,
    ) -> None:
        self.prompt = prompt
        self.success = success
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
        logger.info("Selected card: %s", type(card).__name__)

        ws.send(json.dumps({"type": "new_card", "message": card.prompt}))

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
        logger.info("Received Deepgram response: %s", response)

        if not card.validate_response(response):
            logger.info("Level failed.")
            ws.send(json.dumps({"type": "failure", "message": card.failure}))
            break

        logger.info("Level succeeded.")
        ws.send(json.dumps({"type": "success", "message": card.success}))
        score += 1

    ws.send(json.dumps({"type": "game_over", "score": score}))
