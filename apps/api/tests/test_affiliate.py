import pytest
from app.affiliate_adapters.stored import LinkUnavailable, build_deep_link
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from helpers import approved_program, catalog_fixture
from sqlalchemy import select


def test_unconfigured_link_cannot_create_successful_click(isolated_db, api_client):
    catalog_fixture(isolated_db)
    assert api_client.get("/go/fixture-deal/flight").status_code == 503
    assert isolated_db.scalar(select(AffiliateClick)) is None


def test_approved_program_tracks_session_and_provider(isolated_db, api_client):
    program = approved_program(isolated_db)
    catalog_fixture(isolated_db, program=program)
    response = api_client.get("/go/fixture-deal/flight?session_id=tracking-session")
    assert response.status_code == 307
    click = isolated_db.scalar(select(AffiliateClick))
    assert click.program_id == program.id and click.provider_id == program.provider_id
    assert click.anonymous_session_id == "tracking-session"
    assert (
        response.headers["location"]
        == "https://partner.example/book?foo=bar&sub_id=" + click.tracking_id
    )
    event = isolated_db.scalar(select(AnalyticsEvent))
    assert event.anonymous_session_id == click.anonymous_session_id
    assert (
        response.headers["cache-control"] == "no-store, no-store"
        or "no-store" in response.headers["cache-control"]
    )


@pytest.mark.parametrize("state", ["SUSPENDED", "REJECTED", "DISABLED"])
def test_program_revocation_is_immediate(isolated_db, api_client, state):
    program = approved_program(isolated_db)
    catalog_fixture(isolated_db, program=program)
    assert api_client.get("/api/v1/deals/fixture-deal").json()["components"][0]["available"]
    program.onboarding_status = state
    isolated_db.commit()
    assert not api_client.get("/api/v1/deals/fixture-deal").json()["components"][0]["available"]
    assert api_client.get("/go/fixture-deal/flight").status_code == 503


@pytest.mark.parametrize(
    "url",
    [
        "http://partner.example/x",
        "https://partner.example.evil/x",
        "https://user@partner.example/x",
        "https://partner.example:444/x",
        "//partner.example/x",
        "https://partner.example/\nsecret",
        "https://partner.example\\@evil/x",
        "https://[broken",
    ],
)
def test_unsafe_partner_links_are_rejected(url):
    with pytest.raises(LinkUnavailable):
        build_deep_link(
            url, allowed_hosts=["partner.example"], tracking_param="sub_id", tracking_id="ht-random"
        )


def test_tracking_contract_rejects_invalid_parameter():
    with pytest.raises(LinkUnavailable):
        build_deep_link(
            "https://partner.example",
            allowed_hosts=["partner.example"],
            tracking_param="bad&param",
            tracking_id="id",
        )
