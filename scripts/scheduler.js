require("dotenv").config();

const cron = require("node-cron");

const {
  createUsageSnapshot
} = require("./snapshot");

const SNAPSHOT_CRON_EXPRESSION =
  "0 8,12,15 * * *";

const TIMEZONE = "Asia/Jakarta";

const runSnapshot = async () => {
  const currentTime = new Date().toLocaleString(
    "en-GB",
    {
      timeZone: TIMEZONE
    }
  );

  console.log(
    `[${currentTime} WIB] Running scheduled usage snapshot...`
  );

  try {
    await createUsageSnapshot();
  } catch (error) {
    console.error(
      `Scheduled snapshot failed: ${error.message}`
    );
  }
};

cron.schedule(
  SNAPSHOT_CRON_EXPRESSION,
  runSnapshot,
  {
    timezone: TIMEZONE,
    noOverlap: true,
    name: "usage-snapshot"
  }
);

console.log("Usage snapshot scheduler started.");
console.log(
  "Schedule: 08:00, 12:00, and 15:00 WIB every day."
);
console.log(`Timezone: ${TIMEZONE}`);