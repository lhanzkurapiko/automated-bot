const fs = require("fs");

module.exports.config = {
    name: "myrole",
    version: "2.0.0",
    role: 0,
    credits: "Aro",
    description: "Shows your current role (user, admin, group admin, developer)",
    prefix: false,
    category: "system"
};

module.exports.run = async function({ api, event, Threads, Users }) {
    const { threadID, senderID, messageReply, messageID } = event;
    let targetID = senderID;

    if (messageReply && messageReply.senderID) {
        targetID = messageReply.senderID;
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

    const threadInfo = await Threads.getInfo(threadID);
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

    const name = await Users.getNameUser(targetID);

    const message =
        targetID === senderID
            ? `👋 Hello ${name}!\nYour current role is: ${roleName}\n(Role ID: ${role})`
            : `👤 Name: ${name}\n🎭 Role: ${roleName}\n🆔 Role ID: ${role}`;

    return api.sendMessage(message, threadID, (err, info) => {
        if (!err) {
            api.setMessageReaction(emoji, info.messageID, () => {}, true);
        }
    }, messageID);
};
