import pytest


def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_email(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "testpassword"},
    )
    assert response.status_code == 401


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


def test_get_current_user_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 403


def test_get_current_user_invalid_token(client):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"},
    )
    assert response.status_code == 401


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "New User",
            "email": "new@example.com",
            "password": "newpassword",
            "role": "EDITOR",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["role"] == "EDITOR"


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": "test@example.com",
            "password": "password",
            "role": "VIEWER",
        },
    )
    assert response.status_code == 400
