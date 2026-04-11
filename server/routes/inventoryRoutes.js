const express = require("express");
const router = express.Router();
const { getInventory } = require("../controller/inventoryController");
router.get("/inventory", getInventory);

module.exports = router;