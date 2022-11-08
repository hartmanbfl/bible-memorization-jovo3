'use strict';

const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');
const EsvApiClass = require('../services/EsvApiClass');
const BibleUtilities = require('../helpers/BibleUtilities');

const esvApiClass = new EsvApiClass();

module.exports = {
  MemoryPlanState: {
    HowManyVersesIntent() {
      console.log(`In MemoryPlanState, HowManyVersesIntent`);
      const verseListStr = this.$user.$data.verseList;
      console.log(`HowManyVersesIntent, verseListStr: ${verseListStr}`);
      const verseListObjArray = JSON.parse(verseListStr);
      const numVerses = verseListObjArray.length;
      if (numVerses === 1) {
        this.$speech.addText(`There is ${numVerses} verse currently in your memory plan.`)
      } else {
        this.$speech.addText(`There are ${numVerses} verses currently in your memory plan.`)
      }

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
      const numVerses = verseListObjArray.length;

      // Make sure it isn't empty
      if (numVerses === 0) {
        this.$speech.addText(`There are currently no verses on your memory plan.`)
          .addText('You can add verses to your plan by saying, Add a verse to my memory plan.')
          .addText(`What would you like to do now?`)
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      }

      // iterate over the verses
      console.log(`Size of verse list - ${numVerses}`);
      if (numVerses === 1) {
        this.$speech.addText(`You have ${numVerses} verse in your memory plan.`)
          .addText(`The verse currently on your plan is:`)
      } else {
        this.$speech.addText(`You have ${numVerses} verses in your memory plan.`)
          .addText(`The verses currently on your plan are:`)
      }
      for (let i = 0; i < numVerses; i++) {
        const book = verseListObjArray[i].book;
        const chapter = verseListObjArray[i].chapter;
        const startVerse = verseListObjArray[i].startVerse;
        const endVerse = verseListObjArray[i].endVerse;
        if (i > 0 && i === (numVerses - 1)) {
          this.$speech.addText(`and `)
            .addText(`${book} chapter ${chapter} verse ${startVerse}.`)
            .addText(Messages.one_sec_pause)
        } else {
          this.$speech.addText(`${book} chapter ${chapter} verse ${startVerse}, `)
        }
      }
      if (numVerses > 1) {
        this.$speech.addText(`Would you like to work on memorizing any of these verses?`);
        this.$reprompt.addText(`Would you like to work on memorizing any of these verses?`);
      } else {
        this.$speech.addText(`Would you like to work on memorizing this verse?`);
        this.$reprompt.addText(`Would you like to work on memorizing this verse?`);
      }
      this.ask(this.$speech, this.$reprompt);
    },

    YesIntent() {
      console.log(`In MemoryPlanState, YesIntent`)

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