"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolInvocationStatusProps {
  toolInvocation: ToolInvocation;
}

export function getToolMessage(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";
  const filename = path.split("/").pop() || path;
  const command = typeof args.command === "string" ? args.command : "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create": return `Creating ${filename}`;
      case "str_replace": return `Editing ${filename}`;
      case "insert": return `Editing ${filename}`;
      case "view": return `Viewing ${filename}`;
      case "undo_edit": return `Undoing changes to ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": return `Renaming ${filename}`;
      case "delete": return `Deleting ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationStatus({ toolInvocation: tool }: ToolInvocationStatusProps) {
  const message = getToolMessage(tool.toolName, tool.args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {tool.state === "result" && tool.result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
