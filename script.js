let userName = "অজয়";

let audioContext, analyser, dataArray;
let talking = false;
let lastMood = "neutral";

// 🗣️ Voice
function speak(text) {
  if (talking) return;

  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "bn-BD";

  talking = true;
  msg.onend = () => talking = false;

  speechSynthesis.speak(msg);
}

// 🎤 Start
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();

  let mic = audioContext.createMediaStreamSource(stream);
  mic.connect(analyser);

  analyser.fftSize = 2048;
  dataArray = new Float32Array(analyser.fftSize);

  speak(userName + ", শুরু করো 🎤");
  document.getElementById("feedback").innerText = "Listening...";

  loop();
}

// ⏹️ Stop
function stop() {
  if (audioContext) audioContext.close();
  document.getElementById("feedback").innerText = "Stopped";
}

// 🔁 Loop
function loop() {
  analyser.getFloatTimeDomainData(dataArray);

  let freq = autoCorrelate(dataArray, audioContext.sampleRate);

  let text = "";
  let feedback = "";

  if (freq === -1) {
    text = "🤔 বুঝতে পারছি না";
    feedback = "Clear করে গাও";
    lastMood = "confused";
  } 
  else if (freq > 400) {
    text = "🔺 High";
    feedback = "অজয়, একটু নিচে নামাও";
    lastMood = "high";
  } 
  else if (freq < 300) {
    text = "🔻 Low";
    feedback = "অজয়, voice বাড়াও";
    lastMood = "low";
  } 
  else {
    text = "✅ Good";
    feedback = "Nice! চালিয়ে যাও 🔥";
    lastMood = "good";
  }

  document.getElementById("live").innerText = text;
  document.getElementById("feedback").innerText = feedback;

  if (Math.random() > 0.97) speak(feedback);

  requestAnimationFrame(loop);
}

// 💬 Chat
function chat() {
  let input = document.getElementById("input").value.toLowerCase();
  let reply = "";

  if (input.includes("hello")) {
    reply = userName + ", হ্যালো 😄";
  } 
  else if (input.includes("song")) {
    reply = "গাও দেখি 🎤";
  }
  else if (input.includes("kemon")) {
    reply = lastMood === "good" ? "আজ ভালো গাইছো 🔥" : "practice দরকার 😏";
  }
  else {
    let arr = [
      "চালিয়ে যাও 😄",
      "আমি শুনছি 👀",
      "তুমি improve করছো 🔥"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  let box = document.getElementById("chatBox");
  box.innerHTML += `<p>🧑 ${input}</p>`;
  box.innerHTML += `<p>🤖 ${reply}</p>`;

  speak(reply);
}

// 🎵 Pitch Detect
function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buf[i] * buf[i];
  }

  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;

  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < 0.2) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < 0.2) {
      r2 = SIZE - i;
      break;
    }
  }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;

  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  return sampleRate / T0;
      }
