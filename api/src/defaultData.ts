import { KvStore, getWranglerKv } from './lib/kv';

const baseData: KvStore = {
  DATA: {
    meta: {
      imgHashtag: "landscape",
      imgWidth: 1920.0,
      imgHeight: 1080.0
    },
    numImagesSqrt: 5,
    imgSquareSize: 10,
    totalImages: 0
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
      output[namespace][key] = await getWranglerKv(namespace, key, baseData[namespace][key])
    }
  }
  return output;
};

export default defaultData;
