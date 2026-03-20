let audioContext, analyser, buffer;

let isSinging = false;
let lastSoundTime = 0;
let hasReplied = false;

let pitchList = [];

// 👩 Female voice
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
  msg.lang = "en-US";

  speechSynthesis.speak(msg);
}

// 🎤 Start
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new AudioContext();
  await audioContext.resume();

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  let mic = audioContext.createMediaStreamSource(stream);
  mic.connect(analyser);

  buffer = new Float32Array(analyser.fftSize);

  document.getElementById("status").innerText = "Listening...";
  loop();
}

// ⏹️ Stop
function stop() {
  if (audioContext) audioContext.close();
}

// 🔁 Loop
function loop() {
  analyser.getFloatTimeDomainData(buffer);

  let pitch = detectPitch(buffer, audioContext.sampleRate);
  let now = Date.now();

  if (pitch > 0) {
    pitchList.push(pitch);
    lastSoundTime = now;
    isSinging = true;
    hasReplied = false;
  }

  // ⏳ wait 2 sec after silence
  if (isSinging && now - lastSoundTime > 2000 && !hasReplied) {
    isSinging = false;
    hasReplied = true;

    analyze();
    pitchList = [];
  }

  requestAnimationFrame(loop);
}

// 🎵 Pitch detect
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

// 🎼 Note detection
function getNote(freq) {
  let A4 = 440;
  let noteNum = 12 * (Math.log(freq / A4) / Math.log(2));
  let midi = Math.round(noteNum) + 69;

  let notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return notes[midi % 12];
}

// 📊 Analyze
function analyze() {
  if (pitchList.length < 5) return;

  let avg = pitchList.reduce((a,b)=>a+b,0) / pitchList.length;

  let note = getNote(avg);

  let reply = "";

  // 🎯 Honest judgement
  if (avg < 150) {
    reply = "That was bad. Your pitch was unstable.";
  } 
  else if (avg < 300) {
    reply = "Not bad, but you were off pitch.";
  } 
  else {
    reply = "Good singing. You were mostly on pitch.";
  }

  reply += " | Detected note: " + note;

  document.getElementById("status").innerText = reply;

  speak(reply);
    }
