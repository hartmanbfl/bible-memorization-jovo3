'use strict'
const Messages = require('../helpers/Messages');

module.exports = {
  GetActivityState: {
    GetOptionsIntent() {
      this.$speech.addText('Here are some of the different activities that you can do with Bible Trainer.')
        .addText('Listen to a verse.')
        .addText('Memorize a verse.')
        .addText('Memorize a verse from my memory plan.')
        .addText('Review my memory plan.')
        .addText('Add or remove a verse from my memory plan.')
        .addText(Messages.one_sec_pause)
        .addText('So, what would you like to do?');

      this.$reprompt.addText('So, what would you like to do?')

      this.ask(this.$speech, this.$reprompt);
    },
    // "Listen to a verse"
    ReadVerseIntent() {
      console.log(`GetActivityState, ReadVerseIntent`);
      this.$speech.addText(`What verse would you like to hear?`);
      this.$reprompt.addText(`What verse would you like to hear?`);
      return this.followUpState('ListenToVerseState').ask(this.$speech, this.$reprompt);
    },
    ReadSpecificVerseIntent() {
      console.log(`GetActivityState, ReadSpecificVerseIntent`);
      return this.toStateIntent('ListenToVerseState', 'ReadSpecificVerseIntent');
    },

    // "Practice saying a verse" (beta mode - actually capture user's speech)
    PracticeSayingVerseIntent() {
      console.log(`GetActivityState, PracticeSayingVerseIntent`);
      this.$speech.addText('What verse would you like to memorize?')
      this.$reprompt.addText('What verse would you like to memorize?')

      return this.followUpState('MemorizeVerseState').ask(this.$speech, this.$reprompt);
    },
    // "Memorize a verse" via reading with pauses
    MemorizeAVerseIntent() {
      console.log(`In GetActivityState, MemorizeAVerseIntent`);
      this.$speech.addText('What verse would you like to memorize?')
      this.$reprompt.addText('What verse would you like to memorize?')
      return this.followUpState('PracticeModeState').ask(this.$speech, this.$reprompt);
    },
    ReadVersesWithPausesIntent() {
      console.log(`In GetActivityState, ReadVersesWithPausesIntent`);
//      return this.toStateIntent('PracticeModeState', 'ReadVersesWithPausesIntent');
      return this.toStateIntent('PracticeModeState', 'ReadVersesWithPausesIntent');
    },

    // "practice a verse"
    PracticeAVerseIntent() {
      return this.toStateIntent('PracticeModeState', 'PracticeAVerseIntent');
    },

    // "review memory plan"
    WhichVersesInPlanIntent() {
      console.log(`In GetActivityState, WhichVersesInPlanIntent`);
      return this.toStateIntent('MemoryPlanState', 'WhichVersesInPlanIntent');
    },

    HelpIntent() {
      return this.toStatelessIntent('HelpIntent');
    },

    Unhandled() {
      console.log(`In GetActivityState UNHANDLED intent.`);
      return this.tell(`Goodbye.`);
    }
  }
}