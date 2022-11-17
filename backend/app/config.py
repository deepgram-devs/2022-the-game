import os


def _get_bool(name: str, *, default: bool | None = None) -> bool:
    value = os.getenv(name)
    if value is not None:
        value = value.lower()
        if value == "false":
            return False
        elif value == "true":
            return True
        else:
            raise ValueError(f"Configuration option {name} must be a boolean")
    if default is not None:
        return default
    raise ValueError(f"Configuration option {name} is required")


def _get_int(name: str, *, default: int | None = None) -> int:
    value = os.getenv(name)
    if value is not None:
        try:
            return int(value)
        except ValueError:
            raise ValueError(f"Configuration option {name} must be an integer")
    if default is not None:
        return default
    raise ValueError(f"Configuration option {name} is required")


def _get_string(name: str, *, default: str | None = None) -> str:
    value = os.getenv(name)
    if value is not None:
        return value
    if default is not None:
        return default
    raise ValueError(f"Configuration option {name} is required")


APP_DEBUG = _get_bool("APP_DEBUG", default=False)
APP_PORT = _get_int("APP_PORT", default=8080)
DEEPGRAM_API_KEY = _get_string("DEEPGRAM_API_KEY")
