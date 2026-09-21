from datetime import UTC, datetime


def utc(value: datetime) -> datetime:
    """SQLite drops timezone info; database timestamp columns represent UTC."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)
