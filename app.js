let tier = localStorage.getItem('tier') || 'free';

function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function signup() {
  if (!user.value || !pass.value) return alert('Fill all fields');
  localStorage.setItem('acc', JSON.stringify({ u: user.value, p: pass.value }));
  alert('Account created');
}

function signin() {
  const a = JSON.parse(localStorage.getItem('acc'));
  if (a && a.u === user.value && a.p === pass.value) {
    go('dashboard');
    renderTier();
    renderMeals();
    renderWorkouts();
  } else alert('Login failed');
}

function verifyLicense(code) {
  const parts = code.trim().split('-');
  if (parts.length !== 3) return false;

  const tierName = parts[0].toLowerCase();
  const token = parts[1];
  const check = Number(parts[2]);

  if (!['basic','standard','premium'].includes(tierName)) return false;
  if (!Number.isInteger(check)) return false;

  let sum = 0;
  for (const c of token) sum += c.charCodeAt(0);
  sum += tierName.length;

  return sum % 997 === check ? tierName : false;
}

function unlock() {
  const t = verifyLicense(license.value);
  if (!t) return alert('Invalid license');
  tier = t;
  localStorage.setItem('tier', tier);
  renderTier();
  alert(`Unlocked ${tier.toUpperCase()}`);
  go('dashboard');
}

function renderTier() {
  tierBadge.innerHTML = `<strong>Plan:</strong> ${tier.toUpperCase()}`;
}

function saveGoals() {
  localStorage.setItem('goals', JSON.stringify({
    c: gCalories.value,
    p: gProtein.value,
    cb: gCarbs.value,
    s: gSugar.value
  }));
  updateProgress();
}

function addMeal() {
  if (tier === 'free') return alert('Upgrade required');
  const arr = JSON.parse(localStorage.getItem('meals') || '[]');
  arr.push({ c:+cal.value, p:+pro.value, cb:+carb.value, s:+sug.value });
  localStorage.setItem('meals', JSON.stringify(arr));
  renderMeals();
  updateProgress();
}

function renderMeals() {
  meals.innerHTML = '';
  (JSON.parse(localStorage.getItem('meals')) || []).forEach(m => {
    const li = document.createElement('li');
    li.textContent = `🔥 ${m.c} | P ${m.p} | C ${m.cb} | S ${m.s}`;
    meals.appendChild(li);
  });
}

function updateProgress() {
  const goals = JSON.parse(localStorage.getItem('goals') || '{}');
  const mealsArr = JSON.parse(localStorage.getItem('meals') || '[]');
  const total = mealsArr.reduce((a,m)=>({
    c:a.c+m.c,p:a.p+m.p,cb:a.cb+m.cb,s:a.s+m.s
  }),{c:0,p:0,cb:0,s:0});

  progress.innerHTML = `Calories ${total.c}/${goals.c||0}<br>
  Protein ${total.p}/${goals.p||0}<br>
  Carbs ${total.cb}/${goals.cb||0}<br>
  Sugar ${total.s}/${goals.s||0}`;
}

function renderWorkouts() {
  workoutList.innerHTML = '';
  const list = tier === 'premium'
    ? ['HIIT','Push/Pull','Leg Day','Cardio Burn']
    : tier === 'standard'
    ? ['Full Body','Cardio','Core']
    : ['Walking','Stretching'];

  list.forEach(w => {
    const li = document.createElement('li');
    li.textContent = w;
    workoutList.appendChild(li);
  });
}

renderTier();
updateProgress();
