const Message = require("../models/Message");
const Channel = require("../models/Channel");

// @route GET /api/messages/:channelId
const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const messages = await Message.find({ channel: channelId })
      .populate("sender", "name email avatarColor")
      .sort({ createdAt: 1 })
      .limit(200);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/messages/:channelId
// (Primary send path is via Socket.io; this REST endpoint is a fallback / for testing)
const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text cannot be empty" });
    }

    const message = await Message.create({
      channel: channelId,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    const populated = await message.populate("sender", "name email avatarColor");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
