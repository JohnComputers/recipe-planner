let unlocked = false;


function showPage(id) {
if (!unlocked && id !== 'login') {
alert('Please purchase or use admin bypass');
return;
}
document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
document.getElementById(id).classList.remove('hidden');
}


function createAccount() {
const user = username.value;
const pass = password.value;
localStorage.setItem('account', JSON.stringify({ user, pass }));
alert('Account created');
}


function login() {
const acc = JSON.parse(localStorage.getItem('account'));
if (!acc) return alert('No account');
if (acc.user === username.value && acc.pass === password.value) {
unlocked = true;
showPage('dashboard');
} else alert('Wrong credentials');
}


function bypassPaywall() {
unlocked = true;
showPage('dashboard');
}


function saveGoals() {
const goals = {
calories: goalCalories.value,
protein: goalProtein.value,
carbs: goalCarbs.value,
sugar: goalSugar.value
};
localStorage.setItem('goals', JSON.stringify(goals));
alert('Goals saved');
}


function addMeal() {
const meal = {
calories: calories.value,
protein: protein.value,
carbs: carbs.value,
sugar: sugar.value
};
const meals = JSON.parse(localStorage.getItem('meals') || '[]');
meals.push(meal);
localStorage.setItem('meals', JSON.stringify(meals));
renderMeals();
}


function renderMeals() {
mealList.innerHTML = '';
const meals = JSON.parse(localStorage.getItem('meals') || '[]');
meals.forEach(m => {
const li = document.createElement('li');
li.textContent = `🔥 ${m.calories} | P ${m.protein}g | C ${m.carbs}g | S ${m.sugar}g`;
mealList.appendChild(li);
});
}


renderMeals();
