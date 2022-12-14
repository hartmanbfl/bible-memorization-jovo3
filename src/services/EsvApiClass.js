const fetch = require('node-fetch');
const BibleUtilities = require('../helpers/BibleUtilities');

// Timeout constant
const AlexaTimeout = 7; // 7 seconds 


// ESV API constants
const esv_api_key = "Token c9a931ac0ae6c6e7d5fca859d2dc1a8509ab9ddd"
const esv_http = "https://api.esv.org/v3"
const esvHeader = {
  "Authorization": esv_api_key
}
const esvParams = new Map([
  ["include-passage-references", "false"],
  ["include-headings", "false"],
  ["include-footnotes", "false"],
  ["include-verse-numbers", "false"],
  ["include-first-verse-numbers", "false"],
  ["include-short-copyright", "false"],
]);

class EsvApiClass {

  constructor() { }

  findESVVersesWithKeyword(keyword, numToRead, searchCriteria, shuffle = true, exactSearch = true) {
    console.log('In findESVVersesWithKeyword');
    var taskTookTooLongFlag = false;
    var verseList = [];
    return new Promise(async (resolve, reject) => {
      const startTime = new Date().getTime();


      if (exactSearch)
        var searchVerseUrl = `${esv_http}/passage/search?q="${keyword}"&page-size=100`
      else
        var searchVerseUrl = `${esv_http}/passage/search?q=${keyword}&page-size=100`

      console.log("Calling ESV API with search request: " + searchVerseUrl);

      // Get the initial results from the ESV search query
      var searchResultJson = await this.fetchFromESV(searchVerseUrl);

      // How many results?
      var totalResults = searchResultJson.total_results;

      // How many pages of results?
      var pagesOfResults = searchResultJson.total_pages;

      // Loop throught the pages of results
      for (var page = 0; page < pagesOfResults; page++) {
        // Don't request the first page again
        if (page > 0) {
          searchVerseUrl = `${searchVerseUrl}&page=${page + 1}&page-size=100`
          searchResultJson = await this.fetchFromESV(searchVerseUrl);
        }
        // Loop through each verse that was found on this page and add to our list
        for (var result in searchResultJson.results) {
          const thisVerse = searchResultJson.results[result];
          var verseWithRef = { ref: thisVerse.reference, verse: thisVerse.content };

          // Only push verses if they are found in search criteria
          if (!searchCriteria) {
            verseList.push(verseWithRef);
          }
          else if (BibleUtilities.versePassesSearchCriteria(thisVerse.reference, searchCriteria)) {
            //debug          console.log(`${thisVerse.reference} passed the search criteria of 'is in ${searchCriteria}'`);
            verseList.push(verseWithRef);
          }
        }
        // Do we have time to look for more?
        var currentTime = new Date();
        var elapsedTimeSec = (currentTime - startTime) / 1000;

        if (elapsedTimeSec > AlexaTimeout) {
          console.error("Search took longer than " + AlexaTimeout + " seconds!");
          taskTookTooLongFlag = true;
          break;
        }
      }

      // Now, randomly choose verses up to the number requested
      if (shuffle) {
        if (verseList.length > 0 && numToRead && numToRead != '?') {
          verseList = BibleUtilities.shuffle(verseList).slice(0, numToRead);
        }
      }
      console.log('Found ' + verseList.length + " verses about " + keyword);

      BibleUtilities.returnPacket.numResults = totalResults;
      BibleUtilities.returnPacket.verses = [...verseList];

      // If we timed out, let the user know that this is an incomplete list
      // due to search time
      resolve([taskTookTooLongFlag, verseList]);
    });
  }

  readPassageFromESVApi(sourceBook, chapter, firstVerse, lastVerse) {
    return new Promise(async (resolve, reject) => {
      // Get the name of the book without any spaces (e.g. 1JN for 1st John)
      let book = BibleUtilities.bibleBooksMap.get(sourceBook);

      // See if this is a verse, passage, or chapter request
      if (firstVerse && lastVerse) {
        var verseRequest = (`${book}${chapter}:${firstVerse}-${lastVerse}`).toString();
      } else if (firstVerse) {
        var verseRequest = (`${book}${chapter}:${firstVerse}`).toString();
      } else {
        var verseRequest = (`${book}${chapter}`).toString();
      }
      console.log("Calling ESV API with query: " + verseRequest);

      var paramList = "";
      for (const [key, value] of esvParams.entries()) {
        paramList = paramList + "&" + key + "=" + value;
      }

      var readVerseUrl = `${esv_http}/passage/text/?q=${verseRequest}${paramList}`;

      //      console.log("Param List: " + paramList);
      //      console.log("EsvApiClass: readVerseUrl: " + readVerseUrl);
      var theVerseJson = await this.fetchFromESV(readVerseUrl);
      console.log(`EsvApiClass: theVerseJson:  ${JSON.stringify(theVerseJson)}`);
      var theVerse = (theVerseJson.passages).toString().trim();
      console.log('Got ESV Verse: ' + theVerse);
      resolve(theVerse);
    });
  }

  // Make sure this verse exists in the Bible
  // Note that the ESV API does not give back an error, but rather gives the 
  // nearest verse to the request
  async validateVerse(book, chapter, verse) {
    return new Promise(async (resolve, reject) => {

      // Map the book to the key 
      console.log(`Looking up value for key: ${book}`);
      let bookValue = BibleUtilities.bibleBooksMap.get(book);
      console.log(`Book value: ${bookValue}`);

      // if the book doesn't exist in our map, exit immediately
      if (typeof bookValue === 'undefined') {
        console.log(`This book ${book} is undefined, so returning false.`)
        resolve(false);
      } else {

        let verseRequest = (`${bookValue}${chapter}:${verse}`).toString();
        console.log("Calling ESV API with query: " + verseRequest);

        let paramList = "";
        for (const [key, value] of esvParams.entries()) {
          paramList = paramList + "&" + key + "=" + value;
        }

        let readVerseUrl = `${esv_http}/passage/text/?q=${verseRequest}${paramList}`;
        let theVerseJson = await this.fetchFromESV(readVerseUrl);
        let theQuery = (theVerseJson.query).toString();
        console.log(`ESV REQUEST: ${readVerseUrl}, RESULT: ${JSON.stringify(theVerseJson, null, 2)}`);

        // check if theQuery === the requested verse
        let computedBook = BibleUtilities.getBookFromReference(theQuery);
        let computedRef = BibleUtilities.getBookChapterVerseFromReference(theQuery);
        console.log(`Computed book: ${computedBook}`);
        console.log(`Computed reference: ${computedRef.book}, ${computedRef.chapter}, ${computedRef.verse}`);
        console.log(`Validating [${book} ${chapter}:${verse}], Query Result: [${computedRef.book} ${computedRef.chapter}:${computedRef.verse}]`);
        // Only validating chapter/verse - this is because the ESV API always gives a result
        // even if the verse doesn't exist
        if (chapter === computedRef.chapter && verse === computedRef.verse) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    })
  }

  async findNumberOfVersesWithWordInBible(keyword, exactSearch = true) {
    if (exactSearch)
      var searchVerseUrl = `${esv_http}/passage/search?q="${keyword}"&page-size=100`
    else
      var searchVerseUrl = `${esv_http}/passage/search?q=${keyword}&page-size=100`

    console.log("Calling ESV API with search request: " + searchVerseUrl);

    // Get the initial results from the ESV search query
    var searchResultJson = await this.fetchFromESV(searchVerseUrl);

    // How many results?
    var totalResults = searchResultJson.total_results;

    return totalResults;
  }


  fetchFromESV(url) {
    return new Promise((resolve, reject) => {
      fetch(url, { method: 'GET', headers: esvHeader })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          console.log('Error in fetch: ' + err);
          reject();
        })
    });
  }
}

module.exports = EsvApiClass;