'use strict';
const EsvApiClass = require('../services/EsvApiClass');
const Messages = require('../helpers/Messages');
const Utilities = require('../helpers/Utilities');
const { BibleUtilities } = require('../helpers/BibleUtilities');

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
        book = this.$inputs.book.key;
        chapter = this.$inputs.chapter.value;
        startVerse = this.$inputs.verse.value;
      }

      console.log(`In read intent for ${book} ${chapter}:${startVerse}`);

      const myVerse = await esvApiClass.readPassageFromESVApi(book, chapter, startVerse);
      const esvAudioUrl = `https://audio.esv.org/hw/mq/${book}${chapter}.${startVerse}.mp3`;

      // Save the url and token as session variables
      const token = `${book}.${chapter}.${startVerse}` 
      this.$user.$data.audioVerseUrl = esvAudioUrl;
      this.$user.$data.audioToken = token;
      this.$user.$data.audioRepeatCount = 0;

      // Update the display
      if (this.isAlexaSkill()) {
        var bodyTemplate1 = this.$alexaSkill.templateBuilder('BodyTemplate1');

        bodyTemplate1.setToken(token)
          .setTitle(`${book.toUpperCase()} ${chapter}:${startVerse}`)
          .setTextContent(myVerse);

        this.$alexaSkill.showDisplayTemplate(bodyTemplate1);
      }

      console.log(`URL:  ${esvAudioUrl}`);
      this.$alexaSkill.$audioPlayer
        .setOffsetInMilliseconds(0)
        .setTitle(`${book} ${chapter}:${startVerse}`)
        .setSubtitle('ESV® Bible, copyright © 2001 Crossway')
        .play(`${esvAudioUrl}`, `${token}`)
        .tell(`Please wait while I look up this passage. ${Messages.one_sec_pause}`)


      //    if (endAfterIntent) this.tell(myVerse, Messages.repromptMessageStandard);
      //    else this.ask(myVerse, Messages.repromptMessageStandard);
    },
    stopPlaying() {
      console.log(`ListenToVerseState, stopPlaying`);
      return this.$alexaSkill.$audioPlayer.stop();
    },
    pauseReadingIntent() {
      console.log(`ListenToVerseState, pauseReadingIntent`);
      let offset = this.$alexaSkill.$audioPlayer.getOffsetInMilliseconds();
      this.$user.$data.audioOffset = offset;
      this.$alexaSkill.$audioPlayer.stop()
        .tell(`Paused.`);
    },
    continueReadingIntent() {
      console.log(`ListenToVerseState, continueReadingIntent`);
      const offset = this.$user.$data.audioOffset;
      const audioUrl = this.$user.$data.audioVerseUrl;
      const audioToken = this.$user.$data.audioToken;   
      
      console.log(`Continue reading ${audioToken} at offset ${offset}`);
      this.$alexaSkill.$audioPlayer.setOffsetInMilliseconds(offset)
        .play(audioUrl, audioToken)
          .tell(`Resuming.`);
    },
    startOverReadingIntent() {
      console.log(`ListenToVerseState, startOverReadingIntent`);
      const audioUrl = this.$user.$data.audioVerseUrl;
      const audioToken = this.$user.$data.audioToken;   
      console.log(`Start over reading ${audioUrl} with token ${audioToken}.`);
//      this.$alexaSkill.$audioPlayer.startOver(audioUrl, audioToken)
      this.$alexaSkill.$audioPlayer.setOffsetInMilliseconds(0)
        .play(audioUrl, audioToken)
          .tell(`Starting over.`)
    },
    NextIntent() {
      this.tell("This skill does not support the Audio Next Intent.");
    },
    PreviousIntent() {
      this.tell("This skill does not support the Audio Previous Intent.");
    },
    RepeatIntent() {
      console.log(`ListenToVerseState, RepeatIntent`);
      const audioUrl = this.$user.$data.audioVerseUrl;
      const audioToken = this.$user.$data.audioToken;  
      const audioRepeatCount = this.$user.audioRepeatCount++; 
      const newToken = `${audioToken}.${audioRepeatCount}`
      console.log(`Start over reading ${audioUrl} with token ${audioToken}.`);
//      this.$alexaSkill.$audioPlayer.setExpectedPreviousToken(audioToken).enqueue(audioUrl,newToken)
      this.$alexaSkill.$audioPlayer.setOffsetInMilliseconds(0)
        .setExpectedPreviousToken(audioToken)
        .enqueue(audioUrl, newToken)
        .tell('Repeat confirmed.');
      
    }
  },
}