const token = "7129500871:AAE55tzqOH-h60FcnU9EfPdRJg93W2J-WU4";
const TelegramBot = require("node-telegram-bot-api");
const request = require("@cypress/request");
const bot = new TelegramBot(token, { polling: true });
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Yayandev Bot Running");
});

app.listen(3000, () => {
  console.log("Running on port 3000");

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "Welcome to YayanDev Bot!, Type /help to get started"
    );
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `
      Commands: 
      /start
      /help
      /about
      /github
      /telegram
      /instagram
      /tiktok
      /whatsapp
      /website
      /search {query}
      /audio
    `
    );
  });

  bot.onText(/\/about/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "This bot was created by YayanDev");
  });

  bot.onText(/\/github/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://github.com/yayandev");
  });

  bot.onText(/\/telegram/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://t.me/yayandev_bot");
  });

  bot.onText(/\/instagram/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://instagram.com/yayan.dev");
  });

  bot.onText(/\/tiktok/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://tiktok.com/@yayandev");
  });

  bot.onText(/\/whatsapp/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://wa.me/6283873614764");
  });

  bot.onText(/\/website/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "https://yayandev.my.id");
  });

  bot.onText(/\/search (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    //   cari jawaban dari google
    const url = `https://www.google.com/search?q=${resp.replace(/ /g, "%20")}`;

    bot.sendMessage(chatId, url);
  });

  bot.onText(/\/audio/, function onAudioText(msg) {
    const url =
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg";
    const audio = request(url);
    bot.sendAudio(msg.chat.id, audio);
  });
});
