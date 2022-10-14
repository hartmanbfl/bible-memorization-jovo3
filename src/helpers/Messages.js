const fallbackMessage = 'There was something I did not understand.  Please try your request again.';
const errorMessage = 'I\'m sorry, there was an unexpected error.  Please try a new request.';
const whatToDoMessage = "What would you like to do now?";
const exitSkillMessage = 'Thank you for using the Bible Memorization skill.  Goodbye';
const welcomeMessage = 'Welcome to the Bible Memorization Skill.  What would you like to do?';
const repromptMessageStandard = "Would you like to hear the verse again?";

// Helper sounds
const endSpeak = '</speak>';
const endProsodyMsg = '</prosody>';
const prosodyRate90Msg = `<prosody rate="90%">`;
const prosodyRate80Msg = `<prosody rate="80%">`;
const prosodyRate70Msg = `<prosody rate="70%">`;

const moderateEmphasis = `<emphasis level="moderate">`
const strongEmphasis = `<emphasis level="strong">`
const endEmphasis = `</emphasis>`
const one_sec_pause = `<break time="1s"/>`;
const two_sec_pause = `<break time="2s"/>`;

const positiveResponse = `<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>`;
const negativeResponse = `<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_01"/>`;
const crowdApplause = `<audio src="soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01"/>`;
const crowdCheer = `<audio src="soundbank://soundlibrary/human/amzn_sfx_large_crowd_cheer_03"/>`;
const neutralResponse = `<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_neutral_response_01"/>`


module.exports = {
    fallbackMessage,
    errorMessage,
    whatToDoMessage,
    exitSkillMessage,
    welcomeMessage,
    repromptMessageStandard,

    prosodyRate70Msg,
    prosodyRate80Msg,
    prosodyRate90Msg,
    endProsodyMsg,
    endSpeak,
    one_sec_pause,
    two_sec_pause,
    moderateEmphasis,
    strongEmphasis,
    endEmphasis
}