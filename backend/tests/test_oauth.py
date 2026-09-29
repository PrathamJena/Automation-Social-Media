import pytest


def test_oauth_connect_requires_auth(client):
    response = client.get("/api/social-accounts/facebook/connect")
    assert response.status_code == 403


def test_oauth_callback_invalid_state(client):
    response = client.get(
        "/api/social-accounts/facebook/callback",
        params={"code": "test_code", "state": "invalid_state"},
    )
    assert response.status_code == 400


def test_oauth_callback_missing_params(client):
    response = client.get("/api/social-accounts/facebook/callback")
    assert response.status_code == 422
