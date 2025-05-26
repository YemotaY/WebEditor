// property-panel.js
// Property-Panel-Logik, Event-Listener für Eigenschaften
import { selectedElement, editorElements } from './editor-elements.js';

export function updatePropertyPanel(element) {
  if (!element) return;
  const idInput = document.getElementById('prop-id');
  const idError = document.getElementById('id-error');
  idInput.value = element.id;
  document.getElementById('prop-label').value = element.label;
  document.getElementById('prop-x').value = Math.round(element.x);
  document.getElementById('prop-y').value = Math.round(element.y);
  document.getElementById('prop-width').value = Math.round(element.width);
  document.getElementById('prop-height').value = Math.round(element.height);
  document.getElementById('prop-rotation').value = Math.round(element.rotation);
  document.getElementById('prop-zindex').value = element.zIndex;
  document.getElementById('prop-aspect-ratio').value = element.preserveAspectRatio;
  document.getElementById('prop-opacity').value = Math.round(element.opacity * 100);
  document.getElementById('opacity-value').textContent = `${Math.round(element.opacity * 100)}%`;
  idInput.classList.remove('error');
  idError.style.display = 'none';
  // ...Farben und weitere Eigenschaften wie in main.html...
}

export function updateElementsList() {
  const elementsList = document.getElementById('elements-list');
  if (!elementsList) return;
  elementsList.innerHTML = '';
  // Zeige alle Gruppen
  if (window.groups && window.groups.length > 0) {
    window.groups.forEach((group, idx) => {
      if (!group || group.length < 2) return;
      const groupDiv = document.createElement('div');
      groupDiv.className = 'element-item group-root' + (group === window.groupedElements ? ' active' : '');
      groupDiv.innerHTML = `<span style="font-weight:bold;color:#0066cc;">🗂 Gruppe ${idx+1}</span> <span style="color:#666;font-size:12px;">(${group.length} Elemente)</span>`;
      groupDiv.style.background = group === window.groupedElements ? '#e0e0ff' : '#f6f6ff';
      groupDiv.style.cursor = 'pointer';
      groupDiv.style.display = 'flex';
      groupDiv.style.alignItems = 'center';
      groupDiv.style.gap = '8px';
      groupDiv.style.marginBottom = '2px';
      groupDiv.addEventListener('click', () => {
        window.groupedElements = group;
        group.forEach(el => el.domElement.classList.add('active'));
        window.selectedElement = null;
        updatePropertyPanel(null);
        updateElementsList();
      });
      elementsList.appendChild(groupDiv);
      // Unterelemente
      group.forEach(element => {
        const item = document.createElement('div');
        item.className = 'element-item active';
        item.innerHTML = '<span style="color:#0066cc;font-size:15px;">↳</span> ' + element.label;
        item.style.paddingLeft = '22px';
        item.style.background = '#f6f6ff';
        item.style.borderLeft = '3px solid #b3c6ff';
        item.style.marginBottom = '1px';
        item.dataset.id = element.id;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          window.selectElement(element);
          updatePropertyPanel(element);
          updateElementsList();
        });
        elementsList.appendChild(item);
      });
      // Trenne Gruppen optisch
      const sep = document.createElement('div');
      sep.style.height = '10px';
      sep.style.background = 'transparent';
      elementsList.appendChild(sep);
    });
    // Zeige restliche Elemente
    const groupedIds = window.groups.flat().map(e => e.id);
    editorElements.filter(el => !groupedIds.includes(el.id)).sort((a, b) => a.zIndex - b.zIndex).forEach((element) => {
      const item = document.createElement('div');
      item.className = 'element-item' + (window.selectedElement === element ? ' active' : '');
      item.textContent = element.label;
      item.dataset.id = element.id;
      item.addEventListener('click', () => {
        window.selectElement(element);
        updatePropertyPanel(element);
        updateElementsList();
      });
      elementsList.appendChild(item);
    });
  } else {
    editorElements.sort((a, b) => a.zIndex - b.zIndex).forEach((element) => {
      const item = document.createElement('div');
      item.className = 'element-item' + (window.selectedElement === element ? ' active' : '');
      item.textContent = element.label;
      item.dataset.id = element.id;
      item.addEventListener('click', () => {
        window.selectElement(element);
        updatePropertyPanel(element);
        updateElementsList();
      });
      elementsList.appendChild(item);
    });
  }
  // Markiere alle gruppierten DOM-Elemente als aktiv
  if (window.groupedElements && window.groupedElements.length > 1) {
    window.groupedElements.forEach(el => el.domElement.classList.add('active'));
  }
}

export function setupPropertyPanelListeners() {
  // Event-Listener für Property-Panel Inputs wie prop-label, prop-x, prop-y, etc. aus main.html
  const getEl = id => document.getElementById(id);

  // X
  getEl('prop-x').addEventListener('input', function() {
    if (window.selectedElement && window.selectedElement.domElement) {
      window.selectedElement.x = parseFloat(this.value) || 0;
      if (window.selectedElement.updateTransform) window.selectedElement.updateTransform();
    }
  });
  // Y
  getEl('prop-y').addEventListener('input', function() {
    if (window.selectedElement && window.selectedElement.domElement) {
      window.selectedElement.y = parseFloat(this.value) || 0;
      if (window.selectedElement.updateTransform) window.selectedElement.updateTransform();
    }
  });
  // Breite
  getEl('prop-width').addEventListener('input', function() {
    if (window.selectedElement && window.selectedElement.domElement) {
      window.selectedElement.width = Math.max(1, parseFloat(this.value) || 1);
      if (window.selectedElement.updateScale) window.selectedElement.updateScale();
      if (window.selectedElement.updateTransform) window.selectedElement.updateTransform();
    }
  });
  // Höhe
  getEl('prop-height').addEventListener('input', function() {
    if (window.selectedElement && window.selectedElement.domElement) {
      window.selectedElement.height = Math.max(1, parseFloat(this.value) || 1);
      if (window.selectedElement.updateScale) window.selectedElement.updateScale();
      if (window.selectedElement.updateTransform) window.selectedElement.updateTransform();
    }
  });
  // Rotation
  getEl('prop-rotation').addEventListener('input', function() {
    if (window.selectedElement && window.selectedElement.domElement) {
      window.selectedElement.rotation = parseFloat(this.value) || 0;
      if (window.selectedElement.updateTransform) window.selectedElement.updateTransform();
    }
  });
  // Transparenz-Slider (Element)
  const opacitySlider = getEl('prop-opacity');
  const opacityValue = getEl('opacity-value');
  if (opacitySlider && opacityValue) {
    opacitySlider.addEventListener('input', function() {
      opacityValue.textContent = `${this.value}%`;
      if (window.selectedElement && window.selectedElement.domElement) {
        window.selectedElement.opacity = this.value / 100;
        window.selectedElement.domElement.style.opacity = window.selectedElement.opacity;
      }
    });
  }
  // ...weitere Property-Panel-Listener wie benötigt...
}
