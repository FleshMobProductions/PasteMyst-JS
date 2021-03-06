# PasteMyst-JS

A wrapper for the [PasteMyst](https://paste.myst.rs/) web API for node.js with additional features for Discord bots. 
The source code is written in [TypeScript](https://www.typescriptlang.org/) and features [TSDoc](https://github.com/microsoft/tsdoc) documentation for the public API. 

## Generating the JavaScript Ouput files

To build the library files, open a command line in the root folder of the repository and either run 
```
tsc
```
or
```
npm run build
```
The output files will go into the lib folder. 

## Installing from the NPM repository

To install the published package from the npm repository, run following command: 
```
npm install pastemyst-js
```

## Usage examples

To use PasteMyst-JS, first import it to your project, and then load the module. 
If the package was installed from the npm repository, you can use: 
```js
const pastemystJs = require('pastemyst-js');
```

### Async PasteMyst Request methods

There are 2 methods to send requests to the PasteMyst API. 

- **createPasteMyst(code, expiration, language)** to create a code document entry 
    - **code** is used for the document content/body and can be any string value 
    - **expiration** indicates how long a document is saved on the server, starting from the time of creation. If a document exceeded its expiration time, it is deleted from PasteMyst. More information about valid values can be found in the [getting valid expirations](#getting-valid-expiration-strings-for-requests) section 
    - **language** is used for PasteMyst to identify which language syntax highlighting (styling) should be applied to the document body. More information about valid values can be found in the [getting valid languages](#getting-valid-language-options) section 


- **getPasteMyst(pasteMystId)** to retrieve an existing code document entry
    - **pasteMystId** is the ID of the document, which is also used for the URL of the document (like https://paste.myst.rs/abc)

Both methods are async and will return a Promise for an PasteMyst information object. 
If those methods are used, possible error cases like request timeouts or HTTP 400 response codes should be handled too. 

```js
// Create a new code document on PasteMyst
const codeBlockContent = 'console.log(1);';
const expirationTime = '1h';
const language = 'javascript';

pastemystJs.createPasteMyst(codeBlockContent, expirationTime, language)
  .then((pasteMystInfo) => {
    console.log('success');
    console.log(pasteMystInfo.id);
    console.log(pasteMystInfo.link); // URL to the PasteMyst entry
    console.log(pasteMystInfo.createdAt); // Creation date Linux seconds
    console.log(pasteMystInfo.date); // 'Created at' date, UTC
    console.log(pasteMystInfo.code);
    console.log(pasteMystInfo.expiresIn);
    console.log(pasteMystInfo.language);
  })
  .catch((err)=> {
    console.log('failure');
    console.error(err);
  });

// Retrieve an existing code document from PasteMyst by ID
const examplePasteMystId = 'abc';
pastemystJs.getPasteMyst(examplePasteMystId)
  .then((pasteMystInfo) => {
    console.log('success');
  })
  .catch((err) => {
    console.log('failure');
    console.error(err);
  });
```

### Getting valid expiration strings for requests

The PasteMyst API will reject requests for creating a new document if the expiration value doesn't match with [accepted expiration values](https://github.com/CodeMyst/PasteMyst/blob/master/source/pastemyst.d).

Valid expiration values are:  **never, 1h, 2h, 10h, 1d, 2d, 1w, 1m** or **1y**.

To get a valid expiration string, following methods can be used:

```js
const hourInSeconds = 60 * 60;

// A duration of 36 hours returns '1d' as lower expiration and '2d' as higher expiration
const lowerExpiration36h = pastemystJs.getNextLowerExpirationFromSeconds(36 * hourInSeconds);
console.log(lowerExpiration36h); // '1d'

const higherExpiration36h = pastemystJs.getNextHigherExpirationFromSeconds(36 * hourInSeconds);
console.log(higherExpiration36h); // '2d'

// For durations that perfectly match an expiration value, that value is returned
// lower and higher expirations are both '10h'
const lowerExpiration10h = pastemystJs.getNextLowerExpirationFromSeconds(10 * hourInSeconds);
console.log(lowerExpiration10h); // '10h'

const higherExpiration10h = pastemystJs.getNextHigherExpirationFromSeconds(10 * hourInSeconds);
console.log(higherExpiration10h); // '10h'

// Alternatively, it is possible to feed months, days and hours as parameters
const lowerExpiration1d12h = pastemystJs.getNextLowerExpiration(0, 1, 12);
console.log(lowerExpiration1d12h); // '1d'

const higherExpiration1d12h = pastemystJs.getNextHigherExpiration(0, 1, 12);
console.log(higherExpiration1d12h); // '2d'
```
An array containing all valid expiration values can be retrieved with: 
```js
const expirationOptions = pastemystJs.getExpirationOptions();
```

### Getting valid language options

When a code document is created with **createPasteMyst**, passed language values that are not valid for PasteMyst v1 are changed to '**autodetect**'. 

Here is a [full list of the valid languages](https://github.com/CodeMyst/PasteMyst/blob/master/public/languages.txt) that can be used for PasteMyst v1. 

There is also the possibility to retrieve an array with the valid language options:  
```js
const languageOptions = pastemystJs.getLanguageOptions();
```

A valid discord/highlight.js language identifier can also be converted to a valid PasteMyst language option, if one is available. If no matching language was found, the result will default to '**autodetect**'. 
```js
const pasteMystLanguageMd = pastemystJs.discordToPasteMystLanguage('md');
console.log(pasteMystLanguageMd); // 'markdown'

// Discord supports actionscript syntax highlighting, PasteMyst v1 does not
// The result will default to the default valid language option
const pasteMystLanguageAS = pastemystJs.discordToPasteMystLanguage('actionscript');
console.log(pasteMystLanguageAS); // 'autodetect'
```

### Discord bot helper methods

This library features methods to extract code block information from discord messages. Code blocks on discord are enclosed with \`\`\` at the start and the end of the block. 

As example, let's take the following discord message: 
```
Hi, I was wondering if someone could help me with this problem? 
I was testing if I can check if an array is empty, but this code returns true?

```js
console.log([] != []);
```.

Someone was suggesting that I should just check the length of the array. 
Is this the best way to do it or are there better ways?: 

```js
if (arrayVar.length == 0) {
  console.log('empty array');
}
```.

```
Now let's look at some possible operations, assuming that **message** has the value of the discord message above: 
```js
// Check if message contains code block: 
const containsCodeBlock = pastemystJs.containsDiscordCodeBlock(message);
console.log(containsCodeBlock); // true

// Get the PasteMyst compatible language value for the first 
// code block in the message, if a discord code language compatible 
// PasteMyst language exists: 
const firstBlockPasteMystLanguage = pastemystJs.getFirstDiscordCodeBlockLanguage(message);
console.log(firstBlockPasteMystLanguage); // 'javascript'

// Get the code block content for the first code block in the message: 
const firstBlockCodeContent = pastemystJs.getFirstDiscordCodeBlockContent(message);
console.log(firstBlockCodeContent); // 'console.log([] != []);';

// Get the full information about found code blocks and PasteMyst compatible 
// languages of the code blocks
const codeBlockInfos = pastemystJs.getFullDiscordCodeBlockInfo(message);
// codeBlockInfos is an array of objects that contains the keys 'language' 
// for the PasteMyst compatible language and 'code' for the code block content
console.log(codeBlockInfos.length); // 2
console.log(codeBlockInfos[0].language); // 'javascript'
console.log(codeBlockInfos[0].code); // 'console.log([] != []);';
```

### Usage with [discord.js](https://discord.js.org/)

This example shows how to use [discord.js](https://discord.js.org/) to create a PasteMyst document with the content of the incoming message and return a link to the document if the request was successful. 
A user has to send a message starting with **!codeblock** and some additional text afterwards. All words after !codeblock are used as document content for PasteMyst.
The bot sends the response messages back into the same channel the initial message was received from. If an error occurs during the request, the bot returns the details as a message. 
```js
const Discord = require('discord.js');
const pastemystJs = require('pastemyst-js');
const client = new Discord.Client();

client.on('message', msg => {
  // Get words of message as array
  const words = msg.content.split(' ');
  // First word is used as command identifier
  const command = words[0];
  // Skip the first word, which is stored in command, and reassemble the 
  // original string with the remaining words
  const argumentText = words.slice(1).join(' ');
  if (command === '!codeblock') {
    const codeBlockContent = argumentText;
    const expirationTime = '2h';
    const language = 'autodetect';
    pastemystJs.createPasteMyst(codeBlockContent, expirationTime, language)
      .then((pasteMystInfo) => {
        msg.channel.send(`Your message has been posted as code block on ${pasteMystInfo.link}`);
      })
      .catch((err) => {
        let errorMessage = `Posting code block failed with error: ${err}`;
        // Limit response to 2000 characters, as this is the discord character 
        // limit for one message
        if (errorMessage.length > 2000) {
          errorMessage = errorMessage.substring(0, 2000);
        }
        msg.cannel.send(errorMessage);
      });
  }
});

```
Thanks to [harshhh-dev](https://github.com/harshhh-dev) for suggesting changes to include the discord.js example and clarify parameter options for the PasteMyst API methods.  

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).