'use strict';

const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');
const VerseDb = require('../services/VerseDb');
const EsvApiClass = require('../services/EsvApiClass');

const esvApiClass = new EsvApiClass();

module.exports = {
  PracticeModeState: {
    PracticeAVerseIntent() {
      console.log(`PracticeModeState, PracticeAVerseIntent`);

      // Get the verses from the DB
      const verseListStr = this.$user.$data.verseList;
      const verseListObjArray = JSON.parse(verseListStr);

      // make sure there is at least one verse on the list
      if (verseListObjArray.length === 0) {
        this.$speech.addText(`There are currently no verses on your memory plan.`)
          .addText('You can add verses to your list by saying, Add a verse to my plan.')
          .addText(`What would you like to do now?`)
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      }

      const verseObj = VerseDb.getVerseFromMemory(verseListObjArray);

      console.log(`PracticeAVerseIntent: ${verseObj.book} ${verseObj.chapter}:${verseObj.startVerse}`);

      this.$speech.addText(`Let's work on memorizing a verse off your memory plan.`);

      // Copy to request data to pass to other intent
      this.$data.practiceMode = true;
      this.$data.book = verseObj.book;
      this.$data.chapter = verseObj.chapter;
      this.$data.startVerse = verseObj.startVerse;
      return this.toIntent('ReadVersesWithPausesIntent');
    },

    async ReadVersesWithPausesIntent() {
      console.log(`In ReadVerseWithPausesIntent`);

      let book;
      let chapter;
      let startVerse;

      // if the request data is defined, use that.  Otherwise session
      if (this.$data.practiceMode || this.$data.repeatMode) {
        book = this.$data.book;
        chapter = this.$data.chapter;
        startVerse = this.$data.startVerse;
        this.$data.practiceMode = false;  // reset just in case
        this.$data.repeatMode = false;  // reset just in case
      } else {
        book = this.$inputs.book.key;
        chapter = this.$inputs.chapter.value;
        startVerse = this.$inputs.verse.value;
      }

      // store as session variables as well
      this.$session.$data.currentBook = book;
      this.$session.$data.currentChapter = chapter;
      this.$session.$data.currentStartVerse = startVerse;

      // Need to ensure that this is a valid Bible reference
      const isValid = await esvApiClass.validateVerse(book, chapter, startVerse);
      console.log(`ReadVerseWithPausesIntent valid: ${isValid}`);

      if (!isValid) {
        this.$speech.addText(`${book} chapter ${chapter} verse ${startVerse} does not exist in the Bible,`)
          .addText(Messages.one_sec_pause)
          .addText(`What would you like to do now?`)

        this.$reprompt.addText(`What would you like to do now?`)
        this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      } else {

        // Get the verse from ESV API
        const myVerse = await esvApiClass.readPassageFromESVApi(book, chapter, startVerse);

        this.$speech.addText(`Ok, first I am going to read the entire verse for you to hear.`)
          .addText(`${book} chapter ${chapter} verse ${startVerse}.`)
          .addText(Messages.prosodyRate90Msg)
          .addText(`${myVerse}`)
          .addText(Messages.endProsodyMsg)
          .addText(Messages.one_sec_pause)
          .addText(`Now I am going to say each segment of the verse and have you repeat what I say.`)
          .addText(` Let's get started.`)
          .addText(`${book} chapter ${chapter} verse ${startVerse}.`)
          .addText(Messages.two_sec_pause);

        // Get the number of words in the verse
        this.$session.$data.currentPassage = myVerse;

        console.log(`Verse ${myVerse}`);

        // break in arrays by punctuation
        let originalFragmentArray = myVerse.split(/[\\,.;:!?]/);
        console.log(`number of original fragments: ${originalFragmentArray.length}`);

        // Remove empty strings from array
        let fragmentArray = originalFragmentArray.filter(element => {
          return element !== '';
        });          
        console.log(`number of fragments: ${fragmentArray.length}`);

//        let verseWithoutPunct = Utilities.removePunctuation(myVerse);

        // First say the verse one fragment at a time, pausing for a short period
        // between each fragment
        this.$speech.addText(Messages.prosodyRate90Msg)
        for (let i = 0; i < fragmentArray.length; i++) {
          // how many words are in this fragment?
          let numWords = fragmentArray[i].split(" ").length;
          let pause = Utilities.getPauseCount(numWords);
          console.log(`Fragment[${i}]: ${fragmentArray[i]}`)
          console.log(`Number of words: ${numWords}.  Pausing for ${pause} seconds.`);
          let breakTime = `<break time="${pause}s"/>`

          this.$speech.addText(`${fragmentArray[i]},`)
            .addText(breakTime);
        }
        this.$speech.addText(Messages.endProsodyMsg);

        // Now build one phrase at a time
        this.$speech.addText(`Now let's try to say the whole verse by adding a segment each time.  Just repeat after me.`)
        this.$speech.addText(Messages.prosodyRate90Msg)
        for (let i = 0; i < fragmentArray.length; i++) {

          // Need to add this fragment, plus any previous ones
          let currentPhrase = "";
          for (let j = 0; j <= i; j++) {
            currentPhrase = currentPhrase + fragmentArray[j] + `,`;
//debug            console.log(`[${i}][${j}]: currentPhrase-> ${currentPhrase}`);
          }
          // add the word plus the amount of pause based on the 
          // current number of words
          let numWords = currentPhrase.split(" ").length;
          let pause = Utilities.getPauseCount(numWords);
          console.log(`Number of words: ${numWords}.  Pausing for ${pause} seconds.`);
          let breakTime = `<break time="${pause}s"/>`

          this.$speech.addText(`${currentPhrase} ${breakTime}`);
        }
        this.$speech.addText(Messages.endProsodyMsg);

        // get a rating from the user
        this.$speech.addText(Messages.one_sec_pause)
          .addText(`On a scale of one to five, how well do you have this verse memorized?`)

        this.$reprompt.addText(`On a scale of one to five, how well do you have this verse memorized?`);

        this.followUpState('GetRatingState').ask(this.$speech, this.$reprompt);
      }
    }
  },
  GetRatingState: {
    GetRatingIntent() {
      const book = this.$session.$data.currentBook;
      const chapter = this.$session.$data.currentChapter;
      const verse = this.$session.$data.currentStartVerse;

      // store the reference and score in the DB
      let rating = this.$inputs.rating.value;
      console.log(`The user gave this verse a ${rating} rating.`)

      // If the user gave the rating outside of 1-5, cap it
      if (rating < 1) {
        this.$speech.addText(`You gave a invalid rating of ${rating}.  Resetting to 1.`)
      } else if (rating > 5) {
        this.$speech.addText(`You gave a invalid rating of ${rating}.  Resetting to 5.`)
      } else {
        this.$speech.addText(`Rating saved.`);
      }

      // get the current DB values
      const verseListStr = this.$user.$data.verseList;
      const verseListObjArray = JSON.parse(verseListStr);

      // if this verse is in our plan, update the rating
      let verseInPlan = false;
      for (let i = 0; i < verseListObjArray.length; i++) {
        // Look for a match
        if (book === verseListObjArray[i].book && chapter === verseListObjArray[i].chapter
          && verse === verseListObjArray[i].startVerse) {
          console.log(`GetRatingIntent: we have a match`)
          verseListObjArray[i].rating = rating;
          // Also add timestamp when it was last practiced
          verseListObjArray[i].lastPracticed = Utilities.getTimestampInSeconds();
          verseInPlan = true;
          break;
        }
      }

      // Update the DB with this rating
      if (verseInPlan) {
        this.$user.$data.verseList = JSON.stringify(verseListObjArray);
        console.log(`Updated VerseList: ${this.$user.$data.verseList}`);
      } else {
        // Ask user if they want to add the verse to the plan
        this.$speech.addText(`This verse is not currently in your memory plan.  Would you like to add it?`)
        this.$reprompt.addText(`This verse is not currently in your memory plan.  Would you like to add it?`)
        this.$data.rating = rating;
        this.$data.timestamp = Utilities.getTimestampInSeconds();
        return this.followUpState('AddNewVerseToPlanState').ask(this.$speech, this.$reprompt);
      }

      // If rating is not a 5, ask if they want to practice this one again
      if (rating < 5) {
        this.$speech.addText(`Would you like to practice this verse again?`);
        this.$reprompt.addText(`Would you like to practice this verse again?`);
        return this.followUpState('PracticeAgainState').ask(this.$speech, this.$reprompt);
      } else {
        this.$speech.addText(`What would you like to do now?`);
        this.$reprompt.addText(`What would you like to do now?`);
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      }
    },

    StopIntent() {
      return this.toStatelessIntent('StopIntent');
    },

    // Allow the user to go back to "main menu"
    CancelIntent() {
      console.log(`GetRatingState, CancelIntent`);
      this.$speech.addText(`Ok, Cancelled. What would you like to do now?`);
      this.$reprompt.addText(`What would you like to do now?`);
      return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
    },

    END() {
      return this.toStatelessIntent('END');
    }
  },

  PracticeAgainState: {
    YesIntent() {
      // the user wants to practice again, so repeat ReadVersesWithPausesIntent
      this.$data.repeatMode = true;
      this.$data.book = this.$session.$data.currentBook;
      this.$data.chapter = this.$session.$data.currentChapter;
      this.$data.startVerse = this.$session.$data.currentStartVerse;
      return this.toStateIntent('PracticeModeState', 'ReadVersesWithPausesIntent');
    },
    NoIntent() {
      this.$speech.addText(`What would you like to do now?`);
      this.$reprompt.addText(`What would you like to do now?`);
      return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);

    }
  },

  AddNewVerseToPlanState: {
    YesIntent() {
      const book = this.$session.$data.currentBook;
      const chapter = this.$session.$data.currentChapter;
      const verse = this.$session.$data.currentStartVerse;
      this.$speech.addText(`Ok, I will add ${book} ${chapter} verse ${verse} to your memory plan.`)
        .addText(`What would you like to do now?`);
      this.$reprompt.addText(`What would you like to do now?`);

      // Get current verse list
      const verseListStr = this.$user.$data.verseList;
      const verseListObjArray = JSON.parse(verseListStr);

      const newObj = {
        book: book,
        chapter: chapter,
        startVerse: verse,
        endVerse: verse,
        rating: this.$data.rating,
        lastPracticed: this.$data.timestamp
      }
      // Add the new verse to the database
      verseListObjArray.push(newObj);
      this.$user.$data.verseList = JSON.stringify(verseListObjArray);

      return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
    },
    NoIntent() {
      this.$speech.addText(`Ok, what would you like to do now?`);
      this.$reprompt.addText(`What would you like to do now?`);
      return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);

    }

  }

}