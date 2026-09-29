import pytest


def test_list_users(client, auth_headers):
    response = client.get("/api/users/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_create_user(client, auth_headers):
    response = client.post(
        "/api/users/",
        headers=auth_headers,
        json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "password123",
            "role": "EDITOR",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "EDITOR"


def test_create_user_duplicate_email(client, auth_headers, test_user):
    response = client.post(
        "/api/users/",
        headers=auth_headers,
        json={
            "name": "Duplicate",
            "email": "test@example.com",
            "password": "password",
            "role": "VIEWER",
        },
    )
    assert response.status_code == 400


def test_update_user(client, auth_headers, test_user):
    response = client.put(
        f"/api/users/{test_user.id}",
        headers=auth_headers,
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_user(client, auth_headers, test_user, db):
    response = client.delete(f"/api/users/{test_user.id}", headers=auth_headers)
    assert response.status_code == 200

    # Verify deactivated in database
    from app.models.user import User
    user = db.query(User).filter(User.id == test_user.id).first()
    assert user.is_active == "N"


def test_users_require_admin(client, db, test_user):
    # Make test user a viewer
    from app.models.user import UserRole
    test_user.role = UserRole.VIEWER
    db.commit()

    # Login as viewer
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to list users
    response = client.get("/api/users/", headers=headers)
    assert response.status_code == 403
