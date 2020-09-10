/// <reference path="../index.ts" />
//import { CodeBlockMatchResult } from "../index";

const pastemystJs = require('./../index');

describe('Expiration Estimation test:', () => {
  const seconds1h = 60 * 60;
  const seconds1d = seconds1h * 24;
  const seconds1m = seconds1d * 30;
  const seconds1y = seconds1m * 12;

  // Second tuple value describes the getNextLowerExpirationFromSeconds expected value
  // Third tuple value describes the getNextHigherExpirationFromSeconds expected value
  const testEntryMap:{[key:string]:[number, string, string]} & object = {
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

describe('Malformed Requests test', () => {
  const code = 'let val = { \'key\': \'value\' };'
  const correctLanguage = pastemystJs.discordToPasteMystLanguage('js');
  const wrongLanguage = 'jarvorscropt';
  const correctExpiration = '1h';
  const wrongExpiration = 'abcd1';

  const postPasteMyst = async function (code:string|null|undefined, expiration:string, language:string) {
    return await pastemystJs.createPasteMyst(code, expiration, language);
  }

  // Request with a wrong message will work, because if the message is not detected, it will still default 
  // to a valid pastemyst language option, like Autodetect
  test.concurrent('posting Myst with wrong language will use valid default language and successfully create Myst', async () => {
    await expect(postPasteMyst(code, correctExpiration, wrongLanguage)).resolves.toBeDefined();
  });
  // Requests with invalid expiration strings are expected to fail (status code 400)
  test.concurrent('posting Myst with wrong expiration throws error', async () => {
    await expect(postPasteMyst(code, wrongExpiration, correctLanguage)).rejects.toThrow();
  });
  test.concurrent('posting Myst with wrong language and expiration throws error', async () => {
    await expect(postPasteMyst(code, wrongExpiration, wrongLanguage)).rejects.toThrow();
  });
  test.concurrent('posting Myst with code value being undefined and valid language and expiration creates myst with \'undefined\' as code', async () => {
    const response = await postPasteMyst(undefined, correctExpiration, correctLanguage);
    expect(response.code).toBe('undefined');
  });

   // Requesting a wrong id (resulting in a web request on a non existent url) will return a 404 status code
   test.concurrent('getPasteMyst for an invalid ID throws error', async () => {
    await expect(pastemystJs.getPasteMyst('qwertzuisdfghjkxcvbdfghjfgh')).rejects.toThrow();
  });  
});

interface CodeBlockMatchInput {
  language: string|null|undefined;
  code: string|null|undefined;
  hasCodeBlock: boolean;
}

interface DiscordCodeMessage {
  content: string|null|undefined;
  expectedCodeBlockCount: number;
  regexResults: CodeBlockMatchInput[];
}

describe('Regex Method tests', () => {
  const codeBlock1 = `var value = new String("hello");
  var matches = value.match(reg);
  console.log(matches[0]);`;

  const discordCodeMessageNoLang: DiscordCodeMessage = {
    content: (`Hi, I have a problem
    Here is my code: 
    
    \`\`\`\n`
      + codeBlock1
      + `\n\`\`\``),
    expectedCodeBlockCount: 1,
    regexResults: [{
      code: codeBlock1,
      language: 'autodetect',
      hasCodeBlock: true
    }]
  };

  const discordCodeMessageNoBreaks: DiscordCodeMessage = {
    content: (`Hi, I have a problem
    Here is my code: 
    
    \`\`\``
      + codeBlock1
      + `\`\`\``),
    expectedCodeBlockCount: 1,
    regexResults: [{
      code: codeBlock1,
      language: 'autodetect',
      hasCodeBlock: true
    }]
  };
  
  // Copy first message but append text after the code block: 
  const discordMessageAfterCodeAppend: DiscordCodeMessage = JSON.parse(JSON.stringify(discordCodeMessageNoBreaks));
  discordMessageAfterCodeAppend.content += '\nDoes someone know why I get a null reference exception for matches[0]?';

  const codeBlockPHP = `<?php echo 'test' ?>`;

  const discordMessageLangSingleUppercase: DiscordCodeMessage = {
    content: (`
    problem: 
    \`\`\`PHP\n`
      + codeBlockPHP
      + `\n\`\`\``),
    expectedCodeBlockCount: 1,
    regexResults: [{
      code: codeBlockPHP,
      language: 'php',
      hasCodeBlock: true
    }]
  };

  const codeBlockJS = `console.log(obj1);
  alert(obj2.value);`;

  const discordMessageLangDouble: DiscordCodeMessage = JSON.parse(JSON.stringify(discordMessageLangSingleUppercase));
  discordMessageLangDouble.content += (`
  problem 2: 
  \`\`\`js \n`
    + codeBlockJS
    + `\n\`\`\``);
  discordMessageLangDouble.expectedCodeBlockCount = 2;
  discordMessageLangDouble.regexResults.push({
    language: 'javascript',
    code: codeBlockJS,
    hasCodeBlock: true
  });

  const discordMessageInlineCode: DiscordCodeMessage = {
    content: `
      Here we have \`unrecognized inlined code\`. This was a test
      `,
    expectedCodeBlockCount: 0,
    regexResults: [{
      code: null,
      language: null,
      hasCodeBlock: false
    }]
  };

  const messageWithoutCode: DiscordCodeMessage = {
    content: `
    Hey, you. You're finally awake.
    You were trying to cross the border, right?`,
    expectedCodeBlockCount: 0,
    regexResults: [{
      code: null,
      language: null,
      hasCodeBlock: false
    }]
  };

  const messageNull: DiscordCodeMessage = {
    content: null,
    expectedCodeBlockCount: 0,
    regexResults: [{
      code: null,
      language: null,
      hasCodeBlock: false
    }]
  };

  const messageUndefined: DiscordCodeMessage = {
    content: undefined,
    expectedCodeBlockCount: 0,
    regexResults: [{
      code: null,
      language: null,
      hasCodeBlock: false
    }]
  };

  const testEntryMap: { [key: string]: DiscordCodeMessage } = {
    'undefined': messageUndefined,
    'null': messageNull,
    'discord Code Msg No Lang': discordCodeMessageNoLang,
    'discord Code Msg No Lang No Line Breaks': discordCodeMessageNoBreaks,
    'discord Code Msg No Lang No Line Breaks After Code Append': discordMessageAfterCodeAppend,
    'discord Message Lang Single PHP': discordMessageLangSingleUppercase,
    'discord Message Lang Double PHP_JS': discordMessageLangDouble,
    'discord Message Inline Code': discordMessageInlineCode,
    'message Without Code': messageWithoutCode
  };

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

  describe('containsDiscordCodeBlock for', () => {
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
      test(`${msgName} should contain code block: ${msgValue.regexResults[0].hasCodeBlock}`, () => {
        expect(pastemystJs.containsDiscordCodeBlock(msgValue.content)).toBe(msgValue.regexResults[0].hasCodeBlock);
      });
    }
  });

  describe('getFirstDiscordCodeBlockLanguage for', () => {
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
      test(`${msgName} should be: ${msgValue.regexResults[0].language}`, () => {
        expect(pastemystJs.getFirstDiscordCodeBlockLanguage(msgValue.content)).toBe(msgValue.regexResults[0].language);
      });
    }
  });

  describe('getFirstDiscordCodeBlockContent for', () => {
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
      test(`${msgName} should be: ${msgValue.regexResults[0].code}`, () => {
        expect(pastemystJs.getFirstDiscordCodeBlockContent(msgValue.content)).toBe(msgValue.regexResults[0].code);
      });
    }
  });
    
  describe('getFullDiscordCodeBlockInfo for', () => {
    for (const [msgName, msgValue] of Object.entries(testEntryMap)) {
      test(`${msgName} should return ${msgValue.expectedCodeBlockCount} entries with correct values`, () => {
        const codeBlockInfos = pastemystJs.getFullDiscordCodeBlockInfo(msgValue.content);
        expect(codeBlockInfos.length).toBe(msgValue.expectedCodeBlockCount);
        if (codeBlockInfos.length >= msgValue.expectedCodeBlockCount) {
          for (let index = 0; index < msgValue.expectedCodeBlockCount; index++) {
            expect(codeBlockInfos[index].language).toBe(msgValue.regexResults[index].language);
            expect(codeBlockInfos[index].code).toBe(msgValue.regexResults[index].code);
          }
        }
      });
    }
  });
});