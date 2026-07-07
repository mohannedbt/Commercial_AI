FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Install system dependencies for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers and system dependencies for Chromium
RUN playwright install chromium && \
    playwright install-deps chromium

# Copy backend source code
COPY . .

# Ensure media and database directories exist and have proper permissions
RUN mkdir -p data temp_ads static/generated_ads

EXPOSE 10000

# Use shell form so $PORT is expanded at runtime (Render injects PORT dynamically)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
