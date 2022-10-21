'use strict';
const EsvApiClass = require('../services/EsvApiClass');
const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');

const esvApiClass = new EsvApiClass();

module.exports = {
  ListenToVerseState: {

    async ReadSpecificVerseIntent() {
      let book;
      let chapter;
      let startVerse;

      console.log(`In ReadSpecificVerseIntent, practice: ${this.$data.practiceMode}, repeat: ${this.$data.repeatMode}`);
      // if the request data is defined, use that.  Otherwise session
      if (this.$data.practiceMode || this.$data.repeatMode) {
        book = this.$data.book;
        chapter = this.$data.chapter;
        startVerse = this.$data.startVerse;
        this.$data.practiceMode = false;  // reset just in case
        this.$data.repeatMode = false;  // reset just in case
      } else {
        book = this.$inputs.book.value;
        chapter = this.$inputs.chapter.value;
        startVerse = this.$inputs.verse.value;
      }

      console.log(`In read intent for ${book} ${chapter}:${startVerse}`);

      var myVerse = await esvApiClass.readPassageFromESVApi(book, chapter, startVerse);

      // Update the display
      if (this.isAlexaSkill()) {
        var bodyTemplate1 = this.$alexaSkill.templateBuilder('BodyTemplate1');

        bodyTemplate1.setToken('token')
          .setTitle(`${book.toUpperCase()} ${chapter}:${startVerse}`)
          .setTextContent(myVerse);

        this.$alexaSkill.showDisplayTemplate(bodyTemplate1);
      }


      // maybe use audio player instead
      const esvAudioUrl = `https://audio.esv.org/hw/mq/${book}${chapter}.${startVerse}.mp3`;
      console.log(`URL:  ${esvAudioUrl}`);
      this.$alexaSkill.$audioPlayer
        .setOffsetInMilliseconds(0)
        .setTitle(`${book} ${chapter}:${startVerse}`)
        .setSubtitle('ESV® Bible, copyright © 2001 Crossway')
        .play(`${esvAudioUrl}`, `${book}.${chapter}.${startVerse}`)
        .tell(`Please wait while I look up this passage.`)


      //    if (endAfterIntent) this.tell(myVerse, Messages.repromptMessageStandard);
      //    else this.ask(myVerse, Messages.repromptMessageStandard);
    },
  },
}