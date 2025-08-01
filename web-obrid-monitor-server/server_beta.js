const WebSocket = require("ws");
const http = require("http");
let SerialPort;
try {
  SerialPort = require("serialport").SerialPort;
} catch (err) {
  console.log("serialport module not available. USB support disabled.");
}

const PIXEL = 256;
const USB_PORT = process.env.SERIAL_PORT || "/dev/tty.usbserial-0001";
const BAUD_RATE = 57600;

let port;
let usbConnected = false;

// 상태 및 플래그
let updateBackgroundFlag = false;
let isProcessing = false;

let backValues = null;
let preData = new Array(PIXEL).fill(0);
let preInterP = null;
let preP = null;
let lastInterPeakTime = Date.now();
let flagUpdate = false;

let status = 1; // 1: ベッド上, 2: 座位, 3: 離床, 4: 訪問客
let preStatus = status;
let person = null; // 1: 高齢者, 2: 他者
let resetTime = null;
let lineNotice = true;

const messages = [
  "離床しています！今すぐ確認に行ってください！",
  "ベッド上にいます",
  "端座位です",
  "ただいま来客中",
  "来客は帰られました",
];

// 마지막으로 전송된 이벤트 데이터
let lastEvent = {
  peak_position: null,
  status: null,
  person: null,
  message: "",
};

// SerialPort 열기
if (SerialPort) {
  port = new SerialPort({
    path: USB_PORT,
    baudRate: BAUD_RATE,
    autoOpen: false,
  });
  port.setMaxListeners(0);
  port.open((err) => {
    if (err) {
      console.warn("⚠️ Failed to open serial port.", err.message);
    } else {
      usbConnected = true;
      console.log(`🔌 Serial port ${USB_PORT} opened.`);
    }
  });
  port.on("error", (err) => {
    console.warn("⚠️ Serial port error:", err.message);
    usbConnected = false;
  });
}

// 프레임 읽기
let buffer = Buffer.alloc(0);
function readFrame() {
  return new Promise((resolve) => {
    if (!usbConnected) return resolve(null);
    const onData = (data) => {
      buffer = Buffer.concat([buffer, data]);
      const idx = buffer.indexOf(0);
      if (idx !== -1 && buffer.length >= idx + 1 + PIXEL) {
        const frame = buffer.slice(idx + 1, idx + 1 + PIXEL);
        buffer = buffer.slice(idx + 1 + PIXEL);
        port.off("data", onData);
        resolve(Array.from(frame));
      }
    };
    port.on("data", onData);
  });
}

// 피크 검출
function findAndProcessPeaks(data, threshold) {
  const peaks = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (
      data[i] > threshold &&
      data[i] > data[i - 1] &&
      data[i] >= data[i + 1]
    ) {
      peaks.push(i);
    }
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

// 사람·상태 판별
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
      if (person === 2 && preP > 170) {
        resetTime = Date.now();
      }
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

// 결과 메시지
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

// WebSocket 서버
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    if (msg.toString() === "update_background") {
      updateBackgroundFlag = true;
    }
  });

  const sendData = async () => {
    if (isProcessing || !usbConnected) return;
    isProcessing = true;
    try {
      // **배경 업데이트: 오직 명시적 요청시에만**
      if (updateBackgroundFlag) {
        backValues = await readFrame();
        updateBackgroundFlag = false;
        preData = backValues.slice();
        lastInterPeakTime = Date.now();
        console.log("Background updated");
        isProcessing = false;
        return;
      }
      // **백그라운드가 없으면 처리 중단**
      if (!backValues) {
        isProcessing = false;
        return;
      }

      // 프레임 읽기
      const dataValues = await readFrame();
      if (!dataValues) {
        isProcessing = false;
        return;
      }

      // ── 기존 telemetry 로직 ────────────────────
      const diff = dataValues.map((v, i) => Math.abs(v - backValues[i]));
      const reduction = Math.min(...diff);
      const filtered = diff.map((v) => v - reduction);
      const peakValue = Math.max(...filtered);
      const peakIndex =
        peakValue > 10 && peakValue < 200 ? filtered.indexOf(peakValue) : null;

      ws.send(
        JSON.stringify({
          type: "telemetry",
          peak_index: peakIndex,
          data_values: dataValues,
          back_values: backValues,
          filtered,
        })
      );

      // ── 5–7번 처리 로직 ─────────────────────────
      const inter = dataValues.map((v, i) => Math.abs(v - preData[i]));
      preData = dataValues.slice();

      const backP = findAndProcessPeaks(diff, 15);
      const interP = findAndProcessPeaks(inter, 10);
      let P = position(backP, interP);

      discriminantProcessing(P, preP);

      // 자동 배경 갱신 관리
      if (interP === null && preInterP !== null) {
        lastInterPeakTime = Date.now();
        flagUpdate = true;
      } else if (interP !== null) {
        flagUpdate = false;
        if (70 < interP && interP < 170 && preInterP === null) {
          backValues = backValues.slice();
        }
      }
      if (Date.now() - lastInterPeakTime >= 3000 && flagUpdate) {
        backValues = dataValues.slice();
        lastInterPeakTime = Date.now();
        console.log("Background auto-updated");
      }

      preP = P;
      preInterP = interP;

      // 이벤트용 메시지 생성
      let message = "";
      if (status !== preStatus) {
        message = resultMessage();
      }

      // 변경된 경우에만 event 전송
      const eventPayload = {
        peak_position: P,
        status,
        person,
        message,
      };
      if (
        eventPayload.peak_position !== lastEvent.peak_position ||
        eventPayload.status !== lastEvent.status ||
        eventPayload.person !== lastEvent.person ||
        eventPayload.message !== lastEvent.message
      ) {
        ws.send(JSON.stringify(Object.assign({ type: "event" }, eventPayload)));
        lastEvent = eventPayload;
      }

      preStatus = status;
    } finally {
      isProcessing = false;
    }
  };

  const interval = setInterval(sendData, 40);
  ws.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

const PORT = 8765;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
