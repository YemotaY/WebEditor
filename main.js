// main.js
// Einstiegspunkt, verbindet alle Module
import { createSvgElement, cloneSvgElement, createImageElement, cloneImageElement, editorElements, currentId, selectedElement, getLayoutData } from './editor-elements.js';
import { setupInteract, selectElement, deleteSelectedElement } from './element-interaction.js';
import { updatePropertyPanel, updateElementsList, setupPropertyPanelListeners } from './property-panel.js';
import { svgTemplates, showSvgSelectionDialog, closeSvgSelection } from './svg-templates.js';
import { showSaveDialog, showFileSelection, loadFromServer, saveToServer } from './file-handling.js';
import { applyFillToSvgElement, setupColorListeners } from './color-handling.js';
import { backgroundImage, updateBackground, setupBackgroundListeners } from './background.js';
import { setupGridListeners } from './grid.js';
import { variables, addVariableLink, variableLinks, updateVariable } from './variable-event-handler.js';

// Initialisiere Event-Listener und App-Setup wie in main.html
// Initialisierung der App
window.addEventListener('DOMContentLoaded', () => {

  // Variablen-Liste im UI anzeigen
  const variablesUl = document.getElementById('variables-ul');
  const varSelect = document.getElementById('var-link-name');
  function renderVariablesList() {
    if (!variablesUl) return;
    variablesUl.innerHTML = '';
    variables.forEach(v => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${v.name}</b> (${v.type}): <span id="var-val-${v.name}">${v.value}</span>`;
      // Zeige zugehörige Verknüpfungen
      const links = variableLinks.filter(l => l.variable === v.name);
      if (links.length > 0) {
        const ul = document.createElement('ul');
        ul.style.margin = '4px 0 4px 0';
        links.forEach(link => {
          const sub = document.createElement('li');
          sub.style.fontSize = '12px';
          sub.style.color = '#555';
          sub.textContent = `Wenn Wert = ${link.value} → ${link.event} (${link.target}${link.param ? ', ' + link.param : ''})`;
          ul.appendChild(sub);
        });
        li.appendChild(ul);
      }
      variablesUl.appendChild(li);
    });
  }
  if (variablesUl && varSelect) {
    renderVariablesList();
    varSelect.innerHTML = '';
    variables.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.name;
      varSelect.appendChild(opt);
    });
  }

  updateElementsList();
  updatePropertyPanel(editorElements[0]);

  // Hintergrund-Bild als echtes Hintergrund-Element einfügen
  let backgroundImgDiv = document.createElement('div');
  backgroundImgDiv.id = 'backimg';
  backgroundImgDiv.style.position = 'absolute';
  backgroundImgDiv.style.top = '0';
  backgroundImgDiv.style.left = '0';
  backgroundImgDiv.style.width = '100%';
  backgroundImgDiv.style.height = '100%';
  backgroundImgDiv.style.zIndex = '0';
  backgroundImgDiv.style.pointerEvents = 'none';
  backgroundImgDiv.style.backgroundRepeat = 'no-repeat';
  backgroundImgDiv.style.backgroundPosition = 'center';
  backgroundImgDiv.style.backgroundSize = 'contain';
  backgroundImgDiv.style.opacity = '1';
  document.getElementById('editor').prepend(backgroundImgDiv);

  // Bild-Upload als Hintergrund
  document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      backgroundImgDiv.style.backgroundImage = `url('${evt.target.result}')`;
      backgroundImgDiv.style.backgroundSize = 'contain';
      backgroundImgDiv.style.backgroundPosition = 'center';
      backgroundImgDiv.style.backgroundRepeat = 'no-repeat';
      backgroundImgDiv.style.opacity = '1';
      backgroundImgDiv.style.zIndex = '0';
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  // Hintergrund-Slider steuert Deckkraft des Hintergrundbildes
  const bgScaleSlider = document.getElementById('bgScale');
  if (bgScaleSlider) {
    bgScaleSlider.addEventListener('input', function() {
      // Wert von 10-200, aber für Deckkraft 0.1-2.0, wir wollen aber 0.1-1.0 (max 100%)
      // Wir nehmen 0-100% für opacity
      let opacity = Math.max(0.01, Math.min(1, this.value / 100));
      backgroundImgDiv.style.opacity = opacity;
    });
    // Initial setzen
    let opacity = Math.max(0.01, Math.min(1, bgScaleSlider.value / 100));
    backgroundImgDiv.style.opacity = opacity;
  }

  // Event-Listener für Buttons
  document.getElementById('addSvg').addEventListener('click', showSvgSelectionDialog);
  document.getElementById('addImage').addEventListener('click', () => document.getElementById('imageInput').click());
  document.getElementById('importSvg').addEventListener('click', () => document.getElementById('fileInput').click());

  // Klonen
  document.getElementById('cloneBtn').addEventListener('click', () => {
    // Multi-Clone: Wenn Gruppe aktiv
    if (window.groupedElements && window.groupedElements.length > 1) {
      const newClones = window.groupedElements.map(orig => {
        let clone;
        if (orig.type === 'svg') {
          clone = cloneSvgElement(orig.content, `${orig.label} (Kopie)`);
        } else {
          clone = cloneImageElement(orig.content, `${orig.label} (Kopie)`);
        }
        clone.x = orig.x + 20;
        clone.y = orig.y + 20;
        clone.width = orig.width;
        clone.height = orig.height;
        clone.rotation = orig.rotation;
        clone.zIndex = orig.zIndex + 1;
        clone.preserveAspectRatio = orig.preserveAspectRatio;
        clone.opacity = orig.opacity;
        clone.domElement = clone.createDomElement();
        document.getElementById('editor').appendChild(clone.domElement);
        setupInteract(clone);
        return clone;
      });
      // Neue Gruppe selektieren
      window.groupedElements.forEach(el => el.domElement.classList.remove('active'));
      window.groupedElements = newClones;
      setTimeout(() => {
        window.groupedElements.forEach(el => el.domElement.classList.add('active'));
      }, 0);
      window.selectedElement = null;
      updatePropertyPanel(null);
      updateElementsList();
      return;
    }
    // Einzelnes Element klonen
    if (!window.selectedElement) return;
    let clone;
    if (window.selectedElement.type === 'svg') {
      clone = cloneSvgElement(window.selectedElement.content, `${window.selectedElement.label} (Kopie)`);
    } else {
      clone = cloneImageElement(window.selectedElement.content, `${window.selectedElement.label} (Kopie)`);
    }
    clone.x = window.selectedElement.x + 20;
    clone.y = window.selectedElement.y + 20;
    clone.width = window.selectedElement.width;
    clone.height = window.selectedElement.height;
    clone.rotation = window.selectedElement.rotation;
    clone.zIndex = window.selectedElement.zIndex + 1;
    clone.preserveAspectRatio = window.selectedElement.preserveAspectRatio;
    clone.opacity = window.selectedElement.opacity;
    clone.domElement = clone.createDomElement();
    document.getElementById('editor').appendChild(clone.domElement);
    setupInteract(clone);
    selectElement(clone);
    updateElementsList();
  });

  // Löschen
  document.getElementById('deleteBtn').addEventListener('click', () => {
    // Multi-Delete: Wenn Gruppe aktiv
    if (window.groupedElements && window.groupedElements.length > 1) {
      if (confirm('Alle Elemente der Gruppe wirklich löschen?')) {
        window.groupedElements.forEach(el => {
          const index = editorElements.findIndex(e => e.id === el.id);
          if (index !== -1) {
            editorElements.splice(index, 1);
            el.domElement.remove();
          }
        });
        // Entferne die Gruppe aus window.groups
        if (window.groups) {
          window.groups = window.groups.filter(g => g !== window.groupedElements);
        }
        window.groupedElements = [];
        window.selectedElement = null;
        updateElementsList();
        updatePropertyPanel(null);
      }
      return;
    }
    // Einzelnes Element löschen
    if (!window.selectedElement) return;
    if (confirm('Element wirklich löschen?')) {
      const index = editorElements.findIndex(el => el.id === window.selectedElement.id);
      if (index !== -1) {
        editorElements.splice(index, 1);
        window.selectedElement.domElement.remove();
        // Entferne das Element aus allen Gruppen
        if (window.groups) {
          window.groups = window.groups.map(g => g.filter(e => e.id !== window.selectedElement.id)).filter(g => g.length > 1);
        }
        window.selectedElement = null;
        updateElementsList();
        updatePropertyPanel(null);
      }
    }
  });

  // Speichern (lokal)
  document.getElementById('saveBtn').addEventListener('click', () => {
    const data = getLayoutData();
    // Hintergrundbild als DataURL mit exportieren
    const backimg = document.getElementById('backimg');
    if (backimg && backimg.style.backgroundImage && backimg.style.backgroundImage.startsWith('url')) {
      // Extrahiere DataURL
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
  });

  // Von Server laden
  document.getElementById('loadFromServer').addEventListener('click', showFileSelection);

  // Auf Server speichern
  document.getElementById('saveToServer').addEventListener('click', showSaveDialog);

  // Property-Panel-Listener
  setupPropertyPanelListeners();
  setupColorListeners();
  setupBackgroundListeners();
  setupGridListeners();

  // SVG-Auswahl-Dialog
  document.getElementById('cancel-svg-selection').addEventListener('click', closeSvgSelection);
  document.getElementById('svg-selection-overlay').addEventListener('click', closeSvgSelection);

  // Grid-Checkbox
  document.getElementById('showGrid').addEventListener('change', (e) => {
    document.getElementById('editor').style.backgroundImage = e.target.checked
      ? `linear-gradient(var(--grid-color) 1px, transparent 1px),linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`
      : 'none';
  });

  // Drag & Drop, Resize, Rotate, Keyboard
  document.getElementById('editor').addEventListener('mousedown', (e) => {
    if (e.target === document.getElementById('editor') && selectedElement) {
      selectedElement.domElement.classList.remove('active');
      window.selectedElement = null;
      updatePropertyPanel(null);
    }
    // Multi-Drag: Wenn Gruppe aktiv und auf ein Element der Gruppe geklickt wird
    if (window.groupedElements && window.groupedElements.length > 1) {
      // Prüfe, ob auf ein DOM-Element der Gruppe geklickt wurde
      const clicked = window.groupedElements.find(el => el.domElement === e.target || el.domElement.contains(e.target));
      if (clicked) {
        let dragStart = { x: e.clientX, y: e.clientY };
        const startPositions = window.groupedElements.map(el => ({ x: el.x, y: el.y }));
        function onMove(ev) {
          const dx = ev.clientX - dragStart.x;
          const dy = ev.clientY - dragStart.y;
          window.groupedElements.forEach((el, i) => {
            el.x = startPositions[i].x + dx;
            el.y = startPositions[i].y + dy;
            if (el.updateTransform) el.updateTransform();
          });
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        e.preventDefault();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!selectedElement) return;
    const GRID_SIZE = 20;
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'ArrowUp': selectedElement.rotation += 5; break;
        case 'ArrowDown': selectedElement.rotation -= 5; break;
        default: return;
      }
    } else {
      const step = e.shiftKey ? 1 : GRID_SIZE;
      switch (e.key) {
        case 'ArrowUp': selectedElement.y -= step; break;
        case 'ArrowDown': selectedElement.y += step; break;
        case 'ArrowLeft': selectedElement.x -= step; break;
        case 'ArrowRight': selectedElement.x += step; break;
        case 'Delete': deleteSelectedElement(); return;
        default: return;
      }
    }
    if (document.getElementById('snapToGrid').checked && !(e.ctrlKey || e.metaKey)) {
      selectedElement.x = Math.round(selectedElement.x / GRID_SIZE) * GRID_SIZE;
      selectedElement.y = Math.round(selectedElement.y / GRID_SIZE) * GRID_SIZE;
    }
    if (selectedElement.updateTransform) selectedElement.updateTransform();
    updatePropertyPanel(selectedElement);
    e.preventDefault();
  });

  // Elemente-Overlay verschiebbar machen
  const overlay = document.getElementById('elements-overlay');
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  overlay.addEventListener('mousedown', function(e) {
    if (e.target !== overlay && e.target.tagName !== 'DIV') return;
    isDragging = true;
    dragOffsetX = e.clientX - overlay.offsetLeft;
    dragOffsetY = e.clientY - overlay.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    overlay.style.left = (e.clientX - dragOffsetX) + 'px';
    overlay.style.top = (e.clientY - dragOffsetY) + 'px';
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  // Menü-Overlay verschiebbar machen (links oben)
  const controlsOverlay = document.getElementById('controls-overlay');
  let isDraggingMenu = false;
  let dragMenuOffsetX = 0;
  let dragMenuOffsetY = 0;
  // Drag nur, wenn auf Overlay-Hintergrund oder auf den Bereich über dem eigentlichen Menü (z.B. H3 oder summary) geklickt wird
  controlsOverlay.addEventListener('mousedown', function(e) {
    // Erlaube Drag auf Overlay, H3, summary
    if (
      e.target === controlsOverlay ||
      e.target.tagName === 'H3' ||
      e.target.tagName === 'SUMMARY'
    ) {
      isDraggingMenu = true;
      dragMenuOffsetX = e.clientX - controlsOverlay.offsetLeft;
      dragMenuOffsetY = e.clientY - controlsOverlay.offsetTop;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDraggingMenu) return;
    controlsOverlay.style.left = (e.clientX - dragMenuOffsetX) + 'px';
    controlsOverlay.style.top = (e.clientY - dragMenuOffsetY) + 'px';
  });
  document.addEventListener('mouseup', function() {
    isDraggingMenu = false;
    document.body.style.userSelect = '';
  });

  // Gruppenverwaltung: mehrere Gruppen unterstützen
  window.groups = window.groups || [];
  window.groupedElements = window.groupedElements || [];

  // Hilfsfunktion: Gruppe als neue Gruppe speichern
  function addNewGroup(elements) {
    // Prüfe, ob diese Gruppe schon existiert (gleiche IDs)
    const ids = elements.map(e => e.id).sort().join(',');
    if (!window.groups.some(g => g.map(e => e.id).sort().join(',') === ids)) {
      window.groups.push([...elements]);
    }
    window.groupedElements = [...elements]; // aktuelle Gruppe
  }

  // Gruppieren-Button: Rechteck aufziehen, alle Elemente im Bereich markieren
  let groupRect = null;
  let groupStart = null;
  const editor = document.getElementById('editor');
  const groupBtn = document.getElementById('groupBtn');
  let isGroupMode = false;

  groupBtn.addEventListener('click', () => {
    isGroupMode = !isGroupMode;
    groupBtn.classList.toggle('active', isGroupMode);
    if (isGroupMode) {
      editor.style.cursor = 'crosshair';
    } else {
      editor.style.cursor = '';
      if (groupRect) {
        groupRect.remove();
        groupRect = null;
      }
    }
  });

  editor.addEventListener('mousedown', function(e) {
    if (!isGroupMode) return;
    if (e.button !== 0) return;
    groupStart = { x: e.offsetX, y: e.offsetY };
    if (!groupRect) {
      groupRect = document.createElement('div');
      groupRect.style.position = 'absolute';
      groupRect.style.border = '2px dashed #0066cc';
      groupRect.style.background = 'rgba(0,102,204,0.08)';
      groupRect.style.pointerEvents = 'none';
      groupRect.style.zIndex = 9999;
      editor.appendChild(groupRect);
    }
    groupRect.style.left = groupStart.x + 'px';
    groupRect.style.top = groupStart.y + 'px';
    groupRect.style.width = '0px';
    groupRect.style.height = '0px';
  });

  editor.addEventListener('mousemove', function(e) {
    if (!isGroupMode || !groupStart || !groupRect) return;
    const x = Math.min(groupStart.x, e.offsetX);
    const y = Math.min(groupStart.y, e.offsetY);
    const w = Math.abs(groupStart.x - e.offsetX);
    const h = Math.abs(groupStart.y - e.offsetY);
    groupRect.style.left = x + 'px';
    groupRect.style.top = y + 'px';
    groupRect.style.width = w + 'px';
    groupRect.style.height = h + 'px';
  });

  editor.addEventListener('mouseup', function(e) {
    if (!isGroupMode || !groupStart || !groupRect) return;
    const x1 = Math.min(groupStart.x, e.offsetX);
    const y1 = Math.min(groupStart.y, e.offsetY);
    const x2 = Math.max(groupStart.x, e.offsetX);
    const y2 = Math.max(groupStart.y, e.offsetY);
    // Alle Elemente im Rechteck markieren und gruppieren
    const newGroup = [];
    editorElements.forEach(el => {
      if (!el.domElement) return;
      const rect = el.domElement.getBoundingClientRect();
      const edRect = editor.getBoundingClientRect();
      const ex1 = rect.left - edRect.left;
      const ey1 = rect.top - edRect.top;
      const ex2 = rect.right - edRect.left;
      const ey2 = rect.bottom - edRect.top;
      if (ex1 >= x1 && ey1 >= y1 && ex2 <= x2 && ey2 <= y2) {
        el.domElement.classList.add('active');
        newGroup.push(el);
      } else {
        el.domElement.classList.remove('active');
      }
    });
    if (newGroup.length > 1) {
      addNewGroup(newGroup);
    } else {
      window.groupedElements = [];
    }
    groupRect.remove();
    groupRect = null;
    groupStart = null;
    isGroupMode = false;
    groupBtn.classList.remove('active');
    editor.style.cursor = '';
    window.selectedElement = window.groupedElements[0] || null;
    updatePropertyPanel(window.selectedElement);
    updateElementsList();
  });

  // Gruppieren per Enter-Taste
  document.addEventListener('keydown', function(e) {
    if (isGroupMode && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
      if (!groupStart || !groupRect) return;
      // Simuliere Mouseup-Logik für Gruppieren
      const rect = groupRect.getBoundingClientRect();
      const edRect = editor.getBoundingClientRect();
      const x1 = rect.left - edRect.left;
      const y1 = rect.top - edRect.top;
      const x2 = rect.right - edRect.left;
      const y2 = rect.bottom - edRect.top;
      const newGroup = [];
      editorElements.forEach(el => {
        if (!el.domElement) return;
        const elRect = el.domElement.getBoundingClientRect();
        const ex1 = elRect.left - edRect.left;
        const ey1 = elRect.top - edRect.top;
        const ex2 = elRect.right - edRect.left;
        const ey2 = elRect.bottom - edRect.top;
        if (ex1 >= x1 && ey1 >= y1 && ex2 <= x2 && ey2 <= y2) {
          el.domElement.classList.add('active');
          newGroup.push(el);
        } else {
          el.domElement.classList.remove('active');
        }
      });
      if (newGroup.length > 1) {
        addNewGroup(newGroup);
      } else {
        window.groupedElements = [];
      }
      groupRect.remove();
      groupRect = null;
      groupStart = null;
      isGroupMode = false;
      groupBtn.classList.remove('active');
      editor.style.cursor = '';
      window.selectedElement = window.groupedElements[0] || null;
      updatePropertyPanel(window.selectedElement);
      updateElementsList();
      e.preventDefault();
    }
    // Gruppierung auflösen, wenn ein einzelnes Element ausgewählt wird
    if (!isGroupMode && window.groupedElements && window.groupedElements.length > 1 && window.selectedElement) {
      // Prüfe, ob das ausgewählte Element NICHT in der Gruppe ist
      if (!window.groupedElements.includes(window.selectedElement)) {
        window.groupedElements.forEach(el => el.domElement.classList.remove('active'));
        window.groupedElements = [];
        updateElementsList();
      } else if (window.groupedElements.length === 1) {
        // Falls nur noch ein Element in der Gruppe ist, löse Gruppe auf
        window.groupedElements = [];
        updateElementsList();
      }
    }
  });

  // updateElementsList anpassen, damit alle Gruppen angezeigt werden
  window.updateElementsList = function() {
    const elementsList = document.getElementById('elements-list');
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
  };

  // updateElementsList initial aufrufen
  updateElementsList();

  window.setupInteract = setupInteract;
  window.selectElement = selectElement;
  window.updatePropertyPanel = updatePropertyPanel;
  window.updateElementsList = updateElementsList;

  // Datei-Import (lokal): JSON laden und Hintergrundbild setzen
  document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        // ...bestehende Logik für Elemente...
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
      } catch (err) {
        alert('Fehler beim Importieren der Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Importieren-Button für gespeicherte JSON
  const importJsonBtn = document.getElementById('importJsonBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  if (importJsonBtn && importJsonInput) {
    importJsonBtn.addEventListener('click', () => importJsonInput.click());
    importJsonInput.addEventListener('change', function(e) {
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
          // Gruppen zurücksetzen
          window.groups = [];
          window.groupedElements = [];
          // Elemente wiederherstellen
          if (data.elements && Array.isArray(data.elements)) {
            data.elements.forEach(obj => {
              let el;
              if (obj.type === 'svg') {
                el = createSvgElement(obj.content, obj.label);
              } else if (obj.type === 'image') {
                el = createImageElement(obj.content, obj.label);
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
                setupInteract(el);
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
          updatePropertyPanel(null);
        } catch (err) {
          alert('Fehler beim Importieren der Datei: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  // Verknüpfung anlegen
  const addVarLinkBtn = document.getElementById('add-var-link-btn');
  if (addVarLinkBtn) {
    addVarLinkBtn.addEventListener('click', () => {
      const variable = document.getElementById('var-link-name').value;
      const value = document.getElementById('var-link-value').value;
      const eventType = document.getElementById('var-link-event').value;
      const target = document.getElementById('var-link-target').value;
      const param = document.getElementById('var-link-param').value;
      if (!variable || !eventType || !target) {
        alert('Bitte alle Felder ausfüllen!');
        return;
      }
      addVariableLink({ variable, value, event: eventType, target, param });
      renderVariablesList();
      alert('Verknüpfung angelegt!');
    });
  }

  // Testbutton für Zeitstempel (bereits vorhanden)
  const testBtn = document.createElement('button');
  testBtn.textContent = 'Zeitstempel';
  testBtn.style.fontSize = '12px';
  testBtn.style.margin = '8px 8px 0 0';
  testBtn.onclick = function() {
    const now = new Date().toLocaleTimeString();
    updateVariable('zeitstempel', now);
    const valSpan = document.getElementById('var-val-zeitstempel');
    if (valSpan) valSpan.textContent = now;
  };

  // Testbutton für lebensbit
  const lebensbitBtn = document.createElement('button');
  lebensbitBtn.textContent = 'Lebensbit';
  lebensbitBtn.style.fontSize = '12px';
  lebensbitBtn.style.margin = '8px 8px 0 0';
  lebensbitBtn.onclick = function() {
    const v = variables.find(v => v.name === 'lebensbit');
    if (v) {
      const newVal = !v.value;
      updateVariable('lebensbit', newVal);
      const valSpan = document.getElementById('var-val-lebensbit');
      if (valSpan) valSpan.textContent = newVal;
    }
  };

  // Testbutton für zaehler
  const zaehlerBtn = document.createElement('button');
  zaehlerBtn.textContent = 'Zähler';
  zaehlerBtn.style.fontSize = '12px';
  zaehlerBtn.style.margin = '8px 0 0 0';
  zaehlerBtn.onclick = function() {
    const v = variables.find(v => v.name === 'zaehler');
    if (v) {
      const newVal = (parseInt(v.value, 10) || 0) + 1;
      updateVariable('zaehler', newVal);
      const valSpan = document.getElementById('var-val-zaehler');
      if (valSpan) valSpan.textContent = newVal;
    }
  };

  const variablesPanel = document.getElementById('variables-panel');
  if (variablesPanel) {
    variablesPanel.appendChild(testBtn);
    variablesPanel.appendChild(lebensbitBtn);
    variablesPanel.appendChild(zaehlerBtn);
  }

  // Optional: Automatisch Variablenwerte im UI aktualisieren, wenn updateVariable aufgerufen wird
  window.updateVariable = function(name, value) {
    updateVariable(name, value);
    const valSpan = document.getElementById('var-val-' + name);
    if (valSpan) valSpan.textContent = value;
  };
});
