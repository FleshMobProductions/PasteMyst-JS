const https = require("https")

const pasteMystLanguage2 = {
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

function toValidLanguage(value) {
    return getValidKeyword(value, validLanguages);
}

function toValidExpiration(value) {
    return getValidKeyword(value, validExpirations);
}

function getValidKeyword(value, keywords) {
    if (value != null) {
        const lowerValue = value.toLowerCase();
        if (keywords.indexOf(lowerValue)) {
            return lowerValue;
        }
    }
    return "Unknown";
}
PasteMystInfoJson:
[JsonPropertyName("id")]
public string Id { get; set; }

[JsonPropertyName("createdAt")]
public uint Date { get; set; } // unix epoch time, ticks?

[JsonPropertyName("code")]
public string Code { get; set; }

[JsonPropertyName("expiresIn")]
public string Expiration { get; set; }

[JsonPropertyName("language")]
public string Language { get; set; }


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

const pasteMystConstants = {
    PmEndpoint = "https://paste.myst.rs/", 
    PmPostEndpoint = "https://paste.myst.rs/api/paste", 
    PmGetEndpoint = "https://paste.myst.rs/api/paste?id="
};




class PasteMystForm {
    constructor(code, expiration, language) {
        this.code = code;
        this.expiration = expiration;
        this.language = language;
    }
}

class PasteMystFormJson {
    constructor(code, expiresIn, language) {
        this.code = code;
        this.expiresIn = expiresIn;
        this.language = language;
    }
}

PasteMystFormJson.prototype.toJson = function(form) {
    return new PasteMystFormJson
    (
        encodeURI(form.Code),
        Expiration = form.Expiration.GetStringRepresentation(),
        Language = form.Language.GetStringRepresentation()
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

PasteMystInfo.prototype.fromJson = function(json) {
    return new PasteMystInfo
    (
        json.Id,
        PasteMystConstants.PmEndpoint + json.Id,
        DateTimeOffset.FromUnixTimeSeconds(json.Date).DateTime,
        Uri.UnescapeDataString(json.Code),
        StringRepresentationExtensions.StringToExpiration(json.Expiration),
        StringRepresentationExtensions.StringToLanguage(json.Language)
    );
}



exports.printMsg = function() {
    console.log('This is a message from the demo package');
  }