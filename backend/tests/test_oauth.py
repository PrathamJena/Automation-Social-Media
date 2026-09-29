"""OAuth flow tests.

The OAuth routes store the CSRF `state` value in Redis, so these tests
replace the Redis client with an in-memory fake. That keeps the suite
runnable without a live Redis and makes state validation deterministic.
"""

import pytest
from unittest.mock import patch


class FakeRedis:
    """Minimal stand-in for the bits of Redis the OAuth routes use."""

    def __init__(self):
        self.store = {}

    def setex(self, key, ttl, value):
        self.store[key] = value

    def get(self, key):
        return self.store.get(key)

    def delete(self, key):
        self.store.pop(key, None)


@pytest.fixture
def fake_redis():
    """Patch the Redis client used by the OAuth router."""
    from app.api import oauth

    fake = FakeRedis()
    with patch.object(oauth, "redis_client", fake):
        yield fake


def test_oauth_connect_requires_auth(client):
    response = client.get("/api/social-accounts/facebook/connect")
    assert response.status_code == 403


def test_oauth_callback_rejects_unknown_state(client, fake_redis):
    """A state value the server never issued must be refused."""
    response = client.get(
        "/api/social-accounts/facebook/callback",
        params={"code": "test_code", "state": "never-issued"},
    )
    assert response.status_code == 400
    assert "state" in response.json()["detail"].lower()


def test_oauth_callback_rejects_reused_state(client, fake_redis):
    """A state value may only be used once, preventing replay."""
    fake_redis.store["oauth_state:reusable"] = '{"user_id": "x", "platform": "facebook"}'

    first = client.get(
        "/api/social-accounts/facebook/callback",
        params={"code": "code", "state": "reusable"},
    )
    # The token exchange will fail (no real credentials) but the state
    # must have been consumed, so a second attempt is rejected outright.
    assert "oauth_state:reusable" not in fake_redis.store

    second = client.get(
        "/api/social-accounts/facebook/callback",
        params={"code": "code", "state": "reusable"},
    )
    assert second.status_code == 400
    assert "state" in second.json()["detail"].lower()


def test_oauth_callback_missing_params(client, fake_redis):
    response = client.get("/api/social-accounts/facebook/callback")
    assert response.status_code == 422


def test_social_accounts_require_auth(client):
    response = client.get("/api/social-accounts/")
    assert response.status_code == 403
