const axios = require("axios")

/*
const pasteMystLanguages = {
    Unknown: 'Unknown', 
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
    Objective: 'objective',
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
    Unknown: 'Unknown', 
    Never: "never",
    OneHour: "1h" ,
    TwoHours: "2h" ,
    TenHours: "10h" ,
    OneDay: "1d" ,
    TwoDays: "2d" ,
    OneWeek: "1w" ,
    OneMonth: "1m" ,
    OneYear: "1y" 
};
*/

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

const validExpirations = [
    "never",
    "1h" ,
    "2h" ,
    "10h" ,
    "1d" ,
    "2d" ,
    "1w" ,
    "1m" ,
    "1y" 
];

function getValidLanguage(value) {
    return getValidKeyword(value, validLanguages);
}

function getValidExpiration(value) {
    return getValidKeyword(value, validExpirations);
}

function getValidKeyword(value, keywords) {
    if (value != null) {
        const lowerValue = value.toLowerCase();
        if (keywords.indexOf(lowerValue) >= 0) {
            return lowerValue;
        }
    }
    return "Unknown";
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
        data: json // should we just send the form here?
    };
    console.log(options);
    const response = await axios(options)
    .catch(err => console.log(`post error: ${err}`));
    console.log('response');
    console.log(response);
    const pasteMystInfo = createPasteMystInfoFromResponse(response.data);
    console.log('pasteMystInfo');
    console.log(pasteMystInfo);
    return pasteMystInfo;
}

exports.getPasteMyst = async function(id) {
    console.log(`getInfo: id: ${id}`);
    const response = await axios.get(pasteMystUrlInfo.getEndpoint + id);
    console.log(response);
    const pasteMystInfo = createPasteMystInfoFromResponse(response.data);
    console.log(pasteMystInfo);
    return pasteMystInfo;
}

// Return a copy of the array to prevent external code from editing the source array
exports.getLanguageOptions = function() {
    return validLanguages.slice();
}

exports.getExpirationOptions = function() {
    return validExpirations.slice();
}