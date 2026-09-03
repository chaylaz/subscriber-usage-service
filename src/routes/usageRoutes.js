const express = require("express");

const {
  createUsage,
  getAllUsage
} = require("../controllers/usageController");

const router = express.Router();

router.post("/", createUsage);
router.get("/", getAllUsage);

module.exports = router;