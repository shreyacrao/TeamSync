const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return <div className="typing-indicator-slot" />;

  const names = typingUsers.map((u) => u.name);
  let text;
  if (names.length === 1) text = `${names[0]} is typing...`;
  else if (names.length === 2) text = `${names[0]} and ${names[1]} are typing...`;
  else text = "Several people are typing...";

  return (
    <div className="typing-indicator-slot">
      <span className="typing-indicator">{text}</span>
    </div>
  );
};

export default TypingIndicator;
