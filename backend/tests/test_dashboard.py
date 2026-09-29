import pytest


def test_dashboard_stats(client, auth_headers):
    # Create some posts
    client.post(
        "/api/posts/",
        headers=auth_headers,
        json={"caption": "Draft post", "platforms": []},
    )

    response = client.get("/api/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_posts" in data
    assert "scheduled" in data
    assert "published" in data
    assert "failed" in data
    assert "drafts" in data
    assert data["total_posts"] >= 1


def test_dashboard_stats_unauthorized(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 403
