import abc
import asyncio
import json
import logging
import random
import string
import time
from typing import Any, Callable

import deepgram
import simple_websocket

from . import config

logger = logging.getLogger(__name__)

deepgram_client = deepgram.Deepgram(
    {"api_key": config.DEEPGRAM_API_KEY, "api_url": "https://api.beta.deepgram.com/v1"}
)

DEFAULT_ERROR_MESSAGE = "I didn't quite catch that."


class Card(abc.ABC):
    def __init__(
        self,
        *,
        prompt: str,
        success: str = "Success!",
        options: deepgram.transcription.PrerecordedOptions,
        timeout: int,
    ) -> None:
        self.prompt = prompt
        self.success = success
        self.options = options
        self.timeout = timeout

    @abc.abstractmethod
    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> str | None:
        pass


class TrappedFamilyCard(Card):
    def __init__(self) -> None:
        self.letter = random.choice(string.ascii_uppercase)

        super().__init__(
            prompt=f'You are trapped with family over the holidays and they want to play a game. Try to say over 10 words that start with the letter "{self.letter}"',
            success="You're a walking dictionary!",
            options={},
            timeout=30,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> str | None:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR_MESSAGE

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR_MESSAGE

        words = set(word["word"].title() for word in alternatives[0]["words"])
        matching = [word for word in words if word.startswith(self.letter)]
        count = len(matching)
        if count <= 0:
            return "Uh oh! Your vocab might need a little work."
        if count <= 5:
            return f"Nice try! You got: {', '.join(matching)}"
        if count < 10:
            return f"So close! You got: {', '.join(matching)}"
        return None


class SpeedTalkingCard(Card):

    TWISTERS = [
        "she sells seashells by the seashore",
    ]

    def __init__(self) -> None:
        self.twister = random.choice(self.TWISTERS)

        super().__init__(
            prompt=f'You are home with another case of COVID and you discover a youtube video of the world\'s fastest talker. See if you can say this tongue twister before time is up: "{self.twister}"',
            success="Smooth talker!",
            options={"punctuate": False},
            timeout=10,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> str | None:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR_MESSAGE

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR_MESSAGE

        transcript = alternatives[0]["transcript"].lower()
        if self.twister not in transcript:
            return "Cat got your tongue?"
        return None


class YouTubeContentCreatorCard(Card):
    def __init__(self) -> None:

        super().__init__(
            prompt=f'You are a content creator and YouTube has cut their ad spend. Encourage your viewers to subscribe, smash that like button, click or hit the bell, etc.',
            options={},
            timeout=20,
            success='Hurray! You got new followers and can continue 2022.',
            failure='Your channel is now dead. You gotta follow directions - better luck next time!',
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
        keywords = ['like', 'subscribe', 'bell', 'smash', 'click', 'hit', 'sponsor', 'favor', 'algorithm', 'YouTube', 'content', 'video', 'videos', 'Patreon']
        count = sum(1 for word in words if word["word"].lower() in keywords)
        return count >= 5
        
        
class TwitterHardcoreCard(Card):
    def __init__(self) -> None:

        super().__init__(
            prompt=f'You survived the Twitter layoffs and were just informed that you now have to be "extremely hardcore" to keep your job. Affirm that you will be "extremely hardcore."',
            options={},
            timeout=20,
            success='Okay, I got it, you are extremely hard core. You can continue 2022.',
            failure='That wasn''t convincing. You need to be EXTREMELY HARDCORE! Better luck next time!',
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
        
        transcript = alternatives[0]['transcript']
        if 'extremely hardcore' in transcript:
            return True
        return False

CARDS: list[Callable[[], Card]] = [SpeedTalkingCard]
CARD_TIMEOUT = 300


def play(ws: simple_websocket.Server) -> None:
    logger.info("Starting game")
    cards = [c() for c in CARDS]
    random.shuffle(cards)

    score = 0
    while cards:
        card = cards.pop(0)
        logger.info("Selected card: %s", type(card).__name__)

        _send(ws, {"type": "new_card", "message": card.prompt})

        card_start = time.time()
        while (timeout := CARD_TIMEOUT - time.time() + card_start) > 0:
            data = _receive(ws, timeout)
            if isinstance(data, dict):
                if data.get("type") == "audio_start":
                    mimetype = data.get("mimetype")
                    break
        else:
            # Timed out
            break

        buffer = bytearray()
        audio_start = time.time()
        while (timeout := card.timeout - time.time() + audio_start) > 0:
            data = _receive(ws, timeout)
            if not isinstance(data, bytes):
                break
            buffer.extend(data)
        logger.info("Received %s bytes of audio", len(buffer))

        source = {"buffer": buffer, "mimetype": mimetype}
        response = asyncio.run(
            deepgram_client.transcription.prerecorded(source, card.options)
        )
        logger.info("Received Deepgram response: %s", response)

        error = card.validate_response(response)
        if error is not None:
            _send(ws, {"type": "failure", "message": error})
            break

        _send(ws, {"type": "success", "message": card.success})
        score += 1

    _send(ws, {"type": "game_over", "score": score})


def _send(ws: simple_websocket.Server, data: Any) -> None:
    logger.info("Sending message: %s", data)
    ws.send(json.dumps(data))


def _receive(
    ws: simple_websocket.Server, timeout: int | float | None
) -> bytes | dict | None:
    data = ws.receive(timeout)
    if data is None:
        return None
    if isinstance(data, str):
        data = json.loads(data)
        logger.info("Received message: %s", data)
        return data
    return data
