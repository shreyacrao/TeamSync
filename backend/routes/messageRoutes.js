const express = require("express");
const { getMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/:channelId", getMessages);
router.post("/:channelId", sendMessage);

module.exports = router;
