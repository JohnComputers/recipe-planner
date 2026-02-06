let tier = localStorage.getItem('tier') || 'free';

function go(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function signup() {
  localStorage.setItem('acc', JSON.stringify({ u: user.value, p: pass.value }));
  alert('Account created');
}

function signin() {
  const a = JSON.parse(localStorage.getItem('acc'));
  if (a && a.u === user.value && a.p === pass.value) {
    go('dashboard');
    renderTier();
  } else alert('Login failed');
}

function unlock() {
  const code = license.value.trim();
  if (code === 'BASIC-1111') tier = 'basic';
  else if (code === 'STD-2222') tier = 'standard';
  else if (code === 'PRO-3333') tier = 'premium';
  else return alert('Invalid code');

  localStorage.setItem('tier', tier);
  renderTier();
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
}

function addMeal() {
  if (tier === 'free') return alert('Upgrade required');

  const mealsArr = JSON.parse(localStorage.getItem('meals') || '[]');
  mealsArr.push({
    c: +cal.value,
    p: +pro.value,
    cb: +carb.value,
    s: +sug.value
  });
  localStorage.setItem('meals', JSON.stringify(mealsArr));
  renderMeals();
}

function renderMeals() {
  meals.innerHTML = '';
  (JSON.parse(localStorage.getItem('meals')) || []).forEach(m => {
    const li = document.createElement('li');
    li.textContent = `🔥 ${m.c} | P ${m.p} | C ${m.cb} | S ${m.s}`;
    meals.appendChild(li);
  });
}

renderMeals();
