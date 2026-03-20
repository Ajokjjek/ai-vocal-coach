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

  speak(userName + ", শুরু করো দেখি আজ কী করো 😏");

  loop();
}

// ⏹️ Stop
function stop() {
  if (audioContext) audioContext.close();
}

// 🔁 Loop
function loop() {
  analyser.getFloatTimeDomainData(dataArray);

  let freq = autoCorrelate(dataArray, audioContext.sampleRate);

  let text = "";

  if (freq === -1) {
    text = "🤔 কিছুই বুঝতে পারছি না";
    lastMood = "confused";
  } 
  else if (freq > 400) {
    text = "🔺 অনেক high!";
    lastMood = "high";
  } 
  else if (freq < 300) {
    text = "🔻 অনেক low!";
    lastMood = "low";
  } 
  else {
    text = "✅ ভালো চলছে!";
    lastMood = "good";
  }

  document.getElementById("live").innerText = text;

  // 🔥 fun response trigger
  if (Math.random() > 0.94) funResponse();

  requestAnimationFrame(loop);
}

// 😂 FUN + ROAST SYSTEM
function funResponse() {
  let reply = "";

  if (lastMood === "good") {
    let arr = [
      userName + ", এই তো! singer vibe 🔥",
      "ওহ! আজ তো impress করছো 😄",
      "দেখছি improvement হচ্ছে 👌"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (lastMood === "high") {
    let arr = [
      userName + ", চিৎকার না, গান 😆",
      "মাইক না ভাঙলে ভালো 😏",
      "এত high গেলে পাখিরাও ভয় পাবে 🐦😂"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (lastMood === "low") {
    let arr = [
      userName + ", ঘুমাচ্ছো নাকি? 😴",
      "এত আস্তে কেন? আমি শুনতেই পাচ্ছি না 😆",
      "এইটা গান না whisper 😂"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else {
    let arr = [
      "এইটা কি ছিলো? 😆",
      "কিছুই বুঝলাম না 😂",
      "signal হারিয়ে গেছে মনে হয় 📡"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  speak(reply);
}

// 🎵 Pitch detect
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
