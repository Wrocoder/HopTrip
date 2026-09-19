import asyncio
import json
import sys
from dataclasses import asdict

from app.jobs.pipeline import run_travelpayouts_pipeline
from app.providers.base import ProviderError


def main() -> int:
    try:
        result = asyncio.run(run_travelpayouts_pipeline())
    except ProviderError as exc:
        print(f"Travel data pipeline failed: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(asdict(result), default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
