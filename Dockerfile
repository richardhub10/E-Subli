# ==========================================
# STAGE 1: Build Expo Web Application
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_GEMINI_API_KEY
ARG EXPO_PUBLIC_GROQ_API_KEY
ARG EXPO_PUBLIC_SCANNER_API_URL=/api/scan

ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL \
    EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
    EXPO_PUBLIC_GEMINI_API_KEY=$EXPO_PUBLIC_GEMINI_API_KEY \
    EXPO_PUBLIC_GROQ_API_KEY=$EXPO_PUBLIC_GROQ_API_KEY \
    EXPO_PUBLIC_SCANNER_API_URL=$EXPO_PUBLIC_SCANNER_API_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .
RUN npx expo export -p web

# ==========================================
# STAGE 2: Python Backend & Unified Server
# ==========================================
FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/testscanner-main:/app \
    DIST_DIR=/app/dist \
    PORT=8081

WORKDIR /app

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install lightweight PyTorch CPU wheels
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch>=2.2.0 torchvision>=0.17.0 --index-url https://download.pytorch.org/whl/cpu

# Install Python requirements
COPY testscanner-main/requirements.txt ./testscanner-main/
RUN pip install --no-cache-dir -r testscanner-main/requirements.txt

# Copy testscanner code and model
COPY testscanner-main/ ./testscanner-main/

# Copy built frontend dist from Stage 1 into /app/dist
COPY --from=frontend-builder /app/dist /app/dist

# Expose port (matches Railway's auto-generated port 8081)
EXPOSE 8081

# Start Gunicorn server binding to Railway's dynamic $PORT
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8081} --workers 1 --threads 4 --timeout 180 api.index:app"]
