type TrophyKind = "night" | "aux" | "dance" | "voice" | "explorer" | "heart" | "rock" | "sun" | "headphones" | "vinyl";
const themes: { kind: TrophyKind; words: RegExp; description: string }[] = [
  { kind: "aux", words: /aux|selector|mix.?master/, description: "An aux cable wrapped around a record" },
  { kind: "night", words: /night|after.?hours|midnight|moon|nocturn|\bowl\b|insomni|late.?night|dream|sleep/, description: "A crescent moon cradling a record" },
  { kind: "heart", words: /heart|break.?up|romanti|love|ballad|emotion|sad|tear|melanchol|cry/, description: "A sculptural heart above a record" },
  { kind: "dance", words: /danc|party|disco|groov|club|anthem|rhythm|funk|dance.?floor|boogie|rave/, description: "A mirrored disco ball on a record base" },
  { kind: "voice", words: /sing|vocal|voice|lyric|poet|croon|karaoke|melod|rap|word|harmony/, description: "A vintage microphone trophy" },
  { kind: "rock", words: /rock|guitar|riff|metal|punk|shred|folk|acoustic|country/, description: "An electric guitar trophy" },
  { kind: "explorer", words: /discover|explor|eclectic|genre|adventur|digg|obscur|underground|hidden|taste.?maker|pioneer|indie|blend|chameleon|rare/, description: "A compass inside a vinyl ring" },
  { kind: "sun", words: /sun|bright|happy|upbeat|optimis|cheer|pop|feel.?good|joy|energy|energe/, description: "A sun sculpture above a record" },
  { kind: "aux", words: /\bdj\b|playlist|curator/, description: "An aux cable wrapped around a record" },
  { kind: "headphones", words: /listen|headphone|audio|sound|bass|beat|synth|electro|instrument|sonic/, description: "Headphones framing a vinyl record" },
];

/** Existing awards need no schema migration; their title chooses the visual metaphor. */
export function trophyArt(title: string) {
  const text = title.normalize("NFKD").toLowerCase();
  const theme = themes.find(theme => theme.words.test(text));
  return { src: `/art/trophy-${theme?.kind ?? "vinyl"}.webp`, kind: theme?.kind ?? "vinyl", description: theme?.description ?? "A sculptural vinyl music award" };
}
