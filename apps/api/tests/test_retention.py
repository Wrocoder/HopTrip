from datetime import UTC, datetime, timedelta

from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.services.retention import apply_retention
from helpers import approved_program, catalog_fixture


def test_retention_removes_old_events_and_preserves_attribution_keys(isolated_db):
    program = approved_program(isolated_db)
    deal, _ = catalog_fixture(isolated_db, program=program)
    now = datetime.now(UTC)
    old = now - timedelta(days=91)
    isolated_db.add_all(
        [
            AnalyticsEvent(
                event_name="PAGE_VIEW", anonymous_session_id="old-session", created_at=old
            ),
            AnalyticsEvent(
                event_name="PAGE_VIEW", anonymous_session_id="current-session", created_at=now
            ),
        ]
    )
    click = AffiliateClick(
        deal_id=deal.id,
        component_type="FLIGHT",
        anonymous_session_id="old-session",
        status="REDIRECTED",
        provider_id=program.provider_id,
        program_id=program.id,
        created_at=old,
        source="old-source",
        tracking_id="ht-retained-key",
    )
    isolated_db.add(click)
    isolated_db.commit()
    click_id = click.id
    apply_retention(isolated_db, now)
    assert isolated_db.query(AnalyticsEvent).one().anonymous_session_id == "current-session"
    isolated_db.refresh(click)
    assert click.id == click_id and click.tracking_id == "ht-retained-key"
    assert click.anonymous_session_id == "retention-expired" and click.source is None
