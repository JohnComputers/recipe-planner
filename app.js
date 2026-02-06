/* FitPlanner Pro — client-side MVP
   - Tier unlocking via license codes or URL param
   - Meals saved with timestamps; history + 7-day chart
   - Templates (Premium), CSV export (Premium)
   - All data localStorage-only (no backend)
*/

/* -------------------------
   Utilities & initialization
   ------------------------- */
const RANK = { free: 0, basic: 1, standard: 2, premium: 3 };
let tier = localStorage.getItem('tier') || 'free';

// On load, if URL contains ?license=basic etc. auto-unlock (Square redirect option)
(function checkURLUnlock(){
  const p = new URLSearchParams(location.search);
  const l = (p.get('license') || '').toLowerCase();
  if (l && ['basic','standard','premium'].includes(l)) {
    localStorage.setItem('tier', l);
    tier = l;
    // remove query param from URL (clean)
    history.replaceState({}, document.title, location.pathname);
    alert(`Unlocked ${l.toUpperCase()} via redirect`);
  }
})();

function go(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  // refresh UI for the page
  if (id==='dashboard') { renderTier(); renderMeals(); drawHistoryChart(); updateProgress(); }
  if (id==='nutrition') renderMeals();
  if (id==='workouts') renderWorkouts();
  if (id==='history') renderHistory();
  if (id==='templates') renderTemplates();
}

/* -------------------------
   Account (local-only)
   ------------------------- */
function signup(){
  const u = user.value?.trim(), p = pass.value;
  if (!u || !p) return alert('enter username & password');
  localStorage.setItem('acc', JSON.stringify({u,p}));
  alert('Account created (local only)');
}
function signin(){
  const acc = JSON.parse(localStorage.getItem('acc')||'null');
  if (acc && acc.u===user.value && acc.p===pass.value) {
    alert('Logged in');
    go('dashboard');
  } else alert('Login failed');
}
/* Developer bypass (hidden by CSS). To enable in dev: (localStorage.setItem("dev", "1"); document.getElementById("devBypassBtn").style.display="inline-block") */
function devBypass(){
  if (!localStorage.getItem('dev')) return alert('dev bypass disabled');
  localStorage.setItem('tier','premium');
  tier='premium';
  alert('Dev bypass enabled: premium unlocked');
  go('dashboard');
}

/* -------------------------
   License code scheme (offline generation)
   - Code format: TIER-TOKEN-CHECK
   - CHECK = (sum of token char codes + tierLen) % 997
   - Client verifies checksum (no secret)
   - Admin generates token & CHECK offline using same formula
   ------------------------- */
function verifyLicense(code){
  if (!code) return false;
  const parts = code.trim().split('-');
  if (parts.length < 3) return false;
  const tierName = parts[0].toLowerCase();
  const token = parts[1];
  const check = parseInt(parts[2],10);
  if (!['basic','standard','premium'].includes(tierName)) return false;
  let s=0;
  for (let ch of token) s += ch.charCodeAt(0);
  s += tierName.length;
  if ((s % 997) === check) return tierName;
  return false;
}

function unlock(){
  const code = license.value.trim();
  const ok = verifyLicense(code);
  if (!ok) return alert('Invalid license code. Follow after-purchase instructions.');
  tier = ok;
  localStorage.setItem('tier', tier);
  renderTier();
  alert(`${tier.toUpperCase()} unlocked`);
  go('dashboard');
}

function autoUnlockFromURL(){
  const p = new URLSearchParams(location.search);
  const l = p.get('license');
  if (l) {
    localStorage.setItem('tier', l.toLowerCase());
    tier = l.toLowerCase();
    history.replaceState({}, document.title, location.pathname);
    renderTier();
    alert(`Unlocked ${tier}`);
    go('dashboard');
  } else alert('No license param present in URL');
}

/* -------------------------
   Goals & meals
   ------------------------- */
function saveGoals(){
  const g = {
    cal: Number(gCalories.value||0),
    pro: Number(gProtein.value||0),
    carb: Number(gCarbs.value||0),
    sug: Number(gSugar.value||0)
  };
  localStorage.setItem('goals', JSON.stringify(g));
  alert('Goals saved');
  updateProgress();
}
function clearGoals(){
  localStorage.removeItem('goals');
  gCalories.value = gProtein.value = gCarbs.value = gSugar.value = '';
  updateProgress();
}

function addMeal(){
  if (RANK[tier] < RANK['basic']) return alert('Upgrade required to add meals (Basic).');
  const entry = {
    id: Date.now(),
    ts: new Date().toISOString(),
    c: Number(cal.value||0),
    p: Number(pro.value||0),
    cb: Number(carb.value||0),
    s: Number(sug.value||0)
  };
  const arr = JSON.parse(localStorage.getItem('meals')||'[]');
  arr.push(entry);
  localStorage.setItem('meals', JSON.stringify(arr));
  cal.value=pro.value=carb.value=sug.value='';
  renderMeals();
  updateProgress();
  drawHistoryChart();
}

/* render today's meals list */
function renderMeals(){
  meals.innerHTML='';
  const arr = JSON.parse(localStorage.getItem('meals')||'[]');
  const today = new Date().toISOString().slice(0,10);
  const todayEntries = arr.filter(m => m.ts.slice(0,10)===today);
  if (todayEntries.length===0) {
    meals.innerHTML = '<li class="muted">No entries today</li>';
    return;
  }
  todayEntries.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `<div class="row space"><div>🔥 ${m.c} kcal &nbsp; P ${m.p}g &nbsp; C ${m.cb}g &nbsp; S ${m.s}g</div>
                    <div><button class="ghost" onclick="removeMeal(${m.id})">Delete</button></div></div>`;
    meals.appendChild(li);
  });
}

function removeMeal(id){
  let arr = JSON.parse(localStorage.getItem('meals')||'[]');
  arr = arr.filter(x => x.id !== id);
  localStorage.setItem('meals', JSON.stringify(arr));
  renderMeals(); drawHistoryChart(); updateProgress();
}

/* clear all meals */
function clearMeals(){
  if (!confirm('Clear all stored entries?')) return;
  localStorage.removeItem('meals');
  renderMeals(); renderHistory(); drawHistoryChart(); updateProgress();
}

/* -------------------------
   History & Chart (7-day)
   ------------------------- */
function getLastNDays(n=7){
  const out = [];
  const now = new Date();
  for (let i=n-1;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()-i);
    out.push(d.toISOString().slice(0,10));
  }
  return out;
}
function aggregateByDay(){
  const arr = JSON.parse(localStorage.getItem('meals')||'[]');
  const days = getLastNDays(7);
  const map = days.reduce((acc,d)=>{acc[d]=0;return acc;},{});
  arr.forEach(m=>{
    const day = m.ts.slice(0,10);
    if (map.hasOwnProperty(day)) map[day]+=Number(m.c||0);
  });
  return { days, values: days.map(d=>map[d]) };
}

/* simple bar chart using canvas */
function drawHistoryChart(){
  const canvas = document.getElementById('historyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { days, values } = aggregateByDay();
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(500, ...values);
  const pad = 20;
  const barW = (w - pad*2) / values.length * 0.7;
  values.forEach((v,i)=>{
    const x = pad + i * ((w - pad*2)/values.length) + ((w - pad*2)/values.length - barW)/2;
    const barH = (v / max) * (h - 40);
    ctx.fillStyle = '#2b9be8';
    ctx.fillRect(x, h - pad - barH, barW, barH);
    ctx.fillStyle = '#9fbfdc';
    ctx.fillText(days[i].slice(5), x, h - pad + 12);
  });
}

/* history list (all entries) */
function renderHistory(){
  const arr = JSON.parse(localStorage.getItem('meals')||'[]').slice().reverse();
  historyList.innerHTML = '';
  if (arr.length===0) return historyList.innerHTML = '<li class="muted">No entries</li>';
  arr.forEach(m=>{
    const li = document.createElement('li');
    li.innerHTML = `<div class="row space"><div>${new Date(m.ts).toLocaleString()} — ${m.c} kcal | P ${m.p}g | C ${m.cb}g | S ${m.s}g</div>
                    <div><button class="ghost" onclick="removeMeal(${m.id})">Delete</button></div></div>`;
    historyList.appendChild(li);
  });
}

/* -------------------------
   Progress bars & workouts
   ------------------------- */
function updateProgress(){
  const g = JSON.parse(localStorage.getItem('goals')||'null');
  const arr = JSON.parse(localStorage.getItem('meals')||'[]');
  const today = new Date().toISOString().slice(0,10);
  const t = arr.filter(m=>m.ts.slice(0,10)===today).reduce((a,m)=>({c:a.c+m.c,p:a.p+m.p,cb:a.cb+m.cb,s:a.s+m.s}),{c:0,p:0,cb:0,s:0});
  const container = document.getElementById('progressBars');
  container.innerHTML = '';
  if (!g) return container.innerHTML = '<p class="muted">Set daily goals on the dashboard.</p>';

  [['Calories','c',g.cal],['Protein (g)','p',g.pro],['Carbs (g)','cb',g.carb],['Sugar (g)','s',g.sug]].forEach(([label,k,goal])=>{
    const curr = Math.round(t[k]||0);
    const percent = goal > 0 ? Math.min(100, Math.round((curr/goal)*100)) : 0;
    const el = document.createElement('div');
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${label}</strong><span>${curr}/${goal}</span></div>
                    <div style="height:10px;background:rgba(255,255,255,0.04);border-radius:8px;margin-top:6px">
                      <div style="width:${percent}%;height:100%;background:linear-gradient(90deg,#2b9be8,#22c1c3);border-radius:8px"></div>
                    </div>`;
    container.appendChild(el);
  });
  renderWorkouts(t, g);
}

/* basic workout logic */
function renderWorkouts(t = null, g = null){
  const out = document.getElementById('workoutList');
  out.innerHTML = '';
  const goals = g || JSON.parse(localStorage.getItem('goals')||'null');
  if (!goals) return out.innerHTML = '<p class="muted">Set goals to get personalized workouts.</p>';
  // if total calories today > goal => suggest cardio; if protein below goal => strength; premium adds progressive suggestions
  const todays = t || JSON.parse(localStorage.getItem('meals')||'[]').filter(m=>m.ts.slice(0,10)===new Date().toISOString().slice(0,10)).reduce((a,m)=>({c:a.c+m.c,p:a.p+m.p,cb:a.cb+m.cb,s:a.s+m.s}),{c:0,p:0,cb:0,s:0});
  const list = [];
  if (todays.c > goals.cal) list.push('🔥 Cardio burn: 25–35 min steady-state');
  if (todays.p < goals.pro) list.push('🏋️ Strength focus: compound lower/upper circuit');
  if (todays.cb > goals.carb) list.push('🚶 Light activity: 30–40 min brisk walk');
  if (tier === 'premium') {
    list.push('💡 Premium: Progressive overload plan (3x/week), personalized mobility session');
  } else {
    list.push('🧘 Recovery & mobility: 10–15 min');
  }
  list.forEach(s => {
    const li = document.createElement('div');
    li.className = 'muted';
    li.style.marginBottom = '8px';
    li.textContent = s;
    out.appendChild(li);
  });
}

/* -------------------------
   Templates (Premium)
   ------------------------- */
const templates = [
  { name:'Protein Breakfast (Pancake bowl)', c:450, p:30, cb:45, s:8 },
  { name:'Light Salad + Chicken', c:520, p:40, cb:30, s:6 },
  { name:'Salmon Bowl', c:700, p:45, cb:60, s:4 }
];

function renderTemplates(){
  const list = document.getElementById('templateList');
  list.innerHTML = '';
  if (RANK[tier] < RANK['premium']) return list.innerHTML = '<div class="muted">Upgrade to Premium to use templates.</div>';
  templates.forEach(tpl=>{
    const btn = document.createElement('button');
    btn.className = 'ghost';
    btn.style.width='100%';
    btn.textContent = tpl.name + ` — ${tpl.c} kcal`;
    btn.onclick = ()=>{ cal.value=tpl.c; pro.value=tpl.p; carb.value=tpl.cb; sug.value=tpl.s; alert('Template populated — press Add Meal'); };
    list.appendChild(btn);
  });
}

/* quick add template (button in nutrition) */
function quickAddTemplate(){
  if (RANK[tier] < RANK['premium']) return alert('Templates are premium only.');
  const t = templates[0];
  cal.value=t.c; pro.value=t.p; carb.value=t.cb; sug.value=t.s;
}

/* -------------------------
   Export & backup
   ------------------------- */
function exportCSV(){
  if (RANK[tier] < RANK['premium']) return alert('CSV export is Premium only.');
  const arr = JSON.parse(localStorage.getItem('meals')||'[]');
  if (arr.length===0) return alert('No entries to export');
  const csv = ['timestamp,calories,protein,carbs,sugar', ...arr.map(r=>`${r.ts},${r.c},${r.p},${r.cb},${r.s}`)].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'fitplanner-data.csv'; a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(){
  const data = { goals: JSON.parse(localStorage.getItem('goals')||'null'), meals: JSON.parse(localStorage.getItem('meals')||'[]'), tier };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'fitplanner-backup.json'; a.click();
  URL.revokeObjectURL(url);
}

/* -------------------------
   Helpers: UI render on load
   ------------------------- */
function renderTier(){
  tierBadge.innerHTML = `<span class="badge">Plan: ${tier.toUpperCase()}</span>`;
  // enable/disable buttons
  exportBtn.style.display = (RANK[tier] >= RANK['premium']) ? 'inline-block' : 'none';
  // fill goal inputs
  const g = JSON.parse(localStorage.getItem('goals')||'null');
  if (g) { gCalories.value = g.cal || ''; gProtein.value = g.pro || ''; gCarbs.value = g.carb || ''; gSugar.value = g.sug || ''; }
}

function init(){
  renderTier();
  renderMeals();
  drawHistoryChart();
  updateProgress();
  renderTemplates();
  renderHistory();
}
init();

/* -------------------------
   Optional: expose admin modal
   ------------------------- */
function openAdmin(){
  document.getElementById('adminModal').classList.remove('hidden');
}
function closeAdmin(){
  document.getElementById('adminModal').classList.add('hidden');
}

/* end of app.js */
