FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for compiling psycopg2 and C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and ML requirements
COPY backend/requirements.txt /app/backend/requirements.txt
COPY ml/requirements.txt /app/ml/requirements.txt

# Install Python requirements
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/ml/requirements.txt
RUN python -m spacy download en_core_web_lg

# Copy application source code
COPY backend /app/backend
COPY ml /app/ml

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
