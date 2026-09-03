const usageRecords = require("../data/usageStore");

const createUsage = (req, res) => {
  const {
    subscriberId,
    callMinutes,
    smsCount,
    dataUsageMB
  } = req.body;

  const errors = [];

  if (
    typeof subscriberId !== "string" ||
    subscriberId.trim() === ""
  ) {
    errors.push(
      "subscriberId is required and must be a non-empty string."
    );
  }

  if (
    typeof callMinutes !== "number" ||
    !Number.isFinite(callMinutes) ||
    callMinutes < 0
  ) {
    errors.push(
      "callMinutes is required and must be a non-negative number."
    );
  }

  if (
    typeof smsCount !== "number" ||
    !Number.isInteger(smsCount) ||
    smsCount < 0
  ) {
    errors.push(
      "smsCount is required and must be a non-negative integer."
    );
  }

  if (
    typeof dataUsageMB !== "number" ||
    !Number.isFinite(dataUsageMB) ||
    dataUsageMB < 0
  ) {
    errors.push(
      "dataUsageMB is required and must be a non-negative number."
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors
    });
  }

  const usageRecord = {
    subscriberId: subscriberId.trim(),
    callMinutes,
    smsCount,
    dataUsageMB,
    timestamp: new Date().toISOString()
  };

  usageRecords.push(usageRecord);

  return res.status(201).json({
    message: "Usage record created successfully.",
    data: usageRecord
  });
};

const getAllUsage = (req, res) => {
  return res.status(200).json({
    count: usageRecords.length,
    data: usageRecords
  });
};

module.exports = {
  createUsage,
  getAllUsage
};