// Shmirat HaLashon #1 — Chafetz Chaim, Hilchot Lashon Hara, Klal 1 Seif 1 (Oraita not usable: oraita.co.il is a Judaica shop; fallback per task = the book). Source: ../../sources/chafetz_1_1.wikitext
window.EPISODE = {
  series: "שמירת הלשון",
  seriesKey: "halashon",
  number: 1,
  title: "אפילו על אמת",
  source: "חפץ חיים · הלכות לשון הרע · כלל א׳ סעיף א׳",
  hook: { scene: "yard", action: "whisper", question: "דוד יודע משהו נכון על חבר: הוא קיבל ציון נמוך במבחן. מותר לספר — הרי זה אמת?" },
  beats: [
    { t0: 14, scene: "classroom", action: "point", mood: "bad", caption: "בהפסקה, ילד מהכיתה שואל: ״נו, מה הוא קיבל במבחן? ספר!״" },
    { t0: 24, scene: "yard", action: "think", caption: "דוד חושב: ״אני לא ממציא כלום. זה אמת!״" },
    { t0: 34, scene: "text", text: "״אָסוּר לְסַפֵּר בִּגְנוּת חֲבֵרוֹ, אֲפִלּוּ עַל אֱמֶת גָּמוּר״", ref: "חפץ חיים, כלל א׳ סעיף א׳", caption: "החפץ חיים כותב: גם כשזה נכון — אסור לספר בגנות חבר." },
    { t0: 46, scene: "text", text: "״וְזֶה נִקְרָא בְּפִי חֲזַ״ל בְּכָל מָקוֹם — לָשׁוֹן הָרָע״", ref: "חפץ חיים, כלל א׳ סעיף א׳", caption: "וזה נקרא ״לשון הרע״." },
    { t0: 57, scene: "text", text: "״וְהַמְסַפֵּר עוֹבֵר בְּלֹא תַעֲשֶׂה, שֶׁנֶּאֱמַר: לֹא תֵלֵךְ רָכִיל בְּעַמֶּיךָ״", ref: "חפץ חיים, כלל א׳ סעיף א׳", caption: "מי שמספר — עובר על איסור מן התורה." },
    { t0: 69, scene: "yard", action: "turn_away", mood: "good", caption: "דוד עוצר ועונה: ״בוא נדבר על משהו אחר.״" },
    { t0: 80, scene: "classroom", action: "shrug", caption: "החבר ששאל מושך בכתפיים — ומשנה נושא." },
    { t0: 89, scene: "classroom", action: "smile", mood: "good", caption: "כבוד החבר נשמר — ודוד לא עבר על ״לֹא תֵלֵךְ רָכִיל״." }
  ],
  answer: "אסור! גם כשזה אמת גמורה — לא מספרים בגנות חבר.",
  credit: "חפץ חיים, הלכות לשון הרע, כלל א׳ סעיף א׳",
  answerScene: "classroom"
};
