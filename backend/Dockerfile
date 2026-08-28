# Dockerfile — Backend Production (no reload, optimized)
FROM python:3.12-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Init DB + jalankan tanpa --reload (production)
CMD ["sh", "-c", "python -m app.database.init_db && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
