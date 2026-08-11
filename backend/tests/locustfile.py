"""
Locust load testing file for Buzz API endpoints.

Simulates concurrent user behavior:
- Health check probes
- User registration and login flow
- Prediction inference requests
- Submission history retrieval
"""
import random
import string
from locust import HttpUser, task, between


def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


class BuzzUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Register and log in a unique user for each load test worker."""
        username = f"user_{random_string(8)}"
        email = f"{username}@example.com"
        password = "Password123!"

        # Register
        res = self.client.post(
            "/api/auth/register",
            json={"email": email, "username": username, "password": password},
        )
        if res.status_code == 201:
            self.token = res.json().get("access_token")
        else:
            # Try login fallback
            login_res = self.client.post(
                "/api/auth/login",
                json={"email": email, "password": password},
            )
            if login_res.status_code == 200:
                self.token = login_res.json().get("access_token")

    @task(3)
    def health_check(self):
        self.client.get("/health")

    @task(2)
    def submit_prediction(self):
        if not self.token:
            return
        headers = {"Authorization": f"Bearer {self.token}"}
        sample_texts = [
            "Breaking news: Researchers confirm major breakthroughs in clean energy storage technology after multi-year clinical trials.",
            "Unverified rumors claim secret government experiments are occurring in abandoned facilities nationwide.",
            "Official statement released by international trade organization regarding new economic policies and tariffs.",
        ]
        text = random.choice(sample_texts)
        self.client.post("/api/predict", json={"text": text}, headers=headers)

    @task(1)
    def view_history(self):
        if not self.token:
            return
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/history?page=1&page_size=10", headers=headers)
