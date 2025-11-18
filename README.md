# Dynamic Power Plan Switcher

A web-based dashboard that simulates a Windows utility for dynamically changing the power plan based on CPU usage. This application is a UI concept and cannot control your actual operating system settings.

## Table of Contents

- [Features](#features)
- [Running with Docker](#running-with-docker)
- [Local Development](#local-development)
- [Docker Setup Details](#docker-setup-details)
- [Configuration Files](#configuration-files)

## Features

- Real-time CPU usage simulation
- Dynamic power plan switching based on configurable thresholds
- Activity log for monitoring power plan changes
- Customizable monitoring intervals
- Modern, responsive UI built with React and Tailwind CSS

## Running with Docker

This application can be run inside a Docker container, providing a consistent and isolated environment.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system
- Basic familiarity with command-line interface

### Quick Start

1.  **Clone the Repository** (if you haven't already):
    ```bash
    git clone https://github.com/jrcramos/dynamic_power_plan_switcher.git
    cd dynamic_power_plan_switcher
    ```

2.  **Build the Docker Image**:
    ```bash
    docker build -t power-switcher-app .
    ```
    This command:
    - Uses the multi-stage `Dockerfile` to build the application
    - Installs Node.js dependencies
    - Builds the React application
    - Creates an optimized production image with NGINX
    - Tags the image as `power-switcher-app`

3.  **Run the Docker Container**:
    ```bash
    docker run -d -p 7376:80 --name power-switcher power-switcher-app
    ```
    This command:
    - Runs the container in detached mode (`-d`)
    - Maps port `7376` on your local machine to port `80` inside the container (`-p 7376:80`)
    - Names the container `power-switcher` for easy reference
    - Uses the `power-switcher-app` image

4.  **Access the Application**:
    Open your web browser and navigate to:
    ```
    http://localhost:7376
    ```

### Managing the Container

**Stop the container:**
```bash
docker stop power-switcher
```

**Start the container again:**
```bash
docker start power-switcher
```

**View container logs:**
```bash
docker logs power-switcher
```

**Remove the container:**
```bash
docker rm power-switcher
```

**Remove the image:**
```bash
docker rmi power-switcher-app
```

### Using Different Ports

If port 7376 is already in use, you can map to a different port:
```bash
docker run -d -p 3000:80 --name power-switcher power-switcher-app
```
Then access the application at `http://localhost:3000`

## Local Development

If you want to run the application locally without Docker:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (comes with Node.js)

### Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Access the Application**:
    Open your browser to `http://localhost:3000`

4.  **Build for Production**:
    ```bash
    npm run build
    ```
    The built files will be in the `dist` directory.

## Docker Setup Details

### Dockerfile

The application uses a multi-stage Docker build process:

1.  **Build Stage** (node:18-alpine):
    - Installs Node.js dependencies
    - Copies source code
    - Builds the React application using Vite
    - Produces optimized static files in the `dist` directory

2.  **Production Stage** (nginx:alpine):
    - Uses a minimal NGINX Alpine image
    - Copies built files from the build stage
    - Configures NGINX with custom settings
    - Exposes port 80
    - Serves the application efficiently

**Benefits of this approach:**
- Smaller final image size (only includes production assets)
- No development dependencies in production
- Faster deployment and reduced attack surface
- Optimized for serving static files

### NGINX Configuration

The `.docker/nginx.conf` file contains the NGINX server configuration:

**Key Features:**
- **SPA Support**: Redirects all routes to `index.html` for client-side routing
- **Gzip Compression**: Reduces bandwidth usage for text-based files
- **Security Headers**: Adds protective HTTP headers (X-Frame-Options, X-Content-Type-Options, etc.)
- **Static Asset Caching**: Sets long-term caching for JS, CSS, images, and fonts
- **Dynamic Content**: Disables caching for `index.html` to ensure users get the latest version
- **Health Check Endpoint**: Provides `/health` endpoint for container health monitoring

**Configuration Highlights:**
```nginx
# Serves files from /usr/share/nginx/html
root /usr/share/nginx/html;

# Fallback to index.html for SPA routing
try_files $uri $uri/ /index.html;

# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Configuration Files

### Project Structure

```
.
├── Dockerfile              # Docker build instructions
├── .docker/
│   └── nginx.conf         # NGINX server configuration
├── package.json           # Node.js dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── index.html            # HTML entry point
├── App.tsx               # Main React component
├── components/           # React components
├── hooks/                # Custom React hooks
└── dist/                 # Built files (generated)
```

### Environment Variables

Currently, the application doesn't require environment variables for basic operation. If you need to configure API keys or other settings, you can:

1. Create a `.env` file in the project root
2. Add your variables (e.g., `VITE_API_KEY=your_key`)
3. Rebuild the Docker image

## Troubleshooting

**Issue: Port already in use**
- Solution: Use a different port mapping (e.g., `-p 3000:80`)

**Issue: Container won't start**
- Check logs: `docker logs power-switcher`
- Verify Docker is running: `docker ps`

**Issue: Application not loading**
- Verify container is running: `docker ps`
- Check if port is accessible: `curl http://localhost:7376`
- Review NGINX logs: `docker logs power-switcher`

**Issue: Changes not reflected after rebuild**
- Remove old container: `docker rm -f power-switcher`
- Remove old image: `docker rmi power-switcher-app`
- Rebuild and run again

## License

This project is provided as-is for educational and demonstration purposes.
