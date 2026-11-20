---
title: Video
requireScript: [video]
---

A video that costs nothing until someone plays it. The page shows the poster with a play button; the video itself is
`preload="none"` inside a closed `<details>`, so the browser fetches none of it before then. The pattern follows
[Performance-Optimized Video Embeds with Zero JavaScript](https://blog.master.dev/performance-optimized-video-embeds-with-zero-javascript/).

Without scripting it still works, with one more click: the first opens the video with its controls, the second plays
it. With scripting (`video`), opening it plays the video and moves the focus to it. It is muted and has no sound.

`label` is the poster's accessible name, and the only text a screen reader gets for it: say what plays. `src` names
both files without the extension: `<src>.av1.mp4` (AV1) first, for the browsers that play it, and `<src>.mp4` (H.264)
as the fallback for the rest:

```md
<pd-components-video src="/assets/videos/demo-tour" poster="/assets/videos/demo-tour-poster.webp" label="Play the tour of the demo's landing page" width="1680" height="1050" />
```
