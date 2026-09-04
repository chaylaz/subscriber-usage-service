# Subscriber Usage Service

A simple Node.js and Express service for storing subscriber usage records and creating scheduled CSV snapshots.

## Features

- Create subscriber usage records
- Retrieve all stored usage records
- Basic input validation
- Automatic timestamps
- In-memory storage
- Scheduled CSV snapshots
- Snapshot cleanup for files older than 30 days
- SQL queries for subscriber and usage data
- Simple frontend for creating and viewing usage records
- Dynamic API connection status

## Tech Stack

- Node.js
- Express.js
- node-cron
- MySQL / MariaDB
- HTML, CSS, and JavaScript

## Project Structure

```text
subscriber-usage-service/
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
│
├── scripts/
│   ├── cleanup.js
│   ├── scheduler.js
│   └── snapshot.js
│
├── snapshots/
│   └── .gitkeep
│
├── sql/
│   ├── answers.sql
│   ├── schema.sql
│   └── seed.sql
│
├── troubleshooting/
│   └── getTotalUsageMB.js
│
├── src/
│   ├── controllers/
│   │   └── usageController.js
│   ├── data/
│   │   └── usageStore.js
│   ├── routes/
│   │   └── usageRoutes.js
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- MySQL or MariaDB for running the SQL scripts

Check the installed Node.js and npm versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/chaylaz/subscriber-usage-service.git
```

Move into the project directory:

```bash
cd subscriber-usage-service
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=3000
API_BASE_URL=http://localhost:3000
```

## Running the Backend

Development mode:

```bash
npm run dev
```

Or run normally:

```bash
npm start
```

The service will run at:

```text
http://localhost:3000
```

## API Endpoints

### Service Status

```http
GET /
```

Example response:

```json
{
  "message": "Subscriber Usage Service is running."
}
```

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

Example response:

```json
{
  "message": "Usage record created successfully.",
  "data": {
    "subscriberId": "SUB01",
    "callMinutes": 40,
    "smsCount": 10,
    "dataUsageMB": 1500,
    "timestamp": "2026-09-03T12:00:00.000Z"
  }
}
```

### Get All Usage Records

```http
GET /usage
```

Example response:

```json
{
  "count": 1,
  "data": [
    {
      "subscriberId": "SUB01",
      "callMinutes": 40,
      "smsCount": 10,
      "dataUsageMB": 1500,
      "timestamp": "2026-09-03T12:00:00.000Z"
    }
  ]
}
```

## Simple Frontend

A small frontend is included for interacting with the usage API directly from the browser.

Start the backend:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/app/
```

The frontend can:

- Add usage records through `POST /usage`
- Display stored records from `GET /usage`
- Refresh the current usage list
- Show basic validation messages

The frontend also includes an API status indicator.

When the backend is available, it shows:

```text
API Connected
```

If the backend cannot be reached, it changes to:

```text
API Unavailable
```

The status is checked automatically while the page is open.

The frontend uses plain HTML, CSS, and JavaScript and does not require any additional frontend framework.

## Storage

Usage records are stored in memory.

This means the stored records will be cleared whenever the backend application is restarted.

## Usage Snapshot Automation

The snapshot scheduler calls:

```http
GET /usage
```

three times every day:

```text
08:00 WIB
12:00 WIB
15:00 WIB
```

The scheduler uses:

```text
Asia/Jakarta
```

as its timezone.

### Starting the Scheduler

The backend needs to be running before starting the scheduler.

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run scheduler
```

The scheduler will remain active and create snapshots at the configured times.

## Running a Snapshot Manually

A snapshot can also be created manually for testing:

```bash
npm run snapshot
```

The script calls `GET /usage` and saves the response as a CSV file inside:

```text
snapshots/
```

## Snapshot Naming Convention

Snapshot files use this format:

```text
usage_snapshot_YYYY-MM-DD_HH-mm.csv
```

Example:

```text
usage_snapshot_2026-09-03_21-14.csv
```

The date and time in the filename use WIB.

This format makes the snapshots easier to identify and sort by time.

## CSV Format

Each snapshot contains:

```text
subscriberId
callMinutes
smsCount
dataUsageMB
timestamp
```

Example:

```csv
subscriberId,callMinutes,smsCount,dataUsageMB,timestamp
SUB01,40,10,1500,2026-09-03T14:13:40.292Z
SUB02,90,20,6000,2026-09-03T14:13:49.670Z
SUB03,20,5,500,2026-09-03T14:13:54.142Z
```

## Snapshot Cleanup

A separate cleanup script removes snapshot files older than 30 days.

Run:

```bash
npm run cleanup
```

Only CSV files that follow the snapshot naming convention are checked.

Files with other names are ignored.

## Subscriber & Usage SQL

The SQL scripts are stored in:

```text
sql/
├── answers.sql
├── schema.sql
└── seed.sql
```

- `schema.sql` creates the `subscribers` and `usage` tables.
- `seed.sql` inserts the sample subscriber and usage data.
- `answers.sql` contains the SQL queries for the Q3 requirements.

### Running the SQL

The SQL scripts were tested using MariaDB/MySQL through phpMyAdmin.

Create a database:

```sql
CREATE DATABASE subscriber_usage;
```

Select the database:

```sql
USE subscriber_usage;
```

Then run the files in this order:

```text
1. schema.sql
2. seed.sql
3. answers.sql
```

### Assumption

The provided subscriber IDs range from `SUB01` to `SUB06`.

The task does not specify an ID for Fajar, so `SUB07` is used as the next subscriber ID.

### Query Results

Fajar was successfully inserted with the Basic plan and then updated to Premium.

Total data usage for Premium subscribers:

```text
16800 MB
```

Top 3 subscribers by total data usage:

| Subscriber | Name | Total Usage |
|---|---|---:|
| SUB02 | Sari | 11800 MB |
| SUB04 | Dewi | 9000 MB |
| SUB05 | Rian | 5000 MB |

Subscribers with average call minutes per snapshot less than or equal to 30:

| Subscriber | Name |
|---|---|
| SUB03 | Budi |
| SUB06 | Nia |

## Troubleshooting: Total Usage Calculation

The original function was:

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    total += record.dataUsageMB;
  });
}
```

The main issue is that the `reduce()` callback does not return the updated accumulator.

When a callback uses curly braces, the accumulator has to be returned explicitly. Without a return value, the callback returns `undefined`, so the next iteration cannot continue the calculation correctly.

The original function also does not provide an initial value for the accumulator. This can cause an error when `records` is an empty array.

The fixed version is:

```javascript
function getTotalUsageMB(records) {
  return records.reduce(
    (total, record) => total + record.dataUsageMB,
    0
  );
}
```

The `0` is used as the initial accumulator value. It also makes the function return `0` when an empty array is provided.

The runnable version is available at:

```text
troubleshooting/getTotalUsageMB.js
```

Run it with:

```bash
node troubleshooting/getTotalUsageMB.js
```

Example output:

```text
Total usage: 8000 MB
```

To help prevent this type of bug in the future, I would use unit tests for empty, single-record, and multiple-record inputs. A linting rule such as `array-callback-return` can also catch callbacks that are expected to return a value but do not.

## Available Commands

Start the backend:

```bash
npm start
```

Start the backend in development mode:

```bash
npm run dev
```

Create one snapshot manually:

```bash
npm run snapshot
```

Start the scheduled snapshot process:

```bash
npm run scheduler
```

Remove snapshots older than 30 days:

```bash
npm run cleanup
```