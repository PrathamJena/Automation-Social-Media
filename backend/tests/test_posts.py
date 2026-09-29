import pytest
from datetime import datetime, timedelta


def test_create_post_draft(client, auth_headers):
    response = client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "Test post", "platforms": ["facebook"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["caption"] == "Test post"
    assert data["status"] == "draft"


def test_create_post_scheduled(client, auth_headers):
    scheduled_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/posts/",
        headers=auth_headers,
        json={
            "caption": "Scheduled post",
            "scheduled_at": scheduled_time,
            "platforms": ["instagram"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "scheduled"


def test_list_posts(client, auth_headers):
    # Create a post first
    client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "Test post", "platforms": []},
    )

    response = client.get("/api/posts/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_post(client, auth_headers):
    create_response = client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "Test post", "platforms": []},
    )
    post_id = create_response.json()["id"]

    response = client.get(f"/api/posts/{post_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["caption"] == "Test post"


def test_get_post_not_found(client, auth_headers):
    response = client.get(
        "/api/posts/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_post(client, auth_headers):
    create_response = client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "Original", "platforms": []},
    )
    post_id = create_response.json()["id"]

    response = client.put(
        f"/api/posts/{post_id}",
        headers=auth_headers,
        json={"caption": "Updated"},
    )
    assert response.status_code == 200
    assert response.json()["caption"] == "Updated"


def test_delete_post(client, auth_headers):
    create_response = client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "To delete", "platforms": []},
    )
    post_id = create_response.json()["id"]

    response = client.delete(f"/api/posts/{post_id}", headers=auth_headers)
    assert response.status_code == 200

    # Verify deleted
    get_response = client.get(f"/api/posts/{post_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_create_post_unauthorized(client):
    response = client.post(
        "/api/posts/",
        json={"caption": "Test", "platforms": []},
    )
    assert response.status_code == 403
