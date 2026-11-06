"""Render synthetic empty data using the snapshot taken before H3-18b5."""
import importlib.util
import json
from pathlib import Path

from app.schemas.usage import UsageReport

source = Path(".cache/h3-18b5-before/apps/api/app/services/usage_dashboard.py")
spec = importlib.util.spec_from_file_location("h3_before_usage_dashboard", source)
assert spec is not None and spec.loader is not None
before = importlib.util.module_from_spec(spec)
spec.loader.exec_module(before)
report = UsageReport.model_validate(json.loads(Path("docs/h3-18b5/usage-empty.json").read_text()))
Path("docs/h3-18b5/empty-before-pl.html").write_text(before.render_usage(report), encoding="utf-8")
