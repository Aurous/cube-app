# Node builder
FROM node:25 AS builder
# Set working directory
WORKDIR /app
# Copy everything
COPY . .
# Install dependencies
RUN npm install
# Build static
RUN npm run build
# Nginx server
FROM nginx:stable-alpine
# Remove default static
RUN rm -rf /usr/share/nginx/html/*
# Copy static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start webserver
CMD ["nginx", "-g", "daemon off;"]