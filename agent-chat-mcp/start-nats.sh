#!/bin/bash

# Simple script to start NATS server with JetStream enabled

echo "Starting NATS server with JetStream..."
echo "NATS will be available at nats://localhost:4222"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Check if nats-server is installed
if ! command -v nats-server &> /dev/null; then
    echo "Error: nats-server is not installed"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install nats-server"
    echo "  Linux: Download from https://github.com/nats-io/nats-server/releases"
    echo "  Docker: docker run -p 4222:4222 nats:latest -js"
    exit 1
fi

# Start NATS with JetStream enabled
nats-server -js
