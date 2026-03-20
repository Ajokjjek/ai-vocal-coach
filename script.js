    let userName = "অজয়";

let audioContext, analyser, dataArray;
let talking = false;

// 🗣️ Speak function
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

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  speak(userName + ", শুরু করো দেখি আজ কী করো 😏");

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

  let mood = "";
  let text = "";

  if (avg < 10) {
    mood = "silent";
    text = "🤫 কিছুই শুনছি না";
  } 
  else if (avg < 30) {
    mood = "low";
    text = "🔻 আস্তে গাইছো";
  } 
  else if (avg < 60) {
    mood = "medium";
    text = "🙂 ঠিক আছে";
  } 
  else {
    mood = "high";
    text = "🔥 জোরে গাইছো!";
  }

  document.getElementById("live").innerText = text;

  // 😂 Fun talk trigger
  if (Math.random() > 0.95) funTalk(mood);

  requestAnimationFrame(loop);
}

// 😂 FUN + ROAST SYSTEM
function funTalk(mood) {
  let reply = "";

  if (mood === "silent") {
    let arr = [
      userName + ", তুমি কি মনের মধ্যে গান গাইছো? 😆",
      "এটা কি silent mode? 😂",
      "আমি কিছুই শুনছি না 😅"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (mood === "low") {
    let arr = [
      userName + ", ঘুমাচ্ছো নাকি? 😴",
      "এত আস্তে কেন? 😆",
      "এইটা গান না whisper 😂"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (mood === "medium") {
    let arr = [
      "মন্দ না 😄",
      "চালিয়ে যাও 👍",
      "practice করলে জমবে 🔥"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  else if (mood === "high") {
    let arr = [
      userName + ", mic ফাটিয়ে দিবে নাকি 😂",
      "পাশের লোক ভয় পেয়ে গেছে 😆",
      "এই energy থাকলে concert করতে পারো 🔥"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  speak(reply);
}

// 💬 Chat system
function chat() {
  let input = document.getElementById("input").value.toLowerCase();
  let reply = "";

  if (input.includes("hello") || input.includes("hi")) {
    reply = userName + ", হ্যালো! গান গাইবে? 😄";
  } 
  else if (input.includes("song")) {
    reply = "গাও দেখি 🎤";
  }
  else if (input.includes("kemon")) {
    reply = "তুমি চেষ্টা করছো, সেটাই বড় কথা 😄";
  }
  else {
    let arr = [
      "তুমি আজ funny mood-এ 😆",
      "আমি ready 😏",
      "চালিয়ে যাও 🔥"
    ];
    reply = arr[Math.floor(Math.random()*arr.length)];
  }

  let box = document.getElementById("chatBox");
  box.innerHTML += `<p>🧑 ${input}</p>`;
  box.innerHTML += `<p>🤖 ${reply}</p>`;

  speak(reply);
}
  
