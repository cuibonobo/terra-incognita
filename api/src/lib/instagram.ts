import { get } from './fetch';

const baseUrl = 'https://www.instagram.com/';

export interface HashtagImage {
  shortcode: string,
  caption: string[],
  comments: number,
  likes: number,
  thumbnail: string,
  timestamp: number,
  filePath?: string
}

const getEndpointUrl = (endpoint: string): string => {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }
  return baseUrl + endpoint;
};

// Cycle through image candidates to see which URL to use
const getImageUrl = (media: any, maxWidth: number = 800): string => {
  const candidates = media.carousel_media ? media.carousel_media[0]['image_versions2']['candidates'] : media['image_versions2']['candidates'];
  let imageUrl = '';
  for (let i = 0; i < candidates.length; i++) {
    imageUrl = candidates[i]['url'];
    if (candidates[i]['width'] <= maxWidth) {
      break;
    }
  }
  return imageUrl;
};

export const getHashtagImages = async (hashtag: string, sessionId: string): Promise<HashtagImage[]> => {
  const body = await get(getEndpointUrl(`explore/tags/${hashtag}`), {cookie: `sessionid=${sessionId}`});
  const matches = body.match(/_sharedData = (.+);/);
  if (!matches || matches.length < 2) {
    throw new Error("Couldn't parse `sharedData`!");
  }
  const data = JSON.parse(matches[1])['entry_data']['TagPage'][0]['data'];
  let medias: any[] = [];
  for (const section of data['recent']['sections']) {
    medias = [...medias, ...section['layout_content']['medias']]
  }
  return medias.map((m: any) => ({
    timestamp: m['media']['taken_at'],
    shortcode: m['media']['code'],
    caption: m['media'].caption ? m['media'].caption['text'] : '',
    comments: m['media'].comments ? m['media']['comments'].length : 0,
    likes: m['media']['like_count'],
    thumbnail: getImageUrl(m['media'])
  }));
};
