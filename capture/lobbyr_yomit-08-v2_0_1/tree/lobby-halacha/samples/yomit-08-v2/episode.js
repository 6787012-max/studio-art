// SAMPLE of the v2 look (01/11/2026) - Halacha Yomit #8 with the captions rewritten. Source as in episodes/yomit-08/episode.js.
// Not a daily episode: lives outside episodes/ so the narrator's --retro sweep and the Z publisher never touch it.
// v2 fields (ignored by the narrator): look = 'v2' turns on the new overlay; hl = the words of the caption drawn in the accent colour.
window.EPISODE = {
  look: "v2",
  series: "הלכה יומית",
  seriesKey: "yomit",
  number: 8,
  title: "חלות מתנור בשרי",
  source: "הלכה יומית מפי הגאון רבי עמרם פריד שליט״א",
  hook: { scene: "home", variant: "shabbat", action: "think", question: "חלות שנאפו בתנור בשרי — מותר לאכול אותן עם גבינה?", hl: "עם גבינה" },
  story: "story.js",
  beats: [
    { t0: 14, scene: "story", caption: "התנור בשרי — ואפילו נאפה בו בשר היום", hl: "בשרי" },
    { t0: 28, scene: "story", mood: "bad", caption: "רק לא בתבנית בשרית!", hl: "תבנית בשרית" },
    { t0: 44, scene: "story", mood: "good", caption: "אופים בתבנית פרווה, למשל תבנית חד־פעמית", hl: "תבנית פרווה" },
    { t0: 60, scene: "story", mood: "good", caption: "או על נייר אפייה אטום", hl: "נייר אפייה" },
    { t0: 74, scene: "story", mood: "good", caption: "החלות נשארות פרווה", hl: "פרווה" },
    { t0: 88, scene: "story", mood: "good", caption: "ומותר לאכול אותן עם מאכלי חלב", hl: "מותר" }
  ],
  answer: "מותר לכתחילה לאפות חלות בתנור בשרי ולאכול אותן עם חלב — ובלבד שנאפו בתבנית פרווה",
  credit: "מפי הגאון רבי עמרם פריד שליט״א",
  answerScene: "classroom"
};
