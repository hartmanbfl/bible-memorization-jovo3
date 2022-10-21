// Passed in verseList is a JSON object array
function getVerseFromMemory(verseList) {
  // return a verse, give priority to verses that have a low rating
  let rankingArray = [];
  for (let i = 0; i < verseList.length; i++) {
    let rating = 0;
    if (typeof verseList[i].rating != 'undefined') {
      rating = verseList[i].rating;
    } else {
      rating = 1;
    }
    // Get a random number
    const randomNum = Math.floor(Math.random() * 9) + 1; //1-10
    rankingArray[i] = (rating * randomNum);
    console.log(`RANKING: Book->${verseList[i].book}, Chapter->${verseList[i].chapter}, `
      + ` rating-> ${rating}, ranking->${rankingArray[i]}`);
  }
  // return the smallest one
  console.log(`ranking array: ${rankingArray}`);
  const minIdx = rankingArray.indexOf(Math.min(...rankingArray));
  console.log(`Choosing index: ${minIdx}`);
  return verseList[minIdx];
}

module.exports = {
  getVerseFromMemory
}