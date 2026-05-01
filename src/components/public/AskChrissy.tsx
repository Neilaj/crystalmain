"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Tiny silent MP3 — used to "prime" iOS audio to route through speaker, not earpiece
const SILENT_MP3 = "data:audio/mpeg;base64,//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kMQPAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";

const LIMIT = 6;
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = "chrissy_cooldown";

// Only the cooldown end-time is persisted — question count resets each page visit
function getCooldownUntil(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return 0;
}

function saveCooldown(resetAt: number) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(resetAt)); } catch { /* */ }
}

function clearCooldown() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
}

export default function AskChrissy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [pendingAudioBlob, setPendingAudioBlob] = useState<Blob | null>(null);
  const [pendingAudioIdx, setPendingAudioIdx] = useState<number | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  // Persistent audio element for iOS speaker routing
  const speakerAudioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Format phone as (XXX) XXX-XXXX
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // On mount: detect iOS and check for active cooldown
  useEffect(() => {
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    const resetAt = getCooldownUntil();
    if (resetAt && Date.now() < resetAt) {
      setIsLimited(true);
      setCooldownUntil(resetAt);
    }
  }, []);

  // Countdown timer when limited
  useEffect(() => {
    if (!isLimited) return;
    const tick = () => {
      const remaining = cooldownUntil - Date.now();
      if (remaining <= 0) {
        setIsLimited(false);
        setQuestionCount(0);
        clearCooldown();
        setTimeLeft("");
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLimited, cooldownUntil]);

  // Initialize a persistent audio element on first open — keeps iOS in speaker mode
  useEffect(() => {
    if (isOpen && !speakerAudioRef.current) {
      const audio = document.createElement("audio");
      audio.setAttribute("playsinline", "");
      audio.volume = 1.0;
      audio.src = SILENT_MP3;
      document.body.appendChild(audio);
      audio.play().catch(() => {});
      speakerAudioRef.current = audio;
    }
  }, [isOpen]);

  // Play audio blob — reuses persistent audio element on iOS for speaker routing
  const playAudioBlob = useCallback((blob: Blob, idx: number) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      if (activeAudioRef.current !== speakerAudioRef.current) {
        activeAudioRef.current.remove();
      }
      activeAudioRef.current = null;
    }

    const url = URL.createObjectURL(blob);

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && speakerAudioRef.current) {
      const audio = speakerAudioRef.current;
      audio.src = url;
      audio.volume = 1.0;
      setSpeakingIdx(idx);
      audio.onended = () => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        audio.pause();
        audio.src = "";
        audio.load();
        activeAudioRef.current = null;
      };
      audio.play().catch(() => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
      });
      activeAudioRef.current = audio;
    } else {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.volume = 1.0;
      audio.setAttribute("playsinline", "");
      document.body.appendChild(audio);
      setSpeakingIdx(idx);
      audio.onended = () => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        audio.remove();
        activeAudioRef.current = null;
      };
      audio.play().catch(() => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        audio.remove();
      });
      activeAudioRef.current = audio;
    }
  }, []);

  // Speak a message using ElevenLabs TTS
  const speakMessage = useCallback(async (text: string, idx: number) => {
    if (speakingIdx === idx) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = "";
        activeAudioRef.current.load();
        if (activeAudioRef.current !== speakerAudioRef.current) {
          activeAudioRef.current.remove();
        }
        activeAudioRef.current = null;
      }
      setSpeakingIdx(null);
      return;
    }
    setSpeakingIdx(idx);
    try {
      const res = await fetch("/api/ai/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      playAudioBlob(blob, idx);
    } catch {
      setSpeakingIdx(null);
    }
  }, [speakingIdx, playAudioBlob]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Stop pulse after first open
  useEffect(() => {
    if (isOpen) setPulse(false);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string, fromMic = false) => {
    if (!text.trim() || isStreaming) return;

    // Check for active sitewide cooldown
    const resetAt = getCooldownUntil();
    if (resetAt && Date.now() < resetAt) {
      setIsLimited(true);
      setCooldownUntil(resetAt);
      setShowContactForm(true);
      return;
    }
    if (resetAt && Date.now() >= resetAt) {
      clearCooldown();
      setQuestionCount(0);
    }

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      const data = await res.json();
      const responseText = data.response || "";

      // Check for contact form trigger
      const hasContactForm = responseText.includes("[SHOW_CONTACT_FORM]");
      const cleanText = responseText.replace("[SHOW_CONTACT_FORM]", "").trim();

      setMessages((prev) => [...prev, { role: "assistant", content: cleanText }]);

      // Increment per-page question count (lives in state, resets on navigation)
      const newCount = questionCount + 1;
      setQuestionCount(newCount);

      if (newCount >= LIMIT) {
        // Lock sitewide for 30 mins — persist only the cooldown end time
        const cooldownEnd = Date.now() + COOLDOWN_MS;
        saveCooldown(cooldownEnd);
        setIsLimited(true);
        setCooldownUntil(cooldownEnd);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "You've reached the limit for now — I want to make sure everyone gets a chance to chat! Drop your info below and we'll personally follow up. Come back in 30 minutes to keep chatting." },
        ]);
        setShowContactForm(true);
      } else if (hasContactForm) {
        setShowContactForm(true);
      }

      // Fetch TTS audio if user used mic — desktop only (iOS skips TTS entirely)
      if (fromMic && cleanText && !isIOS) {
        const msgIdx = newMessages.length;
        try {
          const ttsRes = await fetch("/api/ai/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanText }),
          });
          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobileDevice) {
              setPendingAudioBlob(blob);
              setPendingAudioIdx(msgIdx);
            } else {
              playAudioBlob(blob, msgIdx);
            }
          }
        } catch {
          // Silent fail
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Oops, bad connection. Try again in a sec!" },
        ]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, playAudioBlob]);

  // Play pre-fetched TTS audio (iOS safe — called from user tap)
  const playPendingAudio = useCallback(() => {
    if (!pendingAudioBlob || pendingAudioIdx === null) return;
    const blob = pendingAudioBlob;
    const idx = pendingAudioIdx;
    setPendingAudioBlob(null);
    setPendingAudioIdx(null);
    playAudioBlob(blob, idx);
  }, [pendingAudioBlob, pendingAudioIdx, playAudioBlob]);

  // Store pending mic transcript to be sent via useEffect (avoids stale closures)
  const [pendingMicText, setPendingMicText] = useState<string | null>(null);

  useEffect(() => {
    if (pendingMicText && !isStreaming) {
      const text = pendingMicText;
      setPendingMicText(null);
      sendMessage(text, true);
    }
  }, [pendingMicText, isStreaming, sendMessage]);

  // Speech-to-text via Web Speech API
  // IMPORTANT: recognition.start() MUST be called synchronously from the tap handler
  const toggleListening = useCallback(() => {
    // ── Stop if already listening ──
    if (isListening || recognitionRef.current) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* */ }
      }
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    // ── Stop & fully release any playing audio ──
    // iOS shares one audio session between speaker and mic.
    // If the speaker audio element is holding the session, mic start silently fails.
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.src = "";
      activeAudioRef.current.load();
      if (activeAudioRef.current !== speakerAudioRef.current) {
        activeAudioRef.current.remove();
      }
      activeAudioRef.current = null;
      setSpeakingIdx(null);
    }
    // Also reset the persistent iOS speaker element so iOS releases the audio session
    if (speakerAudioRef.current) {
      speakerAudioRef.current.pause();
      speakerAudioRef.current.src = "";
      speakerAudioRef.current.load();
    }
    // Discard any pending TTS blob — user chose to speak instead
    setPendingAudioBlob(null);
    setPendingAudioIdx(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finalTranscript = "";
    let handled = false;

    const finish = (transcript: string) => {
      if (handled) return;
      handled = true;
      recognitionRef.current = null;
      setIsListening(false);
      setInput("");
      if (transcript.trim()) setPendingMicText(transcript.trim());
    };

    recognition.onstart = () => setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
      finalTranscript = transcript;
      if (event.results[event.results.length - 1].isFinal) {
        // Explicitly stop so iOS fires onend cleanly
        try { recognition.stop(); } catch { /* */ }
        finish(transcript);
      }
    };

    // iOS: fires when user stops speaking — force stop to get the final result
    recognition.onspeechend = () => {
      try { recognition.stop(); } catch { /* */ }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      // 'no-speech' is normal on iOS (fires even after valid speech) — don't treat as fatal
      if (event.error === "no-speech") return;
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onend = () => {
      // Safety net: send whatever was captured if finish() wasn't called yet
      finish(finalTranscript);
      // Re-prime iOS speaker element so next TTS works without user tap
      if (speakerAudioRef.current) {
        speakerAudioRef.current.src = SILENT_MP3;
        speakerAudioRef.current.play().catch(() => {});
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isListening]);

  const handleContactSubmit = async () => {
    if (!contactData.name || !contactData.email) return;
    setSubmittingContact(true);

    try {
      const res = await fetch("/api/ai/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          message: contactData.message,
        }),
      });

      if (res.ok) {
        setContactSubmitted(true);
        setShowContactForm(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "You're all set! We'll reach out within 24 hours. Anything else I can help with?" },
        ]);
      } else {
        throw new Error("Failed");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hmm, something went wrong. Try emailing neil@crystalstudios.net or call 917-588-7130!" },
      ]);
    } finally {
      setSubmittingContact(false);
    }
  };

  const quickActions = [
    "What do you build?",
    "Tell me about Parsley CMS",
    "I want a website",
    "How much does it cost?",
  ];

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-red-700 pl-4 pr-5 py-3 text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
        )}
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </span>
        <span className="relative text-sm font-semibold">Ask Chrissy</span>
      </button>
    );
  }

  return (
    <>
      {/* Chat Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[100dvh] max-h-[520px] w-full max-w-[400px] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:left-auto sm:mx-0 sm:h-[520px] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-800 to-red-700 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-lg">💎</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Ask Chrissy</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
              <p className="text-xs text-white/70">Crystal Studios · Online now</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-100">
                Hey! I&apos;m Chrissy from Crystal Studios. What can I help you build today? 💎
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-50 hover:border-red-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "assistant" ? "group/msg" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-red-700 text-white"
                      : "rounded-bl-md bg-white text-gray-700 shadow-sm border border-gray-100"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
                {msg.role === "assistant" && msg.content && !isIOS && (
                  <button
                    onClick={() => speakMessage(msg.content, i)}
                    className={`mt-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-all ${
                      speakingIdx === i
                        ? "bg-red-100 text-red-700"
                        : "text-gray-400 hover:text-red-600"
                    }`}
                    title={speakingIdx === i ? "Stop" : "Listen"}
                  >
                    {speakingIdx === i ? (
                      <>
                        <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="5" width="4" height="14" rx="1" />
                          <rect x="14" y="5" width="4" height="14" rx="1" />
                        </svg>
                        Playing...
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                        Listen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* "Tap to listen" prompt for mobile after mic */}
          {pendingAudioBlob && (
            <div className="flex justify-start">
              <button
                onClick={playPendingAudio}
                className="flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-md animate-pulse transition-all hover:bg-red-800 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                Tap to hear response
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white px-3 py-3">
          {isLimited ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              <svg className="h-4 w-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {timeLeft ? `Back in ${timeLeft}` : "Limit reached — check back in 30 min"}
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-400 transition-colors"
              />
              {/* Mic button */}
              <button
                onClick={toggleListening}
                disabled={isStreaming}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-40"
                }`}
                title={isListening ? "Stop listening" : "Speak your question"}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
              {/* Send button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-700 text-white transition-all hover:bg-red-800 disabled:opacity-40 disabled:hover:bg-red-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          )}
          <p className="mt-1.5 text-center text-[10px] text-gray-300">
            Crystal Studios &middot; crystalstudios.net
          </p>
        </div>
      </div>

      {/* Contact Modal — bottom sheet on mobile, centered on desktop */}
      {showContactForm && !contactSubmitted && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full sm:mx-4 sm:max-w-md flex flex-col max-h-[90dvh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            {/* Pinned header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-red-800 to-red-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Start a Project</h3>
              <p className="mt-0.5 text-sm text-white/70">
                Drop your info and we&apos;ll reach out within 24 hours.
              </p>
            </div>
            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: formatPhone(e.target.value) })}
                  placeholder="(555) 000-0000"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  placeholder="Tell us about your project..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>
            </div>
            {/* Pinned buttons */}
            <div className="flex-shrink-0 flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setShowContactForm(false)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
              <button
                onClick={handleContactSubmit}
                disabled={!contactData.name || !contactData.email || submittingContact}
                className="flex-1 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 transition-colors"
              >
                {submittingContact ? "Sending..." : "Let's Talk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
