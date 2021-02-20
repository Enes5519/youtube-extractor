# youtube-extractor
Unofficial YouTube API for download and search videos

## Simple Example for downloading
```js
const extractor = require("youtube-extractor");
const formats = await extractor.get_video_formats('video_id')
const downloadURL = await formats[0].downloadURL();
```