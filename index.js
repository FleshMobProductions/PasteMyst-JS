const axios = require("axios")

// https://github.com/CodeMyst/PasteMyst/blob/master/public/languages.txt
const pasteMystLanguages = {
    Autodetect: 'autodetect',
    Plaintext: 'plaintext',
    Batch: 'bat',
    C: 'c',
    Csharp: 'csharp',
    Cpp: 'cpp',
    Css: 'css',
    Clojure: 'clojure',
    Coffeescript: 'coffeescript',
    D: 'd',
    Dockerfile: 'dockerfile',
    Fsharp: 'fsharp',
    Go: 'go',
    Html: 'html',
    Handlebars: 'handlebars',
    Ini: 'ini',
    Json: 'json',
    Java: 'java',
    Javascript: 'javascript',
    Lua: 'lua',
    Markdown: 'markdown',
    Objective: 'objective',  // should probably be Objective C?
    Php: 'php',
    Perl: 'perl',
    Powershell: 'powershell',
    Python: 'python',
    R: 'r',
    Razor: 'razor',
    Ruby: 'ruby',
    Rust: 'rust',
    Sql: 'sql',
    Swift: 'swift',
    Typescript: 'typescript',
    Visualbasic: 'vb',
    Xml: 'xml',
    Yaml: 'yaml'
};

const pasteMystExpiration = {
    OneHour: '1h' ,
    TwoHours: '2h' ,
    TenHours: '10h' ,
    OneDay: '1d' ,
    TwoDays: '2d' ,
    OneWeek: '1w' ,
    OneMonth: '1m' ,
    OneYear: '1y' , 
    Never: 'never',
};


/*
// https://github.com/CodeMyst/PasteMyst/blob/master/public/languages.txt
const validLanguages = [
    'autodetect',
    'plaintext',
    'bat',
    'c',
    'csharp',
    'cpp',
    'css',
    'clojure',
    'coffeescript',
    'd',
    'dockerfile',
    'fsharp',
    'go',
    'html',
    'handlebars',
    'ini',
    'json',
    'java',
    'javascript',
    'lua',
    'markdown',
    'objective',
    'php',
    'perl',
    'powershell',
    'python',
    'r',
    'razor',
    'ruby',
    'rust',
    'sql',
    'swift',
    'typescript',
    'vb',
    'xml',
    'yaml'
];
*/
const validLanguages = Object.values(pasteMystLanguages);

// Keep expirations in ascending order to be able to step to the next higher or lower expiration
const validExpirations = [
    pasteMystExpiration.OneHour,
    pasteMystExpiration.TwoHours,
    pasteMystExpiration.TenHours,
    pasteMystExpiration.OneDay,
    pasteMystExpiration.TwoDays,
    pasteMystExpiration.OneWeek,
    pasteMystExpiration.OneMonth,
    pasteMystExpiration.OneYear, 
    pasteMystExpiration.Never
];

// Discord uses highlight.js
// https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md
// ToDo: Reference for future rewrite: https://github.com/CodeMyst/pastemyst-v2/blob/master/data/languages.json
const discordPMLanguageLookup = {
    'plaintext': 'plaintext',
    'txt': 'plaintext',
    'text': 'plaintext',
    'bat': 'bat',
    'cmd': 'bat',
    'dos': 'bat',
    'c': 'c',
    'h': 'c',
    'c#': 'csharp',
    'cs': 'csharp',
    'csharp': 'csharp',
    'cpp': 'cpp',
    'hpp': 'cpp',
    'cc': 'cpp',
    'hh': 'cpp',
    'c++': 'cpp',
    'h++': 'cpp',
    'cxx': 'cpp',
    'hxx': 'cpp',
    'css': 'css',
    'clojure': 'clojure',
    'clj': 'clojure',
    'coffeescript': 'coffeescript',
    'coffee': 'coffeescript',
    'cson': 'coffeescript',
    'iced': 'coffeescript',
    'd': 'd',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'fsharp': 'fsharp',
    'f#': 'fsharp',
    'f#': 'fsharp',
    'go': 'go',
    'golang': 'go',
    'html': 'html',
    'xhtml': 'html',
    'handlebars': 'handlebars',
    'hbs': 'handlebars',
    'html.hbs': 'handlebars',
    'html.handlebars': 'handlebars',
    'ini': 'ini',
    'json': 'json',
    'java': 'java',
    'jsp': 'java',
    'javascript': 'javascript',
    'js': 'javascript',
    'jsx': 'javascript',
    'lua': 'lua',
    'markdown': 'markdown',
    'md': 'markdown',
    'mkdown': 'markdown',
    'mkd': 'markdown',
    'objective': 'objective',
    'objectivec': 'objective',
    'mm': 'objective',
    'objc': 'objective',
    'obj-c': 'objective',
    'php': 'php',
    'php3': 'php',
    'php4': 'php',
    'php5': 'php',
    'php6': 'php',
    'php7': 'php',
    'php8': 'php',
    'perl': 'perl',
    'pl': 'perl',
    'pm': 'perl',
    'powershell': 'powershell',
    'ps': 'powershell',
    'ps1': 'powershell',
    'python': 'python',
    'py': 'python',
    'gyp': 'python',
    'r': 'r',
    'razor': 'razor',
    'cshtml': 'razor',
    'razor-cshtml': 'razor',
    'ruby': 'ruby',
    'rb': 'ruby',
    'gemspec': 'ruby',
    'podspec': 'ruby',
    'thor': 'ruby',
    'irb': 'ruby',
    'rust': 'rust',
    'rust': 'rs',
    'sql': 'sql',
    'swift': 'swift',
    'typescript': 'typescript',
    'ts': 'typescript',
    'vb': 'vb',
    'visualbasic': 'vb',
    'vbnet': 'vb',
    'vba': 'vb',
    'vbscript': 'vb',
    'vbs': 'vb',
    'xml': 'xml',
    'rss': 'xml',
    'atom': 'xml',
    'xjb': 'xml',
    'xsd': 'xml',
    'xsl': 'xml',
    'plist': 'xml',
    'svg': 'xml',
    'yaml': 'yaml', 
    'yml': 'yaml'
};

// Capitalization for language in discord doesn't matter. ```php is as valid as ```pHp
// Do not use g (global flag) so that only the first complete match including capture groups is returned
// (instead of all whole match occurrences throughout the text, but without the capture group matches)
// First capture group is for language detection, second capture group for code block content detection
// The language might not be set in a discord message, so first capture group is optional
// For str.match expresisons. result[0] is the whole regext match, 
// result[1] is first capture group match, result[2] is second capture group match etc
const codeBlockRegex = /```([a-zA-Z]*)\s*\n([\s\S]*?)\n*```/;
// str.matchAll requires the regex to have the global flag set, otherwise TypeError will be thrown.
// str.matchAll will also include capture group matches
const codeBlockRegexMatchAll = /```([a-zA-Z]*)\s*\n([\s\S]*?)\n*```/g;

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
    return typeof val == 'string' || val instanceof String;
  }

function discordToPasteMystLanguage(discordLanguage) {
    const pasteMystLanguage = discordPMLanguageLookup[discordLanguage.toLowerCase()];
    return pasteMystLanguage !== undefined ? pasteMystLanguage : 'Unkown';
}

exports.discordToPasteMystLanguage = discordToPasteMystLanguage;

// getFirstDiscordCodeBlockLanguage and getFirstDiscordCodeBlockContent currently 
// Only support processing of the first code block of a message with potentially 
// multiple blocks
exports.getFirstDiscordCodeBlockLanguage = function(message) {
    if (message != null && isString(message)) {
        const languageCodeMatches = message.match(codeBlockRegex);
        //console.log('getFirstDiscordCodeBlockLanguage: found languageCodeMatches:');
        //console.log(languageCodeMatches);
        if (languageCodeMatches && languageCodeMatches.length > 1) {
            return discordToPasteMystLanguage(languageCodeMatches[1]);
        }
    } 
    return 'Unknown';
}

exports.getFirstDiscordCodeBlockContent = function(message) {
    if (message != null && isString(message)) {
        const languageCodeMatches = message.match(codeBlockRegex);
        //console.log('getFirstDiscordCodeBlockContent: found languageCodeMatches:');
        //console.log(languageCodeMatches);
        if (languageCodeMatches && languageCodeMatches.length > 2) {
            return languageCodeMatches[2];
        }
    } 
    return '';
}

exports.containsDiscordCodeBlock = function(message) {
    return message != null && isString(message) && codeBlockRegex.test(message);
}

exports.getFullDiscordCodeBlockInfo = function(message) {
    let codeBlockInfos = [];
    if (message != null && isString(message)) {
        const matches = message.matchAll(codeBlockRegexMatchAll);
        //console.log('getFullCodeBlockInfo: found matches:');
        for (const match of matches) {
            //console.log(match);
            const matchDetails = getCodeBlockRgxMatchDetail(match);
            codeBlockInfos.push(matchDetails);
        }
    } 
    return codeBlockInfos;
}

function getCodeBlockRgxMatchDetail(match) {
    if (match && match.length > 2) {
        return {
            language: discordToPasteMystLanguage(match[1]), 
            code: match[2]
        };
    }
    return {};
}

exports.getNextHigherExpiration = function(months, days, hours) {
    const expirationHours = getHours(months, days, hours);
    return getNextHigherExpirationFromHours(expirationHours);
}

exports.getNextHigherExpirationFromSeconds = function(expirationSeconds) {
    const expirationHours = secondsToHours(expirationSeconds);
    return getNextHigherExpirationFromHours(expirationHours);
}

exports.getNextLowerExpiration = function(months, days, hours) {
    const expirationHours = getHours(months, days, hours);
    return getNextLowerExpirationFromHours(expirationHours);
}

exports.getNextLowerExpirationFromSeconds = function(expirationSeconds) {
    const expirationHours = secondsToHours(expirationSeconds);
    return getNextLowerExpirationFromHours(expirationHours);
}

function secondsToHours(seconds) {
    return seconds / 3600;
}

function getHours(months, days, hours) {
    if (months == undefined) {
        months = 0;
    }
    if (days == undefined) {
        days = 0;
    }
    if (hours == undefined) {
        hours = 0;
    }
    // Assuming 30 days for a month
    return months * 720 + days * 24 + hours;
}

function getNextHigherExpirationFromHours(expirationHours) {
    const hours1d = 24;
    const hours1m = hours1d * 30;
    const hours1y = hours1m * 12;
    if (expirationHours > hours1y) {
        return pasteMystExpiration.Never;
    }
    if (expirationHours > hours1m) {
        return pasteMystExpiration.OneYear;
    }
    if (expirationHours > hours1d * 7) {
        return pasteMystExpiration.OneMonth;
    }
    if (expirationHours > hours1d * 2) {
        return pasteMystExpiration.OneWeek;
    }
    if (expirationHours > hours1d) {
        return pasteMystExpiration.TwoDays;
    }
    if (expirationHours > 10) {
        return pasteMystExpiration.OneDay;
    }
    if (expirationHours > 2) {
        return pasteMystExpiration.TenHours;
    }
    if (expirationHours > 1) {
        return pasteMystExpiration.TwoHours;
    }
    return pasteMystExpiration.OneHour;
}

function getNextLowerExpirationFromHours(expirationHours) {
    // Add a very slight amount of time so that 2hours does not fall into the 1 hours but 2 hours category for example, 
    // due to how checks in getNextHigherExpirationFromHours are handled
    const nextHigherExpiration = getNextHigherExpirationFromHours(expirationHours + 0.01);
    return getPreviousExpiration(nextHigherExpiration);
}

function getPreviousExpiration(expirationStr) {
    let index = validExpirations.indexOf(expirationStr);
    if (index < 0) {
        return 'never';
    }
    if (index == 0) {
        return getMinimumExpiration();
    }
    return validExpirations[index - 1];
}

function getMinimumExpiration() {
    return pasteMystExpiration.OneHour;
}

// language will default to pasteMystLanguages.Autodetect if no valid language is specified
function getValidLanguage(value) {
    return getValidKeyword(value, validLanguages, pasteMystLanguages.Autodetect);
}

function getValidExpiration(value) {
    return getValidKeyword(value, validExpirations, 'Unknown');
}

function getValidKeyword(value, keywords, defaultValue) {
    if (value != null) {
        const lowerValue = value.toLowerCase();
        if (keywords.indexOf(lowerValue) >= 0) {
            return lowerValue;
        }
    }
    return defaultValue;
}

const pasteMystUrlInfo = {
    endpoint: 'https://paste.myst.rs/', 
    postEndpoint: 'https://paste.myst.rs/api/paste', 
    getEndpoint: 'https://paste.myst.rs/api/paste?id='
};

class PasteMystForm {
    constructor(code, expiresIn, language) {
        this.code = code;
        this.expiresIn = expiresIn;
        this.language = language;
    }
}

function createForm(code, expiresIn, language) {
    return new PasteMystForm
    (
        encodeURI(code), 
        getValidExpiration(expiresIn),
        getValidLanguage(language)
    );
};

class PasteMystInfo {
    constructor(id, link, date, code, expiration, language) {
        this.id = id;
        this.link = link;
        this.date = date;
        this.code = code;
        this.expiration = expiration;
        this.language = language;
    }
}

function createPasteMystInfoFromResponse(response) {
    return new PasteMystInfo
    (
        response.id,
        pasteMystUrlInfo.endpoint + response.id,
        utcDateFromUnixSeconds(response.createdAt),
        decodeURI(response.code),
        response.expiresIn,
        response.language
    );
}

function utcDateFromUnixSeconds(unixSeconds) {
    return new Date(unixSeconds * 1000);
}

function localDateFromUnixSeconds(unixSeconds) {
    return convertUTCDateToLocalDate(utcDateFromUnixSeconds(unixSeconds));
}

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
    return newDate;   
}

// ToDo: add error handling
exports.createPasteMyst = async function(code, expiration, language) {
    console.log(`postMyst: code: ${code}, expiration: ${expiration}, language: ${language}`);
    const form = createForm(code, expiration, language);
    const json = JSON.stringify(form);
    const options = {
        method: 'post', 
        url: pasteMystUrlInfo.postEndpoint, 
        responseEncoding: 'utf8', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        data: json
    };
    console.log(options);
    const axiosRequest = axios(options)
    return await handleAxiosRequestAndCreateMyst(axiosRequest);
}

exports.getPasteMyst = async function(id) {
    console.log(`getInfo: id: ${id}`);
    const axiosRequest = axios.get(pasteMystUrlInfo.getEndpoint + id);
    return await handleAxiosRequestAndCreateMyst(axiosRequest);
}

async function handleAxiosRequestAndCreateMyst(axiosRequest) {
    let response;
    try {
        response = await axiosRequest;
        // console.log('response');
        // console.log(response);
    }
    catch (error) {
        throw error;
    }
    if (!validateResponseData(response.data)) {
        const malformMessage = getMalformedResponseDataMessage(response.data);
        throw `Response received, but malformed: ${malformMessage}`;
    }
    try {
        const pasteMystInfo = createPasteMystInfoFromResponse(response.data);
        // console.log('pasteMystInfo');
        // console.log(pasteMystInfo);
        return pasteMystInfo;
    }
    catch (dataParseError) {
        throw `Response received, error trying to create PasteMystInfo from it: ${dataParseError}`
    }
}

const requiredResponseDataAttributes = [
    'id', 
    'createdAt', 
    'code', 
    'expiresIn', 
    'language'
];

function validateResponseData(responseData) {
    return responseData != null 
    && requiredResponseDataAttributes.every(attribute => responseData[attribute] !== undefined)
}

function getMalformedResponseDataMessage(responseData) {
    return `Expected response data object to have keys ${requiredResponseDataAttributes}\nActual response data: ${String(responseData)}`;
}

// Return a copy of the array to prevent external code from editing the source array
exports.getLanguageOptions = function() {
    return validLanguages.slice();
}

exports.getExpirationOptions = function() {
    return validExpirations.slice();
}