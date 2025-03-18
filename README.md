# Apps Log System Panel

## Introduction

The Apps Log System Panel is a comprehensive logging system designed to efficiently manage and visualize application logs. It provides a user-friendly interface to monitor and analyze logs from various sources. The project is built using Docker Compose for seamless deployment, creating three distinct containers: Frontend, Backend, and a PostgreSQL database. The database is configured with a persistent volume to ensure data retention, and all three components are interconnected within a private network to enhance security and communication.

## Features

- Real-time log monitoring
- Filter and search logs
- Aggregate logs from multiple sources
- User authentication and authorization (will be added soon)
-

## Technologies Used

- **JavaScript**: The main programming language used.
- **Dockerfile**: For containerization.
- **HTML**: Markup language for the structure of the web pages.
- **Python**: For Client-side requests and posting data to db.
- **CSS**: Styling of the web pages.
- **POSTGRES**: Database is used for saving the logs

## Installation

### Prerequisites

- Node.js and npm installed
- Docker installed

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/neverlast121/apps-log-system-panel.git
   cd apps-log-system-panel
   ```

2. Build and run the Docker container:
   ```sh
   docker-compose up -d --build
   ```

## Usage

Open your browser and navigate to http://localhost:3000. Or http://server-ip:3000
