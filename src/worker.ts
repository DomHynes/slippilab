import { stageNameByExternalId } from "./common/ids";
import { GameSettings } from "./common/types";
import { parseGameSettings } from "./parser/parser";

onmessage = async (event) => {
  // Parse in groups of 500 replays at a time to prevent memory issues.
  const parsedSettings: Array<[File, GameSettings | "skipped" | "failed"]> = [];
  const fileGroups = [];
  for (let i = 0; i < event.data.payload.length; i += 500) {
    fileGroups.push(event.data.payload.slice(i, i + 500));
  }
  for (const fileGroup of fileGroups) {
    parsedSettings.push(
      ...(await Promise.all(
        fileGroup.map(
          async (
            file: File
          ): Promise<[File, GameSettings | "skipped" | "failed"]> => {
            try {
              const settings = parseGameSettings(await file.arrayBuffer());
              if (isLegalGameWithoutCPUs(settings)) {
                return [file, settings];
              } else {
                return [file, "skipped"];
              }
            } catch (e) {
              console.error(e);
              return [file, "failed"];
            } finally {
              // signal progress to the UI
              postMessage({
                id: event.data.id,
              });
            }
          }
        )
      ))
    );
  }
  const goodFilesAndSettings = parsedSettings
    .filter(
      (fileAndSettings): fileAndSettings is [File, GameSettings] =>
        fileAndSettings[1] !== "failed" && fileAndSettings[1] !== "skipped"
    )
    .sort(([, a], [, b]) =>
      a.startTimestamp > b.startTimestamp
        ? 1
        : a.startTimestamp === b.startTimestamp
        ? 0
        : -1
    );
  const failedFilenames = parsedSettings
    .filter(([, settings]) => settings === "failed")
    .map(([file]) => file.name);
  const skipCount = parsedSettings.filter(
    ([, settings]) => settings === "skipped"
  ).length;
  postMessage({
    id: event.data.id,
    payload: {
      goodFilesAndSettings,
      skipCount,
      failedFilenames,
    },
  });
};

function isLegalGameWithoutCPUs(gameSettings: GameSettings): boolean {
  const stageName = stageNameByExternalId[gameSettings.stageId];
  if (
    ![
      "Battlefield",
      "Fountain of Dreams",
      "Yoshi's Story",
      "Dream Land N64",
      "Pokémon Stadium",
      "Final Destination",
    ].includes(stageName)
  ) {
    return false;
  }
  if (
    gameSettings.playerSettings
      .filter((p) => p)
      .some((p) => p.playerType === 1 || p.externalCharacterId >= 26)
  ) {
    return false;
  }
  return true;
}
