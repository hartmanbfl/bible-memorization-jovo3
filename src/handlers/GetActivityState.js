'use strict'

module.exports = {
   GetActivityState: {
      GetOptionsIntent() {
         this.$speech.addText('Here are the different activities that you can do with this skill.')
            .addText('Read a verse.')
            .addText('Memorize a verse.')
            .addText('Practice a verse from your memory plan.')
            .addText('So, what would you like to do?')

         this.$reprompt.addText('So, what would you like to do?')

         this.ask(this.$speech, this.$reprompt);
      },
      ReadVerseIntent() {
         return this.toGlobalStateIntent('ReadVerseIntent');
      },
      PromptToMemorizeVerseIntent() {
         this.$speech.addText('What verse would you like to memorize?')
         this.$reprompt.addText('What verse would you like to memorize?')

         return this.followUpState('MemorizeVerseState').ask(this.$speech, this.$reprompt);
      }
   } 
}