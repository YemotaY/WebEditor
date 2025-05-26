// background.js
// Hintergrundbild und Skalierung

export let backgroundImage = {
  url: '',
  scale: 100
};

export function updateBackground() {
  const editor = document.getElementById('editor');
  const backimg = document.getElementById('backimg');
  if (!backimg) return;
  backimg.style.backgroundImage = backgroundImage.url ? `url("${backgroundImage.url}")` : 'none';
  backimg.style.backgroundSize = `${backgroundImage.scale}%`;
}

export function setupBackgroundListeners() {
  // Event-Listener für bgScale aus main.html
  const bgScaleSlider = document.getElementById('bgScale');
  const bgScaleValue = document.getElementById('bgScaleValue');
  if (bgScaleSlider && bgScaleValue) {
    bgScaleSlider.addEventListener('input', function() {
      bgScaleValue.textContent = `${this.value}%`;
    });
  }
}
