// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  logging: true,

  intentMap: {
    'AMAZON.StopIntent': 'END',
    'AMAZON.HelpIntent': 'HelpIntent'
  },

  db: {
//    FileDb: {
//      pathToFile: '../db/db.json',
//    },
    DynamoDb: {
      tableName: 'bibleTrainer',
    }
  },
};
