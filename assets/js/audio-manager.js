/**
 * Audio Manager - Tiếng Trung Cô Mai Version 3.3
 *
 * Cơ chế:
 * 1. Mỗi nút audio có đường dẫn MP3 dự kiến.
 * 2. Khi bấm, hệ thống thử phát file MP3.
 * 3. Nếu file chưa tồn tại, hệ thống tự đọc bằng giọng Trung Quốc của trình duyệt.
 *
 * Vì vậy, chỉ cần đặt MP3 đúng tên vào đúng thư mục là website tự ưu tiên dùng MP3,
 * không phải sửa HTML, JSON hay JavaScript.
 */
window.AudioManager = (() => {
  let activeAudio = null;
  let activeButton = null;
  const availabilityCache = new Map();

  function stop() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (activeButton) {
      activeButton.classList.remove("is-playing");
      activeButton.setAttribute("aria-label", "Nghe phát âm");
      activeButton = null;
    }
  }

  async function fileExists(url) {
    if (!url) return false;
    if (availabilityCache.has(url)) return availabilityCache.get(url);
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      const exists = response.ok;
      availabilityCache.set(url, exists);
      return exists;
    } catch {
      availabilityCache.set(url, false);
      return false;
    }
  }

  function chooseChineseVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => /^zh-CN$/i.test(v.lang)) ||
      voices.find(v => /^zh/i.test(v.lang)) ||
      null
    );
  }

  function speak(text, rate = 0.85) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window) || !text) {
        reject(new Error("Thiết bị không hỗ trợ đọc văn bản."));
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voice = chooseChineseVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = resolve;
      utterance.onerror = reject;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  async function play({ src, text, button, rate = 0.85 }) {
    stop();
    activeButton = button || null;
    if (activeButton) {
      activeButton.classList.add("is-playing");
      activeButton.setAttribute("aria-label", "Dừng phát âm");
    }

    try {
      if (src && await fileExists(src)) {
        activeAudio = new Audio(src);
        activeAudio.preload = "auto";
        activeAudio.playbackRate = 1;
        activeAudio.onended = stop;
        activeAudio.onerror = async () => {
          activeAudio = null;
          try { await speak(text, rate); } finally { stop(); }
        };
        await activeAudio.play();
      } else {
        await speak(text, rate);
        stop();
      }
    } catch {
      try { await speak(text, rate); } finally { stop(); }
    }
  }

  function bind(root = document) {
    root.querySelectorAll("[data-audio-src][data-audio-text]").forEach(button => {
      if (button.dataset.audioBound === "true") return;
      button.dataset.audioBound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (button.classList.contains("is-playing")) {
          stop();
          return;
        }
        play({
          src: button.dataset.audioSrc,
          text: button.dataset.audioText,
          button,
          rate: Number(button.dataset.audioRate || 0.85)
        });
      });
    });
  }

  // Một số trình duyệt chỉ nạp danh sách giọng sau sự kiện voiceschanged.
  if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {});
  }

  return { bind, play, stop, fileExists };
})();