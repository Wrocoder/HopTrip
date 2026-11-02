import pytest
from app.config import Settings
from pydantic import ValidationError


@pytest.mark.parametrize(
    "values",
    [
        {"public_rate_limit": "SEC01-SYNTHETIC-SENSITIVE-INPUT"},
        {"app_env": "production", "admin_token": "SEC01-SYNTHETIC-SHORT-TOKEN"},
    ],
)
def test_settings_validation_diagnostics_do_not_echo_inputs(values, monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", "sqlite://")
    with pytest.raises(ValidationError) as caught:
        Settings(_env_file=None, **values)
    diagnostic = str(caught.value)
    assert "input_value" not in diagnostic
    assert "input_type" not in diagnostic
    assert "SEC01-SYNTHETIC" not in diagnostic
