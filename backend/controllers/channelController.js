const Channel = require("../models/Channel");
const User = require("../models/User");

// @route GET /api/channels
// Returns all public channels + DMs the user is part of
const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [{ isPrivate: false }, { members: req.user._id }],
    })
      .populate("members", "name email avatarColor status")
      .sort({ createdAt: 1 });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/channels
const createChannel = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    const existing = await Channel.findOne({ name, isDirectMessage: false });
    if (existing) {
      return res.status(400).json({ message: "A channel with that name already exists" });
    }

    const channel = await Channel.create({
      name,
      description,
      isPrivate: !!isPrivate,
      members: [req.user._id],
      createdBy: req.user._id,
    });

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/channels/dm/:userId
// Finds or creates a direct-message channel between logged-in user and target user
const getOrCreateDM = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot start a DM with yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let dm = await Channel.findOne({
      isDirectMessage: true,
      members: { $all: [req.user._id, userId], $size: 2 },
    }).populate("members", "name email avatarColor status");

    if (!dm) {
      dm = await Channel.create({
        name: `dm-${req.user._id}-${userId}`,
        isDirectMessage: true,
        isPrivate: true,
        members: [req.user._id, userId],
        createdBy: req.user._id,
      });
      dm = await dm.populate("members", "name email avatarColor status");
    }

    res.json(dm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/channels/:id/join
const joinChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChannels, createChannel, getOrCreateDM, joinChannel };
