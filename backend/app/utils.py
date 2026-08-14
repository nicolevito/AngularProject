from datetime import datetime, timezone


def agora_utc() -> datetime:
    """Datetime UTC naive, compatível com colunas TIMESTAMP WITHOUT TIME ZONE."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
