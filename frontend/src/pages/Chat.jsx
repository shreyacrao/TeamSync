import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import TypingIndicator from "../components/TypingIndicator";

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);

  const publicChannels = channels.filter((c) => !c.isDirectMessage);
  const directMessages = channels.filter((c) => c.isDirectMessage);

  // Initial data load
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [channelsRes, usersRes] = await Promise.all([
          api.get("/channels"),
          api.get("/users"),
        ]);
        setChannels(channelsRes.data);
        setUsers(usersRes.data);

        const initialPresence = {};
        usersRes.data.forEach((u) => {
          initialPresence[u._id] = u.status;
        });
        setPresence(initialPresence);

        if (channelsRes.data.length > 0) {
          const firstPublic = channelsRes.data.find((c) => !c.isDirectMessage);
          setActiveChannel(firstPublic || channelsRes.data[0]);
        } else {
          // No channels yet: create a default "general" channel
          const { data } = await api.post("/channels", { name: "general" });
          setChannels([data]);
          setActiveChannel(data);
        }
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load messages when active channel changes
  useEffect(() => {
    if (!activeChannel || !socket) return;

    socket.emit("channel:join", activeChannel._id);

    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${activeChannel._id}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
    setTypingUsers([]);
  }, [activeChannel, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (activeChannel && message.channel === activeChannel._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handlePresence = ({ userId, status }) => {
      setPresence((prev) => ({ ...prev, [userId]: status }));
    };

    const handleTyping = ({ channelId, userId, name, isTyping }) => {
      if (!activeChannel || channelId !== activeChannel._id) return;
      if (userId === user._id) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, name }];
        }
        return prev.filter((u) => u.userId !== userId);
      });
    };

    socket.on("message:receive", handleReceive);
    socket.on("presence:update", handlePresence);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("presence:update", handlePresence);
      socket.off("typing:update", handleTyping);
    };
  }, [socket, activeChannel, user._id]);

  const handleSendMessage = useCallback(
    (text) => {
      if (!socket || !activeChannel) return;
      socket.emit("message:send", { channelId: activeChannel._id, text });
    },
    [socket, activeChannel]
  );

  const handleCreateChannel = async (name) => {
    try {
      const { data } = await api.post("/channels", { name });
      setChannels((prev) => [...prev, data]);
      setActiveChannel(data);
    } catch (err) {
      alert(err.response?.data?.message || "Could not create channel");
    }
  };

  const handleStartDM = async (targetUserId) => {
    try {
      const { data } = await api.post(`/channels/dm/${targetUserId}`);
      setChannels((prev) => {
        const exists = prev.find((c) => c._id === data._id);
        return exists ? prev : [...prev, data];
      });
      setActiveChannel(data);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start DM");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getChannelTitle = () => {
    if (!activeChannel) return "";
    if (activeChannel.isDirectMessage) {
      const partner = activeChannel.members.find((m) => m._id !== user._id);
      return partner ? partner.name : "Direct Message";
    }
    return `# ${activeChannel.name}`;
  };

  if (!user) return null;

  return (
    <div className="chat-page">
      <Sidebar
        user={user}
        channels={publicChannels}
        directMessages={directMessages}
        users={users}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        onCreateChannel={handleCreateChannel}
        onStartDM={handleStartDM}
        onLogout={handleLogout}
        presence={presence}
      />

      <main className="chat-main">
        <header className="chat-header">
          <h2>{getChannelTitle()}</h2>
          <span className={`connection-badge ${connected ? "connected" : "disconnected"}`}>
            {connected ? "Connected" : "Connecting..."}
          </span>
        </header>

        <MessageList messages={messages} currentUserId={user._id} />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          onSend={handleSendMessage}
          onTypingStart={() =>
            activeChannel && socket?.emit("typing:start", { channelId: activeChannel._id })
          }
          onTypingStop={() =>
            activeChannel && socket?.emit("typing:stop", { channelId: activeChannel._id })
          }
        />
      </main>
    </div>
  );
};

export default Chat;
