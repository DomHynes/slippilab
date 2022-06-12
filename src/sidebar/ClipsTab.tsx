import { Badge, Center, useColorModeValue } from "@hope-ui/solid";
import { createMemo } from "solid-js";
import { Picker } from "../common/Picker";
import { Highlight } from "../search/search";
import { setClip, store } from "../state";

export function ClipsTab() {
  const playerColors = useColorModeValue(
    ["red", "blue", "gold", "green"],
    ["darkred", "darkblue", "darkgoldenrod", "darkgreen"]
  );
  function renderClip([name, clip]: [string, Highlight]) {
    const index = Object.keys(store.clips).indexOf(name);
    const nameColorScheme = (
      [
        "primary",
        "accent",
        "neutral",
        "success",
        "info",
        "warning",
        "danger",
      ] as const
    )[index % 7];
    return (
      <>
        <div class="flex w-full items-center">
          <div class="flex items-center gap-1">
            <Badge
              color="white"
              backgroundColor={playerColors()[clip.playerIndex]}
            >
              {`P${clip.playerIndex + 1}`}
            </Badge>
            <Badge colorScheme={nameColorScheme}>{name}</Badge>
          </div>
          <Center flexGrow="1">{`${clip.startFrame}-${clip.endFrame}`}</Center>
        </div>
      </>
    );
  }
  const entries = createMemo(() => {
    return Array.from(Object.entries(store.clips)).flatMap(([name, clips]) =>
      clips.map((clip): [string, Highlight] => [name, clip])
    );
  });
  return (
    <>
      <div class="overflow-y-auto">
        <Picker
          items={entries()}
          render={renderClip}
          onClick={(_, index) => setClip(index)}
          selected={(_, index) => index === store.currentClip}
        />
      </div>
    </>
  );
}
