const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const emotionText = document.getElementById("emotion-text");

async function start() {
  // Load only the models you need
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models");

  // Start webcam
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing webcam: ", err);
  }
}

video.addEventListener("play", () => {
  canvas.width = video.width;
  canvas.height = video.height;

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);

    // Show dominant emotion
    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).find(
        key => expressions[key] === maxValue
      );
      emotionText.innerText = `Emotion: ${emotion}`;
    } else {
      emotionText.innerText = "";
    }
  }, 100);
});

start();
