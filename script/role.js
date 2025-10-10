module.exports.config = {
    name: "role",
    version: "2.0.0",
    role: 0,
    author: "ari",
    description: "Check your role or the role of the user you reply to.",
    category: "system",
    cooldowns: 3
};

module.exports.run = async function({ api, event }) {
    const { senderID, threadID, messageID, messageReply } = event;

    const targetID = messageReply ? messageReply.senderID : senderID;

    const adminList = global.GoatBot?.config?.ADMINBOT || global.config?.ADMINBOT || [];
    const ownerList = global.GoatBot?.config?.OWNERBOT || global.config?.OWNERBOT || [];
    const operatorList = global.GoatBot?.config?.OPERATOR || [];

    let role = 0; 
    if (ownerList.includes(targetID)) role = 3;
    else if (operatorList.includes(targetID)) role = 2;
    else if (adminList.includes(targetID)) role = 1;

    let roleName;
    switch (role) {
        case 0: roleName = "👤 Normal User (role: 0)"; break;
        case 1: roleName = "🛠️ Admin (role: 1)"; break;
        case 2: roleName = "⚙️ Operator / Moderator (role: 2)"; break;
        case 3: roleName = "👑 Developer / Owner (role: 3)"; break;
        case 4: roleName = "💻 System Command (role: 4)"; break;
        default: roleName = "❓ Unknown Role"; break;
    }

    let name = "You";
    if (messageReply) {
        try {
            const info = await api.getUserInfo(targetID);
            name = info[targetID]?.name || "Unknown User";
        } catch {
            name = "Unknown User";
        }
    }

    api.sendMessage(
        `📊 ${messageReply ? `${name}'s` : "Your"} current role level: ${roleName}`,
        threadID,
        messageID
    );
};
