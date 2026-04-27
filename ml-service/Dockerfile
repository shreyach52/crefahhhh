# Use Python 3.11-slim as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (required for some ML libraries)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the ml-service files
COPY . .

# Expose the port
EXPOSE 8080

# Command to run the coordinator app
CMD ["uvicorn", "agents.coordinator:app", "--host", "0.0.0.0", "--port", "8080"]
