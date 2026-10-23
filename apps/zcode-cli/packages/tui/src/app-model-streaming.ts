import type React from "react";
import type { Message } from "./app-model.js";
import {
  appendStreamingTextDelta,
  appendStreamingThoughtDelta,
  markStreamingMessageComplete,
  markStreamingThoughtComplete,
} from "./app-transcript-stream.js";
import { stringField } from "./state.js";

export type StreamingEventHandlers = {
  assistantMessageIdsByToolCallId: Map<string, string>;
  setLiveModelText: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStatus: (status: string) => void;
  batch?: boolean;
};

const STREAMING_FLUSH_INTERVAL_MS = 40; // ~25fps smooth animation frame window

// Module-level in-flight delta buffers
const bufferedThoughtDeltas = new Map<string, string>();
const bufferedTextDeltas = new Map<string, string>();
let bufferedLiveText = "";
let pendingFlushTimer: NodeJS.Timeout | null = null;
let lastHandlers: StreamingEventHandlers | null = null;

export function flushModelStreamingDeltas(handlers?: StreamingEventHandlers): void {
  if (pendingFlushTimer) {
    clearTimeout(pendingFlushTimer);
    pendingFlushTimer = null;
  }

  const targetHandlers = handlers ?? lastHandlers;
  if (!targetHandlers) return;

  if (bufferedThoughtDeltas.size > 0) {
    const entries = Array.from(bufferedThoughtDeltas.entries());
    bufferedThoughtDeltas.clear();
    targetHandlers.setMessages((current) => {
      let updated = current;
      for (const [id, delta] of entries) {
        updated = appendStreamingThoughtDelta(updated, id, delta);
      }
      return updated;
    });
  }

  if (bufferedTextDeltas.size > 0) {
    const entries = Array.from(bufferedTextDeltas.entries());
    bufferedTextDeltas.clear();
    targetHandlers.setMessages((current) => {
      let updated = current;
      for (const [id, delta] of entries) {
        updated = appendStreamingTextDelta(updated, id, delta);
      }
      return updated;
    });
  }

  if (bufferedLiveText.length > 0) {
    const text = bufferedLiveText;
    bufferedLiveText = "";
    targetHandlers.setLiveModelText((current) => `${current}${text}`);
  }
}

function scheduleFlush(handlers: StreamingEventHandlers): void {
  lastHandlers = handlers;
  if (!pendingFlushTimer) {
    pendingFlushTimer = setTimeout(() => {
      pendingFlushTimer = null;
      flushModelStreamingDeltas(handlers);
    }, STREAMING_FLUSH_INTERVAL_MS);
  }
}

export function applyModelStreamingEvent(
  payload: Record<string, unknown>,
  handlers: StreamingEventHandlers,
): void {
  const kind = stringField(payload, "kind");
  const delta = stringField(payload, "delta") ?? "";
  const isBatchMode = handlers.batch === true;

  if (kind === "reasoning_start") {
    flushModelStreamingDeltas(handlers);
    handlers.setStatus("Streaming model reasoning...");
    return;
  }

  if (kind === "reasoning_delta") {
    const assistantMessageId = stringField(payload, "assistantMessageId");
    if (assistantMessageId && delta.length > 0) {
      if (isBatchMode) {
        const current = bufferedThoughtDeltas.get(assistantMessageId) ?? "";
        bufferedThoughtDeltas.set(assistantMessageId, current + delta);
        scheduleFlush(handlers);
      } else {
        handlers.setMessages((current) =>
          appendStreamingThoughtDelta(current, assistantMessageId, delta),
        );
        handlers.setStatus("Streaming model reasoning...");
      }
    }
    return;
  }

  if (kind === "reasoning_end") {
    flushModelStreamingDeltas(handlers);
    const assistantMessageId = stringField(payload, "assistantMessageId");
    if (assistantMessageId) {
      handlers.setMessages((current) => markStreamingThoughtComplete(current, assistantMessageId));
    }
    handlers.setStatus("Model reasoning received.");
    return;
  }

  if (kind === "tool_call") {
    flushModelStreamingDeltas(handlers);
    rememberStreamingToolMessage(payload, handlers.assistantMessageIdsByToolCallId);
    handlers.setStatus(`Tool ${stringField(payload, "toolName") ?? "tool"} pending.`);
    return;
  }

  if (kind === "tool_input_start" || kind === "tool_input_delta" || kind === "tool_input_end") {
    flushModelStreamingDeltas(handlers);
    // provider tool-input deltas are JSON arguments for a future tool call, not assistant text.
    handlers.setStatus(`Preparing tool ${stringField(payload, "toolName") ?? "tool"}...`);
    return;
  }

  if (kind === "text_delta" || (!kind && delta)) {
    const assistantMessageId = stringField(payload, "assistantMessageId");
    if (assistantMessageId) {
      if (delta.length > 0) {
        if (isBatchMode) {
          const current = bufferedTextDeltas.get(assistantMessageId) ?? "";
          bufferedTextDeltas.set(assistantMessageId, current + delta);
          scheduleFlush(handlers);
        } else {
          handlers.setMessages((current) =>
            appendStreamingTextDelta(current, assistantMessageId, delta),
          );
          handlers.setStatus("Streaming model response...");
        }
      }
    } else {
      if (isBatchMode) {
        bufferedLiveText += delta;
        scheduleFlush(handlers);
      } else {
        handlers.setLiveModelText((current) => `${current}${delta}`);
        handlers.setStatus("Streaming model response...");
      }
    }
    return;
  }

  if (kind === "finish") {
    flushModelStreamingDeltas(handlers);
    const assistantMessageId = stringField(payload, "assistantMessageId");
    if (assistantMessageId) {
      handlers.setMessages((current) => markStreamingMessageComplete(current, assistantMessageId));
    }
    handlers.setStatus("Model response received.");
  }
}

function rememberStreamingToolMessage(
  payload: Record<string, unknown>,
  assistantMessageIdsByToolCallId: Map<string, string>,
): void {
  const toolCallId = stringField(payload, "toolCallId");
  const assistantMessageId = stringField(payload, "assistantMessageId");
  if (toolCallId && assistantMessageId) {
    assistantMessageIdsByToolCallId.set(toolCallId, assistantMessageId);
  }
}
