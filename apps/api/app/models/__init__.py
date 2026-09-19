from app.models.affiliate import AffiliateProgram, AffiliateProvider, ProviderCapability
from app.models.data_provider import DataProvider
from app.models.deal import Deal, DealComponent
from app.models.location import Airport, Destination
from app.models.offer import PriceObservation, TravelOffer
from app.models.statistics import RouteStatistics

__all__ = [
    "AffiliateProgram",
    "AffiliateProvider",
    "Airport",
    "DataProvider",
    "Deal",
    "DealComponent",
    "Destination",
    "PriceObservation",
    "ProviderCapability",
    "RouteStatistics",
    "TravelOffer",
]
