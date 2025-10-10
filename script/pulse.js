module.exports.config = {
    name: "pulse",
    version: "2.0.0",
    role: 0,
    credits: "Ari",
    description: "Monitor user and group activity in real-time without external files",
    prefix: false,
    category: "utility"
};

const activityData = {
    users: {},
    groups: {}
};

module.exports.handleEvent = function({ event }) {
    const { threadID, senderID } = event;
    if (!threadID || !senderID) return;

    if (!activityData.users[senderID]) activityData.users[senderID] = { messages: 0 };
    activityData.users[senderID].messages++;

    if (!activityData.groups[threadID]) activityData.groups[threadID] = { messages: 0 };
    activityData.groups[threadID].messages++;
};

module.exports.run = async function({ api, event, args, Users }) {
    const { threadID, senderID, messageReply, mentions, messageID } = event;
    let targetID = senderID;
    let isGroupCheck = false;
    let isTop = false;

    if (args[0]?.toLowerCase() === "group") isGroupCheck = true;
    if (args[0]?.toLowerCase() === "top") isTop = true;
    else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
    } else if (messageReply?.senderID) {
        targetID = messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
    }

    if (isTop) {
        const topUsers = Object.entries(activityData.users)
            .sort((a, b) => b[1].messages - a[1].messages)
            .slice(0, 5);

        if (topUsers.length === 0)
            return api.sendMessage("📊 Walang data pa! Magpadala muna ng mga messages.", threadID, messageID);

        let msg = "💥 **Top 5 Most Active Users (Pulse Monitor)** 💥\n\n";
        const medals = ["🥇", "🥈", "🥉", "🏅", "🎖️"];
        for (let i = 0; i < topUsers.length; i++) {
            const [uid, info] = topUsers[i];
            const name = await Users.getNameUser(uid).catch(() => uid);
            msg += `${medals[i]} ${name}: ${info.messages} messages\n`;
        }

        return api.sendMessage(msg, threadID, messageID);
    }

    if (isGroupCheck) {
        const groupCount = activityData.groups[threadID]?.messages || 0;
        return api.sendMessage(
            `📡 Pulse Report for this Group:\n💬 Total messages: ${groupCount}\n🧩 Thread ID: ${threadID}`,
            threadID,
            messageID
        );
    }

    const userData = activityData.users[targetID];
    let name;
    try {
        name = await Users.getNameUser(targetID);
    } catch {
        name = `Unknown (${targetID})`;
    }

    const msgCount = userData?.messages || 0;
    const selfCheck = targetID === senderID;

    const message = selfCheck
        ? `👋 Hey ${name}!\nYour chat pulse shows ${msgCount} total messages sent. ⚡`
        : `📊 Pulse Report:\n👤 Name: ${name}\n💬 Messages Sent: ${msgCount}`;

    return api.sendMessage(message, threadID, messageID);
};
