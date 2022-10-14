const { GoogleSpreadsheet } = require('google-spreadsheet');
const Utilities = require('../helpers/Utilities');

const creds = require('../credentials/client_secret.json');

let totalEntries = 0;
let numWorksheets = 0;
let doc;
let bibleVerseDb = [];
let currentVerse = 0;

async function accessSpreadsheet() {
  doc = new GoogleSpreadsheet('1qHauk4ibHZfdfiAxSR8FPWBV8UsG73JHK7MAl15WiLs');

  // clear the category list
  categoryList = [];

  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo();

  // Get the number of worksheets
  numWorksheets = doc.sheetCount;
  for (var i = 0; i < numWorksheets; i++) {
    var worksheet = doc.sheetsByIndex[i];
  }
  console.log(`SPREADSHEET TITLE: ${doc.title}, Worksheets: ${numWorksheets}`);
}

async function loadVerses() {
  let index = 0; // for now just one sheet
  const sheet = doc.sheetsByIndex[index]; 
  const numRows = sheet.rowCount;
  console.log(`Title: ${sheet.title}, Rows: ${numRows}`);

  // get the rows
  const rows = await sheet.getRows({ offset: 0 });

  let verseCount = 0;
  rows.forEach(row => {
    // Create an object for this word
    const verseObj = {
      "book": row.Book,
      "chapter": row.Chapter,
      "startVerse": row.StartVerse,
      "endVerse": row.EndVerse,
      "worksheet": index,
    };
    bibleVerseDb.push(verseObj);

    // Increment total word count
    verseCount++;
  });
  totalEntries = verseCount;
  console.log(`Wrote ${totalEntries} verses to local verse DB.`);
}

function getNextVerse() {
  if (currentVerse >= totalEntries) {
    currentVerse = 0;
  }
  const verse =  bibleVerseDb[currentVerse];
  currentVerse++;
  return verse;
}

function getRandomVerse() {
  const idx = Utilities.getRandomNumber(totalEntries);
  return bibleVerseDb[idx];
}

module.exports = {
  accessSpreadsheet,
  getNextVerse,
  getRandomVerse,
  loadVerses
}