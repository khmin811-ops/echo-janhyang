#!/usr/bin/env node
/*
 잔향 데일리 챕터 추가 스크립트
 사용법:
   node add-chapter.js --title "제목" --file 본문.txt [--date 2026-10-19] [--location 필경도] [--characters harin,gwonmuk]
                       [--region mueum=scribe] [--power scribe=+3,silence=-2] [--event "지도 이벤트 설명"] [--event-region nakeongong]
   (본문은 --file 대신 표준입력으로도 가능: cat body.txt | node add-chapter.js --title "..." )
   node add-chapter.js --rebuild      # data/chapters/*.md 를 다시 읽어 index.json 만 재생성
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname, CH = path.join(ROOT, 'data/chapters'), WORLD = path.join(ROOT, 'data/world.json');

function args() {
  const a = process.argv.slice(2), o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) {
    const k = a[i].slice(2); o[k] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
  }
  return o;
}
function parseMd(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {}; let body = txt;
  if (m) { body = m[2]; m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); }
  return { meta, body: body.trim() };
}
function rebuild() {
  const files = fs.readdirSync(CH).filter(f => /^day-\d+\.md$/.test(f)).sort();
  const list = files.map(f => {
    const { meta, body } = parseMd(fs.readFileSync(path.join(CH, f), 'utf8'));
    const plain = body.replace(/\s+/g, ' ');
    return { day: +meta.day, title: meta.title, date: meta.date, location: meta.location || '',
      characters: (meta.characters || '').split(',').map(s => s.trim()).filter(Boolean),
      file: 'data/chapters/' + f, excerpt: plain.slice(0, 90) + (plain.length > 90 ? '…' : ''), chars: body.replace(/\s/g, '').length };
  }).sort((a, b) => a.day - b.day);
  fs.writeFileSync(path.join(CH, 'index.json'), JSON.stringify({ updated: new Date().toISOString(), chapters: list }, null, 2));
  console.log(`index.json: ${list.length}개 챕터`);
  return list;
}
const o = args();
if (o.rebuild) { rebuild(); process.exit(0); }
if (!o.title) { console.error('--title 이 필요합니다'); process.exit(1); }
let body = o.file ? fs.readFileSync(o.file, 'utf8') : fs.readFileSync(0, 'utf8');
body = body.trim(); if (!body) { console.error('본문이 비었습니다'); process.exit(1); }
const existing = fs.readdirSync(CH).filter(f => /^day-\d+\.md$/.test(f)).map(f => +f.match(/\d+/)[0]);
const day = o.day ? +o.day : (existing.length ? Math.max(...existing) + 1 : 1);
const date = o.date || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // KST
const fm = ['---', `day: ${day}`, `title: ${o.title}`, `date: ${date}`, `location: ${o.location || ''}`, `characters: ${o.characters || ''}`, '---', body, ''].join('\n');
const fname = path.join(CH, `day-${String(day).padStart(3, '0')}.md`);
fs.writeFileSync(fname, fm); console.log('작성:', path.relative(ROOT, fname));

// 세계 상태 갱신 (지도/세력)
if (o.region || o.power || o.event) {
  const w = JSON.parse(fs.readFileSync(WORLD, 'utf8'));
  if (o.region) String(o.region).split(',').forEach(p => { const [id, fac] = p.split('='); const r = w.regions.find(r => r.id === id);
    if (!r) return console.warn('지역 없음:', id); r.faction = fac; r.type = ['ruin', 'neutral'].includes(fac) ? fac : 'territory'; console.log(`지역 ${r.name} → ${fac}`); });
  if (o.power) String(o.power).split(',').forEach(p => { const [id, v] = p.split('='); const f = w.factions.find(f => f.id === id);
    if (!f) return console.warn('세력 없음:', id); f.power = Math.max(0, f.power + parseInt(v, 10)); console.log(`세력 ${f.name} 영향력 ${f.power}`); });
  if (o.event) { w.events = w.events || []; w.events.unshift({ day, region: o['event-region'] || (o.region ? String(o.region).split(',')[0].split('=')[0] : ''), text: o.event }); }
  fs.writeFileSync(WORLD, JSON.stringify(w, null, 2));
}
rebuild();
