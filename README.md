# terra-incognita
A sort of luminous, geometric, incandescent immensity.

## Journal
### 2021-11-27
My original idea was to use the official [Instagram Hashtag Search API](https://developers.facebook.com/docs/instagram-api/guides/hashtag-search/), but it requires that you have a Business or Creator account and that the app undergo an [App Review](https://developers.facebook.com/docs/apps/review) process that seemed much too involved for the amount of usage this app is going to get. Instead, I'm going to use [`scraper-instagram`](https://www.npmjs.com/package/scraper-instagram) to grab images directly from the Instagram public website.

I generally wouldn't reach for scrapers because websites change fairly frequently and without warning, which can break the scraping code. In this case [the code](https://git.kaki87.net/KaKi87/ig-scraper) is simple enough that I could maintain my own version if it were to ever break. (Unfortunately, the original author of this package [has stopped maintaining it](https://git.kaki87.net/KaKi87/ig-scraper/issues/17).) The [`instagram-scraping`](https://www.npmjs.com/package/instagram-scraping) package was my second choice but I will pass on it for now since I can't inspect the code [while GitHub is down](https://www.githubstatus.com/incidents/r5qrpp2f5fc0).

If at some point using Instagram becomes untenable, maybe [Pixelfed](https://pixelfed.org/) could be an alternative photo source.

---
Following the examples for `scraper-instagram` was simple enough. Through some experimentation in the Node interpreter I discovered that the `thumbnail` URL returned in the `getHashtag` response is the same image as what is returned in the `contents.url` result of `getPost` response for an individual post, so it's no use trying to get the individual post information if all you need is the image.

I've also discovered that there's no way to search for multiple hashtags on Instagram in order to filter the results. The only way to achieve this would be to search a "primary" hashtag and then filter out entries that don't contain the secondary tags. This limitation is unfortunate because popular hashtags like `#landscape` will have millions of results so it would be great to do something like `#landscape AND #mountain` to narrow the images down. It's possible to hack this by filtering the results through Google with a search like `site:www.instagram.com "#landscape" AND "#mountain"`, but since it takes some time for the Google crawler to index pages, most results will be at least a year old. For now, the best we could do is keep a local database of results.

---
I'm torn between the high quality of the `featuredPosts` results versus the immediacy of the `lastPosts`. The featured posts are generally more beautiful and are better fit to the hashtag but often feel obnoxiously over-produced. In contrast, the latest posts feel more genuine but have a lot of unsuccessful images, inappropriately-tagged posts, and spam. I may need to include an API to exclude images, but that introduces the need for a database...

I can feel my mind trying to over-engineer this problem, so for now I'm going to just try to manipulate the results of a single scraper request.

---
Image processing libraries are generally very large and will usually only support either browsers or Node, but not both. [`readim`](https://www.npmjs.com/package/readim) is a fairly lightweight package that works in both browsers and Node, but the result is a `Uint8Array` that I now have to figure out how to display as an image. [This post](https://stackoverflow.com/questions/50620821/uint8array-to-image-in-javascript) suggests that using the `Blob` API is all I need, but there isn't an answer for converting it to an image in Node.

Maybe I should just stick with browser-based image manipulation until I have a good reason to add Node?

---
Ended up using [`image-process`](https://www.npmjs.com/package/image-process) instead because it has a straightforward API for selecting precise crop bounding boxes. With this I now can split up an image into 25-pixel pieces and arrange them into a table. The only problem is that it takes 10 seconds to process a single image. For 25 images that's going to be painful.

---
I played with the math a bit to get smaller images and now the split takes less than a second. Next task is arranging 25 images into the table.

---
I've created a new `ImagePixel` component that will take pieces of 25 images and arrange them in a 5x5 grid. The math took some trial and error but it works! I'm using the same placeholder image for all of the cases, so now I need to grab more images.

---
I've tried [`scraper-instagram`](https://www.npmjs.com/package/scraper-instagram) but it only works in a Node environment (not in the browser) and [`instagram-scraping`](https://www.npmjs.com/package/instagram-scraping) also won't work because of CORS errors. Looks like I've encountered a wall where I need to at least use a proxy to get this working. For now I will just save an example result in my `assets`.

---
Whoops. Saving `result.json` wasn't enough because the image URLs themselves are _also_ protected by CORS headers. Looks like I will need to download them with a script and commit them to the repo to demo.

---
Wrote `scraper.js` to grab images from the "landscape" hashtag, download them to the `assets` folder, and then write the image names to a JSON file. The app now reads the image names and serves them locally. Since I now have the potential to scrape a lot of images I decided to remove the `assets` folder from the repository and create it via the scraper script. The script can be invoked with `npm run scrape`.
