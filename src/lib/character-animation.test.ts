import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = process.cwd();
const widget = readFileSync(`${root}/src/components/ChatWidget.tsx`, "utf8");
const stage = readFileSync(`${root}/src/components/CharacterStage.tsx`, "utf8");
const speech = readFileSync(`${root}/src/components/ChatSpeech.tsx`, "utf8");
const knowledge = readFileSync(`${root}/src/lib/ai/knowledge.ts`, "utf8");

test("Task 3 animation stage has separated realistic asset and motion contracts", () => {
  assert.match(stage, /brixy-talking\.mp4/);
  assert.match(stage, /bixy-official\.png/);
  assert.match(stage, /"loading" \| "ready" \| "failed"/);
  assert.match(stage, /specialSceneAudio/);
  assert.match(stage, /playEmbeddedAudio/);
  assert.match(stage, /muted=\{!playEmbeddedAudio \|\| !animated\}/);
  assert.match(stage, /character-motion-\$\{motion\}/);
  assert.match(stage, /CharacterMotion =/);
  assert.match(stage, /"idle"/);
  assert.match(stage, /"listening"/);
  assert.match(stage, /"speaking"/);
  assert.match(stage, /poster=\{asset\.image\}/);
  assert.match(speech, /onSpeakingChange/);
  assert.match(widget, /interactWith\("brixy"\)/);
  assert.match(widget, /Interact with Bixy/);
  assert.match(widget, /Stop Bixy/);
  assert.doesNotMatch(widget, /APPROVED_AUDIO/);
  assert.doesNotMatch(widget, /audioUrl=/);
  assert.match(widget, /placeholder="Ask your guide\.\.\."/);
  assert.match(widget, /onSubmit=\{handleSubmit\}/);
  assert.match(widget, /setSpeechResetToken/);
  assert.match(speech, /Dynamic voice is not configured yet/);
  assert.doesNotMatch(speech, /speechSynthesis\.speak/);
  assert.doesNotMatch(speech, /new Audio/);
  assert.match(knowledge, /family-friendly/);
  assert.doesNotMatch(widget, /Sturdi\s+Guy/);
});
