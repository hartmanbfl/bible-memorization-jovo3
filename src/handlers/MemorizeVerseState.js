'use strict';

const { Log } = require('jovo-framework');
const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');
const EsvApiClass = require('../services/EsvApiClass');

const esvApiClass = new EsvApiClass();

module.exports = {
  MemorizeVerseState: {
    async MemorizeVerseIntent() {
      const book = this.$inputs.book.value;
      const chapter = this.$inputs.chapter.value;
      const verse = this.$inputs.verse.value;
      console.log(`MemorizeVerseIntent: book->${book}, chapter->${chapter}, verse->${verse}`)

      // Look up the verse
      const passage = await esvApiClass.readPassageFromESVApi(book, chapter, verse, verse); 
      console.log(`Got passage: ${passage}`);

      this.$speech
        .addText(`Ok, let\'s work on memorizing ${book} ${chapter} verse ${verse}.`)
        .addText(Messages.prosodyRate90Msg)
        .addText(Messages.one_sec_pause)
        .addText(`${passage}.`)
        .addText(Messages.endProsodyMsg)
        .addText(Messages.one_sec_pause)
        .addText(`Ok, now we'll hear it one more time a bit slower.`)
        .addText(`${book} chapter ${chapter} verse ${verse}.`)
        .addText(Messages.prosodyRate80Msg)
        .addText(`${passage}`)
        .addText(Messages.endProsodyMsg)
        .addText(`Ok, now it is your turn to say the verse.  Go ahead and see if you can say it.`)
        .addText(`Please start by saying, the verse is.`)

      // Save the verse as a session variable
      this.$session.$data.currentBook = book;
      this.$session.$data.currentChapter = chapter;
      this.$session.$data.currentStartVerse = verse;
      this.$session.$data.currentPassage = passage;

      this.ask(this.$speech);
    },

    ListenToUserReciteTheVerseIntent() {
      const passage = this.$inputs.passage.value;
      console.log(`The user said: ${passage}`);

      // how similar was this to the actual verse?
      const verseWithoutPunct = Utilities.removePunctuation(this.$session.$data.currentPassage);
      const howSimilar = Utilities.similarity(verseWithoutPunct.toLowerCase(), passage.toLowerCase());

      console.log(`Your score was ${howSimilar*100} percent.`)

      if (howSimilar == 1) {
        this.$speech.addText([`That was perfect!`, `Great job!`, `Perfect!`]);
      } else if (howSimilar > .9) {
        this.$speech.addText([`Wow, great job!`, `Looks like you know this one well.`, `Good job.`]);
      } else if (howSimilar > .7) {
        this.$speech.addText(`Ok, that wasn't bad, but keep practicing it.`);
      } else {
        this.$speech.addText(`You need to work on this one a bit more.`);
      } 
      this.$speech.addText(`Would you like to practice this one again?`);
      this .$reprompt.addText(`Would you like to practice this one again?`);
      this.followUpState('RepeatVerseState').ask(this.$speech, this.$reprompt);

    },

    Unhandled() {
      // this may trigger when the user took too long
      console.log(`In Unhandled handler of the MemorizeVerseState`);
      if (this.$inputs.$data != null) {
        console.log(`The last thing the user said was: ${this.$inputs.$data.passage.value}`);
      }
      this.$speech.addText(`Sorry, I didn't catch that.  Please try saying the verse again.  Don't forget to start by saying, the verse is.`);
      this.$reprompt.addText(`Please try saying the verse again.  Remember to start by saying, the verse is.`);

      this.ask(this.$speech, this.$reprompt);

    },
    HelpIntent() {
      return this.toGlobalIntent('HelpIntent');
    }

  },

  RepeatVerseState: {
    YesIntent() {
      console.log(`In YesIntent of the RepeatVersestate`);
      this.$speech.addText(`Alright, I'll read the verse and you can try again.`)
        .addText(Messages.one_sec_pause)
        .addText(`${this.$session.$data.currentBook} chapter ${this.$session.$data.currentChapter} verse ${this.$session.$data.currentStartVerse}`)
        .addText(Messages.prosodyRate90Msg)
        .addText(`${this.$session.$data.currentPassage}`)
        .addText(Messages.endProsodyMsg)
        .addText(`Ok, give it a try.  Remember to start by saying, the verse is.`)

      this.$reprompt.addText(`Ok, give it a try. Remember to start by saying, the verse is.`)

      this.ask(this.$speech);
      
      // 
    },
    NoIntent() {
      console.log(`In NoIntent of the RepeatVersestate`);
      // Ask if they want to exit or start over
      this.$speech.addText(`Would you like to exit the Bible Memorization Skill?`)
      this.followUpState('ExitSkillState').ask(this.$speech);
    }
  },

  ExitSkillState: {
    YesIntent() {
      console.log(`In YesIntent of the ExitSkillState`);
      this.$speech.addText([`I hope you have a wonderful day.  Good bye!`, `Good bye!`, `Bye!`]);

      this.tell(this.$speech);
    }
  }
}