'use strict';

const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');
const EsvApiClass = require('../services/EsvApiClass');

const esvApiClass = new EsvApiClass();

module.exports = {
  MemoryPlanState: {
    HowManyVersesIntent() {
      console.log(`In MemoryPlanState, HowManyVersesIntent`);
      const verseListStr = this.$user.$data.verseList;
      console.log(`HowManyVersesIntent, verseListStr: ${verseListStr}`);
      const verseListObjArray = JSON.parse(verseListStr);
      const numVerses = verseListObjArray.length;
      this.$speech.addText(`There are ${numVerses} verses currently in your memorization plan.`)

      if (this.$session.$data.keepSeesionOpen) {
        this.$speech.addText(`Whst would you like to do next?`)
        this.$reprompt.addText(`What would you like to do next?`)
        this.ask(this.$speech, this.$reprompt);
      } else {
        this.tell(this.$speech);
      }
    },

    WhichVersesInPlanIntent() {
      console.log(`In MemoryPlanState, WhichVersesInPlanIntent`)

      // Get the verses from the DB
      const verseListStr = this.$user.$data.verseList;
      const verseListObjArray = JSON.parse(verseListStr);

      // Make sure it isn't empty
      if (verseListObjArray.length === 0) {
        this.$speech.addText(`There are currently no verses on your memory list.`)
          .addText('You can add verses to your list by saying, Add a verse to my list.')
          .addText(`What would you like to do now?`)
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      }

      // iterate over the verses
      console.log(`Size of verse list - ${verseListObjArray.length}`);
      this.$speech.addText(`The verses on your current memory list are:`)
      for (let i = 0; i < verseListObjArray.length; i++) {
        const book = verseListObjArray[i].book;
        const chapter = verseListObjArray[i].chapter;
        const startVerse = verseListObjArray[i].startVerse;
        const endVerse = verseListObjArray[i].endVerse;
        this.$speech.addText(`${book} chapter ${chapter} verse ${startVerse}`)
          .addText(Messages.one_sec_pause)
      }
      this.$speech.addText(`Would you like to work on memorizing any of these verses?`);
      this.$reprompt.addText(`Would you like to work on memorizing any of these verses?`);
      this.ask(this.$speech, this.$reprompt);
    },

    YesIntent() {
      console.log(`In MemoryPlanState, YesIntent`)
      //this.$speech.addText('Which verse would you like to memorize?')
      //this.$reprompt.addText('Which verse would you like to memorize?')
      this.$speech.addText('Ok, I will choose a verse to work on.');

      //TDB create state to get the verse
//      this.followUpState('PracticeModeState').ask(this.$speech, this.$reprompt);
      return this.toStateIntent('PracticeModeState', 'PracticeAVerseIntent');

    },
    NoIntent() {
      console.log(`In MemoryPlanState, NoIntent`)
      if (this.$session.$data.keepSessionOpen) {
        this.$speech.addText(`What would you like to do now?`);
        this.$reprompt.addText(`What would you like to do now?`)
          .addText('Remember, to get a list of the different options, just say, list options.');
        this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      } else {
        this.toStatelessIntent('END');
      }
    },
    Unhandled() {
      console.log(`In MemoryPlanState Unhandled.`);
      this.toStatelessIntent('END');
    }

  },
}