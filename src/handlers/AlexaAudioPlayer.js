module.exports = {
    AUDIOPLAYER: {
      'AlexaSkill.PlaybackStarted'() {
        console.log('+++ AlexaSkill.PlaybackStarted');
      },
      'AlexaSkill.PlaybackNearlyFinished'() {
        console.log('+++ AlexaSkill.PlaybackNearlyFinished');
      },
      'AlexaSkill.PlaybackFinished'() {
        console.log('+++ AlexaSkill.PlaybackFinished');
        this.$speech.addText(`What would you like to do now?`);
        this.$reprompt.addText(`What would you like to do now?`)
          .addText('Remember, to get a list of the different options, just say, list options.');
        return this.followUpState('GetActivityState').ask(this.$speech, this.$reprompt);
      },
      'AlexaSkill.PlaybackStopped'() {
        console.log('+++++ AlexaSkill.PlaybackStopped');
      },
  
      'AlexaSkill.PlaybackFailed'() {
        console.log('+++++ AlexaSkill.PlaybackFailed');
      }
    }
  }