# Bible Memorization Design Notes

## Design Contraints
- Alexa does not support the user saying long sections of free-flow text

## Ideas for Implementation
- Instead of having the user say the whole verse, could have Alexa read the verse while the user reads along
  - Could then prompt the user for how well they knew the verse (maybe 1-5)
- Have two modes, ad-hoc and scheduled/planned
  - With the ad-hoc mode, any verse can be chosen in the Bible
  - With the scheduled mode, read in verses from a DB or Google Sheet

## Development components
1. Interface to ESV or other Bible API
2. Interface to DB or Google Sheets
3. Interface to Alexa/Google Home (jovo possible)
4. Intent development
5. Algorithm development for which verses to present user (based on past history, scores, etc.)
6. Interface to Alexa with displays

## Intents

## Sample Flow / Use-cases
1. Alexa, open my Bible Memorization app 
2. Alexa, ask my Bible Memorization app to help me memorize John 3 verse 16

## Component features/requirements

### Interface to ESV or Bible API
1. ESV
  - Authorization: Token c9a931ac0ae6c6e7d5fca859d2dc1a8509ab9ddd
  - Capability to retrieve any verse or range of verses
    - Examples:  Ephesians 2:10 or Proverbs 3:5-6


# Building and deploying steps
1.  jovo build
2.  jovo deploy --ask-profile edot
3.  jovo3 get alexaSkill --skill-id amzn1.ask.skill.97d8429a-8c3f-4f53-8172-32c1d1f93ede --ask-profile edot

