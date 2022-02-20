declare module 'scraper-instagram' {
  export default class Scraper {
    authBySessionId: (sessionId: string) => any
    getHashtag: (hashtag: string) => any
  }
}

declare module 'rimraf' {
  export default function (path: string): void;
}

type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }
