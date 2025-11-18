# Dynamic Power Plan Switcher

A web-based dashboard that simulates a Windows utility for dynamically changing the power plan based on CPU usage. This application is a UI concept and cannot control your actual operating system settings.

## Running with Docker

This application can be run inside a Docker container, providing a consistent and isolated environment.

### Prerequisites

- You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system.

### Steps

1.  **Open a Terminal:** Open your command prompt, PowerShell, or terminal.

2.  **Navigate to the Project Directory:** Use the `cd` command to go to the folder where the `Dockerfile` is located.

3.  **Build the Docker Image:** Run the following command. This will build a local Docker image named `power-switcher-app`.
    ```bash
    docker build -t power-switcher-app .
    ```

4.  **Run the Docker Container:** After the image is built, run this command to start a container from it.
    ```bash
    docker run -p 8080:80 power-switcher-app
    ```
    This command maps port `8080` on your local machine to port `80` inside the container.

5.  **Access the Application:** Open your web browser and navigate to the following address:
    [http://localhost:8080](http://localhost:8080)

You should now see the application running, served from your Docker container.
