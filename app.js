/* ---------- LICENSE SYSTEM ---------- */
const params = new URLSearchParams(window.location.search);

if (params.get("license")) {
  localStorage.setItem("license", params.get("license"));
}

const license = localStorage.getItem("license");
if (license) {
  document.getElementById("app").classList.remove("hidden");
}

/* ---------- RECIPE DATA ---------- */
const recipes = {
  "Spaghetti": ["pasta", "tomato sauce", "garlic"],
  "Chicken Salad": ["chicken", "lettuce", "olive oil"],
  "Pancakes": ["flour", "eggs", "milk"],
  "Omelette": ["eggs", "cheese", "butter"],
  "Grilled Cheese": ["bread", "cheese", "butter"]
};

/* ---------- LOAD RECIPES ---------- */
const recipeSelect = document.getElementById("recipeSelect");
Object.keys(recipes).forEach(r => {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r;
  recipeSelect.appendChild(opt);
});

/* ---------- MEAL PLANNER ---------- */
function addRecipe() {
  const recipe = recipeSelect.value;
  const textareas = document.querySelectorAll("textarea");
  for (let t of textareas) {
    if (!t.value) {
      t.value = recipe;
      updateShoppingList();
      return;
    }
  }
  alert("All days filled!");
}

function savePlan() {
  const meals = Array.from(document.querySelectorAll("textarea")).map(t => t.value);
  localStorage.setItem("mealPlan", JSON.stringify(meals));
  updateShoppingList();
  alert("Saved!");
}

/* ---------- SHOPPING LIST ---------- */
function updateShoppingList() {
  if (!license) return;

  const meals = JSON.parse(localStorage.getItem("mealPlan") || "[]");
  const items = new Set();

  meals.forEach(m => {
    if (recipes[m]) {
      recipes[m].forEach(i => items.add(i));
    }
  });

  const ul = document.getElementById("shoppingList");
  ul.innerHTML = "";
  items.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });
}

/* ---------- LOAD SAVED ---------- */
const saved = JSON.parse(localStorage.getItem("mealPlan") || "[]");
document.querySelectorAll("textarea").forEach((t, i) => {
  if (saved[i]) t.value = saved[i];
});
updateShoppingList();
