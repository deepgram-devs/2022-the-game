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

DEFAULT_ERROR = {"type": "failure", "message": "I didn't quite catch that."}


class Card(abc.ABC):
    def __init__(
        self,
        *,
        prompt: str,
        options: deepgram.transcription.PrerecordedOptions,
        timeout: int,
    ) -> None:
        self.prompt = prompt
        self.options = options
        self.timeout = timeout

    @abc.abstractmethod
    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        pass


class HelloInForeignLanguageCard(Card):

    OPTIONS = [
        ("Mandarin", "China", "zh-CN", "nǐ hǎo"),
        ("Spanish", "Spain", "es", "hola"),
        ("French", "France", "fr", "bonjour"),
    ]

    def __init__(self) -> None:
        self.language, self.country, self.model, self.word = random.choice(self.OPTIONS)

        super().__init__(
            prompt=f"You were born in California but you've been invited to compete for {self.country} in the Beijing Winter Olympics. Say hello in {self.language} ({self.word}).",
            options={"punctuate": False, "language": self.model},
            timeout=30,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR

        transcript = alternatives[0]["transcript"].lower()
        if self.word not in transcript:
            return {
                "type": "failure",
                "message": f"Ouch! Your {self.language} needs a bit of work.",
            }

        return {"type": "success", "message": "You're a multilingual wizard!"}


class TrappedFamilyCard(Card):
    def __init__(self) -> None:
        self.letter = random.choice(string.ascii_uppercase)

        super().__init__(
            prompt=f'You are trapped with family over the holidays and they want to play a game. Try to say over 10 words that start with the letter "{self.letter}"',
            options={"punctuate": False},
            timeout=30,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR

        words = set(word["word"].title() for word in alternatives[0]["words"])
        matching = [word for word in words if word.startswith(self.letter)]
        count = len(matching)
        if count <= 0:
            return {
                "type": "failure",
                "message": "Uh oh! Your vocab might need a little work.",
            }
        if count <= 5:
            return {
                "type": "failure",
                "message": f"Nice try! You got: {', '.join(matching)}",
            }
        if count < 10:
            return {
                "type": "failure",
                "message": f"So close! You got: {', '.join(matching)}",
            }
        return {"type": "success", "message": "You're a walking dictionary!"}


class SpeedTalkingCard(Card):

    TWISTERS = [
        "she sells seashells by the seashore",
        "peter piper picked a peck of pickled peppers",
        "how much wood would a woodchuck chuck if a woodchuck could chuck wood",
    ]

    def __init__(self) -> None:
        self.twister = random.choice(self.TWISTERS)

        super().__init__(
            prompt=f'You are home with another case of COVID and you discover a youtube video of the world\'s fastest talker. See if you can say this tongue twister before time is up: "{self.twister}"',
            options={"punctuate": False},
            timeout=5,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR

        transcript_words = set(
            word["word"].lower() for word in alternatives[0]["words"]
        )
        twister_words = set(self.twister.split())
        intersection = twister_words.intersection(transcript_words)

        if len(intersection) < len(twister_words) / 2:
            return {"type": "failure", "message": "Cat got your tongue?"}
        return {"type": "success", "message": "Smooth talker!"}


class YouTubeContentCreatorCard(Card):
    def __init__(self) -> None:
        super().__init__(
            prompt="You are a content creator and YouTube has cut their ad spend. Encourage your viewers to subscribe, smash that like button, click or hit the bell, etc.",
            options={"punctuate": False},
            timeout=20,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR

        words = alternatives[0]["words"]
        keywords = [
            "like",
            "subscribe",
            "bell",
            "smash",
            "click",
            "hit",
            "sponsor",
            "favor",
            "algorithm",
            "youtube",
            "content",
            "video",
            "videos",
            "patreon",
        ]
        count = sum(1 for word in words if word["word"].lower() in keywords)

        if count < 5:
            return {
                "type": "failure",
                "message": "Your channel is now dead. You gotta follow directions - better luck next time!",
            }

        return {
            "type": "success",
            "message": "Hurray! You got new followers and can continue 2022.",
        }


class TwitterHardcoreCard(Card):
    def __init__(self) -> None:
        super().__init__(
            prompt='You survived the Twitter layoffs and were just informed that you now have to be "extremely hardcore" to keep your job. Affirm that you will be "extremely hardcore."',
            options={"punctuate": False},
            timeout=20,
        )

    def validate_response(
        self, response: deepgram.transcription.PrerecordedTranscriptionResponse
    ) -> dict:
        channels = response["results"]["channels"]
        if not channels:
            return DEFAULT_ERROR

        alternatives = channels[0]["alternatives"]
        if not alternatives:
            return DEFAULT_ERROR

        transcript = alternatives[0]["transcript"].lower()
        if "extremely hardcore" not in transcript:
            return {
                "type": "failure",
                "message": "That wasn't convincing. You need to be EXTREMELY HARDCORE! Better luck next time!",
            }

        return {
            "type": "success",
            "message": "Okay, I got it, you are extremely hard core. You can continue 2022.",
        }


class TwitterMoneyCard(Card):
    def __init__(self) -> None:

        super().__init__(
            prompt=f'You want to become verified on Twitter. Tell me who you are, and pay me $20 dollars. Too much? Fine. $8.',
            options={'detect_entities': True},
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
        
        
        transcript = alternatives[0]['transcript']
        if transcript == '':
            return {
                "type": "success",
                "message": "You said nothing and I don't know who you are. But maybe that's the whole point? You can continue 2022.",
            }
        
        if 'entities' in alternatives[0].keys():
            entities = alternatives[0]['entities']
            if len(entities) > 1:
                return {
                    "type": "success",
                    "message": "At first I heard you say you are {}, but then I thought I heard something else. Anyways, you can continue 2022.".format(entities[0]['value']),
                }
            elif len(entities) == 1:
                return {
                    "type": "success",
                    "message": "So you are {}. Yes, I totally believe you. You can continue 2022.".format(entities[0]['value']),
                }
            else:
                return {
                    "type": "success",
                    "message": "You said something but told me nothing about who you are. But maybe that's the whole point? You can continue 2022.",
                }

CARDS: list[Callable[[], Card]] = [HelloInForeignLanguageCard]
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

        response = card.validate_response(response)
        _send(ws, response)
        if response["type"] == "failure":
            break

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
