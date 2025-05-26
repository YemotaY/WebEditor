// editor-elements.js
// Enthält EditorElement-Klasse und Funktionen zum Erstellen/Klonen/Löschen von Elementen

export class EditorElement {
  constructor(id, content, label = "", type = 'svg') {
    this.id = id;
    this.content = content;
    this.label = label;
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.width = 150;
    this.height = 150;
    this.rotation = 0;
    this.zIndex = 1;
    this.opacity = 1;
    this.preserveAspectRatio = "xMidYMid meet";
    this.objectFit = 'contain';
    this.domElement = null;
    this.interactiveFunctions = {};
  }
  createDomElement() {
    const div = document.createElement('div');
    div.className = 'svg-container';
    div.innerHTML = this.content + '<div class="resize-handle"></div><div class="rotate-handle"></div>';
    div.style.position = 'absolute';
    div.style.left = this.x + 'px';
    div.style.top = this.y + 'px';
    div.style.width = this.width + 'px';
    div.style.height = this.height + 'px';
    div.style.zIndex = this.zIndex;
    div.style.opacity = this.opacity;
    // SVG skalieren
    const svg = div.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';
    }
    // Image skalieren
    const img = div.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = this.objectFit || 'contain';
      img.style.display = 'block';
    }
    this.domElement = div;
    return div;
  }
  updateTransform() {
    if (!this.domElement) return;
    this.domElement.style.left = this.x + 'px';
    this.domElement.style.top = this.y + 'px';
    this.domElement.style.transform = `rotate(${this.rotation}deg)`;
    // SVG skalieren
    const svg = this.domElement.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = '100%';
      svg.style.height = '100%';
    }
    // Image skalieren
    const img = this.domElement.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
    }
  }
  updateScale() {
    if (!this.domElement) return;
    this.domElement.style.width = this.width + 'px';
    this.domElement.style.height = this.height + 'px';
    // SVG skalieren
    const svg = this.domElement.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = '100%';
      svg.style.height = '100%';
    }
    // Image skalieren
    const img = this.domElement.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
    }
  }
}

export let editorElements = [];
export let currentId = 0;
export let selectedElement = null;

export function createSvgElement(content, label = "", template = null) {
  const id = `svg-${currentId++}`;
  const element = new EditorElement(id, content, label, 'svg');
  editorElements.push(element);
  // domElement und Interact-Setup werden im main.js erledigt
  return element;
}

export function cloneSvgElement(content, label = "", template = null) {
  const id = `svg-${currentId++}`;
  const element = new EditorElement(id, content, label, 'svg');
  editorElements.push(element);
  return element;
}

export function createImageElement(src, label = "") {
  const id = `img-${currentId++}`;
  const element = new EditorElement(id, src, label, 'image');
  element.width = 200;
  element.height = 200;
  editorElements.push(element);
  return element;
}

export function cloneImageElement(src, label = "") {
  const id = `img-${currentId++}`;
  const element = new EditorElement(id, src, label, 'image');
  element.width = 200;
  element.height = 200;
  editorElements.push(element);
  return element;
}

export function getLayoutData() {
  return {
    elements: editorElements.map(el => {
      // Für SVG-Elemente: Füllfarbe extrahieren
      let fillColor = '#cc0000';
      if (el.type === 'svg') {
        const svg = el.domElement?.querySelector('svg');
        if (svg) {
          const shape = svg.querySelector('path, rect, circle, ellipse, polygon, g');
          if (shape) fillColor = shape.getAttribute('fill') || fillColor;
        }
      }
      return {
        id: el.id,
        content: el.content,
        label: el.label,
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        zIndex: el.zIndex,
        opacity: el.opacity,
        preserveAspectRatio: el.preserveAspectRatio,
        objectFit: el.objectFit,
        fill: fillColor
      };
    })
  };
}
