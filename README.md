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

## GitHub Actions
Merging into the `main` branch with changes in the `./app` directory will automatically build the web application and sync it to a Backblaze B2 bucket. To accomplish this, the following secrets must be set on the repository:
- `B2_APPLICATION_KEY_ID`
- `B2_APPLICATION_KEY`

> **Note:** The Backblaze application key created for this purpose must have read and write access permissions.

Similarly, merging into the `main` branch with changes to the `./api` directory will automatically build the Workers application and publish it to Cloudflare. The following secrets must be set in the repository:
- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`

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

[2 hours]

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

### 2022-01-19
Met with Ron and Maddie, the curator, to discuss the technology needs for the piece.

Also added a `try/catch` to the scraper script so that it would continue if there was ever a download error.

[1 hour]

### 2022-01-31
Added more error catching to the scraper script and converted it to TypeScript. Then I spent a long time researching how [Cloudflare Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects) should work. DO is a fairly new product so there is a lot of conflicting information, different build configurations, etc. I struggled for a while to find _any_ concrete examples that looked like what I was trying to build.

I decided on using [Miniflare](https://miniflare.dev/) to test the worker in my local environment before deploying, and used [this example](https://github.com/mrbbot/miniflare-typescript-esbuild-jest) for building a TypeScript worker via [esbuild](https://esbuild.github.io/). For now it's just a `Hello, world!`, but I need to let my brain settle.

The overall plan is to save the Instagram images and the compiled site to Backblaze B2 and serve those files with a Worker. The image names correspond to the Instagram shortcode for the post, which is based on the post's timestamp. This will allow images to sort themselves automatically based on date. On initialization, the worker will choose the last 100 images and list them in order in an array saved on [KV](https://developers.cloudflare.com/workers/learning/how-kv-works). Every minute, a new image will be added to the list and the last image will be removed. The number of images and the pixel size will be saved in separate KV keys and will affect how many images are displayed on the canvas (but don't affect that there are always 100 images in the 'latest' list). If a user selects an image for removal, a new image ID is selected at random and its ID will replace the image that was selected.

The DO is what will allow for realtime communication via WebSockets to pass that information back and forth between the clients, but I'm very fuzzy on the details. The [Cloudflare DO chat demo](https://github.com/cloudflare/workers-chat-demo) should point me in the right direction. Unfortunately the server code is in a single `.mjs` file and the client code is all in an `.html` file so it will take some time to decode everything that's happening.

[2 hours]

### 2022-02-01

Spent a long time stuck on an issue where uploads to B2 weren't working. The issue ended up being a dumb thing where I had copied some of the code from a different project and didn't notice that the body of `POST` requests was always being JSON stringified just before being sent. This would create a situation where the SHA1 of the file wouldn't match the contents in the body, so my upload requests to B2 were being rejected. When I found the `JSON.stringify` line I felt so stupid.

Added a CLI script so that one-off management operations are easier to script and deploy. I also fixed an issue where Node was suddenly rejecting my `.ts` scripts with cryptic errors. I had already been using the `--loader ts-node/esm` argument so that I could run TypeScript files without a build step. I'm also using `--es-module-specifier-resolution=node` so that I don't have to specify the file extensions for any modules those scripts import. The part that I was missing was adding `"module": "esnext"` to the `tsconfig.json` file. All of these setting are [described in this `ts-node` issue](https://github.com/TypeStrong/ts-node/issues/1007), but I hadn't understood how they all work together until today.

In addition to the existing Instagram scraper code, I also added a CLI script to upload one-off files to B2. Also, the scraper will now upload images to B2 in addition to downloading them to the `assets` directory.

The next steps are:
- Getting the web app to read from B2 instead of the local `assets` directory
- Designing the image index so that there's an accurate list of all B2 images
- Changing the app to read from the image index datastore instead of a JSON file on B2
- Downloading scraper images to a temp directory and eliminating the `assets` directory API

[5 hours]

### 2022-02-08
Updated the CORS rules for the B2 Bucket to allow all cross-origin requests. (I'll need to change it to a specific domain once I'm done with development.) I've decided that writing the images to a JSON index in the B2 bucket is a bad idea, but the idea of moving it all over to KV feels overwhelming right now. For the moment I'm going to only make small adjustments that still produce a working site instead of making huge breaking changes.

The first thing I noticed is that now downloading the images feels extremely slow. My browser development tools are even complaining that the server response time was longer than 500 ms for most of the image requests. Still, it "works".

---
I was worried I would have to convert my code to use some sort of static site generator, but I followed [these instructions on how to deploy a React app to Backblaze and Cloudflare](https://itnext.io/deploy-your-react-app-on-backblaze-and-cloudflare-with-github-actions-93f09f2c67d5) and it's working great (but still slow).

---
I noticed the cascade in my network requests and realized that I could download my images in parallel instead of one-by-one. Now the draw feels faster than before!

I also refactored the code so that the final image width and height are inputs and other values are computed based on that. This allowed me to simplify some of the size calculations. More importantly, I can give a 'final' canvas size at the beginning so that we can adjust based on the size of the display.

---
Met with Ron and Mackenzie to discuss the themes for the artist statement and talk about some logistics regarding the display at the museum.

---
Figured out how to initialize a Workers KV binding to Miniflare and to production. The production version of the worker is published at https://terra-incognita.haverstack.workers.dev.

[4 hours]

### 2022-02-15
Updated the initialization script so that it sets data for both Miniflare and Workers KV. This will allow me to set the same data for both without any manual setup.

---
Added a GitHub Action to automatically build the site and sync it to a Backblaze B2 bucket. Testing and debugging the action took about as long as researching and writing it.

---
Added a small router library to get data from the worker API. Removed the hard-coded values to use the API instead.

One thing I've noticed is that there are a lot of moving parts and it can be easy to miss a step. New data needs to be initialized, changes to the worker need to be published, etc. It might be possible to also automate these steps, but I want to see how much friction they cause first before going that route.

[3 hours]

### 2022-02-19
Converted the build and KV initialization scripts to CLI commands so that random scripts weren't littering the codebase. Also separated out the values for the number of images per block and the pixel size so they can be manipulated independently of each other.

---
Split the repo into an `app` and `api` directory so that I can create different CI/CD behaviors for each sub-component.

---
Publish the worker with GitHub Actions whenever there are changes to the `./api` subdirectory. Struggled a lot with this step because [existing actions don't support newer versions of Node](https://github.com/cloudflare/wrangler-action/pull/56).

---
Added feature to allow uploaded files to have different names from the original file.

[4 hours]

### 2022-02-20
Made some code to sync all the existing images but using a number as the image name instead of the image shortcode from Instagram. This will allow me to display images by picking a random number instead of needing to look up the image names in an index. The original shortcode names are still saved to the upload metadata in case I need that information in the future. I'm also saving the modified date for all the images.

---
Added new functions for getting and setting values from Wrangler KV so that it would be possible to initialize the KV store without clobbering any existing KV data. This is important so that I don't lose the value for the total number of images in the bucket.

---
Updated scraper code so that it downloads to a temporary directory and uses information from Instagram to populate the image metadata.

Unfortunately I ran into an issue where Instagram is now requiring authenticated sessions to view hashtag pages. There also seem to be changes to the pages themselves, so the scraper is throwing an error. I might have to fork the library to make my own version... 

---
Accounting for the Instagram page changes really kicked my butt. I had to write all new scraper code because the old `scraper-instagram` was almost completely unusable. The only tidbit I got from it was a regex for finding the data on the HTML page -- everything else was new. An incredible pain in the ass!!

Luckily I didn't have to recreate the entire library because I only needed to scrape the hashtag page, but this was still a setback that I wasn't expecting. Also, I now have to set an `INSTAGRAM_SESSION_ID` in my environment variables because the hashtag page is no longer accessible without logging in. It's very likely that Instagram is tailoring the images based on information in my account, so I will probably have to create a new Instagram account that's only used for scraping.

[6 hours]

### 2022-02-21
I've switched the app to read from a randomly-generated number array stored in KV, so now the images won't change unless there's a change to the KV data. Exciting!

[1 hour]

### 2022-02-28
Spent some time commenting on the finalized design and then I integrated Tailwind CSS so that I could start adding styles and organizing the site into different pages. Once the pages were defined I realized I needed to break up the components differently and create a hook so that the image data would be easier to access from different pages.

Next step is to create the slider controls and then wire up the controls to different API endpoints so that they will change the image. It might be better to start jumping in to realtime responses via Durable Objects instead of creating a REST API that might not be used in the final product.

[3 hours]

### 2022-03-03
I'm running into an issue where direct URLs like `/create` return a 404 on the production site, but work in my development environment. The culprit is that my Cloudflare Transform Rules redirect requests to `/` to the index page, but all other endpoints attempt to find their counterparts in the B2 storage.

I saw that Transform Rules allow for regex so I decided to try one that would match against endpoints but wouldn't match against specific files (`^/(?:[^.]+)$`), but I found out later that regex rules only work for Business and Enterprise plans. My only path forward now is to modify my worker code so that it can serve both the API and my client code.

[1 hour]

### 2022-03-04
Redesigned the Cloudflare Worker code to be able to serve a React Single Page App (SPA). There are some examples on the web of how to serve a static site with Cloudflare Workers, but an SPA is unique in that most URLs return the index page for the site and the router on that page then updates the view to match the URL. It might be a good idea to write a blog post about this at some point so that others won't get stuck like I did.

Something else that would be good to write about is a clear overview of how to serve a Cloudflare Workers site from a custom domain. The process involves creating a dummy `A`-record in your DNS settings so that the worker route can then take over the request, but the docs don't feel very clear about this.

Serving the HTML from my worker code meant that I needed to serve from different URLs when running on my development machine versus running in production. This led me to discover that `process.env.NODE_ENV` doesn't work in worker code. Figuring out how to separate my environment into development and production also took a long time.

Finally, I refactored my app code to take advantage of the `<Outlet />` component from React Router. My hope is that this change will allow my requests for page content to be slightly smaller and that I can reuse some state across most of my pages.

[4 hours]

### 2022-03-05
Created a library for code shared between the frontend and the backend so that there wouldn't be a bunch of repeated code everywhere. With that I shared some common types and math functions and used those to create new API endpoints for updating KV data.

---
Went on a wild goose chase thinking that the Miniflare data wasn't being updated properly when I put in requests to the API. Turns out the Miniflare data could update just fine but I was sending garbage to the API, so nothing was behaving as expected. Ended up reorganizing some code while I figured out the bug.

---
Added the sliders! Now the image will update based on user input. The next step is making this work across all users. I also need to find out how to disable the controls for a few seconds after every change. Right now scrubbing the controls causes a huge number of changes.

[6 hours]

### 2022-03-13
Added tick marks to the existing `Slider` components. Unfortunately I had to resort to some trickery because the 'correct' way of doing it with a `datalist` component is not supported in Firefox and has inconsistent UI in other browsers.

---
Changed how the APIs are accessed so that `localhost` isn't hard-coded in the codebase. This allows me to test the site from my phone on a local network.

---
Updated the state management to be Redux-like. That is, state is managed in a central location and state changes are dispatched with reducers. This will allow me to do complex state changes with many users while keeping the complexity of the app to a manageable level. I also updated all components to use this new state system.

[5 hours]

### 2022-03-14
Implemented a `Messenger` and `RateLimitier` durable objects by using the [workers chat demo](https://github.com/cloudflare/workers-chat-demo) as a guide. I ran into an issue where the Cloudflare Workers `WebSocket` object conflicts with the one defined in the DOM. As a result, I can't use the `accept()` method on the WebSocket on the server side without casting the WebSocket to `any` first. The strange thing is that I'm not including DOM types in the API project, so I don't understand why there's a conflict.

Progress feels extremely slow while I try to understand all the concepts. The main difference between this implementation and the chat demo is that there is only a single 'room' that all sessions are interacting in. I wonder if I should implement some sort of limit in case there are too many concurrent users? I'm also worried about the message format that will be sent back and forth. Sending the full state feels like the safest way to keep everyone updated, but it might be too much data.

---
Updated the app code to send each `Action` that changes the state as a message before each dispatch and that... worked?! The messenger on the server will send all messages to everyone regardless of where they came from and I'm filtering the messages on the client side so that messages from the same session aren't acted upon.

Unfortunately there's an unexpected side-effect where the loading screen is triggered whenever a message is received. Getting to the bottom of that and filtering messages from the same sender on the server side are probably what I will tackle next.

[6 hours]

### 2022-03-18

I had to put checks on the client and server side, add timestamp checking, and reject messages that didn't have the expected properties but I _finally_ am able to get 2 clients talking to each other without the message ping-ponging back and forth. I was seeing the screen reload after each change because the ping-ponging would trigger the rate-limiter, which in turn would trigger an error, which would cause the page to reload. The page reload is disabled for now while I squash the bugs, and I added a lot more logging.

One strange thing is that messages still go through even if the response is a rate-limit error. That's part of the reason the pages would ping-pong. I need to add error handlers on the client side so that the interface is disabled while the IP is rate-limited, but the server also shouldn't send the message if the client is in rate-limit jail.

---
The rate-limiting bug was a missing `return` on the server! I did notice another bug once it started working: the rate-limited client's UI will fall out of sync with everyone else unless the UI is reset. A possible solution is to stop using the `/api` endpoints and only update the client UI when a message has been acknowledged by the server.

[4 hours]

### 2022-03-26
There is a terrible bug where swapping the images or changing the number of images will cause render issues and errors when other users receive the update messages because I'm sending the resized image URLs, which correspond to binary blobs that are specific to each user's browser. Receiving a blob URL from a different user is non-sensical, so instead each user will have to get the updated image array and download/resize any missing images on their own browser.

Fixing this will require some huge changes. I've updated the API to return the whole image array whenever there's a change and done some prep work to (hopefully) create an async reducer. The idea is to dispatch the change to the image array and update the session's resized image URLs in the background.

There will be a few 'WIP' commits where I break the app, but I'd rather do that than accidentally lose work.

---
Attempting to make an asynchronous reducer failed miserably. Instead, I'm using the `useEffect` hook in the `DataInitializer` component to detect when values that have secondary effects have changed. This will kick off a secondary effect function that updates the resized image URLs. I had to add some logic to the reducer so that it wouldn't send a message for updates that should only happen on the current user's browser. I also changed the image resizing logic so that it would only request images that have changed and leave everything else alone.

One thing I re-discovered while I was making this work is that changing the number of images will trigger a resize for _all_ images, so it wouldn't be practical to save the resized versions. I'm caching the images pretty aggressively so I'm not worried about needing to re-download files, however I will need to cache the full-sized versions in a local database if I want the app to work offline.

---
Debounced the slider input and made it keep some internal state so that the value won't update until we're finished loading. Also changed the order so that the slider for the number of images appears next to the image replacer (because they are related).

---
Added the cooldown timeout value to the app metadata so that it could be accessed on the client side. I use this information to disable the controls for the specified cooldown period.

I got stuck for a while because I kept trying to use the environment bindings that are passed to a durable object's `fetch` method, but those bindings are actually empty. The correct environment bindings are passed when the durable object is instantiated, so I need to save those if I want to use KV data.

[8 hours]

### 03/28/2022
Got a few requests from Ron but I got stuck on the first one: the slider has a behavior where if you tap on it you can jump to the tapped value, but if you try to grab the slider it will only let you increment a single value. I was trying to make it so you can grab the slider and drop it wherever you wanted, but I kept getting inconsistent behavior on mobile vs. desktop.

I tried a different slider fron `npm` but it behaved the same! This might be fixed in one of the component libraries but it's a difficult problem to google for. I'll move on to other things for now.

[2 hours]

### 03/30/2022
Visited the museum to drop off the laptop for the show. While I was there I had to troubleshoot the settings a little bit because the display would take on different settings depending on if the lid was open or closed. Another weird behavior is that if you move the cursor offscreen and then close the lid, the cursor would jump back to the middle of the screen. We needed to attach a mouse to get the cursor off screen while the lid was closed.

One _very_ concerning aspect of the trip was that the musuem's internet was much slower than I anticipated. A visit to the meta API page should be nearly instantaneous, but it took a good 10 seconds to load on the museum WiFi. We had thought about contingencies for the internet being offline, but I hadn't considered such a slow connection.

[2 hours]

### 04/02/2022
Took some time to do an honest assessment of everything that's left and created [a few more issues](https://github.com/cuibonobo/terra-incognita/issues) for those items. I also added a new `P1` label for items that should be prioritized.

---
I'm extremely worried about the slow internet in the museum so I ordered a cellular hotspot as a 'Plan B' in case I don't get a handle on the offline features in time. I found one that was available today so I'll test it out tomorrow and deliver it to the museum early next week.

---
Spent most of the day tackling the design tasks that were left so I wouldn't be left scrambling at the last minute. I updated the About page to add the artist statement and bios, I made a header logo and a favicon for the site, and I made the explainer graphics for the sliders. I also added some text to the footer and the home page and made a ton of style changes.

Throughout this project I had struggled with setting specific pixel dimensions to the elements with [Tailwind CSS](https://tailwindcss.com), for example setting an element to 320 pixels wide with `w-80`, and today I finally discovered that it has been a browser caching issue. If I add new Tailwind classes my changes don't show up if I rely on the automatic refresh from the Parcel server, so I have to always hard refresh.

[6 hours]

### 04/03/2022

Tackling my issues list. Fixed #30, #31, and #22. A few of these were small cosmetic things that weren't high priority but I wanted to get out of the way. The major fix was adjusting the math for the canvas so that it always 'overdraws' by a small amount so that the image always fills the entire canvas. I also added a small offset for the overdraw so that the edges would be de-prioritized. This causes a fractional block on the edges of the canvas when the pixel size or number of images don't add up to a whole number.

---
Added a new loading screen with a spinner. Fixes #28.

---
Modify the 'number of images' slider to show the square instead of the square root. Fixes #19.

Also starting setting up basic styles for a messaging component. This will be useful to show errors and for debugging.

---
Added a framework for adding alerts for errors and debugging. Fixes #26.

[4 hours]

### 04/04/2022
Read through [this tutorial](https://medium.com/swlh/how-to-make-your-web-apps-work-offline-be6f27dd28e) and the [Parcel Service Workers](https://parceljs.org/languages/javascript/#service-workers) documentation to get a feel for how to get the page to work offline. I'm not sure if service workers must be written in JavaScript or if I can write them in TypeScript and have Parcel compile them at build time.

---
Adding TypeScript support didn't end up being hard, but I'm having a lot of trouble actually testing the offline support because Parcel adds `?<timestamp>` to the URL of an asset when I'm previewing the site. This doesn't seem to be the case when run a full build, but it's making debugging difficult.

---
The `--no-hmr` flag disables the timestamps, so I've added a script to start the app in 'offline mode' to test the service worker.

---
I'm seeing inconsistent behavior on Chrome and I'm not sure what to do about it. Service workers are extremely difficult to test.

[4 hours]

### 04/06/2022
I ran PWA tester application and it had a lot of suggestions for how to improve the app, so I went through a bunch of those today: adding different-sized icons, improving the site WebManifest, adding some missing `<meta>` tags, etc. I also fixed an issue related to slider sizes being too large on mobile.

---
Started work on fixing some of the error messages but got stuck on how to transmit the error types.

[3 hours]

### 04/07/2022
I was stuck yesterday because for some reason the classes and functions that I defined in the shared library aren't getting compiled correctly. I ended up just moving the definitions to the app project and that fixed the problem. It's puzzling because I have other functions in the shared library that work fine. It seems like it hates classes for some reason, but I don't have time to investigate that now.

---
Ron was doing more testing at the museum today and based on how I hear him and the curator talking about the error messages, I feel like they are actually confusing people more than transmitting any helpful information. I think I'm going to just remove all the error messages except for the rate-limiter (so that people have feedback about why they can't send commands). Also, Ron sent me a picture of his phone and I noticed that the slider graphics were still too large, so there's still more work to do there.

---
Added some new state variables to save whether the app is offline or in the process of reloading. If we're on the artwork page and detect a server error, it should just refresh automatically. If we're on a page that shows controls it will show that the interface is offline. It has been surprising just how many icons need to be generated for a project like this.

[3 hours]

### 04/08/2022
The curator expressed some frustration about the rate-limiter messages so I'm just going to comment out that feature for now.

---
I've left a browser on the production site on both Chrome and Firefox and on both browsers I noticed that the websocket closes itself after a few minutes!! When I run the page on localhost it would just remain up indefinitely, which is why I never noticed this behavior. This explains why we've been having so much trouble! It's not that the connection has been spotty (though that probably didn't help). Seeing this, I will probably implement some heartbeat logic and see if the socket ever reconnects or if refreshing is the only option at that point.

I also noticed the slider jumping behavior on Firefox that Ron mentioned before, so I will need to tackle that as well.

---
Updated the server so that it saves the full state of the artwork whenever there is a request. Fixes #11. Technically not a priority but I really wanted to save the full history of the artwork as it changes over time.

---
I noticed a few error responses in the Cloudflare dashboard but I have no way of inspecting logs unless I'm constantly tailing them. The way workers handle logging is honestly pretty annoying. I've updated the error handler to accept the environment so that we can save to the `LOGS` KV when there's an error.

---
I've just confirmed that [Cloudflare will close WebSocket connections that are dormant for 100 seconds](https://stackoverflow.com/a/41031976/2001558), so I've implemented a heartbeat on the client side that sends a short message every 30 seconds. Fixes #24. Originally I wanted to implement the heartbeat on the server side but I didn't see an obvious way to do that.

---
Found a huge bug in how I was initializing the websocket on the client side! Despite implementing heartbeats the connection is still not being kept open consistently so I went looking for why my connection wasn't just resetting automatically and I found out! The way I had structured my code made it so that the event handlers were only added to the initial connection -- subsequent connections would open (and I would see them on my network tab) but not react to messages from the server. I've tested this by killing my connection manually and it's working great: I see several retry attempts while the connection comes back and then when it finally does I see a new session ID and heartbeats.

I also added some logic to quick a join a attempt if it's taking too long. I've seen multiple join attempts happen at once when there's an error so I wanted to mitigate that.

I think the next step is probably sending the entire server state on reconnect so that the app can quickly get back up to speed. I should also turn the 'offline' flag off to re-enable the controls.

---
I'm doing way fewer requests on initialization by setting up the app state based on the ready message. Now I don't have to worry about possibly falling out of sync between initialization and the first message. Fixes #23.

---
Added an information button to the controls page. It always takes me WAY too long to do CSS changes... Fixes #27.

---
Randomize the app values on the server side. Fixes #20.

---
Add an offline indicator to the artwork as a clue about why it's not updating. Also extend the time that we wait for retries with each retry so that we aren't spamming the network.

---
Adjusted the image size for scraped images to be slightly smaller. Images 1299 and below can be sized down.

[8 hours]

### 04/09/2022
Added Twitter and Open Graph `meta` tags so that the site looks good when it's shared on social media.

---
Added a new `/healthy` endpoint that should never be cached so that the app can quickly determine if it has access to the API. Based on this it will only trigger window reloads if the API is online. I'm honestly not 100% sure about this change though... The Service Worker was caching the result of `/healthy` despite setting it up with headers to never cache.

[2 hours]

### 04/11/2022
Enabled a cron job on my home machine to run the Instagram image collection every 30 minutes. The original idea was to run this as a Scheduled Worker, but the job will sometimes run longer than 30 seconds, which is the limit for Cloudflare's 'Unbound' workers. The other issue was that the current Instagram scraping code relies on a lot of APIs that aren't available in Workers (like `fs`, for example), so making all of the necessary changes would have taken too much time.

I discovered that the WSL implementation of Ubuntu is a little odd: it's not using `systemd`, `cron` doesn't start by default, etc. I followed [this guide](https://blog.snowme34.com/post/schedule-tasks-using-crontab-on-windows-10-with-wsl/index.html) to get `cron` running on startup, but the better long-term solution would be to fix the code so that it can actually run as a Scheduled Worker.

[1 hour]

### 04/13/2022

Found that the cron job stopped working suddenly because of a DNS error. Followed [these instructions](https://gist.github.com/coltenkrauter/608cfe02319ce60facd76373249b8ca6) to get DNS working again in WSL.

[0.5 hours]
