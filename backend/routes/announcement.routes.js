const express = require("express");
const router = express.Router();
const announcements = require("../controllers/announcement.controller.js");
const { verifyToken } = require("../middleware/auth.middleware"); // Assuming auth middleware exists

// Create a new Announcement
router.post("/", verifyToken, announcements.create);

// Retrieve all Announcements
router.get("/", verifyToken, announcements.findAll);

// Delete an Announcement with id
router.delete("/:id", verifyToken, announcements.delete);

module.exports = router;
