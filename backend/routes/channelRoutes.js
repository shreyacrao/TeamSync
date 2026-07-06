const express = require("express");
const {
  getChannels,
  createChannel,
  getOrCreateDM,
  joinChannel,
} = require("../controllers/channelController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getChannels);
router.post("/", createChannel);
router.post("/dm/:userId", getOrCreateDM);
router.post("/:id/join", joinChannel);

module.exports = router;
