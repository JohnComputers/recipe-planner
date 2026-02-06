let unlocked = false;


function go(id) {
if (!unlocked && id !== 'login') {
alert('Access locked. Purchase required.');
return;
}
document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
document.getElementById(id).classList.remove('hidden');
}


function signup() {
localStorage.setItem('account', JSON.stringify({ u: user.value, p: pass.value }));
alert('Account created');
}


function signin() {
const a = JSON.parse(localStorage.getItem('account'));
if (a && a.u === user.value && a.p === pass.value) {
unlocked = true;
go('dashboard');
} else alert('Invalid login');
}


function bypass() {
unlocked = true;
go('dashboard');
}


function saveGoals() {
const g = {
cal: +gCalories.value,
pro: +gProtein.value,
carb: +gCarbs.value,
sug: +gSugar.value
};
localStorage.setItem('goals', JSON.stringify(g));
updateProgress();
}


function addMeal() {
const m = {
cal:+cal.value, pro:+pro.value, carb:+carb.value, sug:+sug.value
};
const arr = JSON.parse(localStorage.getItem('meals')||'[]');
arr.push(m);
localStorage.setItem('meals', JSON.stringify(arr));
renderMeals();
updateProgress();
}


function renderMeals() {
meals.innerHTML = '';
const arr = JSON.parse(localStorage.getItem('meals')||'[]');
arr.forEach(m => {
const li = document.createElement('li');
li.textContent = `🔥 ${m.cal} | P ${m.pro}g | C ${m.carb}g | S ${m.sug}g`;
meals.appendChild(li);
});
}


function updateProgress() {
const g = JSON.parse(localStorage.getItem('goals'));
if (!g) return;
const arr = JSON.parse(localStorage.getItem('meals')||'[]');
const t = arr.reduce((a,m)=>({
cal:a.cal+m.cal, pro:a.pro+m.pro, carb:a.carb+m.carb, sug:a.sug+m.sug
}),{cal:0,pro:0,carb:0,sug:0});


progress.innerHTML = `
<p>Calories: ${t.cal}/${g.cal}</p>
<p>Protein: ${t.pro}/${g.pro}g</p>
<p>Carbs: ${t.carb}/${g.carb}g</p>
<p>Sugar: ${t.sug}/${g.sug}g</p>`;


renderWorkouts(t,g);
}


function renderWorkouts(t,g) {
workoutList.innerHTML='';
if (t.cal > g.cal) workoutList.innerHTML += '<li>🔥 Cardio burn session</li>';
if (t.pro < g.pro) workoutList.innerHTML += '<li>🏋️ Strength training</li>';
if (t.carb > g.carb) workoutList.innerHTML += '<li>🚶 Light activity walk</li>';
workoutList.innerHTML += '<li>🧘 Stretch & mobility</li>';
}


renderMeals();
updateProgress();
