import { Show } from "solid-js";
import { ArrowLeft, ArrowRight, DownloadIcon } from "~/components/common/icons";
import { OpenMenu } from "~/components/common/OpenMenu";
import { UploadDialog } from "~/components/panels/UploadDialog";
import { nextFile, previousFile, selectionStore } from "~/state/selectionStore";

export function TopBar() {
  return (
    <div class="grid grid-cols-5 items-center">
      <OpenMenu />
      <Show when={selectionStore.selectedFileAndSettings}>
        <div class="text col-span-3 flex items-center gap-4 justify-self-center">
          <ArrowLeft
            class="w-6 cursor-pointer"
            title="Previous Replay"
            onClick={() => previousFile()}
          />
          <div
            class="max-w-[150px] truncate whitespace-nowrap sm:max-w-xs"
            title={selectionStore.selectedFileAndSettings![0].name}
          >
            {selectionStore.selectedFileAndSettings![0].name}
          </div>
          <div class="hidden whitespace-nowrap xl:block">
            {new Date(
              selectionStore.selectedFileAndSettings![1].startTimestamp
            ).toLocaleString()}
          </div>
          <ArrowRight
            class="w-6 cursor-pointer"
            title="Next Replay"
            onClick={() => nextFile()}
          />
        </div>
        <div class="flex h-8 gap-4 justify-self-end">
          <DownloadIcon
            class="h-8 w-8"
            role="button"
            onClick={() => {
              if (selectionStore.selectedFileAndSettings === undefined) {
                return;
              }
              const file = selectionStore.selectedFileAndSettings[0];
              const element = document.createElement("a");
              const url = URL.createObjectURL(file);
              element.href = url;
              element.setAttribute("download", file.name);
              element.style.display = "none";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            title="download .slp"
          />
          <UploadDialog />
        </div>
      </Show>
    </div>
  );
}
