const video = document.getElementById('video');

async function start() {
    // Load models from local "models" folder
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');

    // Start webcam
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Camera access error:", err));
}

video.addEventListener('play', () => {
    const canvas = document.getElementById('overlay');
    canvas.width = video.width = 500;   // adjust width
    canvas.height = video.height = 375; // adjust height

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 200);
});

start();
