'use strict';
const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const Spreadsheet = require('./services/GoogleSpreadsheetService');

console.log('This template uses an outdated version of the Jovo Framework. We strongly recommend upgrading to Jovo v4. Learn more here: https://www.jovo.tech/docs/migration-from-v3');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler(
  require('./handlers/BibleVerseIntents'),  
  require('./handlers/GetActivityState'),
  require('./handlers/MemorizeVerseState'),

{
  NEW_USER() {
    console.log(`New user identified.`);
  },

  ON_REQUEST() {
    var theIntent = this.$request.getIntentName();
    var theState = this.$request.getState();
    console.log(`ON_REQUEST: Intent-> ${theIntent}, State-> ${theState}`);
  },

  async NEW_SESSION() {
    // Setup the Google Spreadsheet
    await initializeSkill.call(this);
  },

  LAUNCH() {
    console.log(`LAUNCH Intent`);
    this.$speech.addText('Welcome to the Bible Trainer Alexa Skill.')
      .addText('What would you like to do today?')
      .addText('To get a list of options, just say, list options.');

    this.$reprompt.addText('To get a list of options, just say, list options.');

    return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
  },

  HelpIntent()
  {
    this.tell('Please tell the developer that the Help Intent needs to be implemented');
  },

  // Memorize a verse
  MemorizeVerseIntent() {
    return this.toStateIntent('MemorizeVerseState', 'MemorizeVerseIntent');
  },

  Unhandled() {
    console.log('IN GLOBAL UNHANDLED INTENT HANDLER');
  }
});

async function initializeSkill() {
  // Get data from the Google Sheet
  await Spreadsheet.accessSpreadsheet();
  await Spreadsheet.loadVerses();
}

module.exports.app = app;
