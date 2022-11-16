import os


def _get_string(name: str) -> str:
    value = os.getenv(name)
    if value is None:
        raise ValueError(f"Configuration option {name} is required")
    return value


DEEPGRAM_API_KEY = _get_string("DEEPGRAM_API_KEY")
POSTGRES_USER = _get_string("POSTGRES_USER")
POSTGRES_PASSWORD = _get_string("POSTGRES_PASSWORD")
