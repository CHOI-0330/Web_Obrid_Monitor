// server_beta_http.js (UDP Discovery IPv4 및 mDNS 자동 인식 추가)
// server_beta.js의 MQTT 수신 로직을 HTTP POST 수신 로직으로 변경
// UDP 브로드캐스트로 ESP32가 서버 IP(IPv4)를 자동 탐색하도록 추가

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");
const mdns = require("mdns"); // mDNS 광고용
const dgram = require("dgram"); // UDP 디스커버리용
const os = require("os"); // 로컬 IPv4 인터페이스 조회용

// --- 설정 ---
const PIXEL = 256; // 픽셀 수
const PORT = 8765; // HTTP & WebSocket 포트
const DISC_PORT = 41234; // UDP 디스커버리 포트
const DISC_MSG = "DISCOVER_MYSERVER"; // 탐색 요청 메시지

// 상태 및 플래그
let updateBackgroundFlag = false;
let isProcessing = false;

let backValues = null;
let preData = new Array(PIXEL).fill(0);
let preInterP = null;
let preP = null;
let lastInterTime = Date.now();
let flagUpdate = false;

let status = 1; // 1: ベッド上, 2: 座位, 3: 離床, 4: 訪問客
let preStatus = status;
let person = null;
let resetTime = null;
let lineNotice = true;

const messages = [
  "離床しています！今すぐ確認に行ってください！",
  "ベッド上にいます",
  "端座位です",
  "ただいま来客中",
  "来客は帰られました",
];

let lastEvent = {
  peak_position: null,
  status: null,
  person: null,
  message: "",
};

// Express 서버 생성
const app = express();
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "1mb" }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 로컬 IPv4 주소 탐색 함수
function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

// 1) mDNS 서비스 광고 (ESP32 mDNS fallback용)
const mdnsAd = mdns.createAdvertisement(mdns.tcp("http"), PORT, {
  name: "myserver",
});
mdnsAd.start();

// 2) UDP 디스커버리 소켓 설정
const udp = dgram.createSocket("udp4");
udp.bind(DISC_PORT, () => udp.setBroadcast(true));
udp.on("message", (msg, rinfo) => {
  if (msg.toString() === DISC_MSG) {
    const ipv4 = getLocalIPv4();
    udp.send(ipv4, rinfo.port, rinfo.address);
    console.log(
      `UDP discovery ping from ${rinfo.address}, replied with ${ipv4}`
    );
  }
});

// WebSocket 연결 처리
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("message", (msg) => {
    if (msg.toString() === "update_background") updateBackgroundFlag = true;
  });
  ws.on("close", () => console.log("Client disconnected"));
});

// 헬퍼: 피크 탐지
function findAndProcessPeaks(data, threshold) {
  const peaks = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] >= data[i + 1])
      peaks.push(i);
  }
  if (peaks.length === 0) return null;
  if (peaks.length === 1) return peaks[0];
  peaks.sort((a, b) => data[b] - data[a]);
  return (peaks[0] + peaks[1]) / 2;
}

function position(back, inter) {
  if (back !== null && inter !== null) return (back + inter) / 2;
  if (inter === null) return back;
  return null;
}

function discriminantProcessing(P, preP) {
  if (P !== null) {
    if (preP === null && status === 1) {
      if (P < 70) {
        person = 1;
        status = 1;
      } else if (P > 170) {
        person = 2;
        status = 4;
      }
    }
    if (person === 1) {
      if (P <= 100 && preP !== null) status = 2;
      else if (P > 100 && preP !== null) status = 3;
    }
  } else {
    if (preP !== null) {
      if (person === 1) {
        if (preP <= 70) status = 1;
        else if (preP > 150) status = 3;
      }
      if (person === 2 && preP > 170) resetTime = Date.now();
    }
    if (
      preP === null &&
      status === 4 &&
      resetTime &&
      Date.now() - resetTime > 5000
    ) {
      status = 1;
      resetTime = null;
    }
  }
}

function resultMessage() {
  let msg = "";
  if (status === 1) {
    if (preStatus === 2) msg = messages[1];
    else if (preStatus === 4) msg = messages[4];
  } else if (status === 2) {
    msg = messages[2];
    lineNotice = true;
  } else if (status === 3) {
    if (lineNotice) {
      msg = messages[0];
      lineNotice = false;
    }
  } else if (status === 4) {
    msg = messages[3];
  }
  return msg;
}

// 공통 처리 함수
function handleTelemetry(dataValues) {
  if (isProcessing) return;
  isProcessing = true;
  try {
    if (updateBackgroundFlag) {
      backValues = dataValues.slice();
      updateBackgroundFlag = false;
      preData = backValues.slice();
      lastInterTime = Date.now();
      console.log("Background updated");
      return;
    }
    if (!backValues) return;
    const diff = dataValues.map((v, i) => Math.abs(v - backValues[i]));
    const reduction = Math.min(...diff);
    const filtered = diff.map((v) => v - reduction);
    const peakValue = Math.max(...filtered);
    const peakIndex =
      peakValue > 10 && peakValue < 200 ? filtered.indexOf(peakValue) : null;

    // Telemetry 전송
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "telemetry",
            peak_index: peakIndex,
            data_values: dataValues,
            back_values: backValues,
            filtered,
          })
        );
      }
    });

    const inter = dataValues.map((v, i) => Math.abs(v - preData[i]));
    preData = dataValues.slice();
    const backP = findAndProcessPeaks(diff, 15);
    const interP = findAndProcessPeaks(inter, 10);
    let P = position(backP, interP);
    discriminantProcessing(P, preP);

    if (interP === null && preInterP !== null) {
      lastInterTime = Date.now();
      flagUpdate = true;
    } else if (interP !== null) {
      flagUpdate = false;
      if (70 < interP && interP < 170 && preInterP === null)
        backValues = backValues.slice();
    }
    if (Date.now() - lastInterTime >= 3000 && flagUpdate) {
      backValues = dataValues.slice();
      lastInterTime = Date.now();
      console.log("Background auto-updated");
    }
    preP = P;
    preInterP = interP;

    let msgStr = "";
    if (status !== preStatus) msgStr = resultMessage();
    const eventPayload = { peak_position: P, status, person, message: msgStr };
    if (
      eventPayload.peak_position !== lastEvent.peak_position ||
      eventPayload.status !== lastEvent.status ||
      eventPayload.person !== lastEvent.person ||
      eventPayload.message !== lastEvent.message
    ) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify(Object.assign({ type: "event" }, eventPayload))
          );
        }
      });
      lastEvent = eventPayload;
    }
    preStatus = status;
  } finally {
    isProcessing = false;
  }
}

// HTTP POST 엔드포인트
app.post("/telemetry", (req, res) => {
  const buf = req.body;
  if (Buffer.isBuffer(buf) && buf.length >= 1 + PIXEL) {
    const dataValues = new Array(PIXEL);
    for (let i = 0; i < PIXEL; i++) dataValues[i] = buf[i + 1];
    handleTelemetry(dataValues);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server listening on http://${getLocalIPv4()}:${PORT}`);
});
