// The video (components/video): a closed <details> whose summary is the poster. Without scripting, opening it shows
// the video with its controls, and one more click plays it. With scripting, opening it plays the video and moves the
// focus to it, so the keyboard and a screen reader carry on there (the summary they were on is hidden once open).

for (const details of document.querySelectorAll<HTMLDetailsElement>("details.video")) {
  const video = details.querySelector("video");
  if (!video) continue;
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    video.focus();
    // Muted, so the browser lets it play; should it refuse anyway, the controls are there.
    video.play().catch(() => {});
  });
}
