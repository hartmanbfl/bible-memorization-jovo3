const Utilities = require('../helpers/Utilities');
const BibleUtilities = require('../helpers/BibleUtilities');
const Credentials = require('../credentials/api_keys');

const fetch = require('node-fetch');

// Bible API constants
const b_api_key = Credentials.bible_api_key;
const asv_bible_id = "06125adad2d5898a-01";
const kjv_bible_id = "de4e12af7f28f599-01";
const elo_bible_id = "95410db44ef800c1-01";
const rvr09_bible_id = "592420522e16049f-01";
const french_bible_id = "2ef4ad5622cfd98b-01";
const dutch_bible_id = "ead7b4cc5007389c-01";
const bible_url = `https://api.scripture.api.bible/v1/bibles`;
const bible_rqst = `${bible_url}`;

const headers = {
  "api-key": b_api_key,
  "Content-Type": "application/json"
}

/* Bible API Calls */
function readVerseFromBible(book, chapter, verse, version = BibleUtilities.KJV) {
  return new Promise((resolve, reject) => {
    var bibleId = kjv_bible_id;
    var language = "en-US";
    var voice = "";

    // Get the proper version ID 
    switch (version) {
      case 'KJV':
        bibleId = kjv_bible_id;
        break;
      case 'ASV':
        bibleId = asv_bible_id;
        break;
      case 'ELO':
        bibleId = elo_bible_id;
        language = "de-DE";
        voice = "Marlene";
        break;
      case 'RVR09':
        bibleId = rvr09_bible_id;
        language = "es-ES";
        voice = "Conchita";
        break;
      case 'LSG':
        bibleId = french_bible_id;
        language = "fr-FR";
        voice = "Celine";
        break;
      case 'NLD1939':
        bibleId = dutch_bible_id;
        language = "de-DE";  // no Dutch support at present
        voice = "Vicki";
        break;
      default:
        bibleId = kjv_bible_id;
    }

    console.log("Getting the name for: " + book + " out of the bibleBooksMap");
    const apiBook = BibleUtilities.bibleBooksMap.get(book.toString().toLowerCase());
    const verseRequest = `${bible_rqst}/${bibleId}/verses/${apiBook}.${chapter}.${verse}`;

    console.log("Calling Bible API with rqst url: " + verseRequest + " with key: " + b_api_key);

    fetch(verseRequest, { method: 'GET', headers: headers })
      .then(response => response.json())
      .then(data => {
        console.log(`Response: ${JSON.stringify(data)}`)

        var theVerse = Utilities.stripHtml(data.data.content);
        console.log('Got verse: ' + theVerse);
        if (language !== "en-US") {
          resolve(`<voice name="${voice}"><lang xml:lang="${language}">${theVerse}</lang></voice>`);
        } else {
          resolve(`${theVerse}`);
        }
      })
      .catch(err => {
        console.error('Error in fetch: ' + err);
        reject();
      });
  })
}

module.exports = {
  readVerseFromBible
}