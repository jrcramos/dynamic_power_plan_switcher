# Dynamic Power Plan Switcher

A desktop application for Windows that dynamically changes the power plan based on CPU usage. This application can actually control your operating system's power settings, providing real automated power management.
To use your system's power plan GUIDs, run in Command Prompt:
```cmd
powercfg /list
```
## Table of Contents

- [Features](#features)
- [Desktop Application (Recommended)](#desktop-application-recommended)
- [Running with Docker (Web Version)](#running-with-docker-web-version)
- [Local Development](#local-development)
- [How It Works](#how-it-works)
- [Configuration](#configuration)

## Features

- **Real CPU Usage Monitoring**: Monitors actual CPU usage on your system
- **Automatic Power Plan Switching**: Switches Windows power plans based on configurable CPU thresholds
- **Desktop Application**: Native Electron-based desktop app with system integration
- **Activity Log**: Real-time monitoring of power plan changes and CPU usage
- **Customizable Settings**: Configure CPU thresholds and monitoring intervals
- **Cross-platform UI**: Modern, responsive interface built with React and Tailwind CSS
- **Web Version Available**: Also runnable as a web-based simulation for demonstration

## Desktop Application (Recommended)

The desktop application provides full functionality with real system control on Windows.

### Prerequisites

- Windows 10 or later (for power plan control)
- Node.js 18 or higher (for development only)

### Download and Install

1. **Download the installer** from the [Releases](https://github.com/jrcramos/dynamic_power_plan_switcher/releases) page
2. **Run the installer** and follow the installation wizard
3. **Run as Administrator** for best results (required to change power plans)

### Building from Source

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/jrcramos/dynamic_power_plan_switcher.git
    cd dynamic_power_plan_switcher
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Build the Application**:
    ```bash
    npm run electron:build
    ```
    
    The installer will be created in the `release` directory.

### Running in Development Mode

To test the application during development:

```bash
npm run electron:dev
```

This starts both the Vite dev server and Electron in development mode with hot reload.

## Running with Docker (Web Version)

The web version is a simulation and cannot control actual system settings. For full functionality, use the desktop application.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system

### Quick Start

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/jrcramos/dynamic_power_plan_switcher.git
    cd dynamic_power_plan_switcher
    ```

2.  **Build the Docker Image**:
    ```bash
    docker build -t power-switcher-app .
    ```

3.  **Run the Docker Container**:
    ```bash
    docker run -d -p 7376:80 --name power-switcher power-switcher-app
    ```

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

**Remove the container:**
```bash
docker rm power-switcher
```

## Local Development

For web-based development without Electron:

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
    Open your browser to `http://localhost:5173`

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## How It Works

### Desktop Application

1. **CPU Monitoring**: The application continuously monitors CPU usage using Node.js system APIs
2. **Threshold Detection**: When CPU usage exceeds the configured threshold, it switches to High Performance mode
3. **Power Plan Switching**: Uses Windows `powercfg` command to change power plans
4. **Return to Balanced**: When CPU usage drops below the low threshold, it returns to Balanced mode

### Administrator Privileges

The application requests administrator privileges because changing Windows power plans requires elevated permissions. You can run it without admin rights, but power plan switching will fail (CPU monitoring will still work).

### Supported Platforms

- **Windows**: Full functionality (CPU monitoring + power plan control)
- **macOS/Linux**: CPU monitoring only (no power plan control)
- **Web Version**: Simulation mode only

## Configuration

### Power Plan GUIDs

The application uses Windows Power Plan GUIDs to switch between plans:

- **High Performance**: `8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c`
- **Balanced**: `381b4222-f694-41f0-9685-ff5bb260df2e`

To find your system's power plan GUIDs, run in Command Prompt:
```cmd
powercfg /list
```

### Configurable Settings

- **CPU Threshold**: CPU usage percentage to trigger High Performance mode (default: 50%)
- **Low CPU Threshold**: CPU usage percentage to return to Balanced mode (default: 35%)
- **Monitor Interval**: How often to check CPU usage in seconds (default: 5s)

## Troubleshooting

**Issue: Power plan won't switch**
- Solution: Run the application as Administrator (right-click → Run as Administrator)

**Issue: Application won't start or shows a blank screen**
- Solution: Ensure you have the latest version of Windows and all updates installed
- Check the log file for detailed error information (see "Log Files" section below)

**Issue: High CPU usage from the app itself**
- Solution: Increase the monitor interval to reduce checking frequency

### Log Files

The application creates log files to help diagnose issues. Log files are stored at:
- **Windows**: `%APPDATA%\Dynamic Power Plan Switcher\logs\app.log`

You can access the log folder directly from the application footer when running the desktop version. The log file contains:
- Application startup information
- CPU monitoring data
- Power plan switching events
- Error messages and warnings

## Project Structure

```
.
├── electron/              # Electron main process files
│   ├── main.ts           # Main process (system integration)
│   └── preload.ts        # Preload script (IPC bridge)
├── components/           # React UI components
├── hooks/                # React hooks (including power monitoring)
├── App.tsx               # Main React component
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config for React
├── tsconfig.electron.json # TypeScript config for Electron
└── vite.config.ts        # Vite build configuration
```
