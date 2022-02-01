declare module 'scraper-instagram' {
  export default class Scraper {
    getHashtag: (hashtag: string) => any
  }
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
