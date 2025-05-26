// file-handling.js
// Laden/Speichern, Dialoge, Server-Kommunikation
import { getLayoutData, editorElements, createSvgElement, createImageElement } from './editor-elements.js';
import { updateElementsList } from './property-panel.js';

window.createSvgElement = createSvgElement;
window.createImageElement = createImageElement;

export async function showSaveDialog() {
  // Speichert das aktuelle Layout als JSON-Datei (Download)
  const data = getLayoutData();
  // Hintergrundbild als DataURL mit exportieren
  const backimg = document.getElementById('backimg');
  if (backimg && backimg.style.backgroundImage && backimg.style.backgroundImage.startsWith('url')) {
    const match = backimg.style.backgroundImage.match(/url\(["']?(data:[^"')]+)["']?\)/);
    if (match && match[1]) {
      data.backgroundImage = match[1];
      data.backgroundOpacity = backimg.style.opacity || '1';
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'svg-layout.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function showFileSelection() {
  // Öffnet einen Datei-Dialog zum Laden einer Layout-JSON und lädt das Layout
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        // Elemente zurücksetzen
        if (window.editorElements) {
          window.editorElements.forEach(el => el.domElement && el.domElement.remove());
          window.editorElements.length = 0;
        }
        window.groups = [];
        window.groupedElements = [];
        // Elemente wiederherstellen
        if (data.elements && Array.isArray(data.elements)) {
          data.elements.forEach(obj => {
            let el;
            if (obj.type === 'svg') {
              el = window.createSvgElement(obj.content, obj.label);
            } else if (obj.type === 'image') {
              el = window.createImageElement(obj.content, obj.label);
            }
            if (el) {
              el.x = obj.x;
              el.y = obj.y;
              el.width = obj.width;
              el.height = obj.height;
              el.rotation = obj.rotation;
              el.zIndex = obj.zIndex;
              el.opacity = obj.opacity;
              el.preserveAspectRatio = obj.preserveAspectRatio;
              el.objectFit = obj.objectFit;
              el.domElement = el.createDomElement();
              document.getElementById('editor').appendChild(el.domElement);
              if (window.setupInteract) window.setupInteract(el);
            }
          });
        }
        // Hintergrundbild wiederherstellen
        if (data.backgroundImage) {
          const backimg = document.getElementById('backimg');
          backimg.style.backgroundImage = `url('${data.backgroundImage}')`;
          backimg.style.backgroundSize = 'contain';
          backimg.style.backgroundPosition = 'center';
          backimg.style.backgroundRepeat = 'no-repeat';
          backimg.style.opacity = data.backgroundOpacity || '1';
          backimg.style.zIndex = '0';
        }
        updateElementsList();
      } catch (err) {
        alert('Fehler beim Importieren der Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export async function loadFromServer(filename) {
  // Lädt ein Layout von einem Server-Endpunkt (z.B. per fetch)
  try {
    const response = await fetch(filename, {cache: 'no-store'});
    if (!response.ok) throw new Error('Fehler beim Laden der Datei');
    const data = await response.json();
    // Elemente zurücksetzen
    if (window.editorElements) {
      window.editorElements.forEach(el => el.domElement && el.domElement.remove());
      window.editorElements.length = 0;
    }
    window.groups = [];
    window.groupedElements = [];
    // Elemente wiederherstellen
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(obj => {
        let el;
        if (obj.type === 'svg') {
          el = window.createSvgElement(obj.content, obj.label);
        } else if (obj.type === 'image') {
          el = window.createImageElement(obj.content, obj.label);
        }
        if (el) {
          el.x = obj.x;
          el.y = obj.y;
          el.width = obj.width;
          el.height = obj.height;
          el.rotation = obj.rotation;
          el.zIndex = obj.zIndex;
          el.opacity = obj.opacity;
          el.preserveAspectRatio = obj.preserveAspectRatio;
          el.objectFit = obj.objectFit;
          el.domElement = el.createDomElement();
          document.getElementById('editor').appendChild(el.domElement);
          if (window.setupInteract) window.setupInteract(el);
        }
      });
    }
    // Hintergrundbild wiederherstellen
    if (data.backgroundImage) {
      const backimg = document.getElementById('backimg');
      backimg.style.backgroundImage = `url('${data.backgroundImage}')`;
      backimg.style.backgroundSize = 'contain';
      backimg.style.backgroundPosition = 'center';
      backimg.style.backgroundRepeat = 'no-repeat';
      backimg.style.opacity = data.backgroundOpacity || '1';
      backimg.style.zIndex = '0';
    }
    updateElementsList();
  } catch (err) {
    alert('Fehler beim Laden vom Server: ' + err.message);
  }
}

export async function saveToServer(filename) {
  // Speichert das aktuelle Layout auf dem Server (z.B. per fetch/POST)
  const data = getLayoutData();
  // Hintergrundbild als DataURL mit exportieren
  const backimg = document.getElementById('backimg');
  if (backimg && backimg.style.backgroundImage && backimg.style.backgroundImage.startsWith('url')) {
    const match = backimg.style.backgroundImage.match(/url\(["']?(data:[^"')]+)["']?\)/);
    if (match && match[1]) {
      data.backgroundImage = match[1];
      data.backgroundOpacity = backimg.style.opacity || '1';
    }
  }
  try {
    await fetch(filename, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data, null, 2)
    });
    alert('Layout erfolgreich auf Server gespeichert!');
  } catch (err) {
    alert('Fehler beim Speichern auf dem Server: ' + err.message);
  }
}

// Hilfsfunktion für das Setzen des Hintergrundbilds aus JSON
export function setBackgroundFromData(data) {
  const backimg = document.getElementById('backimg');
  if (backimg && data.backgroundImage) {
    backimg.style.backgroundImage = `url('${data.backgroundImage}')`;
    backimg.style.backgroundSize = 'contain';
    backimg.style.backgroundPosition = 'center';
    backimg.style.backgroundRepeat = 'no-repeat';
    backimg.style.opacity = data.backgroundOpacity || '1';
    backimg.style.zIndex = '0';
  }
}

// Beim Start svg-layout.json laden
window.addEventListener('DOMContentLoaded', () => {
  loadFromServer('svg-layout.json');
});
