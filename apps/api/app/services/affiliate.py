from dataclasses import dataclass

from app.affiliate_adapters.stored import LinkUnavailable, build_deep_link
from app.models.affiliate import AffiliateProgram, AffiliateProvider
from app.models.deal import DealComponent
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
    return LinkPolicy(True, "AVAILABLE", program, provider, url)
