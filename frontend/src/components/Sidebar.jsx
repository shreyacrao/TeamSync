import { useState } from "react";
import Avatar from "./Avatar";

const Sidebar = ({
  user,
  channels,
  directMessages,
  users,
  activeChannel,
  onSelectChannel,
  onCreateChannel,
  onStartDM,
  onLogout,
  presence,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    onCreateChannel(newChannelName.trim());
    setNewChannelName("");
    setShowCreateForm(false);
  };

  const getDMPartnerName = (dm) => {
    const partner = dm.members.find((m) => m._id !== user._id);
    return partner ? partner.name : "Unknown";
  };

  const getDMPartner = (dm) => dm.members.find((m) => m._id !== user._id);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Avatar name={user.name} color={user.avatarColor} size={40} status="online" />
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user.name}</p>
          <p className="sidebar-user-status">Online</p>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          ⎋
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>CHANNELS</span>
          <button className="add-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
            +
          </button>
        </div>

        {showCreateForm && (
          <form className="create-channel-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="channel-name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              autoFocus
            />
            <button type="submit">Create</button>
          </form>
        )}

        <ul className="channel-list">
          {channels.map((channel) => (
            <li
              key={channel._id}
              className={`channel-item ${
                activeChannel?._id === channel._id ? "active" : ""
              }`}
              onClick={() => onSelectChannel(channel)}
            >
              <span className="channel-hash">#</span> {channel.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>DIRECT MESSAGES</span>
        </div>
        <ul className="channel-list">
          {directMessages.map((dm) => {
            const partner = getDMPartner(dm);
            const isOnline = partner && presence[partner._id] === "online";
            return (
              <li
                key={dm._id}
                className={`channel-item ${
                  activeChannel?._id === dm._id ? "active" : ""
                }`}
                onClick={() => onSelectChannel(dm)}
              >
                <Avatar
                  name={getDMPartnerName(dm)}
                  color={partner?.avatarColor}
                  size={20}
                  status={isOnline ? "online" : "offline"}
                />
                <span className="dm-name">{getDMPartnerName(dm)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>TEAM MEMBERS</span>
        </div>
        <ul className="channel-list">
          {users.map((u) => (
            <li key={u._id} className="channel-item member-item" onClick={() => onStartDM(u._id)}>
              <Avatar
                name={u.name}
                color={u.avatarColor}
                size={20}
                status={presence[u._id] === "online" ? "online" : "offline"}
              />
              <span className="dm-name">{u.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
