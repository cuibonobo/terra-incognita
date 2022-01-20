const fs = require('fs');
const util = require('util');
const https = require('https');
const Scraper = require('scraper-instagram');
const Stream = require('stream').Transform;

const imgHashtag = 'landscape';

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

const getHashtagResult = async (hashtag) => {
  const client = new Scraper();
  return await client.getHashtag(hashtag);
};

const downloadImage = async (url, destName) => {
  return new Promise((resolve, reject) => {
    https.request(url, (response) => {
      const data = new Stream();

      response.on('data', (chunk) => {
        data.push(chunk);
      });

      response.on('end', () => {
        fs.writeFile(destName, data.read(), (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        })
      });
    }).end();
  });
};

let writeImageNames = async () => {
  return new Promise((resolve, reject) => {
    fs.readdir('./assets/', (readDirErr, files) => {
      if (readDirErr) {
        return reject(readDirErr);
      }
      const imageNames = files.filter((v) => v.endsWith('.jpg'));
      fs.writeFile('./assets/imageNames.json', JSON.stringify(imageNames), 'utf-8', (writeFileErr) => {
        if (writeFileErr) {
          return reject(writeFileErr);
        }
        return resolve();
      })
    });
  });
};

const main = async () => {
  if (!(await exists('./assets'))) {
    await mkdir('./assets')
  }
  const result = await getHashtagResult(imgHashtag);
  for (let i = 0; i < result.lastPosts.length; i++) {
    console.log(`Downloading image ${i}...`);
    try {
      await downloadImage(result.lastPosts[i].thumbnail, `./assets/${result.lastPosts[i].shortcode}.jpg`);
    } catch (e) {
      console.error(`Couldn't download image ${i}: ${e}`);
    }
  }
  await writeImageNames();
};

main();
