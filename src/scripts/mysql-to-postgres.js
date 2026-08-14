import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  Category, Product, User, Review, Cart, Order, OrderItem, Payment,
  LebalmaContract, LebalmaInstallment, Notification, Feedback,
} from '../models/index.js';

/**
 * Convertit un dump MySQL (mysqldump) en un fichier SQL PostgreSQL importable.
 * - retire les backticks, convertit les échappements MySQL → Postgres,
 * - convertit les booléens 0/1 → true/false (d'après le type réel des colonnes),
 * - respecte l'ordre des clés étrangères, recale les séquences auto-increment,
 * - `ON CONFLICT DO NOTHING` : n'écrase pas les lignes déjà présentes.
 *
 *   node src/scripts/mysql-to-postgres.js "C:\\chemin\\vers\\dump.sql" [sortie.sql]
 */

const DUMP = process.argv[2] || path.join(os.homedir(), 'Downloads', 'cheikh_tidiane_apple.sql');
const OUT = process.argv[3] || path.join(process.cwd(), 'postgres-import.sql');

// Ordre d'insertion (parents avant enfants, pour les clés étrangères).
// payments référence lebalma_installments → doit venir APRÈS les échéances.
const TABLE_ORDER = [
  'categories', 'users', 'products', 'carts', 'cart_items', 'orders', 'order_items',
  'reviews', 'lebalma_contracts', 'lebalma_installments', 'payments',
  'notifications', 'feedbacks',
];

const MODELS = [
  Category, Product, User, Review, Cart, Order, OrderItem, Payment,
  LebalmaContract, LebalmaInstallment, Notification, Feedback,
];

// table → { booleans:Set<col>, hasId:boolean }
const META = {};
for (const M of MODELS) {
  const table = M.getTableName();
  const attrs = M.getAttributes();
  const booleans = new Set();
  let hasId = false;
  for (const [name, def] of Object.entries(attrs)) {
    const col = def.field || name;
    if (def.type?.key === 'BOOLEAN') booleans.add(col);
    if (col === 'id') hasId = true;
  }
  META[table] = { booleans, hasId };
}

/** Déséchappe une chaîne MySQL (contenu entre quotes, sans les quotes). */
function mysqlUnescape(s) {
  return s.replace(/\\(.)/g, (_, c) => {
    switch (c) {
      case 'n': return '\n';
      case 'r': return '\r';
      case 't': return '\t';
      case '0': return '\0';
      case 'b': return '\b';
      case 'Z': return '\x1a';
      default: return c; // \' \" \\ et autres → caractère littéral
    }
  });
}

/** Convertit une valeur brute MySQL en littéral Postgres. */
function toPg(raw, isBool) {
  if (raw === 'NULL' || raw === '') return isBool ? 'NULL' : 'NULL';
  if (raw[0] === "'") {
    // Nettoie les octets de contrôle C1 et le caractère de remplacement (accents
    // corrompus dans le dump source) qui font échouer l'import.
    const inner = mysqlUnescape(raw.slice(1, -1));
    if (isBool) return inner === '1' ? 'true' : 'false';
    return `'${inner.replace(/'/g, "''")}'`;
  }
  if (isBool) return raw === '1' ? 'true' : raw === '0' ? 'false' : raw;
  return raw; // nombre, NULL déjà géré
}

/** Extrait toutes les instructions INSERT (en respectant les chaînes). */
function extractInserts(sql) {
  const out = [];
  const re = /INSERT INTO/gi;
  let m;
  while ((m = re.exec(sql))) {
    let inStr = false;
    let j = m.index;
    for (; j < sql.length; j++) {
      const ch = sql[j];
      if (inStr) {
        if (ch === '\\') { j++; continue; }
        if (ch === "'") inStr = false;
      } else if (ch === "'") inStr = true;
      else if (ch === ';') break;
    }
    out.push(sql.slice(m.index, j));
    re.lastIndex = j;
  }
  return out;
}

/**
 * Récupère l'ordre des colonnes de chaque table depuis les `CREATE TABLE`
 * (nécessaire quand les INSERT n'ont pas de liste de colonnes — cas mysqldump).
 */
function parseCreateTables(sql) {
  const map = {};
  const re = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\n\)\s*ENGINE/gi;
  let m;
  while ((m = re.exec(sql))) {
    const table = m[1];
    const cols = [];
    for (const line of m[2].split('\n')) {
      const cm = line.match(/^\s*`([^`]+)`\s+\S/); // ligne de colonne (backtick immédiat)
      if (cm) cols.push(cm[1]);
    }
    map[table] = cols;
  }
  return map;
}

/** Parse une instruction INSERT → { table, cols:[], rows:[[raw,...]] }. */
function parseInsert(stmt, columnsByTable = {}) {
  const head = stmt.match(/^INSERT INTO\s+`([^`]+)`\s*(?:\(([^)]*)\)\s*)?VALUES\s*/is);
  if (!head) return null;
  const table = head[1];
  const cols = head[2]
    ? head[2].split(',').map((c) => c.trim().replace(/`/g, ''))
    : columnsByTable[table] || [];
  if (!cols.length) return null; // colonnes inconnues → on saute
  const body = stmt.slice(head[0].length);

  const rows = [];
  let i = 0;
  const n = body.length;
  while (i < n) {
    while (i < n && body[i] !== '(') i++;
    if (i >= n) break;
    i++; // '('
    const vals = [];
    let cur = '';
    let inStr = false;
    while (i < n) {
      const ch = body[i];
      if (inStr) {
        if (ch === '\\') { cur += ch + (body[i + 1] ?? ''); i += 2; continue; }
        cur += ch;
        if (ch === "'") inStr = false;
        i++;
        continue;
      }
      if (ch === "'") { cur += ch; inStr = true; i++; continue; }
      if (ch === ',') { vals.push(cur.trim()); cur = ''; i++; continue; }
      if (ch === ')') { vals.push(cur.trim()); i++; break; }
      cur += ch; i++;
    }
    rows.push(vals);
  }
  return { table, cols, rows };
}

function run() {
  if (!fs.existsSync(DUMP)) {
    console.error(`❌ Dump introuvable : ${DUMP}`);
    process.exit(1);
  }
  const sql = fs.readFileSync(DUMP, 'utf8');
  const columnsByTable = parseCreateTables(sql);
  const inserts = extractInserts(sql).map((s) => parseInsert(s, columnsByTable)).filter(Boolean);

  const byTable = {};
  for (const ins of inserts) byTable[ins.table] = ins;

  const truncate = process.argv.includes('--truncate');
  const truncateStmt = `TRUNCATE ${TABLE_ORDER.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`;

  const out = [];
  out.push('-- Import PostgreSQL généré depuis le dump MySQL.');
  out.push('-- Les tables doivent déjà exister (créées par Sequelize / npm run db:seed).');
  out.push(truncate
    ? '-- MODE REMPLACEMENT : les tables sont VIDÉES puis rechargées (IDs exacts).'
    : '-- « ON CONFLICT DO NOTHING » : les lignes déjà présentes ne sont pas écrasées.');
  out.push('');
  out.push("SET client_encoding TO 'UTF8';");
  out.push('');
  out.push('BEGIN;');
  out.push('');
  // TRUNCATE placé DANS la transaction → rollback complet si un INSERT échoue.
  out.push((truncate ? '' : '-- ') + truncateStmt);
  out.push('');

  const done = new Set();
  const emit = (table) => {
    const ins = byTable[table];
    if (!ins || !ins.rows.length) return;
    const meta = META[table] || { booleans: new Set() };
    const colList = ins.cols.map((c) => `"${c}"`).join(', ');
    out.push(`-- ${table} (${ins.rows.length} ligne(s))`);
    out.push(`INSERT INTO "${table}" (${colList}) VALUES`);
    const lines = ins.rows.map((row) => {
      const vals = row.map((raw, idx) => toPg(raw, meta.booleans.has(ins.cols[idx])));
      return `  (${vals.join(', ')})`;
    });
    out.push(lines.join(',\n') + '\nON CONFLICT DO NOTHING;');
    out.push('');
    done.add(table);
  };

  for (const t of TABLE_ORDER) emit(t);
  // Tables du dump non prévues dans l'ordre (au cas où)
  for (const t of Object.keys(byTable)) if (!done.has(t)) emit(t);

  // Recalage des séquences auto-increment
  out.push('-- Recale les séquences (id) pour éviter les collisions futures');
  for (const t of [...TABLE_ORDER, ...Object.keys(byTable)]) {
    if (!byTable[t] || !(META[t]?.hasId)) continue;
    out.push(
      `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "${t}"), 1));`
    );
  }
  out.push('');
  out.push('COMMIT;');

  fs.writeFileSync(OUT, out.join('\n'), 'utf8');
  console.log(`✅ Fichier généré : ${OUT}`);
  console.log(`   Tables importées : ${[...done].join(', ')}`);
}

run();
