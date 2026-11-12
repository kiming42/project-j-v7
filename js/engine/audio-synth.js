/* ============================================================================
 * Project J：艾瑟瑞亞的破曉 — Web Audio API 復古 8-bit 音樂與音效合成器 (audio-synth.js)
 * 100% 原生晶片音合成，零外部 MP3 載入錯誤，支援多章節主題 BGM 自動切換！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};

(function() {
  let ctx = null;
  let isMuted = false;
  let currentBgmTheme = null;
  let bgmTimer = null;
  let noteStep = 0;

  // 四大場景與戰鬥 8-bit 旋律音階頻率表 (Hz)
  const MELODIES = {
    // 翠風森林營地：輕快溫暖的奇幻冒險曲
    forest: {
      tempo: 260,
      notes: [330, 392, 440, 494, 523, 494, 440, 392, 349, 392, 440, 330, 294, 330, 392, 330]
    },
    // 流沙峽谷與地下迷宮：神秘緊湊的探索曲
    canyon: {
      tempo: 240,
      notes: [294, 349, 440, 466, 440, 349, 294, 262, 294, 349, 440, 523, 466, 440, 349, 294]
    },
    // 深淵秘境與無盡之塔：低沉史詩壓迫感
    abyss: {
      tempo: 220,
      notes: [220, 262, 247, 220, 196, 220, 247, 196, 175, 196, 220, 262, 247, 220, 196, 165]
    },
    // Break & Boost 戰鬥曲：高燃熱血節奏
    battle: {
      tempo: 165,
      notes: [440, 440, 523, 587, 659, 587, 523, 494, 440, 392, 440, 523, 587, 523, 494, 440]
    }
  };

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  function playTone(freq, type, duration, vol = 0.08, slideFreq = null) {
    if (isMuted) return;
    ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  const AudioEngine = {
    toggleMute() {
      isMuted = !isMuted;
      const btn = document.getElementById("btn-bgm-toggle");
      if (btn) btn.innerText = isMuted ? "🔇" : "🔊";
      if (isMuted) {
        this.stopBgm();
      } else {
        this.playBgm(currentBgmTheme || "forest");
      }
    },

    playBgm(theme = "forest") {
      currentBgmTheme = theme;
      clearInterval(bgmTimer);
      if (isMuted) return;

      const track = MELODIES[theme] || MELODIES.forest;
      noteStep = 0;

      bgmTimer = setInterval(() => {
        if (isMuted || !ctx || ctx.state !== "running") return;
        const freq = track.notes[noteStep % track.notes.length];
        playTone(freq, "triangle", 0.18, 0.035);
        noteStep++;
      }, track.tempo);
    },

    stopBgm() {
      clearInterval(bgmTimer);
    },

    // 1. 採集礦石/靈草清脆叮聲
    sfxGather() {
      playTone(587, "sine", 0.09, 0.1);
      setTimeout(() => playTone(880, "sine", 0.14, 0.12), 70);
    },

    // 2. 答對題目揮刀斬擊 + 削盾音效
    sfxAttackHit() {
      playTone(523, "square", 0.08, 0.09);
      setTimeout(() => playTone(784, "square", 0.15, 0.1), 65);
    },

    // 3. 💥 BREAK 破防玻璃碎裂重擊音效
    sfxBreakShield() {
      playTone(330, "sawtooth", 0.12, 0.14, 880);
      setTimeout(() => playTone(987, "square", 0.25, 0.15, 440), 90);
    },

    // 4. 答錯擦傷低音提示
    sfxWrong() {
      playTone(220, "sawtooth", 0.18, 0.1, 130);
    },

    // 5. 升級與鍛造成功勝利號角
    sfxLevelUp() {
      const fanfare = [523, 659, 784, 1046];
      fanfare.forEach((f, idx) => {
        setTimeout(() => playTone(f, "square", 0.16, 0.11), idx * 95);
      });
    },

    // 6. 炸彈爆破音效
    sfxBomb() {
      playTone(150, "sawtooth", 0.32, 0.18, 45);
    },

    // 7. NPC 對話打字機輕響
    sfxTalkBlip() {
      playTone(660, "sine", 0.04, 0.04);
    }
  };

  // 首次點擊畫面時自動解鎖手機瀏覽器 AudioContext
  window.addEventListener("pointerdown", () => {
    ensureContext();
    if (!bgmTimer && !isMuted) AudioEngine.playBgm(currentBgmTheme || "forest");
  }, { once: true });

  window.Aetheria.Audio = AudioEngine;
})();
