const fs = require("fs");

module.exports.config = {
    name: "role",
    version: "1.1.0",
    role: 0,
    credits: "Ari",
    description: "Shows your or another user's role (supports reply, mention, or UID)",
    prefix: false,
    category: "system"
};

module.exports.run = async function({ api, event, args, Threads, Users }) {
    const { threadID, senderID, messageReply, mentions, messageID } = event;
    let targetID = senderID;

    if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
    } else if (messageReply?.senderID) {
        targetID = messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
    }

    const configPath = process.cwd() + "/config.json";
    const devPath = process.cwd() + "/dev.json";

    let config = [];
    let dev = [];

    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath));
    if (fs.existsSync(devPath)) dev = JSON.parse(fs.readFileSync(devPath));

    let role = 0;
    let roleName = "Normal User 👤";
    let emoji = "👤";

    let threadInfo = null;
    try {
        if (Threads && typeof Threads.getInfo === "function") {
            threadInfo = await Threads.getInfo(threadID);
        } else {
            threadInfo = await api.getThreadInfo(threadID);
        }
    } catch (err) {
        console.warn("⚠️ Warning: Unable to get thread info, fallback to defaults.");
    }

    const isGroupAdmin = threadInfo?.adminIDs?.some(e => e.id == targetID);
    const isBotAdmin = config?.[0]?.admin?.includes(targetID);
    const isDev = config?.[0]?.masterKey?.admin?.includes(targetID) || dev?.includes(targetID);

    if (isDev) {
        role = 3;
        roleName = "Developer 👑";
        emoji = "👑";
    } else if (isBotAdmin) {
        role = 1;
        roleName = "Bot Admin 🔧";
        emoji = "🔧";
    } else if (isGroupAdmin) {
        role = 2;
        roleName = "Group Admin 🧩";
        emoji = "🧩";
    }

    let name;
    try {
        name = await Users.getNameUser(targetID);
    } catch {
        name = `Unknown User (${targetID})`;
    }

    const message =
        targetID === senderID
            ? `👋 Hello ${name}!\nYour current role is: ${roleName}\n(Role ID: ${role})`
            : `👤 Name: ${name}\n🎭 Role: ${roleName}\n🆔 Role ID: ${role}\n📩 Requested by: ${await Users.getNameUser(senderID)}`;
    
    return api.sendMessage(message, threadID, (err, info) => {
        if (!err) api.setMessageReaction(emoji, info.messageID, () => {}, true);
    }, messageID);
};
