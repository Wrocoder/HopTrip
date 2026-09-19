from datetime import datetime
from decimal import Decimal
from typing import Protocol


class CurrencyConverter(Protocol):
    def to_pln(self, amount: Decimal, currency: str, at: datetime) -> tuple[Decimal, Decimal] | None: ...


class PlnOnlyConverter:
    """Converts only PLN until a licensed exchange-rate source is configured."""

    def to_pln(self, amount: Decimal, currency: str, at: datetime) -> tuple[Decimal, Decimal] | None:
        if currency.upper() != "PLN":
            return None
        return amount, Decimal(1)
