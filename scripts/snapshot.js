require("dotenv").config();

const fs = require("fs");
const path = require("path");

const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:3000";

const SNAPSHOT_DIRECTORY = path.join(
  __dirname,
  "..",
  "snapshots"
);

const CSV_HEADERS = [
  "subscriberId",
  "callMinutes",
  "smsCount",
  "dataUsageMB",
  "timestamp"
];

const getWibDateParts = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  });

  const parts = formatter.formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
};

const createSnapshotFilename = () => {
  const {
    year,
    month,
    day,
    hour,
    minute
  } = getWibDateParts();

  return `usage_snapshot_${year}-${month}-${day}_${hour}-${minute}.csv`;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes("\"") ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
};

const convertRecordsToCsv = (records) => {
  const headerRow = CSV_HEADERS.join(",");

  const dataRows = records.map((record) =>
    CSV_HEADERS
      .map((header) => escapeCsvValue(record[header]))
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
};

const getUsageRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/usage`);

  if (!response.ok) {
    throw new Error(
      `GET /usage failed with HTTP status ${response.status}.`
    );
  }

  const responseBody = await response.json();

  if (Array.isArray(responseBody)) {
    return responseBody;
  }

  if (Array.isArray(responseBody.data)) {
    return responseBody.data;
  }

  throw new Error(
    "Unexpected response format from GET /usage."
  );
};

const createUsageSnapshot = async () => {
  const usageRecords = await getUsageRecords();

  await fs.promises.mkdir(SNAPSHOT_DIRECTORY, {
    recursive: true
  });

  const filename = createSnapshotFilename();

  const filePath = path.join(
    SNAPSHOT_DIRECTORY,
    filename
  );

  const csvContent = convertRecordsToCsv(
    usageRecords
  );

  await fs.promises.writeFile(
    filePath,
    csvContent,
    "utf8"
  );

  console.log(
    `Snapshot saved: ${filename} (${usageRecords.length} records)`
  );

  return filePath;
};

if (require.main === module) {
  createUsageSnapshot().catch((error) => {
    console.error(
      `Failed to create usage snapshot: ${error.message}`
    );

    process.exitCode = 1;
  });
}

module.exports = {
  createUsageSnapshot
};