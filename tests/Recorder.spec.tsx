import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import Recorder from "../src/components/Recorder";
import { mockAudioRecordingProcesses } from "./mockMedia";

test("renders buttons", async () => {
  const { getByRole } = render(<Recorder />);

  await expect
    .element(getByRole("button", { name: "Record" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Pause" }))
    .toBeInTheDocument();
  await expect
    .element(getByRole("button", { name: "Stop" }))
    .toBeInTheDocument();
});

test("buttons initial state", async () => {
  const { getByRole } = render(<Recorder />);

  await expect.element(getByRole("button", { name: "Record" })).toBeEnabled();
  await expect.element(getByRole("button", { name: "Pause" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Stop" })).toBeDisabled();
});

test("buttons state change", async () => {
  mockAudioRecordingProcesses();

  const { getByRole } = render(<Recorder />);

  await getByRole("button", { name: "Record" }).click();
  await expect.element(getByRole("button", { name: "Record" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Pause" })).toBeEnabled();
  await expect.element(getByRole("button", { name: "Stop" })).toBeEnabled();

  await getByRole("button", { name: "Pause" }).click();
  await expect.element(getByRole("button", { name: "Record" })).toBeEnabled();
  await expect.element(getByRole("button", { name: "Pause" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Stop" })).toBeEnabled();

  await getByRole("button", { name: "Stop" }).click();
  await expect.element(getByRole("button", { name: "Record" })).toBeEnabled();
  await expect.element(getByRole("button", { name: "Pause" })).toBeDisabled();
  await expect.element(getByRole("button", { name: "Stop" })).toBeDisabled();
});

test("offline warnings", async () => {
  const { getByRole, getByText } = render(<Recorder />);

  vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
  await getByRole("button", { name: "Record" }).click();
  await expect
    .element(
      getByText(
        "Connection issues during recording, recording will be transcribed once connection is restored",
      ),
    )
    .toBeInTheDocument();
  await getByRole("button", { name: "Stop" }).click();
  await expect
    .element(
      getByText(
        "A recording is awaiting transcription, recording a new one will overwrite the existing one",
      ),
    )
    .toBeInTheDocument();
});
