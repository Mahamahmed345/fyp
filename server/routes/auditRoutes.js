const express = require("express");
const audit = require("../controller/auditController");

const router = express.Router();

router.get("/audit-summary", audit.getAuditSummary);
router.get("/anomalies", audit.getAnomalies);
router.post("/audit-report", audit.generateAuditReport);

module.exports = router;