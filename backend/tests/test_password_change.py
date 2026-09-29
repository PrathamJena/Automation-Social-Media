"""Tests for changing the signed-in user's password and profile."""

import pytest


def test_change_password_success(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "a-brand-new-passphrase",
            "confirm_password": "a-brand-new-passphrase",
        },
    )
    assert response.status_code == 200
    assert "success" in response.json()["message"].lower()


def test_change_password_wrong_current_password(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "not-my-password",
            "new_password": "a-brand-new-passphrase",
            "confirm_password": "a-brand-new-passphrase",
        },
    )
    assert response.status_code == 400
    assert "current password" in response.json()["detail"].lower()


def test_change_password_mismatch(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "a-brand-new-passphrase",
            "confirm_password": "something-else-entirely",
        },
    )
    assert response.status_code == 400
    assert "do not match" in response.json()["detail"].lower()


def test_change_password_too_short(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "short",
            "confirm_password": "short",
        },
    )
    assert response.status_code == 400
    assert "at least" in response.json()["detail"].lower()


def test_change_password_reuse_old(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "testpassword",
            "confirm_password": "testpassword",
        },
    )
    assert response.status_code == 400
    assert "different" in response.json()["detail"].lower()


def test_change_password_requires_auth(client):
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "a",
            "new_password": "b",
            "confirm_password": "b",
        },
    )
    assert response.status_code == 403


def test_new_password_actually_works(client, auth_headers):
    """After changing, the old password must stop working and the new one must work."""
    client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "rotated-password-123",
            "confirm_password": "rotated-password-123",
        },
    )

    old = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert old.status_code == 401

    new = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "rotated-password-123"},
    )
    assert new.status_code == 200


def test_update_profile(client, auth_headers):
    response = client.put(
        "/api/auth/profile",
        headers=auth_headers,
        json={"name": "Renamed Admin", "email": "renamed@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Renamed Admin"
    assert data["email"] == "renamed@example.com"


def test_update_profile_rejects_blank_name(client, auth_headers):
    response = client.put(
        "/api/auth/profile",
        headers=auth_headers,
        json={"name": "   "},
    )
    assert response.status_code == 400


def test_update_profile_rejects_taken_email(client, auth_headers, db):
    from app.models.user import User

    other = User(
        name="Other",
        email="taken@example.com",
        password_hash="x",
    )
    db.add(other)
    db.commit()

    response = client.put(
        "/api/auth/profile",
        headers=auth_headers,
        json={"email": "taken@example.com"},
    )
    assert response.status_code == 400
    assert "already in use" in response.json()["detail"].lower()
