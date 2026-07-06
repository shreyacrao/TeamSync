import { useEffect, useRef } from "react";
import Avatar from "./Avatar";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "Today";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDateLabel = null;

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="empty-state">No messages yet. Say hello 👋</div>
      )}

      {messages.map((msg) => {
        const isOwn = msg.sender._id === currentUserId;
        const dateLabel = formatDateLabel(msg.createdAt);
        const showDateDivider = dateLabel !== lastDateLabel;
        lastDateLabel = dateLabel;

        return (
          <div key={msg._id}>
            {showDateDivider && (
              <div className="date-divider">
                <span>{dateLabel}</span>
              </div>
            )}
            <div className={`message-row ${isOwn ? "own" : ""}`}>
              {!isOwn && (
                <Avatar name={msg.sender.name} color={msg.sender.avatarColor} size={32} />
              )}
              <div className="message-bubble-wrapper">
                {!isOwn && <span className="message-sender">{msg.sender.name}</span>}
                <div className={`message-bubble ${isOwn ? "own" : ""}`}>
                  {msg.text}
                </div>
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
