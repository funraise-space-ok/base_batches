/*
  Genera public/pls-index.json con el listado de archivos en public/pls
  Uso:
    node scripts/generate-pls-index.cjs
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLS_DIR = path.join(ROOT, 'public', 'pls');
const OUT = path.join(ROOT, 'public', 'pls-index.json');

function main() {
  if (!fs.existsSync(PLS_DIR)) {
    console.error('No existe:', PLS_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(PLS_DIR)
    .filter(f => f && !f.startsWith('.') && /\.(webp|png|jpg|jpeg)$/i.test(f))
    .sort();
  const json = { files };
  fs.writeFileSync(OUT, JSON.stringify(json, null, 2) + "\n");
  console.log(`Escrito ${files.length} entradas en`, OUT);
}

main();

