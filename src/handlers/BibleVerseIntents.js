'use strict';
const EsvApiClass = require('../services/EsvApiClass');
const Messages = require('../helpers/Messages');

const esvApiClass = new EsvApiClass();
const Spreadsheet = require('../services/GoogleSpreadsheetService')

module.exports = {
  async ReadVerseIntent() {
    var book = this.$inputs.book.value;
    var chapter = this.$inputs.chapter.value;
    var verse = this.$inputs.verse.value;

    console.log(`In read intent for ${book} ${chapter}:${verse}`);

    var myVerse = await esvApiClass.readPassageFromESVApi(book, chapter, verse);

    // Update the display
    if (this.isAlexaSkill()) {
      var bodyTemplate1 = this.$alexaSkill.templateBuilder('BodyTemplate1');

      bodyTemplate1.setToken('token')
        .setTitle(`${book.toUpperCase()} ${chapter}:${verse}`)
        .setTextContent(myVerse);

      this.$alexaSkill.showDisplayTemplate(bodyTemplate1);
    }

    this.tell(myVerse, Messages.fallbackMessage);

//    if (endAfterIntent) this.tell(myVerse, Messages.repromptMessageStandard);
//    else this.ask(myVerse, Messages.repromptMessageStandard);
  },
  
  async GetVerseIntent() {
    const passage = Spreadsheet.getRandomVerse();
    this.$session.$data.currentPassage = passage;
    console.log(`Retrieved ${passage.book} chapter ${passage.chapter} verse ${passage.startVerse}`);

    // Look up this verse
    
    // Read the verse
    this.$reprompt
      .addText(Messages.repromptMessageStandard);
    this.$speech
      .addText(`${passage.book} chapter ${passage.chapter} verse ${passage.startVerse}`);

    return this.tell(this.$speech);
  }
}