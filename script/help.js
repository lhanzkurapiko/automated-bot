module.exports = {
  name: "help",
  aliases: ["commands"],
  description: "Show all commands",
  credits: "kurapiko",

  async run({ api, event, commands }) {
    let list = "";

    for (const name of commands.keys()) {
      list += `┄┄「${name}」\n`;
    }

    const message =
`━━━━━━━━━━〔𝙃𝙀𝙇𝙋〕━━━━━━━━━━
${list}━━━━━━━━━━━━━━━━━━━━━
Developer by : ***Lhanz Kurapiko***`;

    api.sendMessage(message, event.threadID, event.messageID);
  }
};
