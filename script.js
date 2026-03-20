
  let userName = "অজয়";

let audioContext, analyser, buffer;

let isSinging = false;
let lastSoundTime = 0;
let hasReplied = false;

let pitchList = [];

// 👩 voice setup
speechSynthesis.onvoiceschanged = () => {
  speechSynthesis.getVoices();
};

function speak(text) {
  if (speechSynthesis.speaking) return;

  let msg = new SpeechSynthesisUtterance(text);
  let voices = speechSynthesis.getVoices();

  let female = voices.find(v =>
    v.name.toLowerCase().includes("female") ||
    v.name.includes("Google") ||
    v.name.includes("Zira")
  );

  if (female) msg.voice = female;

  msg.pitch = 1.5;
  msg.lang = "bn-BD";

  speechSynthesis.speak(msg);
}

// 🎤 start
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new AudioContext();
  await audioContext.resume();

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  let mic = audioContext.createMediaStreamSource(stream);
  mic.connect(analyser);

  buffer = new Float32Array(analyser.fftSize);

  loop();
}

// ⏹️ stop
function stop() {
  if (audioContext) audioContext.close();
}

// 🔁 loop
function loop() {
  analyser.getFloatTimeDomainData(buffer);

  let pitch = detectPitch(buffer, audioContext.sampleRate);
  let now = Date.now();

  // 🎤 detect singing
  if (pitch > 0) {
    pitchList.push(pitch);
    lastSoundTime = now;
    isSinging = true;
    hasReplied = false;
  }

  // ⏳ 2 sec silence = song finished
  if (isSinging && now - lastSoundTime > 2000 && !hasReplied) {
    isSinging = false;
    hasReplied = true;

    analyze(); // 👉 এখানেই final reply
    pitchList = [];
  }

  requestAnimationFrame(loop);
}

// 🎵 pitch detect
function detectPitch(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buf[i] * buf[i];
  }

  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let bestOffset = -1;
  let bestCorrelation = 0;

  for (let offset = 8; offset < 1000; offset++) {
    let correlation = 0;

    for (let i = 0; i < SIZE - offset; i++) {
      correlation += buf[i] * buf[i + offset];
    }

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1) return -1;

  return sampleRate / bestOffset;
}

// 🎼 note + accuracy
function freqToNote(freq) {
  let A4 = 440;
  let noteNum = 12 * (Math.log(freq / A4) / Math.log(2));
  let midi = Math.round(noteNum) + 69;

  let notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  let note = notes[midi % 12];

  let exactFreq = A4 * Math.pow(2, (midi - 69) / 12);
  let cents = 1200 * Math.log2(freq / exactFreq);

  return { note, cents };
}

// 📊 analyze (FINAL reply)
function analyze() {
  if (pitchList.length < 5) return;

  let avg = pitchList.reduce((a,b)=>a+b,0) / pitchList.length;

  let { note, cents } = freqToNote(avg);

  let reply = "";

  // 🎯 honest judgement
  if (Math.abs(cents) < 20) {
    reply = "ভালো গেয়েছো 😄 (Note: " + note + ")";
  } 
  else if (Math.abs(cents) < 50) {
    reply = "মোটামুটি... একটু off ছিল 😏";
  } 
  else {
    reply = "খারাপ হয়েছে 😆 সুর ঠিক ছিল না";
  }

  reply += " | error: " + Math.round(cents) + " cents";

  speak(reply);
}
