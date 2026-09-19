from app.models.affiliate import AffiliateProgram, AffiliateProvider, ProviderCapability
from app.models.affiliate_click import AffiliateClick
from app.models.analytics import AnalyticsEvent
from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.job import JobRun, JobStatus
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.models.statistics import RouteStatistics

__all__ = [
    "AffiliateClick",
    "AffiliateProgram",
    "AffiliateProvider",
    "Airport",
    "AnalyticsEvent",
    "DataProvider",
    "Deal",
    "DealComponent",
    "Destination",
    "JobRun",
    "JobStatus",
    "PriceObservation",
    "ProviderCapability",
    "RouteStatistics",
    "TravelOffer",
]
