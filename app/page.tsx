"use client";

import { useState } from "react";

type Json = Record<string, unknown>;

export default function Page() {
  const [loading, setLoading] = useState<string | null>(null);
  const [metadataResult, setMetadataResult] = useState<Json | null>(null);
  const [chaptersResult, setChaptersResult] = useState<Json | null>(null);
  const [repliesResult, setRepliesResult] = useState<Json | null>(null);

  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [comments, setComments] = useState("");

  async function callEndpoint(path: string, body: Json) {
    setLoading(path);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return await res.json();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container">
      <section className="card">
        <h3>Generate Metadata (Title, Description, Tags)</h3>
        <label className="label">Topic or brief</label>
        <textarea className="textarea" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How to set up n8n for YouTube automation" />
        <button className="button" disabled={!topic || !!loading} onClick={async () => {
          const data = await callEndpoint("/api/metadata", { topic });
          setMetadataResult(data);
        }}>Generate</button>
        <p className="small">POST /api/metadata ? Use from n8n HTTP node.</p>
        {metadataResult && (
          <div>
            <p className="small">Result</p>
            <pre>{JSON.stringify(metadataResult, null, 2)}</pre>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Create Chapters from Transcript</h3>
        <label className="label">Transcript</label>
        <textarea className="textarea" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste transcript text" />
        <button className="button" disabled={!transcript || !!loading} onClick={async () => {
          const data = await callEndpoint("/api/chapters", { transcript });
          setChaptersResult(data);
        }}>Create Chapters</button>
        <p className="small">POST /api/chapters ? Returns timestamps and titles.</p>
        {chaptersResult && (
          <div>
            <p className="small">Result</p>
            <pre>{JSON.stringify(chaptersResult, null, 2)}</pre>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Reply Suggestions for Comments</h3>
        <label className="label">Raw comments (one per line)</label>
        <textarea className="textarea" value={comments} onChange={(e) => setComments(e.target.value)} placeholder={"Great video!\nCan you cover n8n triggers?"} />
        <button className="button" disabled={!comments || !!loading} onClick={async () => {
          const list = comments.split("\n").map((s) => s.trim()).filter(Boolean);
          const data = await callEndpoint("/api/replies", { comments: list });
          setRepliesResult(data);
        }}>Suggest Replies</button>
        <p className="small">POST /api/replies ? Suggests tone-aware responses.</p>
        {repliesResult && (
          <div>
            <p className="small">Result</p>
            <pre>{JSON.stringify(repliesResult, null, 2)}</pre>
          </div>
        )}
      </section>

      <section className="card">
        <h3>n8n Webhook</h3>
        <p className="small">POST /api/webhook/n8n with {"action":"metadata"|"chapters"|"replies", payload...}</p>
        <pre>{JSON.stringify({
          action: "metadata",
          payload: { topic: "How to automate YouTube with n8n" }
        }, null, 2)}</pre>
      </section>
    </div>
  );
}
