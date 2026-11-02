import re
from datetime import UTC, datetime


def offset_datetime(value: object) -> datetime | None:
    """A calendar timestamp with an explicit offset; retain that source offset.

    Reject normalized invalid offsets and instants outside Python's UTC range.
    Date-only values and SQLite's naive database timestamps are separate contracts.
    """
    if not isinstance(value, str) or not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?"
        r"(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)", value
    ):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        parsed.astimezone(UTC)  # Validate representability without losing the source offset.
        return parsed
    except (ValueError, OverflowError):
        return None


def utc(value: datetime) -> datetime:
    """SQLite drops timezone info; database timestamp columns represent UTC."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)
