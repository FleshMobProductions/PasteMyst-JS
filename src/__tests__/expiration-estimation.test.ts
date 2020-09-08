const pastemystJs = require('./../index');

interface TimeInputResultObj {
  [key:string]:[number, string, string]
}

describe('Expiration Estimation test:', () => {
  const seconds1h = 60 * 60;
  const seconds1d = seconds1h * 24;
  const seconds1m = seconds1d * 30;
  const seconds1y = seconds1m * 12;

  // Second tuple value describes the getNextLowerExpirationFromSeconds expected value
  // Third tuple value describes the getNextHigherExpirationFromSeconds expected value
  const testEntryMap:TimeInputResultObj & object = {
      '0.5 hours':[seconds1h * 0.5, '1h', '1h'], 
      '1 hours': [seconds1h, '1h', '1h'], 
      '2 hours': [seconds1h * 2, '2h', '2h'], 
      '3 hours': [seconds1h * 3, '2h', '10h'], 
      '10 hours': [seconds1h * 10, '10h', '10h'], 
      '15 hours': [seconds1h * 15, '10h', '1d'], 
      '1 day': [seconds1d, '1d', '1d'], 
      '2 days': [seconds1d * 2, '2d', '2d'], 
      '3 days': [seconds1d * 3, '2d', '1w'], 
      '1 week': [seconds1d * 7, '1w', '1w'], 
      '1.5 weeks': [seconds1d * 10.5, '1w', '1m'], 
      '2 weeks': [seconds1d * 14, '1w', '1m'], 
      '1 month': [seconds1m, '1m', '1m'], 
      '2 months': [seconds1m * 2, '1m', '1y'], 
      '10 months': [seconds1m * 10, '1m', '1y'], 
      '1 year': [seconds1y, '1y', '1y'], 
      '2 years': [seconds1y * 2, '1y', 'never']
  };

  const testEntryMapKeys = Object.keys(testEntryMap);
  const lowerResultTable:[string, number, string][] = testEntryMapKeys.map(key => [key, testEntryMap[key][0], testEntryMap[key][1]]); // Take lower expected result from tuple
  const upperResultTable:[string, number, string][] = testEntryMapKeys.map(key => [key, testEntryMap[key][0], testEntryMap[key][2]]); // Take upper expected result from tuple

  describe.each(lowerResultTable)('getNextLowerExpirationFromSeconds for %s with seconds value %i', (durationName, inputSeconds, expectedEpiration) => {
    test(`returns value ${expectedEpiration}`, () => {
      expect(pastemystJs.getNextLowerExpirationFromSeconds(inputSeconds)).toBe(expectedEpiration);
    });
  });

  describe.each(upperResultTable)('getNextHigherExpirationFromSeconds for %s with seconds value %i', (durationName, inputSeconds, expectedEpiration) => {
    test(`returns value ${expectedEpiration}`, () => {
      expect(pastemystJs.getNextHigherExpirationFromSeconds(inputSeconds)).toBe(expectedEpiration);
    });
  });
});

describe('Myst Creation-Retrieval test', () => {
  const code = `public class TestClass {
        
    public void TestMethod() {
        Constole.WriteLine("This is a Test");
    }
  }`;
  const language = 'csharp';
  const expiresIn = '1h';

  test.concurrent('Create and retrieve myst is successful', async () => {
    const postResponse = await pastemystJs.createPasteMyst(code, expiresIn, language);
    const getResponse = await pastemystJs.getPasteMyst(postResponse.id);
    expect(postResponse['code']).toBe(getResponse['code']);
    expect(postResponse['id']).toBe(getResponse['id']);
  });
});

describe('Regex Method tests', () => {
    const discordCodeMessage = `Hi, I have a problem
    Here is my code: 
    
    \`\`\`
    var value = new String("hello");
    var matches = value.match(reg);
    console.log(matches[0]);
    \`\`\``;

    const discordMessageAfterCodeAppend = discordCodeMessage + '\nDoes someone know why I get a null reference exception for matches[0]?';

    const discordMessageLangSingle = `
    problem: 
    \`\`\`php
    <?php echo 'test' ?>
    \`\`\`
    `;

    const discordMessageLangDouble = discordMessageLangSingle + 
    `
    problem 2: 
    \`\`\`js
    console.log(obj1);
    alert(obj2.value);
    \`\`\`
    `;

    const discordMessageInlineCode = `
    Here we have \`unrecognized inlined code\`. This was a test
    `;

    const messageWithoutCode = `
    Hey, you. You're finally awake.
    You were trying to cross the border, right? 
    Walked right into that Imperial ambush, same as us, and that thief over there. 
    Damn you Stormcloaks. Skyrim was fine until you came along. Empire was nice and lazy. 
    If they hadn't been looking for you, I could've stolen that horse and be halfway to Hammerfell. 
    You there. You and me - we shouldn't be here. It's these Stormcloaks the Empire wants.
    `;

    const testEntryMap = {
        'undefined':undefined, 
        'null': null, 
        'number': 34, 
        'discordCodeMsgNoLang': discordCodeMessage, 
        'discordCodeMsgNoLangAfterCodeAppend': discordMessageAfterCodeAppend, 
        'discordMessageLangSinglePHP': discordMessageLangSingle, 
        'discordMessageLangDoublePHP_JS': discordMessageLangDouble, 
        'discordMessageInlineCode': discordMessageInlineCode, 
        'messageWithoutCode': messageWithoutCode
    };

    console.log('Discord language to pastemyst language check');
    // discordToPasteMystLanguage does not handle non string types at the moment
  
  const defaultPMLanguage = 'autodetect';
  
  test(`discordToPasteMystLanguage: Unknown discord language returns ${defaultPMLanguage} PM language`, () => {
    expect(pastemystJs.discordToPasteMystLanguage('Some nonexisting language')).toBe(defaultPMLanguage)
  })
  
  const langTestInputToResults: [string, string][] = [
    ['cs', 'csharp'], 
    ['javascript', 'javascript']
  ];
  
  test.each(langTestInputToResults)('discordToPasteMystLanguage: %s returns %s', (discordLanguage, pmLanguage) => {
    expect(pastemystJs.discordToPasteMystLanguage(discordLanguage)).toBe(pmLanguage);
  })

    console.log('Contains code block test');
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
        console.log(`${msgName} contains code block: ${pastemystJs.containsDiscordCodeBlock(msgValue)}`);
    }
    console.log('\n');

    
    console.log('Language detection test:');
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
        console.log(`${msgName} has following language: ${pastemystJs.getFirstDiscordCodeBlockLanguage(msgValue)}`);
    }
    console.log('\n');

    console.log('Code block detection test:');
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
        console.log(`${msgName} has first code block: \n${pastemystJs.getFirstDiscordCodeBlockContent(msgValue)}`);
    }
    console.log('\n');

    console.log('Full code block info test:');
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
        
        const codeInfos = pastemystJs.getFullDiscordCodeBlockInfo(msgValue);
        console.log(`${msgName} full infos length: ${codeInfos.length}`);
        for (const info of codeInfos) {
            console.log(info);
        }
    }
    console.log('\n');

})