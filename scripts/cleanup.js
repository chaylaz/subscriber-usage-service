const fs = require("fs");
const path = require("path");

const SNAPSHOT_DIRECTORY = path.join(
  __dirname,
  "..",
  "snapshots"
);

const RETENTION_DAYS = 30;

const SNAPSHOT_FILENAME_PATTERN =
  /^usage_snapshot_(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})\.csv$/;

const getSnapshotDate = (filename) => {
  const match = filename.match(
    SNAPSHOT_FILENAME_PATTERN
  );

  if (!match) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute
  ] = match;

  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+07:00`
  );
};

const cleanupOldSnapshots = async () => {
  try {
    await fs.promises.mkdir(
      SNAPSHOT_DIRECTORY,
      {
        recursive: true
      }
    );

    const files = await fs.promises.readdir(
      SNAPSHOT_DIRECTORY
    );

    const now = new Date();

    const retentionMilliseconds =
      RETENTION_DAYS *
      24 *
      60 *
      60 *
      1000;

    let deletedCount = 0;

    for (const filename of files) {
      const snapshotDate =
        getSnapshotDate(filename);

      if (!snapshotDate) {
        continue;
      }

      const snapshotAge =
        now.getTime() -
        snapshotDate.getTime();

      if (
        snapshotAge >
        retentionMilliseconds
      ) {
        const filePath = path.join(
          SNAPSHOT_DIRECTORY,
          filename
        );

        await fs.promises.unlink(filePath);

        deletedCount += 1;

        console.log(
          `Deleted old snapshot: ${filename}`
        );
      }
    }

    console.log(
      `Cleanup completed. ${deletedCount} snapshot(s) deleted.`
    );
  } catch (error) {
    console.error(
      `Snapshot cleanup failed: ${error.message}`
    );

    process.exitCode = 1;
  }
};

cleanupOldSnapshots();