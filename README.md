# Buzz

> **TruthLens - AI Powered Misinformation and Fake News Detector**

Buzz is a multi-model AI ensemble platform designed to detect misinformation, fake news, and manipulated text in digital media. It combines fine-tuned DistilBERT NLP transformers, spaCy stylometry, and TF-IDF baseline models to deliver high-precision claim verification with word-level highlighted reasoning.

---

## Key Features

- **Multi Model Ensemble**: Combines DistilBERT transformer embeddings, spaCy stylometric linguistic patterns, and N-Gram TF-IDF statistical models.
- **Word Level AI Explainability**: Highlights key words and phrases influencing the truthfulness score for transparent verification.
- **URL & Raw Text Processing**: Accepts direct article URLs (scraped asynchronously via Trafilatura & Celery) or raw text snippets.
- **Dark Mode UI**: Next.js App Router dashboard styled with Tailwind CSS, Recharts visual signals, and Framer Motion micro-animations.
- **REST API & Telemetry**: FastAPI backend with JWT authentication, Redis caching, rate limiting, and an admin analytics dashboard.
- **Production Containerization**: Full Docker Compose setup with Nginx reverse proxy, PostgreSQL, Redis, and Celery workers.

---

## Tech Stack

| Component | Technologies |
| --- | --- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Recharts, Framer Motion, Lucide Icons |
| **Backend API** | FastAPI, SQLModel, PyJWT, Bcrypt, SlowAPI Rate Limiter, Sentry SDK |
| **Machine Learning** | PyTorch, HuggingFace Transformers (DistilBERT), spaCy, Scikit-learn, ONNX Runtime |
| **Task Queue & Cache** | Celery, Redis, Trafilatura Web Scraper |
| **Database** | PostgreSQL (Production), SQLite (Testing/Development) |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions CI/CD |

---

## Quick Start (Docker)

To run the complete platform locally using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/mantisdarling/Buzz.git
cd Buzz

# Start all services (PostgreSQL, Redis, FastAPI, Celery, Next.js, Nginx)
docker-compose up --build
```

Access the services:
- **Web App**: `http://localhost`
- **Backend API Docs**: `http://localhost/docs`
- **Direct Frontend Dev Server**: `http://localhost:3000`

---

## Local Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment & activate
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r ../ml/requirements.txt
python -m spacy download en_core_web_lg

# Run dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

---

## Running Unit & Integration Tests

```bash
cd backend
python -m pytest tests/ -v
```

---

## License

Distributed under the MIT License.
