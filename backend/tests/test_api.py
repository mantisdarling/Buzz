"""
Pytest integration tests for TruthLens FastAPI endpoints.
Uses SQLite in-memory database for fast, isolated test runs.
"""
import os

# Use SQLite in-memory database for unit test execution
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-at-least-32-characters-long"

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.models.user import User  # noqa: F401
from app.models.submission import Submission  # noqa: F401
from app.models.feedback import Feedback  # noqa: F401
from app.main import app
from app.db.session import get_db, engine as test_engine

# Setup in-memory SQLite database for testing
sqlite_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})


def override_get_db():
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture():
    SQLModel.metadata.create_all(test_engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    SQLModel.metadata.drop_all(test_engine)
    app.dependency_overrides.clear()


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}


def test_user_registration_and_login(client: TestClient):
    # 1. Register new user
    reg_data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "Password123!",
    }
    res = client.post("/api/auth/register", json=reg_data)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data

    # 2. Login with correct credentials
    login_data = {
        "email": "testuser@example.com",
        "password": "Password123!",
    }
    res_login = client.post("/api/auth/login", json=login_data)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 3. Login with wrong password should fail with 401
    bad_login = {
        "email": "testuser@example.com",
        "password": "WrongPassword!",
    }
    res_bad = client.post("/api/auth/login", json=bad_login)
    assert res_bad.status_code == 401


def test_predict_validation_and_auth(client: TestClient):
    # 1. Unauthenticated request to /predict should return 401
    res_unauth = client.post("/api/predict", json={"text": "Short text"})
    assert res_unauth.status_code == 401

    # 2. Register & obtain token
    client.post(
        "/api/auth/register",
        json={"email": "predict_user@example.com", "username": "preduser", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "predict_user@example.com", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Text less than 20 characters should trigger validation error (422)
    res_short = client.post("/api/predict", json={"text": "Too short"}, headers=headers)
    assert res_short.status_code == 422

    # 4. Valid text submission
    valid_text = (
        "Breaking: Researchers at the institute have released a peer-reviewed study confirming significant results."
    )
    res_valid = client.post("/api/predict", json={"text": valid_text}, headers=headers)
    assert res_valid.status_code == 202
    res_data = res_valid.json()
    assert res_data["status"] == "done"
    assert res_data["verdict"] in ["Real", "Fake"]
    assert 0.0 <= res_data["confidence"] <= 1.0
    assert "scores" in res_data
    assert isinstance(res_data["explanation"], list)
