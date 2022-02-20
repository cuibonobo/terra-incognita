import crypto from 'crypto';
import { KvStore, getWranglerKv, getKvValue } from './lib/kv';

const baseData: KvStore = {
  DATA: {
    meta: {
      imgHashtag: "landscape",
      imgWidth: 1920.0,
      imgHeight: 1080.0
    },
    numImagesSqrt: 5,
    imgSquareSize: 10,
    totalImages: 0,
    imgArray: async (length: number = 100): Promise<number[]> => {
      const maxIdx = (await getWranglerKv('DATA', 'totalImages', 0)) as number;
      return getNumArray(0, maxIdx, length);
    }
  }
};

const getNumArray = (minimum: number, maximum: number, length: number): number[] => {
  const output: number[] = [];
  if (maximum - minimum < length) {
    length = maximum - minimum;
  }
  while (output.length < length) {
    while (true) {
      const candidate = crypto.randomInt(minimum, maximum);
      if (output.indexOf(candidate) < 0) {
        output.push(candidate);
        break;
      }
    }
  }
  return output;
};

/**
 * Builds KV data without clobbering existing KV values.
 */
const defaultData = async (): Promise<KvStore> => {
  const output: any = {};
  for (const namespace in baseData) {
    output[namespace] = {};
    for (const key in baseData[namespace]) {
      output[namespace][key] = await getWranglerKv(namespace, key, await getKvValue(baseData[namespace][key]));
    }
  }
  return output;
};

export default defaultData;
