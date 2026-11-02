import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as ill from "../src/illustrations";

type Name = Exclude<keyof typeof ill, never>;

/** Renders one of the shared SVG illustrations to a string for the static pages. */
export function art(name: Name, className = "") {
  return renderToStaticMarkup(createElement(ill[name], { className }));
}

export const workArt: Record<string, Name> = {
  StudyReel: "StudyIcon",
  "job match": "CareerIcon",
  "Useful Map": "MapIcon",
  Logiscore: "SoundIcon",
  "五十音マインスイーパー": "KanaIcon",
  "Gojuon Minesweeper": "KanaIcon",
  "あそび横丁": "StallIcon",
  "Asobi Yokocho": "StallIcon",
  "梅田地下ナビ": "UndergroundIcon",
  "Umeda Underground Navi": "UndergroundIcon",
};
