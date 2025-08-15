#!/bin/bash

# Development script to run both backend and frontend

echo "🚀 Starting development servers..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend server
echo "🔧 Starting backend server on port 5003..."
PORT=5003 npm exec nodemon server.js &

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo "🎨 Starting frontend development server on port 5173..."
cd frontend
npm exec vite &

# Wait for both processes
wait


