from app.models.affiliate import AffiliateProvider
from app.services.catalog import serialize_deal
from helpers import approved_program, catalog_fixture


def test_partner_label_and_inactive_program_have_no_redirect(isolated_db):
    program = approved_program(isolated_db)
    program.name = "Aviasales"
    deal, component = catalog_fixture(isolated_db, program=program)
    result = serialize_deal(isolated_db, deal).components[0]
    assert result.partner_name == "Aviasales"
    assert result.available and result.redirect_path
    program.is_active = False
    isolated_db.commit()
    result = serialize_deal(isolated_db, deal).components[0]
    assert not result.available and result.redirect_path is None
    assert result.reason == "PROGRAM_UNAVAILABLE"
    program.is_active = True
    isolated_db.get(AffiliateProvider, program.provider_id).onboarding_status = "UNDER_REVIEW"
    isolated_db.commit()
    assert serialize_deal(isolated_db, deal).components[0].redirect_path is None
