import { KvStore, getWranglerKv, getKvValue } from './lib/kv';
import { getNumArray } from '../../shared';

const maxNumImagesSqrt = 10;

const baseData: KvStore = {
  DATA: {
    meta: {
      imgHashtag: "landscape",
      imgWidth: 1600.0,
      imgHeight: 900.0,
      minNumImagesSqrt: 2,
      maxNumImagesSqrt,
      minImgSquareSize: 2,
      maxImgSquareSize: 25,
      cooldownTimeout: 3
    },
    numImagesSqrt: 5,
    imgSquareSize: 10,
    totalImages: 0,
    imgArray: async (length: number = Math.pow(maxNumImagesSqrt, 2)): Promise<number[]> => {
      const maxIdx = (await getWranglerKv('DATA', 'totalImages', 0)) as number;
      return getNumArray(0, maxIdx, length);
    }
  }
};

/**
 * Builds KV data without clobbering existing KV values.
 */
const defaultData = async (): Promise<KvStore> => {
  const output: any = {};
  for (const namespace in baseData) {
    output[namespace] = {};
    for (const key in baseData[namespace]) {
      const defaultValue = await getKvValue(baseData[namespace][key]);
      let value = await getWranglerKv(namespace, key, defaultValue);
      if (typeof value === 'object' && !Array.isArray(value) && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
        value = Object.assign(defaultValue, value);
      }
      output[namespace][key] = value;
    }
  }
  return output;
};

export default defaultData;
