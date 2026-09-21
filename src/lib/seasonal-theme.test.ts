import assert from "node:assert/strict";
import test from "node:test";
import { classifyWeatherCode, getHoliday, getSeason } from "./seasonal-theme";

test("calendar seasons and holiday windows are deterministic", () => {
  assert.equal(getSeason(new Date(2026, 2, 1)), "spring");
  assert.equal(getSeason(new Date(2026, 5, 1)), "summer");
  assert.equal(getSeason(new Date(2026, 8, 1)), "fall");
  assert.equal(getSeason(new Date(2026, 11, 1)), "winter");
  assert.equal(getHoliday(new Date(2026, 1, 14)), "valentines");
  assert.equal(getHoliday(new Date(2026, 9, 31)), "halloween");
  assert.equal(getHoliday(new Date(2026, 10, 26)), "thanksgiving");
  assert.equal(getHoliday(new Date(2026, 11, 20)), "christmas");
  assert.equal(getHoliday(new Date(2027, 0, 1)), "new-years");
  assert.equal(getHoliday(new Date(2026, 3, 1)), null);
});

test("weather classification keeps severe weather visually quiet", () => {
  assert.equal(classifyWeatherCode(0), "clear");
  assert.equal(classifyWeatherCode(3), "cloudy");
  assert.equal(classifyWeatherCode(61), "rain");
  assert.equal(classifyWeatherCode(73), "snow");
  assert.equal(classifyWeatherCode(95), "severe");
});
