// variable-event-handler.js
// Logik für Variablen- und Event-Handling im SVG Editor

import { applyFillToSvgElement } from './color-handling.js';

// Beispielhafte Test-Variablen
export const variables = [
  {
    name: 'zeitstempel',
    value: new Date().toLocaleTimeString(),
    type: 'string',
    description: 'Aktueller Zeitstempel',
    links: []
  },
  {
    name: 'lebensbit',
    value: true,
    type: 'boolean',
    description: 'Lebensbit (true/false)',
    links: []
  },
  {
    name: 'zaehler',
    value: 0,
    type: 'number',
    description: 'Ein Zähler für beliebige Zwecke',
    links: []
  }
];

// Verknüpfungen: { variable, value, event, target, param }
export const variableLinks = [];

// Variable anlegen
export function addVariable(name, value, type = 'string', description = '') {
  variables.push({ name, value, type, description, links: [] });
}

// Verknüpfung anlegen
export function addVariableLink({ variable, value, event, target, param }) {
  variableLinks.push({ variable, value, event, target, param });
}

// Variable aktualisieren (z.B. von außen)
export function setVariable(name, newValue) {
  const v = variables.find(v => v.name === name);
  if (v) v.value = newValue;
}

// Alle Verknüpfungen für eine Variable und Wert holen
export function getLinksForVariable(name, value) {
  return variableLinks.filter(link => link.variable === name && link.value == value);
}

// Event auslösen, wenn Variable den Wert annimmt
export function handleVariableEvents(name, value) {
  const links = getLinksForVariable(name, value);
  links.forEach(link => {
    // Beispiel: Event-Handling für Farbe ändern
    if (link.event === 'color') {
      const el = window.editorElements?.find(e => e.id === link.target);
      if (el && el.domElement) {
        // Richtiges Färben via applyFillToSvgElement (SVG!)
        applyFillToSvgElement(el, link.param);
      }
    }
    // Beispiel: Ein-/Ausblenden
    if (link.event === 'show') {
      const el = window.editorElements?.find(e => e.id === link.target);
      if (el && el.domElement) {
        el.domElement.style.display = link.param ? '' : 'none';
      }
    }
    // Custom Event: Hier kann beliebige Logik ergänzt werden
    if (link.event === 'custom') {
      // window.dispatchEvent(new CustomEvent(...)) o.ä.
    }
  });
}

// Beispiel: Variable ändern und Events prüfen
export function updateVariable(name, newValue) {
  setVariable(name, newValue);
  handleVariableEvents(name, newValue);
}
