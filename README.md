# Subscriber Usage Service

A Node.js and Express service for storing and retrieving subscriber usage records.

## Features

- Create subscriber usage records
- Retrieve all usage records
- Input validation
- Automatic timestamps
- In-memory storage

## Tech Stack

- Node.js
- Express.js

## Installation

Clone the repository:

```bash
git clone https://github.com/USERNAME/subscriber-usage-service.git
```

Navigate to the project:

```bash
cd subscriber-usage-service
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
```

## Running the Application

Development:

```bash
npm run dev
```

Standard:

```bash
npm start
```

The service runs at:

```text
http://localhost:3000
```

## API

### Create Usage Record

```http
POST /usage
```

Example request:

```json
{
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500
}
```

### Get All Usage Records

```http
GET /usage
```

## Storage

The service currently uses in-memory storage.

All records are cleared whenever the application restarts.