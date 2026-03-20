let userName = "অজয়";

let audioContext, analyser, dataArray;

let talking = false;
let lastSoundTime = 0;
let isSpeaking = false;

// 👩 Female voice
function speak(text) {
  if (talking) return;

  let msg = new SpeechSynthesisUtterance(text);

  let voices = speechSynthesis.getVoices();

  let femaleVoice = voices.find(v =>
    v.name.toLowerCase().includes("female") ||
    v.name.toLowerCase().includes("zira") ||
    v.name.toLowerCase().includes("google")
  );

  if (femaleVoice) msg.voice = femaleVoice;

  msg.lang = "bn-BD";
  msg.pitch = 1.5;
  msg.rate = 1;

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

  analyser.fftSize = 512;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  speak(userName + ", শুরু করো... আমি judge করছি 😏");

  loop();
}

// ⏹️ Stop
function stop() {
  if (audioContext) audioContext.close();
}

// 🔁 Loop
function loop() {
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  let avg = sum / dataArray.length;
  let now = Date.now();

  // 🎤 detect sound
  if (avg > 20) {
    lastSoundTime = now;
    isSpeaking = true;
  }

  // ⏳ song end detect
  if (isSpeaking && now - lastSoundTime > 2000) {
    isSpeaking = false;
    react(avg);
  }

  requestAnimationFrame(loop);
}

// 😂 SAVAGE REACTION
function react(avg) {
  let reply = "";

  if (avg < 20) {
    let arr = [
      userName + ", তুমি গাইছিলে নাকি ভাবছিলে? 😆",
      "আমি কিছুই শুনলাম না... imagination ছিল নাকি? 😂",
      "এইটা গান না silent mode 😏",
      "তুমি গাইলে আমি guess করলাম 😅"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (avg < 40) {
    let arr = [
      userName + ", honestly... একটু struggle হলো শুনতে 😆",
      "এইটা গান ছিলো... না test? 😏",
      "practice দরকার... urgent 😄",
      "কাকও চিন্তা করছে competition দিবে 🐦😂",
      "confidence বেশি, skill একটু কম 😆"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else {
    let arr = [
      "ওহ! আজ একটু impress করলে 🔥",
      "এইটা ভালোই ছিল 😄",
      "চালিয়ে যাও, improve হচ্ছে 👌",
      "আজ singer vibe আসছে 😏",
      "এইটা ঠিক ছিল... finally 😆"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  speak(reply);
}

// 💬 Chat
function chat() {
  let input = document.getElementById("input").value.toLowerCase();
  let reply = "";

  if (input.includes("hello")) {
    reply = userName + ", হ্যালো 😄";
  } 
  else if (input.includes("song")) {
    reply = "গাও দেখি... আমি ready 😏";
  }
  else if (input.includes("kemon")) {
    reply = "তুমি চেষ্টা করছো... সেটাই বড় কথা 😆";
  }
  else {
    let arr = [
      "তুমি আজ interesting 😏",
      "আমি judge করছি 😄",
      "চালিয়ে যাও... surprise দাও 🔥"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  let box = document.getElementById("chatBox");
  box.innerHTML += `<p>🧑 ${input}</p>`;
  box.innerHTML += `<p>🤖 ${reply}</p>`;

  speak(reply);
      }
