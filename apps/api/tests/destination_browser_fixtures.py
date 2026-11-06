"""Synthetic HTTP catalogue scenarios; installed only by the guarded E2E app."""
from copy import deepcopy
from datetime import UTC, datetime, timedelta
from typing import Literal

from app.models.deal import Deal
from app.models.location import Destination
from app.services.catalog import serialize_deal
from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse


def install_destination_recovery_fixture(app: FastAPI, engine) -> None:
    scenario = 'normal'
    alerts_active = False
    deadline = datetime.now(UTC)

    @app.post('/__test__/destination-recovery')
    def configure(value: Literal['normal', 'zero', 'one', 'many', 'none', 'error', 'expired', 'expiring'] = 'normal',
                  alerts: bool = False):
        nonlocal scenario, alerts_active, deadline
        scenario, alerts_active = value, alerts
        deadline = datetime.now(UTC) + timedelta(seconds=6 if value == 'expiring' else 7200)
        return {'scenario': scenario, 'synthetic': True}

    def rows(slug: str, count: int):
        now = datetime.now(UTC)
        with Session(engine) as db:
            base = serialize_deal(db, db.scalar(select(Deal).where(Deal.slug == 'browser-deal'))).model_dump(mode='json')
            destination = db.scalar(select(Destination).where(Destination.slug == slug))
            destination_id, city, country = destination.id, destination.city, destination.country_code
        result = []
        for index in range(count):
            row = deepcopy(base)
            row.update(id=9000 + destination_id * 10 + index, slug=f'h315-{slug}-{index}',
                       destination_id=destination_id, destination_slug=slug, destination_city=city,
                       destination_country_code=country, origin_code='WRO', origin_city='Wrocław',
                       trip_type='ROUND_TRIP', flight_quality={'version': 'flight-quality-v1',
                           'status': 'COMPLETE', 'reasons': [], 'recommendation_eligible': True})
            for field in ('airport_context', 'destination_time', 'weekend_assessment', 'score_explanation', 'flight_facts'):
                row.pop(field, None)
            # Old API-compatible calendar facts; no invented measured transfer or city time.
            row['flight_quality'] = {'version': 'flight-quality-v1', 'status': 'PARTIAL',
                                     'reasons': ['UNKNOWN_CARRIER'], 'recommendation_eligible': True}
            price = str((220 if slug == 'rome' else 100) + index)
            row.update(flight_price_pln=price, price_per_person_pln=price, total_estimated_pln=price,
                       historical_baseline_pln=None, discount_percent=None, last_verified_at=now.isoformat())
            hidden = now - timedelta(seconds=1) if scenario == 'expired' else deadline
            row['expires_at'] = hidden.isoformat()
            row['price_freshness'] = {'observed_at': now.isoformat(), 'observation_basis': 'SOURCE',
                'fetched_at': now.isoformat(), 'availability_checked_at': now.isoformat(),
                'hidden_after': hidden.isoformat(), 'max_age_hours': 2}
            result.append(row)
        return result

    @app.middleware('http')
    async def destination_scenarios(request, call_next):
        if scenario == 'normal':
            return await call_next(request)
        path, query = request.url.path, request.query_params
        if path == '/api/v1/alerts/status':
            return JSONResponse({'enabled': alerts_active, 'delivery_enabled': alerts_active})
        if path.startswith('/api/v1/deals/h315-'):
            slug, index = path.rsplit('/', 1)[1].removeprefix('h315-').rsplit('-', 1)
            return JSONResponse(rows(slug, int(index) + 1)[int(index)])
        if path != '/api/v1/deals':
            return await call_next(request)
        if query.get('destination') == 'milan':
            items = rows('milan', 1 if scenario == 'one' else 3 if scenario == 'many' else 0)
        elif query.get('limit') == '100' and query.get('round_trip') == 'true' and not query.get('destination'):
            if scenario == 'error':
                return JSONResponse({'detail': 'Synthetic related catalogue failure'}, status_code=503)
            items = [] if scenario == 'none' else rows('barcelona', 2) + rows('rome', 2)
        else:
            return await call_next(request)
        if query.get('include_total') == 'true':
            limit, offset = int(query.get('limit', '12')), int(query.get('offset', '0'))
            return JSONResponse({'items': items[offset:offset + limit], 'total': len(items), 'offset': offset, 'limit': limit})
        return JSONResponse(items)
