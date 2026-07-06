const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Channel = require("../models/Channel");

// Maps userId -> socketId for presence tracking
const onlineUsers = new Map();

const socketHandler = (io) => {
  // Authenticate every socket connection using the JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: no token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error: user not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user._id);
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { status: "online" });
    io.emit("presence:update", { userId, status: "online" });

    // Join all channels the user belongs to, so messages route correctly
    const channels = await Channel.find({
      $or: [{ isPrivate: false }, { members: userId }],
    });
    channels.forEach((channel) => socket.join(String(channel._id)));

    // Client explicitly joins a channel room (e.g. after creating/opening one)
    socket.on("channel:join", (channelId) => {
      socket.join(channelId);
    });

    socket.on("channel:leave", (channelId) => {
      socket.leave(channelId);
    });

    // Handle new message send
    socket.on("message:send", async ({ channelId, text }, callback) => {
      try {
        if (!text || !text.trim()) return;

        const message = await Message.create({
          channel: channelId,
          sender: userId,
          text: text.trim(),
          readBy: [userId],
        });

        const populated = await message.populate("sender", "name email avatarColor");

        io.to(channelId).emit("message:receive", populated);

        if (typeof callback === "function") callback({ success: true });
      } catch (err) {
        if (typeof callback === "function") callback({ success: false, error: err.message });
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ channelId }) => {
      socket.to(channelId).emit("typing:update", {
        channelId,
        userId,
        name: socket.user.name,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ channelId }) => {
      socket.to(channelId).emit("typing:update", {
        channelId,
        userId,
        name: socket.user.name,
        isTyping: false,
      });
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });
      io.emit("presence:update", { userId, status: "offline" });
    });
  });
};

module.exports = socketHandler;
