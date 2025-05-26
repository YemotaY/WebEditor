// element-interaction.js
// Drag/Drop, Resizing, Auswahl, Keyboard
import { editorElements, selectedElement } from './editor-elements.js';
import { updatePropertyPanel } from './property-panel.js';

export function setupInteract(element) {
  const domElement = element.domElement;
  if (!domElement) return;

  domElement.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle')) {
      selectElement(element);
    }
  });

  if (window.interact) {
    window.interact(domElement).draggable({
      ignoreFrom: '.rotate-handle, .resize-handle',
      startDistance: 5,
      listeners: {
        move(event) {
          element.x += event.dx;
          element.y += event.dy;
          if (element.updateTransform) element.updateTransform();
          updatePropertyPanel(element);
        },
        end() {
          domElement.classList.remove('active');
        }
      }
    });

    const rotateHandle = domElement.querySelector('.rotate-handle');
    if (rotateHandle) {
      window.interact(rotateHandle).draggable({
        listeners: {
          start() {
            domElement.classList.add('active');
          },
          move(event) {
            const rect = domElement.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = event.client.x - cx;
            const dy = event.client.y - cy;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            element.rotation = Math.round(angle);
            if (element.updateTransform) element.updateTransform();
            updatePropertyPanel(element);
          },
          end() {
            domElement.classList.remove('active');
          }
        }
      });
    }

    window.interact(domElement).resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          element.width = Math.max(1, event.rect.width);
          element.height = Math.max(1, event.rect.height);
          domElement.style.width = `${element.width}px`;
          domElement.style.height = `${element.height}px`;
          if (element.updateTransform) element.updateTransform();
          updatePropertyPanel(element);
        },
        end() {
          domElement.classList.remove('active');
        }
      }
    });
  }
}

export function selectElement(element) {
  if (window.selectedElement && window.selectedElement.domElement) {
    window.selectedElement.domElement.classList.remove('active');
  }
  window.selectedElement = element;
  if (element && element.domElement) {
    element.domElement.classList.add('active');
    element.domElement.style.zIndex = 1000;
    setTimeout(() => {
      element.domElement.style.zIndex = element.zIndex;
    }, 200);
    if (typeof window.updatePropertyPanel === 'function') window.updatePropertyPanel(element);
    if (typeof window.updateElementsList === 'function') window.updateElementsList();
  }
}

export function deleteSelectedElement() {
  if (selectedElement && confirm('Element wirklich löschen?')) {
    const index = editorElements.findIndex(el => el.id === selectedElement.id);
    if (index !== -1) {
      editorElements.splice(index, 1);
      selectedElement.domElement.remove();
      window.selectedElement = null;
      // updateElementsList();
      // updatePropertyPanel(null);
    }
  }
}
