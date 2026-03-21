FROM python:3.9-slim

# Create a non-root user for Hugging Face (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies (avoid sudo, use user permissions)
USER root
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
USER user

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip3 install --no-cache-dir --user -r requirements.txt

# Copy the rest of the app
COPY --chown=user . .

# Hugging Face Spaces uses port 7860
ENV PORT=7860
EXPOSE 7860

# Run with python -m to avoid PATH issues
CMD ["python3", "-m", "gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
