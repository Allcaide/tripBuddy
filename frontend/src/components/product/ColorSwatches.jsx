import './ColorSwatches.css';

/* Map of known color names → hex values */
const COLOR_MAP = {
  'beige natural': '#C8B9A6',
  beige: '#C8B9A6',
  branco: '#FFFFFF',
  white: '#FFFFFF',
  creme: '#FFF8E7',
  cinza: '#999999',
  grey: '#999999',
  'cinza claro': '#C0C0C0',
  'cinza escuro': '#555555',
  preto: '#1a1a1a',
  black: '#1a1a1a',
  'azul-marinho': '#1B2A4A',
  navy: '#1B2A4A',
  azul: '#4A90D9',
  verde: '#5C7A5C',
  green: '#5C7A5C',
  'verde escuro': '#2D4A2D',
  rosa: '#D4A5A5',
  terracota: '#C87941',
  mostarda: '#C4A535',
  bordô: '#6B1A2A',
  nude: '#D4B9A0',
  camel: '#C4A36C',
  dourado: '#B8943E',
  gold: '#B8943E',
};

function colorToHex(name) {
  const lower = name.toLowerCase().trim();
  // If the name itself looks like a hex code
  if (/^#?[0-9a-f]{6}$/i.test(lower)) {
    return lower.startsWith('#') ? lower : `#${lower}`;
  }
  return COLOR_MAP[lower] || '#ccc';
}

export default function ColorSwatches({ colors }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="color-swatches">
      {colors.map((color) => (
        <span
          key={color}
          className="color-swatches__dot"
          style={{ backgroundColor: colorToHex(color) }}
          title={color}
        />
      ))}
    </div>
  );
}
