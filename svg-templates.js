// svg-templates.js
// SVG-Vorlagen und SVG-Auswahldialog
import { createSvgElement, currentId } from './editor-elements.js';

export const svgTemplates = [
  {
    label: "Pfeil",
    svg: `<svg width="150" height="150" viewBox="0 0 100 100">
        <path d="M10,50 L80,50 M60,30 L80,50 L60,70" stroke="#333" stroke-width="5" fill="none"/>
      </svg>`
  },
  {
    label: "Kreis",
    svg: `<svg width="150" height="150" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#0066cc"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">Kreis</text>
      </svg>`
  },
  {
    label: "Rechteck",
    svg: `<svg width="150" height="150" viewBox="0 0 100 100">
        <rect width="90" height="90" x="5" y="5" fill="#ff0066" rx="1"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">Rechteck</text>
      </svg>`
  }
  // ...weitere Vorlagen nach Bedarf...
];

export function showSvgSelectionDialog() {
  const dialog = document.getElementById('svg-selection-dialog');
  const overlay = document.getElementById('svg-selection-overlay');
  const container = document.getElementById('svg-templates');
  container.innerHTML = '';
  svgTemplates.forEach(template => {
    const templateElement = document.createElement('div');
    templateElement.className = 'svg-template';
    templateElement.innerHTML = `
      ${template.svg}
      <div class="label">${template.label}</div>
    `;
    templateElement.addEventListener('click', () => {
      const el = createSvgElement(template.svg, `${template.label} ${currentId + 1}`);
      el.domElement = el.createDomElement();
      document.getElementById('editor').appendChild(el.domElement);
      window.setupInteract(el);
      window.selectElement(el);
      window.updateElementsList();
      closeSvgSelection();
    });
    container.appendChild(templateElement);
  });
  dialog.style.display = 'block';
  overlay.style.display = 'block';
}

export function closeSvgSelection() {
  document.getElementById('svg-selection-dialog').style.display = 'none';
  document.getElementById('svg-selection-overlay').style.display = 'none';
}
