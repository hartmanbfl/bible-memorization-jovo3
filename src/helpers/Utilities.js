// Shuffle an array of key/value pairs
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripHtml(html) {
  // Strip off any HTML tags from the content string
  var noHtmlString = html.replace(/<[^>]+>/g, '');

  // Strip off the numbers on the front of the content string
  return noHtmlString.replace(/^\d+/g, '');
}

// Get a number from 0 to max-1
function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

// From stackoverflow
// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}


// Remove punctuation from string
function removePunctuation(sourceStr) {
  let noPunctStr = sourceStr.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  let finalStr = noPunctStr.replace(/\s{2,}/g," ");
  return finalStr;
}

// get number of words in a string
function wordCount(str) { 
  return str.split(" ").length;
}

// TBD - good algorithm for pausing between words
function getPauseCount(numWords) {
  // use 150 wpm = 2.5 wps
  let pause = Math.ceil(numWords / 2.5);
  if (pause >= 10) pause = 10;
  return pause;
}


module.exports = {
  getPauseCount,
  getRandomNumber,
  removePunctuation,
  shuffle,
  similarity,
  stripHtml,
  wordCount
}