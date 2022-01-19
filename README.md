# terra-incognita
A sort of luminous, geometric, incandescent immensity.

## Getting Started
To install the necessary dependencies and start a local server at http://localhost:8000:
```bash
npm install
npm run start
```

To download 70 of the latest Instagram images in the `landscape` hashtag:
```bash
npm run scrape
```

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

[8 hours]

### 2021-11-28
Made the square size smaller and the image base size bigger and that greatly improves the beauty and impressiveness of the result regardless of the quality of the images. The problem with that is that it lengthens the render time significantly. I added a percentage completion display so that it's clear that something is happening and an elapsed time display so that we can keep track of how long all of the resizing and cropping takes. With the current settings it's averaging about 50 seconds.

It takes an additional minute or so to actually render all of the squares into the tables, but that isn't accounted for in the displayed time. It's cool to see the rows gradually populating themselves, but the browser chrome becomes unresponsive. It would be better to make this faster, but I'm not sure how to do that at the moment besides assembling the squares as a giant image instead of rendering them out in the DOM.

---
Met with Ron and we played around with the values a bit. Larger square sizes makes it feel more chaotic, a smaller image square root makes it feel more cohesive, and a larger base image size makes it feel more impressive. I feel like the values that I have it at now strick a good balance, but later we will add sliders so that these values can be adjusted by the viewer.

During our meeting Ron suggested that there be UI for eliminating images that the viewer doesn't like. Instead of a database, I think it should just pick a new image and re-generate on-the-fly. He also suggested that the UI be on a different device, which I thought was interesting. To implement that, the artwork and the UI each need to be on a client device and there also needs to be a server that communicates between the two. I'm not going to worry about how to implement that now though.

The biggest immediate challenge is that the render times need to come way down. It might be possible by drawing directly on a `canvas` element instead of generating thousands of DOM elements.

[1 hour + 1 hour meeting]

### 2021-12-08
Branching the current work to attempt a first pass at `canvas` rendering. I think I put off working on it for a while because I'm not familiar with `canvas` drawing at all.

---
It took me a while to figure it out, but rendering with `canvas` is faster than I ever thought possible. It basically renders as soon as the images are done loading and resizing. Incredible!

The only major issue I ran into is that you have to be very careful to not use `setState` or do anything else that might trigger a re-render because the `canvas` element is very finnicky and will re-render at the drop of a hat. I also had to learn to use `useMemo` so that the expensive function that does the rendering doesn't get called again unless there is a change in the memo's inputs. The syntax of the memoized function looks strange, but I love how it works.

The best part is that I ended up with less lines of code than when I started.

[3 hours]

### 2021-12-21
Met with Ron to discuss the different possibilities for serving content. For now we are going to have a server component hosted on the cloud and two clients: a display component and a UI component. To maintain constant communication between all the components, [Cloudflare Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects) seems like a good fit.

I'll split up the repository over the next few days into its component parts and should hopefully have something working by the next time we meet.

[1 hour]

### 2022-01-01
Created a new `/admin` route and a corresponding page component. Split up the repo to better reuse code across the Admin and Artwork pages.

Splitting up the pages helped me find a bug where the `Canvas` component wasn't sized properly.

[2 hours]

### 2022-01-12
Met with Ron to play around with different settings, explain what controls are available, and discuss how to approach the admin interface design.

Later had an email exchange with Mackenzie about the initial wireframes.

[1 hour]
