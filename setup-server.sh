#!/bin/bash
set -e

echo "Installing packages..."
sudo dnf update -y
sudo dnf install -y nginx git python3-pip

echo "Starting and enabling nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo "Creating website directory..."
sudo mkdir -p /var/www/html
sudo chown nginx:nginx /var/www/html

echo "Configuring firewall..."
sudo firewall-cmd --permanent --add-service=http || true
sudo firewall-cmd --permanent --add-service=https || true
sudo firewall-cmd --reload || true

echo "Server setup complete!"
