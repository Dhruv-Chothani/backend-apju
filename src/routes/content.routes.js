const express = require("express");
const router = express.Router();

const {
  addContent,
  getAllContent,
  getHomeContent,
} = require("../controllers/content.controller");

router.post("/add", addContent);
router.get("/all", getAllContent);
router.get("/home", getHomeContent);

module.exports = router; // ✅ VERY IMPORTANT
