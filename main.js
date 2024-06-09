const token = "7129500871:AAE55tzqOH-h60FcnU9EfPdRJg93W2J-WU4";
const TelegramBot = require("node-telegram-bot-api");
const FormData = require("form-data");

const bot = new TelegramBot(token, { polling: true });

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
    /input
  `
  );
});

let userData = {};

bot.onText(/\/input/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = { step: "name" };
  bot.sendMessage(chatId, "Please send your name.");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userData[chatId]) {
    return;
  }

  switch (userData[chatId].step) {
    case "name":
      if (/^[a-zA-Z\s]+$/.test(text)) {
        userData[chatId].name = text;
        userData[chatId].step = "region";
        bot.sendMessage(chatId, "Please send your region.");
      } else {
        bot.sendMessage(chatId, "Invalid name. Please send your name.");
      }
      break;
    case "region":
      if (/^[a-zA-Z\s]+$/.test(text)) {
        userData[chatId].region = text;
        userData[chatId].step = "jabatan";
        bot.sendMessage(chatId, "Please send your position (jabatan).");
      } else {
        bot.sendMessage(chatId, "Invalid region. Please send your region.");
      }
      break;
    case "jabatan":
      if (/^[a-zA-Z\s]+$/.test(text)) {
        userData[chatId].jabatan = text;
        userData[chatId].step = "photo";
        bot.sendMessage(chatId, "Please send your photo.");
      } else {
        bot.sendMessage(
          chatId,
          "Invalid jabatan. Please send your position (jabatan)."
        );
      }
      break;
    case "photo":
      if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        const photoFileId = photo.file_id;
        const photoFile = await bot.getFile(photoFileId);
        const photoFileUrl = `https://api.telegram.org/file/bot${token}/${photoFile.file_path}`;

        userData[chatId].photo = photoFileUrl;
        userData[chatId].step = "ktp";
        bot.sendMessage(chatId, "Please send your KTP photo.");
      } else {
        bot.sendMessage(chatId, "Please send a photo.");
      }
      break;
    case "ktp":
      if (msg.photo) {
        const ktpPhoto = msg.photo[msg.photo.length - 1];
        const ktpFileId = ktpPhoto.file_id;
        const ktpFile = await bot.getFile(ktpFileId);
        const ktpFileUrl = `https://api.telegram.org/file/bot${token}/${ktpFile.file_path}`;

        userData[chatId].ktpPhoto = ktpFileUrl;

        const {
          ktpPhoto: ktpUrl,
          photo,
          name,
          region,
          jabatan,
        } = userData[chatId];

        if (ktpUrl && photo && name && region && jabatan) {
          try {
            bot.sendMessage(chatId, "Sedang di proses, harap tunggu...");

            const fetch = (await import("node-fetch")).default; // Menggunakan import

            // Unduh foto KTP
            const ktpResponse = await fetch(ktpUrl);
            if (!ktpResponse.ok) {
              throw new Error(
                `Failed to fetch KTP photo: ${ktpResponse.statusText}`
              );
            }
            const ktpBlob = await ktpResponse.buffer();

            // Unduh foto kedua
            const photoResponse = await fetch(photo);
            if (!photoResponse.ok) {
              throw new Error(
                `Failed to fetch photo: ${photoResponse.statusText}`
              );
            }
            const photoBlob = await photoResponse.buffer();

            const formData = new FormData();
            formData.append("ktp", ktpBlob, "ktp.jpg");
            formData.append("photo", photoBlob, "photo.jpg");
            formData.append("nama", name);
            formData.append("wilayah", region);
            formData.append("jabatan", jabatan);

            const apiUrl = "https://pjbn.upg.ac.id/api/arsipkta/simpan";

            const response = await fetch(apiUrl, {
              method: "POST",
              body: formData,
              headers: { Accept: "application/json" },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            bot.sendMessage(chatId, `Data submitted: ${JSON.stringify(data)}`);
          } catch (error) {
            bot.sendMessage(chatId, "Failed to download photos.");
            console.error("Error downloading or submitting photos:", error);
          } finally {
            delete userData[chatId]; // Pindahkan penghapusan di sini
          }
        } else {
          bot.sendMessage(chatId, "Missing some data, please try again.");
        }
      } else {
        bot.sendMessage(chatId, "Please send a KTP photo.");
      }
      break;
    default:
      bot.sendMessage(chatId, "Type /input to start the process.");
      break;
  }
});

bot.on("polling_error", (error) => {
  console.log(error);
});
