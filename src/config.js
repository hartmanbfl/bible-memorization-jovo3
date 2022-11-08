// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  logging: true,

  intentMap: {
    'AMAZON.StopIntent': 'END',
    'AMAZON.CancelIntent': 'CancelIntent',
    'AMAZON.PauseIntent': 'PauseIntent',
    'AMAZON.ResumeIntent': 'ResumeIntent',
    'AMAZON.NextIntent': 'NextIntent',
    'AMAZON.PreviousIntent': 'PreviousIntent',
    'AMAZON.RepeatIntent': 'RepeatIntent',
    'AMAZON.StartOverIntent': 'StartOverIntent',
    'AMAZON.YesIntent': 'YesIntent',
    'AMAZON.NoIntent': 'NoIntent',
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
