import { readFile, writeFile } from "node:fs/promises";
import decodeAudio from "audio-decode";
import { encode as encodeWav } from "wav-encoder";

const voices = [
  ["C:/Users/Aarons/Downloads/09-19-2026_00-21_msg5618052.mp3", "data/character-voices/sturdi-girl-approved.wav"],
  ["C:/Users/Aarons/Downloads/09-19-2026_00-26_msg5618064 (1) (3).mp3", "data/character-voices/brixy-approved.wav"],
] as const;

async function main() {
  for (const [source, destination] of voices) {
    const audio = await decodeAudio(await readFile(source));
    const wav = await encodeWav({ sampleRate: audio.sampleRate, channelData: audio.channelData });
    await writeFile(destination, Buffer.from(wav));
    console.log(`${destination}: ${wav.byteLength} bytes, ${audio.sampleRate} Hz, ${audio.channelData.length} channel(s)`);
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Voice conversion failed"); process.exitCode = 1; });
