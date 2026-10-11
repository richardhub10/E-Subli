const fileInput = document.getElementById('fileInput');
const uploadScanBtn = document.getElementById('uploadScanBtn');
const startCameraBtn = document.getElementById('startCameraBtn');
const flipCameraBtn = document.getElementById('flipCameraBtn');
const captureScanBtn = document.getElementById('captureScanBtn');
const video = document.getElementById('camera');
const canvas = document.getElementById('captureCanvas');

const predictionText = document.getElementById('predictionText');
const confidenceText = document.getElementById('confidenceText');
const reasonText = document.getElementById('reasonText');
const topkText = document.getElementById('topkText');
const previewCol = document.getElementById('previewCol');
const extractedPreview = document.getElementById('extractedPreview');

let cameraStream = null;
let currentFacingMode = 'environment'; // Default: back camera!

function setLoading(isLoading) {
  uploadScanBtn.disabled = isLoading;
  captureScanBtn.disabled = isLoading;
  uploadScanBtn.textContent = isLoading ? 'Scanning...' : 'Scan Uploaded Image';
  captureScanBtn.textContent = isLoading ? 'Scanning...' : 'Capture & Scan';
}

function renderResult(result) {
  predictionText.textContent = (result.prediction || '-').toLowerCase();
  const confPct = ((result.confidence ?? 0) * 100).toFixed(1);
  confidenceText.textContent = `${confPct}%`;
  reasonText.textContent = result.reason || '';

  const topk = (result.top_k || []).map((item, i) => `${i + 1}. ${item.label.toLowerCase()} (${(item.confidence * 100).toFixed(1)}%)`);
  topkText.textContent = topk.length ? `Candidates:\n${topk.join('\n')}` : '';

  if (result.extracted_image_url) {
    extractedPreview.src = result.extracted_image_url;
    previewCol.style.display = 'flex';
  }
}

async function scanWithFormData(formData) {
  setLoading(true);
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Scan failed');
    }
    renderResult(data);
  } catch (error) {
    reasonText.textContent = error.message;
  } finally {
    setLoading(false);
  }
}

async function scanWithDataUrl(dataUrl) {
  setLoading(true);
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data_url: dataUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Scan failed');
    }
    renderResult(data);
  } catch (error) {
    reasonText.textContent = error.message;
  } finally {
    setLoading(false);
  }
}

uploadScanBtn.addEventListener('click', async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    reasonText.textContent = 'Choose an image file first.';
    return;
  }
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  await scanWithFormData(formData);
});

async function startCamera(facingMode) {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }
  try {
    const constraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false
    };
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = cameraStream;
    startCameraBtn.textContent = 'Camera Active';
    startCameraBtn.disabled = true;
    flipCameraBtn.style.display = 'inline-flex';
    captureScanBtn.disabled = false;
    reasonText.textContent = '';
  } catch (error) {
    reasonText.textContent = 'Camera access failed: ' + error.message;
  }
}

startCameraBtn.addEventListener('click', () => {
  startCamera(currentFacingMode);
});

flipCameraBtn.addEventListener('click', () => {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  startCamera(currentFacingMode);
});

captureScanBtn.addEventListener('click', async () => {
  if (!video.srcObject) {
    reasonText.textContent = 'Start camera first.';
    return;
  }
  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;

  // Calculate center square crop matching the viewfinder box
  const cropSize = Math.min(vw, vh) * 0.65;
  const startX = (vw - cropSize) / 2;
  const startY = (vh - cropSize) / 2;

  canvas.width = cropSize;
  canvas.height = cropSize;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);

  const dataUrl = canvas.toDataURL('image/png');
  await scanWithDataUrl(dataUrl);
});
