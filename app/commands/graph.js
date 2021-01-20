const prepareAnswer = require('../utils/prepareAnswer');

async function graph(body, bot, chatId, n = 10) {
  const data = await prepareAnswer.summaryGraph(body, n);

  bot.sendPhoto(chatId, data, {
    reply_markup: {
      inline_keyboard: [[{
        text: 'Delete',
        callback_data: 'Delete graph',
      }]],
    },
  });
}

module.exports = {
  graph,
};
