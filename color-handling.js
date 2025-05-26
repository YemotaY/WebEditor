// color-handling.js
// Farb- und Transparenz-Logik
import { selectedElement } from './editor-elements.js';

export function applyFillToSvgElement(element, color) {
  const svgElements = element.domElement.querySelectorAll('svg *');
  svgElements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if ([ 'path', 'rect', 'circle', 'ellipse', 'polygon', 'text' ].includes(tag)) {
      el.setAttribute('fill', color);
    } else if (tag === 'g' && !el.querySelector('[fill]')) {
      el.setAttribute('fill', color);
    }
  });
}

export function setupColorListeners() {
  // Event-Listener für prop-fill (Formfarbe)
  const fillInput = document.getElementById('prop-fill');
  if (fillInput) {
    fillInput.addEventListener('input', function() {
      if (window.selectedElement && window.selectedElement.domElement) {
        applyFillToSvgElement(window.selectedElement, this.value);
      }
    });
  }
  // Event-Listener für prop-textcolor (Textfarbe)
  const textColorInput = document.getElementById('prop-textcolor');
  if (textColorInput) {
    textColorInput.addEventListener('input', function() {
      if (window.selectedElement && window.selectedElement.domElement) {
        // Alle <text> Elemente im SVG einfärben
        const texts = window.selectedElement.domElement.querySelectorAll('svg text');
        texts.forEach(t => t.setAttribute('fill', this.value));
      }
    });
  }
  // Event-Listener für prop-text (Textinhalt SVG-Text)
  let textInput = document.getElementById('prop-svgtext');
  if (!textInput) {
    // Falls das Feld noch nicht existiert, dynamisch einfügen
    const panel = document.getElementById('property-panel');
    if (panel) {
      const row = document.createElement('div');
      row.className = 'property-row';
      row.style.marginBottom = '6px';
      const label = document.createElement('label');
      label.textContent = 'Text:';
      label.style.fontSize = '12px';
      textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.id = 'prop-svgtext';
      textInput.style.fontSize = '12px';
      row.appendChild(label);
      row.appendChild(textInput);
      panel.insertBefore(row, panel.querySelector('.property-row:last-of-type'));
    }
  }
  if (textInput) {
    textInput.addEventListener('input', function() {
      if (window.selectedElement && window.selectedElement.domElement) {
        // Alle <text> Elemente im SVG anpassen
        const texts = window.selectedElement.domElement.querySelectorAll('svg text');
        texts.forEach(t => t.textContent = this.value);
      }
    });
  }
}
