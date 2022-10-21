'use strict';
const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { DynamoDb } = require('jovo-db-dynamodb');

const Messages = require('./helpers/Messages');

console.log('This template uses an outdated version of the Jovo Framework. We strongly recommend upgrading to Jovo v4. Learn more here: https://www.jovo.tech/docs/migration-from-v3');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  //  new FileDb(),
  new DynamoDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler(
  require('./handlers/ListenToVerseState'),
  require('./handlers/GetActivityState'),
  require('./handlers/MemorizeVerseState'),
  require('./handlers/MemoryPlanState'),
  require('./handlers/PracticeModeState'),
  require('./handlers/AlexaAudioPlayer'),

  {
    NEW_USER() {
      console.log(`New user identified.`);
      // who is this?
      //    if (this.isAlexaSkill()) {
      // Is this a voice profile user?
      //      var alexaUser = this.$alexaSkill.$user.getPersonId();
      //    }
      //    console.log(`New user: ${alexaUser}`);

      // Mark this person as the active user in the database
      //    this.$user.$data.activeUserId = alexaUser;
      //   this.$user.$data.activeUserIdx = personIdx;

    },

    ON_REQUEST() {
      var theIntent = this.$request.getIntentName();
      var theState = this.$request.getState();
      console.log(`ON_REQUEST: Intent-> ${theIntent}, State-> ${theState}`);
    },

    async NEW_SESSION() {
      console.log(`In global state, NEW_SESSION`);
      await initializeSkill.call(this);
    },

    LAUNCH() {
      console.log(`LAUNCH Intent`);
      this.$session.$data.keepSessionOpen = true;
      this.$speech.addText('Welcome to the Bible Trainer.')
        .addText('What would you like to do today?')
        .addText('To get a list of options, just say, list options.');

      this.$reprompt.addText('To get a list of options, just say, list options.');

      return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
    },

    HelpIntent() {
      this.$speech.addText(`The Bible Trainer Skill is designed to help memorize scripture.`)
        .addText(`You can maintain a list of verses that you want to work on, and Bible Trainer will read `)
        .addText(`them segment by segment to help get the verses into your memory.`)
        .addText(`Here are some commands that you can use:`)
        .addText(`Review my plan.  This will give a list of the verses currently on the memory plan.`)
        .addText(Messages.one_sec_pause)
        .addText(`Add a verse to my plan.  This will add a verse to the database of verses.`)
        .addText(` Note that you can also say the specific verse like, add John chapter 3 verse 16 to my plan.`)
        .addText(Messages.one_sec_pause)
        .addText(`Remove a verse from my plan.  This will remove a verse from the database of verses.`)
        .addText(Messages.one_sec_pause)
        .addText(`Practice a verse.  Alexa will choose a verse from your plan, giving priority to verses with low memory scores.`)
        .addText(Messages.one_sec_pause)
        .addText(`Listen to a verse.  This will read a verse with a natural human voice.`)
        .addText(`You can also simply say, Listen to John chapter 3 verse 16.`)
      return this.tell(this.$speech);
    },

    // Add or remove verses from the memory plan
    AddVerseToPlanIntent() {
      const book = this.$inputs.book.value.toLowerCase();
      const chapter = this.$inputs.chapter.value;
      const verse = this.$inputs.verse.value;

      // check if verse is already on the plan
      const verseListStr = this.$user.$data.verseList;
      const verseListObj = JSON.parse(verseListStr);
      let idxToAdd = -1;
      for (let i = 0; i < verseListObj.length; i++) {
        if (verseListObj[i].book === book && verseListObj[i].chapter === chapter
          && verseListObj[i].startVerse === verse) {
          // this is a match, we shouldn't re-add it 
          console.log(`We have a match for ${book} ${chapter}:${verse}`);
          idxToAdd = i;
          break;
        }
      }
      if (idxToAdd > -1) {
        this.$speech.addText(`This verse is already on your list.`)
      } else {
        const newObj = {
          book: book,
          chapter: chapter,
          startVerse: verse,
          endVerse: verse
        }
        verseListObj.push(newObj);
        console.log(`List after adding: ${JSON.stringify(verseListObj, null, 2)}`);
        this.$user.$data.verseList = JSON.stringify(verseListObj);
        this.$speech.addText(`${book} ${chapter} verse ${verse} was added to your list.`);
      }
      if (this.$session.$data.keepSessionOpen) {
        this.$speech.addText(`What would you like to do now?`);
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      } else {
        return this.tell(this.$speech);
      }
    },
    RemoveVerseFromPlanIntent() {
      const book = this.$inputs.book.value.toLowerCase();
      const chapter = this.$inputs.chapter.value;
      const verse = this.$inputs.verse.value;

      // check if verse is on the plan
      const verseListStr = this.$user.$data.verseList;
      const verseListObj = JSON.parse(verseListStr);
      let idxToRemove = -1;
      for (let i = 0; i < verseListObj.length; i++) {
        console.log(`Comparing ${verseListObj[i].book} ${verseListObj[i].chapter}:${verseListObj[i].startVerse}`
          + ` to ${book} ${chapter}:${verse}.`);
        if (verseListObj[i].book === book && verseListObj[i].chapter === chapter
          && verseListObj[i].startVerse === verse) {
          // this is a match, we can remove it
          console.log(`We have a match for ${book} ${chapter}:${verse}`);
          idxToRemove = i;
          break;
        } else {
          verseListObj[i].book === book ? console.log(`book match`) : console.log(`book no match`);
          verseListObj[i].chapter === chapter ? console.log(`chapter match`) : console.log(`chapter no match`);
          verseListObj[i].startVerse === verse ? console.log(`verse match`) : console.log(`verse no match`);
        }
      }
      if (idxToRemove > -1) {
        verseListObj.splice(idxToRemove, 1);
        this.$user.$data.verseList = JSON.stringify(verseListObj);
        this.$speech.addText(`${book} ${chapter} verse ${verse} was removed from your list.`);
      } else {
        this.$speech.addText(`I couldn't find this verse on your list.`);
      }
      if (this.$session.$data.keepSessionOpen) {
        this.$speech.addText(`What would you like to do now?`);
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      } else {
        return this.tell(this.$speech);
      }
    },

    // Memorize a verse (beta) - this only works with short verses
    PracticeSayingVerseIntent() {
      console.log(`GlobalState, PracticeSayingVerseIntent`);
      return this.toStateIntent('MemorizeVerseState', 'MemorizeVerseIntent');
    },

    // Memorize a verse by the verse building gradually
    PracticeAVerseIntent() {
      console.log(`GlobalState, PracticeAVerseIntent`);
      return this.toStateIntent('PracticeModeState', 'PracticeAVerseIntent');
    },
    MemorizeAVerseIntent() {
      console.log(`GlobalState, MemorizeAVerseIntent`);
      return this.toStateIntent('GetActivityState', 'MemorizeAVerseIntent'); 
    },
    ReadVersesWithPausesIntent() {
      console.log(`GlobalState, ReadVersesWithPausesIntent`);
      return this.toStateIntent('GetActivityState', 'ReadVersesWithPausesIntent');
    },

    WhichVersesInPlanIntent() {
      return this.toStateIntent('MemoryPlanState', 'WhichVersesInPlanIntent');
    },

    HowManyVersesIntent() {
      return this.toStateIntent('MemoryPlanState', 'HowManyVersesIntent');
    },

    // Global Intent to get book, chapter and verse
    GetBookChapterVerseIntent() {
      const book = this.$inputs.book.value.toLowerCase();
      const chapter = this.$inputs.chapter.value;
      const verse = this.$inputs.verse.value;
      const route = this.getRoute();
      const state = route.state;

      this.$data.book = book;
      this.$data.chapter = chapter;
      this.$data.startVerse = verse;

      // save to session
      this.$session.$data.currentBook = book;
      this.$session.$data.currentChapter = chapter;
      this.$session.$data.currentStartVerse = verse;

      this.$data.practiceMode = true;
      if (state === 'ListenToVerseState') {
        return this.toStateIntent(state, 'ReadSpecificVerseIntent')
      } else if (state === 'PracticeModeState') {
        return this.toStateIntent(state, 'ReadVersesWithPausesIntent')
      } else {
        console.log(`Unknown state.`)
      }
    },

    StopIntent() {
      this.$speech.addText(`Goodbye.`)
      this.tell(this.$speech);
    },
    END() {
      this.$speech.addText(`Goodbye.`)
      this.tell(this.$speech);
    },

    Unhandled() {
      console.log('IN GLOBAL UNHANDLED INTENT HANDLER');
    }
  });

async function initializeSkill() {
  console.log(`In global state, initializeSkill()`);

  // init DB if verse list is empty
  if (this.$user.$data.verseList === null) {

    this.$user.$data.verseList = `[]`;
  }
}

module.exports.app = app;
