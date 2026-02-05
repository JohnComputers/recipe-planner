/* ---------- LICENSE + RECEIPT ---------- */
const params = new URLSearchParams(window.location.search);

if (params.get("license")) {
  localStorage.setItem("license", params.get("license"));
  localStorage.setItem("receipt", JSON.stringify({
    license: params.get("license"),
    date: new Date().toLocaleString(),
    site: "Meal Planner Pro"
  }));
  window.history.replaceState({}, document.title, "/recipe-planner/");
}

const license = localStorage.getItem("license");

const ranks = { basic: 1, standard: 2, premium: 3 };
const has = lvl => ranks[license] >= ranks[lvl];

/* ---------- SHOW APP ---------- */
if (license) {
  document.getElementById("app").classList.remove("hidden");
}

/* ---------- RECIPE PACKS ---------- */
const recipePacks = {
  basic: {
    "Pancakes": ["flour", "eggs", "milk"],
    "Omelette": ["eggs", "cheese", "butter"]
  },
  standard: {
    "Spaghetti": ["pasta", "tomato sauce", "garlic"],
    "Chicken Salad": ["chicken", "lettuce", "olive oil"]
  },
  premium: {
    "Steak Dinner": ["steak", "potatoes", "butter"],
    "Salmon Bowl": ["salmon", "rice", "avocado"]
  }
};

/* ---------- LOAD RECIPES ---------- */
const recipeSelect = document.getElementById("recipeSelect");

function loadRecipes() {
  recipeSelect.innerHTML = "";
  Object.entries(recipePacks).forEach(([lvl, pack]) => {
    if (has(lvl)) {
      Object.keys(pack).forEach(r => {
        const opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        recipeSelect.appendChild(opt);
      });
    }
  });

  if (!has("standard")) {
    document.getElementById("upgradePrompt").textContent =
      "Upgrade to Standard to unlock more recipes & shopping lists.";
  }
}

loadRecipes();

/* ---------- MEAL PLANNER ---------- */
function addRecipe() {
  const r = recipeSelect.value;
  const slots = document.querySelectorAll("textarea");
  for (let s of slots) {
    if (!s.value) {
      s.value = r;
      updateShoppingList();
      return;
    }
  }
}

function savePlan() {
  const meals = [...document.querySelectorAll("textarea")].map(t => t.value);
  localStorage.setItem("mealPlan", JSON.stringify(meals));
  updateShoppingList();
  alert("Saved!");
}

/* ---------- SHOPPING LIST ---------- */
function updateShoppingList() {
  const ul = document.getElementById("shoppingList");
  ul.innerHTML = "";

  if (!has("standard")) {
    ul.innerHTML = "<li>Upgrade to Standard to unlock shopping lists</li>";
    return;
  }

  const meals = JSON.parse(localStorage.getItem("mealPlan") || "[]");
  const items = new Set();

  meals.forEach(m => {
    Object.values(recipePacks).forEach(pack => {
      if (pack[m]) pack[m].forEach(i => items.add(i));
    });
  });

  items.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });
}

/* ---------- RECEIPT DISPLAY ---------- */
const receipt = localStorage.getItem("receipt");
if (receipt) {
  document.getElementById("receipt").textContent =
    JSON.stringify(JSON.parse(receipt), null, 2);
}

/* ---------- LOAD SAVED PLAN ---------- */
const saved = JSON.parse(localStorage.getItem("mealPlan") || "[]");
document.querySelectorAll("textarea").forEach((t, i) => {
  if (saved[i]) t.value = saved[i];
});
updateShoppingList();
//
