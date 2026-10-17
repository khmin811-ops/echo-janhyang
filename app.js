function fallbackImg(img,name,col){const d=document.createElement('div');d.className='ph';d.style.setProperty('--c',col);d.textContent=name[0];img.replaceWith(d)}
const COLORS={ruin:'#8a8f9e',neutral:'#d8d2c0'};
const TYPE_LABEL={territory:'세력 영토',ruin:'폐허 · 무주지',neutral:'중립 지대'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let W,FAC={},CHAPTERS=[];

/* 떨어지는 글자 */
(function rain(){
  const c=document.getElementById('rain'),x=c.getContext('2d');
  const G='괜찮아기억해같이놀자지워라팔게약속거짓말기도맹세쉿잊지마사랑해미안해돌아와말잔향殘響落言誓祈ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ';
  let w,h,drops=[];const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){w=c.width=innerWidth*devicePixelRatio;h=c.height=innerHeight*devicePixelRatio;
    const n=Math.min(90,Math.floor(innerWidth/14));drops=Array.from({length:n},()=>mk(true));}
  function mk(init){return{x:Math.random()*w,y:init?Math.random()*h:-40,v:(.25+Math.random()*.9)*devicePixelRatio,s:(10+Math.random()*16)*devicePixelRatio,
    ch:G[Math.floor(Math.random()*G.length)],a:.15+Math.random()*.55,hue:Math.random()<.75?'242,196,109':'127,232,255',sw:Math.random()*Math.PI*2}}
  function tick(){x.clearRect(0,0,w,h);
    for(const d of drops){d.y+=d.v;d.sw+=.01;const px=d.x+Math.sin(d.sw)*8;
      x.font=`${d.s}px 'Noto Serif KR',serif`;x.shadowBlur=14;x.shadowColor=`rgba(${d.hue},.9)`;
      x.fillStyle=`rgba(${d.hue},${d.a*(1-d.y/h*.6)})`;x.fillText(d.ch,px,d.y);
      if(d.y>h+40)Object.assign(d,mk(false));}
    if(!reduce)requestAnimationFrame(tick);}
  addEventListener('resize',size);size();tick();
})();

function colorOf(fid){return FAC[fid]?.color||COLORS[fid]||'#999'}

function renderMap(){
  const svg=document.getElementById('worldmap');const NS='http://www.w3.org/2000/svg';
  let s=`<defs>
   <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
   <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter>
   <radialGradient id="sea" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#141a33"/><stop offset=".7" stop-color="#080a15"/><stop offset="1" stop-color="#030409"/></radialGradient>
   <radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2c4" stop-opacity=".95"/><stop offset=".35" stop-color="#f2c46d" stop-opacity=".5"/><stop offset="1" stop-color="#f2c46d" stop-opacity="0"/></radialGradient>
   <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff22" stroke-width="2"/></pattern>
  </defs>
  <rect width="1000" height="720" fill="url(#sea)"/>`;
  const [CX,CY]=W.center||[500,364];
  s+=`<path d="${W.coast||''}" fill="#10142a" stroke="#f2c46d" stroke-opacity=".35" stroke-width="10" filter="url(#glow)"/><path d="${W.coast||''}" fill="#0d1124" stroke="#f2c46d" stroke-opacity=".6" stroke-width="1.2"/>`;
  // 낙언 파문 (sound rings)
  for(let i=1;i<=8;i++){const r=40+i*48;s+=`<ellipse cx="${CX}" cy="${CY}" rx="${r*1.5}" ry="${r}" fill="none" stroke="#f2c46d" stroke-opacity="${.22-i*.025}" stroke-width="1" stroke-dasharray="${i%2?'2 7':'14 6'}"><animate attributeName="ry" values="${r};${r+8};${r}" dur="${6+i}s" repeatCount="indefinite"/><animate attributeName="rx" values="${r*1.5};${(r+8)*1.5};${r*1.5}" dur="${6+i}s" repeatCount="indefinite"/></ellipse>`}
  // 균열선
  const cracks=[[CX,CY,470,30],[CX,CY,980,250],[CX,CY,900,700],[CX,CY,90,710],[CX,CY,10,250],[CX,CY,640,715]];
  cracks.forEach(([a,b,c,d],i)=>{const mx=(a+c)/2+(i%2?40:-40),my=(b+d)/2+(i%3?-30:30);
    s+=`<path d="M${a},${b} Q${mx},${my} ${c},${d}" fill="none" stroke="#7fe8ff" stroke-opacity=".18" stroke-width="1.4" filter="url(#rough)"/>`});
  // 말의 강 (무음산맥 → 낙언공 → 여울장 → 바다)
  s+=`<path d="M470,110 C500,170 470,230 492,292 M560,420 C640,470 720,430 800,470 C860,500 930,560 995,600" fill="none" stroke="#7fe8ff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
  s+=`<text x="930" y="560" class="rsub" style="fill:#7fe8ffaa">말의 강</text><text x="880" y="704" class="rsub">잔향해 · 말 없는 바다</text><text x="110" y="40" class="rsub">잔향해</text>`;
  // 지역
  W.regions.forEach(r=>{const c=colorOf(r.faction);const op=r.type==='territory'?.32:.2;
    s+=`<g class="rg" data-id="${r.id}"><path class="region" data-id="${r.id}" d="${r.d}" fill="${c}" fill-opacity="${op}" stroke="${c}" stroke-opacity=".9" stroke-width="1.4"/>`;
    if(r.type!=='territory')s+=`<path d="${r.d}" fill="url(#hatch)" pointer-events="none"/>`;
    s+=`</g>`});
  s+=`<circle cx="${CX}" cy="${CY}" r="60" fill="url(#core)" pointer-events="none"><animate attributeName="r" values="52;66;52" dur="4s" repeatCount="indefinite"/></circle>`;
  // 지도 위 떨어지는 글자
  const g='쉿약속기억거짓기도놀자괜찮';for(let i=0;i<26;i++){const x=40+Math.random()*920,y=Math.random()*700,fs=10+Math.random()*14,d=8+Math.random()*10;
    s+=`<text class="mapglyph" x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${fs.toFixed(0)}" opacity="0">${g[i%g.length]}<animate attributeName="y" values="${(y-60).toFixed(0)};${(y+60).toFixed(0)}" dur="${d.toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.6;0" dur="${d.toFixed(1)}s" repeatCount="indefinite"/></text>`}
  W.regions.forEach(r=>{const[x,y]=r.label;s+=`<text class="rlabel" x="${x}" y="${y}">${esc(r.name)}</text><text class="rsub" x="${x}" y="${y+18}">${esc(r.hanja)}</text>`});
  s+=`<g transform="translate(60,660)" opacity=".7"><circle r="22" fill="none" stroke="#f2c46d" stroke-opacity=".5"/><path d="M0,-30 L5,0 L0,30 L-5,0Z" fill="#f2c46d" fill-opacity=".6"/><text y="-36" class="rsub" style="fill:#f2c46d">北</text></g>`;
  svg.innerHTML=s;
  svg.querySelectorAll('.region').forEach(p=>{
    p.addEventListener('mouseenter',()=>showRegion(p.dataset.id,false));
    p.addEventListener('click',()=>showRegion(p.dataset.id,true));
  });
  document.getElementById('legend').innerHTML=W.factions.map(f=>`<span><i style="background:${f.color}"></i>${esc(f.name)}</span>`).join('')+
    `<span><i style="background:${COLORS.ruin}"></i>폐허 · 무주지</span><span><i style="background:${COLORS.neutral}"></i>중립 지대</span><span><i style="background:#7fe8ff"></i>말의 강 · 균열</span>`;
}
function showRegion(id,lock){
  const r=W.regions.find(r=>r.id===id);if(!r)return;
  document.querySelectorAll('.region').forEach(p=>p.classList.toggle('sel',p.dataset.id===id));
  const c=colorOf(r.faction),fname=FAC[r.faction]?.name||TYPE_LABEL[r.type];
  const ev=(W.events||[]).filter(e=>e.region===id).slice(0,3);
  document.getElementById('map-info').innerHTML=`<h3>${esc(r.name)} <small class="muted">${esc(r.hanja)}</small></h3>
   <span class="tag" style="background:${c}">${esc(fname)}</span><p>${esc(r.lore)}</p>${ev.map(e=>`<p class="muted">Day ${e.day} · ${esc(e.text)}</p>`).join('')}`;
  if(lock&&innerWidth<860)document.getElementById('map-info').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderFactions(){
  const max=Math.max(...W.factions.map(f=>f.power));
  document.getElementById('faction-list').innerHTML=W.factions.map(f=>{
    const regs=W.regions.filter(r=>r.faction===f.id).map(r=>r.name).join(', ')||'없음';
    const mem=W.characters.filter(c=>c.faction===f.id).map(c=>c.name).join(', ');
    return `<div class="fac" data-h="${esc(f.hanja)}" style="border-color:${f.color}55;box-shadow:0 0 50px ${f.color}12 inset">
     <h3 style="color:${f.color}">${esc(f.name)}</h3><p class="motto" style="color:${f.color}cc">“${esc(f.motto)}”</p><p>${esc(f.desc)}</p>
     <small>지배 지역: ${esc(regs)}<br>주요 인물: ${esc(mem)}</small>
     <div class="bar"><b style="width:${f.power/max*100}%;background:${f.color};box-shadow:0 0 12px ${f.color}"></b></div><small>영향력 ${f.power}</small></div>`}).join('');
}
function renderChars(){
  const el=document.getElementById('char-list');
  el.innerHTML=W.characters.map(c=>{const col=colorOf(c.faction);return `<div class="card" style="--c:${col}" data-id="${c.id}">
    <img src="${esc(c.img)}" alt="${esc(c.name)}" loading="lazy" onerror="fallbackImg(this,'${esc(c.name)}','${col}')"><div class="cap"><span class="role">${esc(c.role)} · ${esc(c.age)}</span><h3>${esc(c.name)}</h3>
    <span class="fw">첫마디 「${esc(c.firstWord)}」</span></div></div>`}).join('');
  el.querySelectorAll('.card').forEach(n=>n.onclick=()=>{const c=W.characters.find(c=>c.id===n.dataset.id),col=colorOf(c.faction);
    document.getElementById('modal-card').innerHTML=`<img src="${esc(c.img)}" alt="" onerror="fallbackImg(this,'${esc(c.name)}','${col}')"><div class="mc" style="--c:${col}"><span class="role muted">${esc(c.role)} · ${esc(c.age)} · ${esc(FAC[c.faction]?.name||'무소속')}</span>
     <h3>${esc(c.name)}</h3><span class="fw">첫마디 「${esc(c.firstWord)}」</span><p>${esc(c.desc)}</p>
     <p class="muted">등장: ${CHAPTERS.filter(ch=>ch.characters.includes(c.id)).map(ch=>'Day '+ch.day).join(', ')||'아직 없음'}</p></div>`;
    document.getElementById('modal').classList.add('open')});
}
function md(t){return t.split(/\n\s*\n/).map(p=>`<p>${esc(p).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')}</p>`).join('')}
async function openChapter(day){
  const ch=CHAPTERS.find(c=>c.day===day);if(!ch)return;
  document.querySelectorAll('.timeline li').forEach(li=>li.classList.toggle('on',+li.dataset.day===day));
  const raw=await (await fetch(ch.file+'?v='+Date.now())).text();const body=raw.replace(/^---[\s\S]*?---\n?/,'');
  const who=ch.characters.map(id=>W.characters.find(c=>c.id===id)?.name).filter(Boolean).join(', ');
  document.getElementById('reader').innerHTML=`<div class="meta">DAY ${ch.day} · ${esc(ch.date)} · ${esc(ch.location)}${who?' · '+esc(who):''}</div><h3>${esc(ch.title)}</h3><br>${md(body)}<div class="end">— 기록 계속 —</div>`;
}
function renderChron(){
  const tl=document.getElementById('timeline');
  tl.innerHTML=[...CHAPTERS].reverse().map(c=>`<li data-day="${c.day}"><div class="d">DAY ${c.day} · ${esc(c.date)}</div><div class="t">${esc(c.title)}</div></li>`).join('');
  tl.querySelectorAll('li').forEach(li=>li.onclick=()=>openChapter(+li.dataset.day));
  const last=CHAPTERS[CHAPTERS.length-1];
  if(last){openChapter(last.day);document.getElementById('latest').innerHTML=`최신 기록 <b>DAY ${last.day}</b> · ${esc(last.title)}`}
}
(async()=>{
  [W,{chapters:CHAPTERS}]=await Promise.all([fetch('data/world.json').then(r=>r.json()),fetch('data/chapters/index.json?v='+Date.now()).then(r=>r.json())]);
  W.factions.forEach(f=>FAC[f.id]=f);
  document.getElementById('hero-title').textContent=W.title;document.getElementById('hero-sub').textContent=W.subtitle;document.getElementById('hero-tag').textContent=W.tagline;
  document.getElementById('lore-list').innerHTML=W.lore.map(l=>`<div><h3>${esc(l.h)}</h3><p>${esc(l.p)}</p></div>`).join('');
  renderMap();renderFactions();renderChars();renderChron();showRegion('nakeongong');
  document.getElementById('updated').textContent='DAY '+(CHAPTERS.at(-1)?.day||0);
})();
