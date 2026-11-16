"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const openingMessage: Message = {
  role: "assistant",
  content: "Сайн уу. Би Claude. Юун дээр хамт ажиллах вэ?",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([openingMessage]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result: { text?: string; error?: string } = await response.json();
      if (!response.ok || !result.text) {
        throw new Error(result.error || "Хариу авахад алдаа гарлаа.");
      }
      setMessages([...nextMessages, { role: "assistant", content: result.text }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Сүлжээний алдаа гарлаа.");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Claude Studio нүүр">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>claude<span className="brand-light"> studio</span></span>
        </a>
        <div className="model-label"><span className="status-dot" /> Claude Sonnet 4.5</div>
        <a className="top-link" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          API тохиргоо <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="chat-layout" aria-label="Claude AI чат">
        <div className="chat-heading">
          <p className="eyebrow">ТАНЫ AI ТУСЛАХ</p>
          <h1>Юунаас эхлэх вэ?</h1>
          <p className="intro">Санаагаа бичээрэй. Claude тантай хамт бодож, бүтээнэ.</p>
        </div>

        <div className="conversation" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === "assistant" && <span className="message-avatar">C</span>}
              <div className="message-body">
                {message.role === "assistant" && <span className="message-author">Claude</span>}
                <p>{message.content}</p>
              </div>
            </article>
          ))}
          {isSending && (
            <article className="message assistant" aria-label="Claude хариулж байна">
              <span className="message-avatar">C</span>
              <div className="typing-indicator"><i /><i /><i /></div>
            </article>
          )}
        </div>

        <div className="composer-area">
          {error && <p className="error-message" role="alert">{error}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              aria-label="Зурвасаа бичнэ үү"
              placeholder="Claude-оос юу асуух вэ?"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              maxLength={12000}
              disabled={isSending}
            />
            <div className="composer-footer">
              <span className="hint">Shift + Enter шинэ мөр</span>
              <button type="submit" aria-label="Зурвас илгээх" disabled={!draft.trim() || isSending}>
                {isSending ? "..." : "Илгээх"}<span aria-hidden="true"> ↗</span>
              </button>
            </div>
          </form>
          <p className="disclaimer">Claude заримдаа алдаж болно. Чухал мэдээллээ нягтлаарай.</p>
        </div>
      </section>
    </main>
  );
}
