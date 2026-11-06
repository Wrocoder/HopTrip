from dataclasses import dataclass

from app.affiliate_adapters.stored import LinkUnavailable, build_deep_link
from app.config import get_settings
from app.models.affiliate import AffiliateProgram, AffiliateProvider
from app.models.deal import DealComponent
from app.models.offer import TravelOffer
from app.services.partner_links import source_url, valid_partner
from sqlalchemy.orm import Session


@dataclass(frozen=True)
class LinkPolicy:
    available: bool
    reason: str
    program: AffiliateProgram | None = None
    provider: AffiliateProvider | None = None
    url: str | None = None


def component_policy(
    db: Session, component: DealComponent, tracking_id: str | None = None
) -> LinkPolicy:
    program = (
        db.get(AffiliateProgram, component.affiliate_program_id)
        if component.affiliate_program_id
        else None
    )
    if not program:
        return LinkPolicy(False, "NO_PROGRAM")
    provider = db.get(AffiliateProvider, program.provider_id)
    if not provider or any(
        not e.is_active or e.onboarding_status != "APPROVED" for e in (program, provider)
    ):
        return LinkPolicy(False, "PROGRAM_UNAVAILABLE", program, provider)
    if (
        "AFFILIATE_LINK" not in program.capabilities_json
        or "AFFILIATE_LINK" not in provider.capabilities_json
        or program.adapter_code != "stored_link"
    ):
        return LinkPolicy(False, "UNSUPPORTED_CAPABILITY", program, provider)
    try:
        url = build_deep_link(
            (component.metadata_json or {}).get("outbound_url"),
            allowed_hosts=program.allowed_hosts,
            tracking_param=program.tracking_param,
            tracking_id=tracking_id,
        )
    except LinkUnavailable as exc:
        return LinkPolicy(False, str(exc), program, provider)
    if provider.code == "travelpayouts" and program.code == "aviasales":
        # This converter already has an exact-ticket contract. Check it on every
        # read/redirect too: synchronization may not have run since a source edit.
        # Never replace the converter's placement sub_id with a per-click ID.
        if component.component_type.upper() != "FLIGHT":
            return LinkPolicy(False, "UNSUPPORTED_CAPABILITY", program, provider)
        if program.tracking_param is not None:
            return LinkPolicy(False, "UNSUPPORTED_TRACKING", program, provider)
        offer = db.get(TravelOffer, component.travel_offer_id) if component.travel_offer_id else None
        settings = get_settings()
        marker, project = settings.travelpayouts_marker, settings.travelpayouts_project_id
        try:
            if (offer is None or offer.source != "travelpayouts_data"
                    or not isinstance(offer.raw_payload, dict) or not marker or not project):
                raise ValueError
            direct = source_url(offer.raw_payload.get("link"))
            if not valid_partner(url, direct, marker, project):
                raise ValueError
        except ValueError:
            return LinkPolicy(False, "ITINERARY_LINK_MISMATCH", program, provider)
    return LinkPolicy(True, "AVAILABLE", program, provider, url)
