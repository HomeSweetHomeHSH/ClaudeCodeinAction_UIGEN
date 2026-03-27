import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationStatus, getToolMessage } from "../ToolInvocationStatus";

afterEach(() => {
  cleanup();
});

// getToolMessage unit tests

test("getToolMessage: str_replace_editor create", () => {
  expect(getToolMessage("str_replace_editor", { command: "create", path: "/src/Button.tsx" })).toBe("Creating Button.tsx");
});

test("getToolMessage: str_replace_editor str_replace", () => {
  expect(getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" })).toBe("Editing App.tsx");
});

test("getToolMessage: str_replace_editor insert", () => {
  expect(getToolMessage("str_replace_editor", { command: "insert", path: "/src/App.tsx" })).toBe("Editing App.tsx");
});

test("getToolMessage: str_replace_editor view", () => {
  expect(getToolMessage("str_replace_editor", { command: "view", path: "/src/App.tsx" })).toBe("Viewing App.tsx");
});

test("getToolMessage: str_replace_editor undo_edit", () => {
  expect(getToolMessage("str_replace_editor", { command: "undo_edit", path: "/src/App.tsx" })).toBe("Undoing changes to App.tsx");
});

test("getToolMessage: file_manager rename", () => {
  expect(getToolMessage("file_manager", { command: "rename", path: "/src/Old.tsx" })).toBe("Renaming Old.tsx");
});

test("getToolMessage: file_manager delete", () => {
  expect(getToolMessage("file_manager", { command: "delete", path: "/src/Old.tsx" })).toBe("Deleting Old.tsx");
});

test("getToolMessage: unknown tool falls back to toolName", () => {
  expect(getToolMessage("some_other_tool", { command: "foo", path: "/src/file.tsx" })).toBe("some_other_tool");
});

test("getToolMessage: unknown command falls back to toolName", () => {
  expect(getToolMessage("str_replace_editor", { command: "unknown", path: "/src/file.tsx" })).toBe("str_replace_editor");
});

test("getToolMessage: extracts filename from nested path", () => {
  expect(getToolMessage("str_replace_editor", { command: "create", path: "/deep/nested/path/Component.tsx" })).toBe("Creating Component.tsx");
});

test("getToolMessage: handles missing path", () => {
  expect(getToolMessage("str_replace_editor", { command: "create" })).toBe("Creating ");
});

test("getToolMessage: handles empty args", () => {
  expect(getToolMessage("str_replace_editor", {})).toBe("str_replace_editor");
});

// ToolInvocationStatus component tests

test("shows friendly message and green dot when completed", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).toBeTruthy();
});

test("shows spinner when in progress", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/App.tsx" },
        state: "call",
        result: undefined,
      }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeTruthy();
});

test("shows spinner when state is result but result is falsy", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
        state: "result",
        result: undefined,
      }}
    />
  );
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeTruthy();
});

test("falls back to raw toolName for unknown tool", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolCallId: "4",
        toolName: "unknown_tool",
        args: {},
        state: "result",
        result: "done",
      }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
