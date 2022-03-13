export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export interface Meta {
  imgHashtag: string,
  imgWidth: number,
  imgHeight: number,
  minNumImagesSqrt: number,
  maxNumImagesSqrt: number,
  minImgSquareSize: number,
  maxImgSquareSize: number
}

export const getNumArray = (minimum: number, maximum: number, length: number): number[] => {
  const output: number[] = [];
  if (maximum - minimum < length) {
    length = maximum - minimum;
  }
  while (output.length < length) {
    output.push(getRandomUniqueValue(minimum, maximum, output));
  }
  return output;
};

export const getRandomUniqueValue = (minimum: number, maximum: number, values: number[]) => {
  while (true) {
    const candidate = minimum + Math.floor(Math.random() * maximum);
    if (values.indexOf(candidate) < 0) {
      return candidate;
    }
  }
};

export const getRandomString = (length: number, prefix: string = '', characters?: string) => {
  if (length < 0) {
    throw new RangeError('Not defined for negative numbers!');
  }
  length = Math.floor(length);
  characters = characters ? characters : '0123456789abcdefghjkmnpqrstvwxyz';
  let output = '';
  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * characters.length)]
  }
  return prefix + output;
};

export const stringify = <T>(value: T, escapeQuotes: boolean = false) => {
  let output = typeof(value) === "string" ? value : JSON.stringify(value);
  if (escapeQuotes) {
    output = JSON.stringify(output);
  }
  return output;
};
