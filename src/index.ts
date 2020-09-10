const axios = require('axios').default;

interface StringValueObject {
  [key: string]: string;
}

// https://github.com/CodeMyst/PasteMyst/blob/master/public/languages.txt
const pasteMystLanguages: StringValueObject = {
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
  Objective: 'objective', // should probably be Objective C?
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
  Yaml: 'yaml',
};

const pasteMystDefaultLanguage = pasteMystLanguages.Autodetect;

enum PasteMystExpiration {
  OneHour = '1h',
  TwoHours = '2h',
  TenHours = '10h',
  OneDay = '1d',
  TwoDays = '2d',
  OneWeek = '1w',
  OneMonth = '1m',
  OneYear = '1y',
  Never = 'never',
}

const validLanguages = Object.values(pasteMystLanguages);

// Keep expirations in ascending order to be able to step to the next higher or lower expiration
const validExpirations: string[] = [
  PasteMystExpiration.OneHour,
  PasteMystExpiration.TwoHours,
  PasteMystExpiration.TenHours,
  PasteMystExpiration.OneDay,
  PasteMystExpiration.TwoDays,
  PasteMystExpiration.OneWeek,
  PasteMystExpiration.OneMonth,
  PasteMystExpiration.OneYear,
  PasteMystExpiration.Never,
];

// Discord uses highlight.js
// https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md
// ToDo: Reference for future rewrite: https://github.com/CodeMyst/pastemyst-v2/blob/master/data/languages.json
const discordPMLanguageLookup: StringValueObject = {
  plaintext: 'plaintext',
  txt: 'plaintext',
  text: 'plaintext',
  bat: 'bat',
  cmd: 'bat',
  dos: 'bat',
  c: 'c',
  h: 'c',
  'c#': 'csharp',
  cs: 'csharp',
  csharp: 'csharp',
  cpp: 'cpp',
  hpp: 'cpp',
  cc: 'cpp',
  hh: 'cpp',
  'c++': 'cpp',
  'h++': 'cpp',
  cxx: 'cpp',
  hxx: 'cpp',
  css: 'css',
  clojure: 'clojure',
  clj: 'clojure',
  coffeescript: 'coffeescript',
  coffee: 'coffeescript',
  cson: 'coffeescript',
  iced: 'coffeescript',
  d: 'd',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  fsharp: 'fsharp',
  'f#': 'fsharp',
  go: 'go',
  golang: 'go',
  html: 'html',
  xhtml: 'html',
  handlebars: 'handlebars',
  hbs: 'handlebars',
  'html.hbs': 'handlebars',
  'html.handlebars': 'handlebars',
  ini: 'ini',
  json: 'json',
  java: 'java',
  jsp: 'java',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  lua: 'lua',
  markdown: 'markdown',
  md: 'markdown',
  mkdown: 'markdown',
  mkd: 'markdown',
  objective: 'objective',
  objectivec: 'objective',
  mm: 'objective',
  objc: 'objective',
  'obj-c': 'objective',
  php: 'php',
  php3: 'php',
  php4: 'php',
  php5: 'php',
  php6: 'php',
  php7: 'php',
  php8: 'php',
  perl: 'perl',
  pl: 'perl',
  pm: 'perl',
  powershell: 'powershell',
  ps: 'powershell',
  ps1: 'powershell',
  python: 'python',
  py: 'python',
  gyp: 'python',
  r: 'r',
  razor: 'razor',
  cshtml: 'razor',
  'razor-cshtml': 'razor',
  ruby: 'ruby',
  rb: 'ruby',
  gemspec: 'ruby',
  podspec: 'ruby',
  thor: 'ruby',
  irb: 'ruby',
  rust: 'rust',
  rs: 'rust',
  sql: 'sql',
  swift: 'swift',
  typescript: 'typescript',
  ts: 'typescript',
  vb: 'vb',
  visualbasic: 'vb',
  vbnet: 'vb',
  vba: 'vb',
  vbscript: 'vb',
  vbs: 'vb',
  xml: 'xml',
  rss: 'xml',
  atom: 'xml',
  xjb: 'xml',
  xsd: 'xml',
  xsl: 'xml',
  plist: 'xml',
  svg: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
};

// Capitalization for language in discord doesn't matter. ```php is as valid as ```pHp
// Do not use g (global flag) so that only the first complete match including capture groups is returned
// (instead of all whole match occurrences throughout the text, but without the capture group matches)
// First capture group is for language detection, second capture group for code block content detection
// The language might not be set in a discord message, so first capture group is optional
// For str.match expresisons. result[0] is the whole regext match,
// result[1] is first capture group match, result[2] is second capture group match etc
// When the language is not specified, there will be no matched language and the code block is the first capture group
// To make sure there is always at least one matched capture group, we require the code block to have some content,
// so there needs to be at least one character in a code block
// Include the \n to the language capture group and trim it out, otherwise there is no good approach I have
// found to make sure where the language declaration starts and where it ends
const codeBlockRegex = /```([a-zA-Z]*\s*\n)*([\s\S]+?)\n*```/;
// str.matchAll requires the regex to have the global flag set, otherwise TypeError will be thrown.
// str.matchAll will also include capture group matches
const codeBlockRegexMatchAll = /```([a-zA-Z]*\s*\n)*([\s\S]+?)\n*```/g;

/**
 * Determine if a value is a String
 *
 * @param {any} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val: any) {
  return typeof val === 'string' || val instanceof String;
}

/**
 * Tries to convert the specified discord code block language into a
 * valid PasteMyst language. If no matching language was found, will return 'autodetect'
 *
 * @remarks
 * Discord uses highlight.js, as such, the conversion should work for highlight.js language
 * keywords that related to one of the accepted languages of PasteMyst v1, a list of which can
 * be seen {@link https://github.com/CodeMyst/PasteMyst/blob/master/public/languages.txt | here}.
 *
 * @param discordLanguage - The specified code language (case insensitive) in the discord message
 * (values that follow the initial ``` and work for highlighting syntax in a code block)
 * @returns A valid PasteMyst language
 */
function discordToPasteMystLanguage(discordLanguage: string) {
  const pasteMystLanguage = discordPMLanguageLookup[discordLanguage.toLowerCase().trim()];
  return pasteMystLanguage !== undefined ? pasteMystLanguage : pasteMystDefaultLanguage;
}

exports.discordToPasteMystLanguage = discordToPasteMystLanguage;

/**
 * Checks if a discord message contains at least 1 code block
 *
 * @remarks
 * discord code blocks start and end with ```
 *
 * @param message - The Discord message
 * @returns true if a codeblock was found, otherwise false
 */
exports.containsDiscordCodeBlock = (message: string): boolean => {
  return message != null && isString(message) && codeBlockRegex.test(message);
};

/**
 * Converts the specified language of the first code block of a
 * discord into the matching valid PasteMyst language and returns it.
 * If no code block exists in the message, null will be returned.
 * If a code block exists but either no language was defined, or
 * no matching PasteMyst language was found, 'autodetect' is returned.
 *
 * @remarks
 * discord code blocks start and end with ```
 *
 * @param message - The discord message
 * @returns The first code block string if one is available, otherwise null
 */
exports.getFirstDiscordCodeBlockLanguage = (message: string): string | null => {
  if (message != null && isString(message)) {
    const languageCodeMatches = message.match(codeBlockRegex);
    if (languageCodeMatches) {
      const discordLanguage = getDiscordCodeLanguageFromMatch(languageCodeMatches);
      return discordToPasteMystLanguage(discordLanguage);
    }
  }
  return null;
};

/**
 * Returns the body of the first code block of a discord message, If one is available
 *
 * @remarks
 * discord code blocks start and end with ```
 *
 * @param message - The Discord message
 * @returns The first code block string if one is available, otherwise null
 */
exports.getFirstDiscordCodeBlockContent = (message: string): string | null => {
  if (message != null && isString(message)) {
    const languageCodeMatches = message.match(codeBlockRegex);
    if (languageCodeMatches) {
      const discordCodeBlock = getDiscordCodeBlockBodyFromMatch(languageCodeMatches);
      return discordCodeBlock;
    }
  }
  return null;
};

// If optional capture groups like the language group are not found, they
// still have their reserved index in the match but are undefined
function getDiscordCodeLanguageFromMatch(match: RegExpMatchArray) {
  const discordLanguage = match[1] !== undefined ? match[1].trim() : '';
  return discordLanguage;
}

function getDiscordCodeBlockBodyFromMatch(match: RegExpMatchArray) {
  const discordCodeBlock = match[2];
  return discordCodeBlock;
}

/**
 * Returns an array with PasteMyst relevant information for all code blocks in a discord message
 *
 * @remarks
 * discord code blocks start and end with ```
 *
 * @param message - The Discord message
 * @returns An array of objects with the keys 'language' for the PasteMyst compatible language and 'code' for the code block content
 */
exports.getFullDiscordCodeBlockInfo = (message: string): CodeBlockMatchResult[] => {
  const codeBlockInfos = [];
  if (message != null && isString(message)) {
    const matches = message.matchAll(codeBlockRegexMatchAll);
    for (const match of matches) {
      if (match) {
        const matchDetails = getCodeBlockRgxMatchDetail(match);
        codeBlockInfos.push(matchDetails);
      }
    }
  }
  return codeBlockInfos;
};

export interface CodeBlockMatchResult {
  language: string;
  code: string;
}

function getCodeBlockRgxMatchDetail(match: RegExpMatchArray): CodeBlockMatchResult {
  const discordLanguage = getDiscordCodeLanguageFromMatch(match);
  return {
    language: discordToPasteMystLanguage(discordLanguage),
    code: getDiscordCodeBlockBodyFromMatch(match),
  };
}

/**
 * Uses the cumulative time value of the input parameters and returns a PasteMyst expiration
 * that matches at least the duration of the input time or a higher value
 *
 * @param months - Number of months (1 month is counted as 30 days)
 * @param days - Number of days
 * @param hours - Number of hours
 * @returns A valid PasteMyst expiration value
 */
exports.getNextHigherExpiration = (months: number, days: number, hours: number): PasteMystExpiration => {
  const expirationHours = getHours(months, days, hours);
  return getNextHigherExpirationFromHours(expirationHours);
};

/**
 * Returns a PasteMyst expiration
 * that matches at least the duration of the input time or a higher value
 *
 * @param expirationSeconds - The expiration duration in seconds
 * @returns A valid PasteMyst expiration value
 */
exports.getNextHigherExpirationFromSeconds = (expirationSeconds: number): PasteMystExpiration => {
  const expirationHours = secondsToHours(expirationSeconds);
  return getNextHigherExpirationFromHours(expirationHours);
};

/**
 * Uses the cumulative time value of the input parameters and returns a PasteMyst expiration
 * that matches maximally the duration of the input time or a lower value
 *
 * @param months - Number of months (1 month is counted as 30 days)
 * @param days - Number of days
 * @param hours - Number of hours
 * @returns A valid PasteMyst expiration value
 */
exports.getNextLowerExpiration = (months: number, days: number, hours: number): PasteMystExpiration => {
  const expirationHours = getHours(months, days, hours);
  return getNextLowerExpirationFromHours(expirationHours);
};

/**
 * Returns a PasteMyst expiration
 * that matches maximally the duration of the input time or a lower value
 *
 * @param expirationSeconds - The expiration duration in seconds
 * @returns A valid PasteMyst expiration value
 */
exports.getNextLowerExpirationFromSeconds = (expirationSeconds: number): PasteMystExpiration => {
  const expirationHours = secondsToHours(expirationSeconds);
  return getNextLowerExpirationFromHours(expirationHours);
};

function secondsToHours(seconds: number): number {
  return seconds / 3600;
}

function getHours(months: number, days: number, hours: number): number {
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

function getNextHigherExpirationFromHours(expirationHours: number): PasteMystExpiration {
  const hours1d = 24;
  const hours1m = hours1d * 30;
  const hours1y = hours1m * 12;
  if (expirationHours > hours1y) {
    return PasteMystExpiration.Never;
  }
  if (expirationHours > hours1m) {
    return PasteMystExpiration.OneYear;
  }
  if (expirationHours > hours1d * 7) {
    return PasteMystExpiration.OneMonth;
  }
  if (expirationHours > hours1d * 2) {
    return PasteMystExpiration.OneWeek;
  }
  if (expirationHours > hours1d) {
    return PasteMystExpiration.TwoDays;
  }
  if (expirationHours > 10) {
    return PasteMystExpiration.OneDay;
  }
  if (expirationHours > 2) {
    return PasteMystExpiration.TenHours;
  }
  if (expirationHours > 1) {
    return PasteMystExpiration.TwoHours;
  }
  return PasteMystExpiration.OneHour;
}

function getNextLowerExpirationFromHours(expirationHours: number): PasteMystExpiration {
  // Add a very slight amount of time so that 2hours does not fall into the 1 hours but 2 hours category for example,
  // due to how checks in getNextHigherExpirationFromHours are handled
  const nextHigherExpiration = getNextHigherExpirationFromHours(expirationHours + 0.01);
  return getPreviousExpiration(nextHigherExpiration);
}

function getPreviousExpiration(expirationStr: string): PasteMystExpiration {
  const index = validExpirations.indexOf(expirationStr);
  if (index < 0) {
    return PasteMystExpiration.Never;
  }
  if (index === 0) {
    return getMinimumExpiration();
  }
  return validExpirations[index - 1] as PasteMystExpiration;
}

function getMinimumExpiration(): PasteMystExpiration {
  return PasteMystExpiration.OneHour;
}

// language will default to pasteMystLanguages.Autodetect if no valid language is specified
function getValidLanguage(value: string) {
  return getValidKeyword(value, validLanguages, pasteMystDefaultLanguage);
}

// returns the input if value is a valid expiration, otherwise 'Unknown'
function getExpiration(value: string) {
  return getValidKeyword(value, validExpirations, 'Unknown');
}

function getValidKeyword(value: string, keywords: string[], defaultValue: string) {
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
  getEndpoint: 'https://paste.myst.rs/api/paste?id=',
};

class PasteMystForm {
  code: string;
  expiresIn: string;
  language: string;

  constructor(code: string, expiresIn: string, language: string) {
    this.code = code;
    this.expiresIn = expiresIn;
    this.language = language;
  }
}

function createForm(code: string, expiresIn: string, language: string) {
  return new PasteMystForm(encodeURI(code), getExpiration(expiresIn), getValidLanguage(language));
}

export class PasteMystInfo {
  id: string;
  link: string;
  createdAt: number;
  date: Date;
  code: string;
  expiresIn: string;
  language: string;

  constructor(id: string, link: string, createdAt:number, date: Date, code: string, expiresIn: string, language: string) {
    this.id = id;
    this.link = link;
    this.createdAt = createdAt;
    this.date = date;
    this.code = code;
    this.expiresIn = expiresIn;
    this.language = language;
  }
}

interface PMServerResponse {
  id: string;
  createdAt: number;
  code: string;
  expiresIn: string;
  language: string;
}

function createPasteMystInfoFromResponse(response: PMServerResponse) {
  return new PasteMystInfo(
    response.id,
    pasteMystUrlInfo.endpoint + response.id,
    response.createdAt,
    utcDateFromUnixSeconds(response.createdAt),
    response.code,
    response.expiresIn,
    response.language,
  );
}

function utcDateFromUnixSeconds(unixSeconds: number) {
  return new Date(unixSeconds * 1000);
}

function localDateFromUnixSeconds(unixSeconds: number) {
  return convertUTCDateToLocalDate(utcDateFromUnixSeconds(unixSeconds));
}

function convertUTCDateToLocalDate(date: Date) {
  const newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return newDate;
}

/**
 * Sends a post request to the PasteMyst service, requesting the creation of the PasteMyst with the specified values.
 * The caller of this method should add error handling as this method throws if there is an http request
 * error (for example from the post payload having invalid values, such as a non-valid expiration string)
 * or in case the response was malformed
 *
 * @param code - The code/text content of the PasteMyst
 * @param expiration - A valid expiration string. If invalid, the service will reject the request
 * @param language - A valid PasteMyst language option. If invalid, the language will default to 'autodetect'
 * @returns A processed version of the PasteMyst information the server returns for the PasteMyst that was created in this request
 */
exports.createPasteMyst = async (code: string, expiration: string, language: string): Promise<PasteMystInfo> => {
  const form = createForm(code, expiration, language);
  const json = JSON.stringify(form);
  const options = {
    method: 'post',
    url: pasteMystUrlInfo.postEndpoint,
    responseEncoding: 'utf8',
    headers: {
      'Content-Type': 'application/json',
    },
    data: json,
  };
  const axiosRequest = axios(options);
  return await handleAxiosRequestAndCreateMyst(axiosRequest);
};

/**
 * Requests and returns a PasteMyst from the PasteMyst service.
 * The caller of this method should add error handling as this method throws if there is an http request
 * error (for example from passing an invalid ID) or in case the response was malformed
 *
 * @param id - The ID of the myst to retrieve
 * @returns A processed version of the PasteMyst information the server returns
 */
exports.getPasteMyst = async (id: string): Promise<PasteMystInfo> => {
  const axiosRequest = axios.get(pasteMystUrlInfo.getEndpoint + id);
  return await handleAxiosRequestAndCreateMyst(axiosRequest);
};

async function handleAxiosRequestAndCreateMyst(axiosRequest: any) {
  let response;
  try {
    response = await axiosRequest;
  } catch (error) {
    throw error;
  }
  if (!validateResponseData(response.data)) {
    const malformMessage = getMalformedResponseDataMessage(response.data);
    throw new Error(`Response received, but malformed: ${malformMessage}`);
  }
  try {
    const pasteMystInfo = createPasteMystInfoFromResponse(response.data);
    return pasteMystInfo;
  } catch (dataParseError) {
    throw new Error(`Response received, error trying to create PasteMystInfo from it: ${dataParseError}`);
  }
}

const requiredResponseDataAttributes = ['id', 'createdAt', 'code', 'expiresIn', 'language'];

function validateResponseData(responseData: any) {
  return (
    responseData != null && requiredResponseDataAttributes.every((attribute) => responseData[attribute] !== undefined)
  );
}

function getMalformedResponseDataMessage(responseData: any) {
  return `Expected response data object to have keys ${requiredResponseDataAttributes}\nActual response data: ${String(
    responseData,
  )}`;
}

// Return a copy of the array to prevent external code from editing the source array
/**
 * Returns a copy of the array containing all valid PasteMyst v1 language options
 *
 * @returns All valid PasteMyst v1 language options
 */
exports.getLanguageOptions = () => {
  return validLanguages.slice();
};

/**
 * Returns a copy of the array containing all valid PasteMyst expiration options
 *
 * @returns All valid PasteMyst expiration options
 */
exports.getExpirationOptions = () => {
  return validExpirations.slice();
};
