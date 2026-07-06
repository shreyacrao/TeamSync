const Avatar = ({ name, color, size = 36, status }) => {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      <div
        className="avatar"
        style={{
          backgroundColor: color || "#5B5FEF",
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
      >
        {initials}
      </div>
      {status && <span className={`status-dot status-${status}`} />}
    </div>
  );
};

export default Avatar;
