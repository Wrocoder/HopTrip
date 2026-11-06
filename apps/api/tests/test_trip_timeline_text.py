import pytest
from app.services.trip_timeline import trip_timeline
from app.services.trip_timeline_text import COPY, timeline_text
from test_trip_timeline import facts


@pytest.mark.parametrize("locale", ["pl", "en", "ru", "uk"])
def test_notification_formatter_uses_same_timeline_and_actual_airport(locale):
    value = facts(return_destination_airport="KRK", return_arrival_calculated=True)
    value.timeline = trip_timeline(value)
    text = timeline_text(value, locale)
    assert f"{COPY[locale][0]}: 1" in text
    assert "KRK: 2030-05-06" in text and "+1" in text
    assert COPY[locale][4] in text
    value.timeline.local_return_arrival_date = None
    value.timeline.nights_at_destination = None
    text = timeline_text(value, locale)
    assert COPY[locale][1] in text and COPY[locale][3] in text
    assert "2030-05-06" not in text
