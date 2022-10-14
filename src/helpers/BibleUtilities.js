
/* CONSTANTS AND TYPES */
const bibleVersions = [
  "ASV",
  "ESV",
  "KJV",
  "ELO"      
]

const bibleBooksMap = new Map([
    ['genesis', 'GEN'],
    ['exodus', 'EXO'],
    ['leviticus', 'LEV'],
    ['numbers', 'NUM'],
    ['deuteronomy', 'DEU'],
    ['joshua', 'JOS'],
    ['judges', 'JDG'],
    ['1 samuel', '1SA'],
    ['2 samuel', '2SA'],
    ['1 kings', '1KI'],
    ['2 kings', '2KI'],
    ['1 chronicles', '1CH'],
    ['2 chronicles', '2CH'],
    ['ezra', 'EZR'],
    ['nehemiah', 'NEH'],
    ['esther', 'EST'],
    ['job', 'JOB'],
    ['psalm', 'PSA'],
    ['proverbs', 'PRO'],
    ['ecclesiates', 'ECC'],
    ['song of solomon', 'SNG'],
    ['isaiah', 'ISA'],
    ['jeremiah', 'JER'],
    ['lamentations', 'LAM'],
    ['ezekiel', 'EZK'],
    ['daniel', 'DAN'],
    ['hosea', 'HOS'],
    ['joel', 'JOL'],
    ['amos', 'AMO'],
    ['obadiah', 'OBA'],
    ['jonah', 'JON'],
    ['micah', 'MIC'],
    ['nahum', 'NAH'],
    ['habbakuk', 'HAB'],
    ['zephaniah', 'ZEP'],
    ['haggai', 'HAG'],
    ['zecharia', 'ZEC'],
    ['malachi', 'MAL'],
    // New Testament
    ['matthew', 'MAT'],
    ['mark', 'MRK'],
    ['luke', 'LUK'],
    ['john', 'JHN'],
    ['acts', 'ACT'],
    ['romans', 'ROM'],
    ['1 corinthians', '1CO'],
    ['2 corinthians', '2CO'],
    ['galatians', 'GAL'],
    ['ephesians', 'EPH'],
    ['philippians', 'PHP'],
    ['colossians', 'COL'],
    ['1 thessalonians', '1TH'],
    ['2 thessalonians', '2TH'],
    ['1 timothy', '1TI'],
    ['2 timothy', '2TI'],
    ['titus', 'TIT'],
    ['philemon', 'PHM'],
    ['hebrews', 'HEB'],
    ['james', 'JAS'],
    ['1 peter', '1PE'],
    ['2 peter', '2PE'],
    ['1 john', '1JN'],
    ['2 john', '2JN'],
    ['3 john', '3JN'],
    ['jude', 'JUD'],
    ['revelation', 'REV'],
    // Extra searches
    ['old testament', 'OT'],
    ['new testament', 'NT'],
    ['bible', 'BIBLE'],
    ['pauls epistles', 'PE'],
  ]);
  
  const oldTestamentBooks = [
    "genesis",
    "exodus",
    "leviticus",
    "numbers",
    "deuteronomy",
    "joshua",
    "judges",
    "ruth",
    "1 samuel",
    "2 samuel",
    "1 kings",
    "2 kings",
    "1 chronicles",
    "2 chronicles",
    "ezra",
    "nehemiah",
    "esther",
    "job",
    "psalm",
    "proverbs",
    "ecclesiastes",
    "song of solomon",
    "isaiah",
    "jeremiah",
    "lamentations",
    "ezekiel",
    "daniel",
    "hosea",
    "joel",
    "amos",
    "obadiah",
    "jonah",
    "micah",
    "nahum",
    "habakkuk",
    "zephaniah",
    "haggai",
    "zechariah",
    "malachi"
  ];
  
  const newTestamentBooks = [
    "matthew",
    "mark",
    "luke",
    "john",
    "acts",
    "romans",
    "1 corinthians",
    "2 corinthians",
    "galatians",
    "ephesians",
    "philippians",
    "colossians",
    "1 thessalonians",
    "2 thessalonians",
    "1 timothy",
    "2 timothy",
    "titus",
    "philemon",
    "hebrews",
    "james",
    "1 peter",
    "2 peter",
    "1 john",
    "2 john",
    "3 john",
    "jude",
    "revelation"
  ];
  
  const paulsEpistles = [
    "romans",
    "1 corinthians",
    "2 corinthians",
    "galatians",
    "ephesians",
    "philippians",
    "colossians",
    "1 thessalonians",
    "2 thessalonians",
    "1 timothy",
    "2 timothy",
    "titus",
    "philemon",
  ];
  
  var returnPacket = {
    "numResults": 0,
    "verses": []
  };
  
  /* BIBLE HELPER FUNCTIONS */
  function isInOldTestament(book) {
    if (oldTestamentBooks.indexOf(book) > -1) {
      return true;
    } else return false;
  }
  
  function isInNewTestament(book) {
    if (newTestamentBooks.indexOf(book) > -1) {
      return true;
    } else return false;
  }
  
  function isInPaulsEpistles(book) {
    if (paulsEpistles.indexOf(book) > -1) {
      return true;
    } else return false;
  }
  
  // Function to determine whether a specific verse passes a search criteria
  // Specifically, if the verse is found in a specific book or part of the Bible
  function versePassesSearchCriteria(reference, searchCriteria) {
    // First check whether this is a multi-book search
    if (searchCriteria === "bible") {
      return true;
    }
    else if (searchCriteria === "old testament") {
      // check passage against old testament array
      var thisBook = getBookFromReference(reference);
      if (isInOldTestament(thisBook)) {
        return true;
      } else {
        return false;
      }
    }
    else if (searchCriteria === "new testament") {
      // check passage against new testament array
      var thisBook = getBookFromReference(reference);
      if (isInNewTestament(thisBook)) {
        return true;
      } else {
        return false;
      }
    }
    else if (searchCriteria === "paul") {
      // check passage against new testament array
      var thisBook = getBookFromReference(reference);
      if (isInPaulsEpistles(thisBook)) {
        return true;
      } else {
        return false;
      }
    }
    // else must be a specific book
    else {
      bookOfTheBible = getBookFromReference(reference);
      //debug    console.log(`Comparing ${bookOfTheBible} with ${searchCriteria}`);
      if (bookOfTheBible.toLowerCase().startsWith(searchCriteria.toLowerCase())) {
        return true;
      } else {
        return false;
      }
    }
  }
  
  function getBookFromReference(reference) {
    var bookOfTheBible;
    // Parse the book from the reference (use max of 3 for song of solomon)
    var tokRef = reference.toLowerCase().split(" ", 3);
    // check if the first 'word' is a number - trick is to check against isNaN
    if (!isNaN(tokRef[0])) {
      bookOfTheBible = `${tokRef[0]} ${tokRef[1]}`;
    }
    // Next check the special case of song of solomon
    else if (tokRef[0] + " " + tokRef[1] + " " + tokRef[2] === "song of solomon") {
      bookOfTheBible = "song of solomon";
    }
    // else a standard book
    else bookOfTheBible = tokRef[0];
  
    return bookOfTheBible.toLowerCase();
  }
  
  
  
  module.exports = {
    bibleBooksMap,
    returnPacket,
    versePassesSearchCriteria
  }