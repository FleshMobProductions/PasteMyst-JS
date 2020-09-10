'use strict'

const pastemystJs = require('./index'); // Error without the ;

(async function() {

    const testMystCreationAndRetrieval = async function() {
        const code = `public class TestClass {
        
            public void TestMethod() {
                Constole.WriteLine("This is a Test");
            }
        }`;
        const language = 'csharp';
        const expiresIn = '1h';
    
        const postResponse = await pastemystJs.createPasteMyst(code, expiresIn, language);
        console.log('postResponse');
        console.log(postResponse);
    
        const getResponse = await pastemystJs.getPasteMyst(postResponse.id);
        console.log('getResponse');
        console.log(getResponse);
    }

    const testMalformedRequests = async function() {
        const code = 'let val = { \'key\': \'value\' };'
        const correctLanguage = pastemystJs.discordToPasteMystLanguage('js');
        const wrongLanguage = 'jarvorscropt';
        const correctExpiration = '1h';
        const wrongExpiration = 'abcd1';

        const logPostResponse = async function(operationName, code, expiration, language) {
            try {
                console.log(operationName);
                const postResponse = await pastemystJs.createPasteMyst(code, expiration, language);
                console.log(postResponse);
            }
            catch (error) {
                console.log(`operation ${operationName} threw error:`);
                console.log(error);
            }
        }

        // Request with a wrong message will work, because if the message is not detected, it will still default 
        // to a valid pastemyst language option, like Autodetect
        await logPostResponse('response Post Myst - wrong language', code, correctExpiration, wrongLanguage);
        // Requests with invalid expiration strings are expected to fail (status code 400)
        await logPostResponse('response Post Myst - wrong expiration', code, wrongExpiration, correctLanguage);
        await logPostResponse('response Post Myst - wrong expiration and language', code, wrongExpiration, wrongLanguage);
        // Undefined code still works, the content of the myst will then be 'undefined' as string
        await logPostResponse('response Post Myst - undefined code', undefined, correctExpiration, correctLanguage);

        try {
            // Requesting a wrong id (resulting in a web request on a non existent url) will return a 404 status code
            console.log('response Get myst with wrong id');
            const getResponse = await pastemystJs.getPasteMyst('qwertzuisdfghjkxcvbdfghjfgh');
            console.log(getResponse);
        }
        catch (error) {
            console.log(error);
        }
        
    }

    const testRegexMethods = function() {
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
        const discordLangs = ['cs', 'javascript', 'beta'];
        discordLangs.map(lang => console.log(`discord language ${lang} is PM language ${pastemystJs.discordToPasteMystLanguage(lang)}`));

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
    };

    const testExpirationEstimation = function() {
        const seconds1h = 60 * 60;
        const seconds1d = seconds1h * 24;
        const seconds1m = seconds1d * 30;
        const seconds1y = seconds1m * 12;

        const testEntryMap = {
            '0.5 hours':seconds1h * 0.5, 
            '1 hours': seconds1h, 
            '2 hours': seconds1h * 2, 
            '3 hours': seconds1h * 3, 
            '10 hours': seconds1h * 10, 
            '15 hours': seconds1h * 15, 
            '1 day': seconds1d, 
            '2 days': seconds1d * 2, 
            '3 days': seconds1d * 3, 
            '1 week': seconds1d * 7, 
            '1.5 weeks': seconds1d * 10.5, 
            '2 weeks': seconds1d * 14, 
            '1 month': seconds1m, 
            '2 months': seconds1m * 2, 
            '10 months': seconds1m * 10, 
            '1 year': seconds1y, 
            '2 years': seconds1y * 2
        };

        console.log('Expiration estimation test');
        for(const [durationName, durationVal] of Object.entries(testEntryMap)) {
            console.log(`${durationName} has lower expiration of ${pastemystJs.getNextLowerExpirationFromSeconds(durationVal)} and upper expiration of ${pastemystJs.getNextHigherExpirationFromSeconds(durationVal)}`);
        }
    };

    testMystCreationAndRetrieval();
    testMalformedRequests();
    testRegexMethods();
    testExpirationEstimation();

})();