// Unlock system (local only)
const urlParams = new URLSearchParams(window.location.search);
const paid = localStorage.getItem("paid");

if (urlParams.get("success") === "true") {
  localStorage.setItem("paid", "true");
}

if (paid === "true") {
  document.getElementById("app").classList.remove("hidden");
}

function savePlan() {
  const meals = document.querySelectorAll("textarea");
  const plan = Array.from(meals).map(t => t.value);
  localStorage.setItem("mealPlan", JSON.stringify(plan));
  alert("Meal plan saved!");
}

// Load saved plan
const saved = JSON.parse(localStorage.getItem("mealPlan") || "[]");
document.querySelectorAll("textarea").forEach((t, i) => {
  if (saved[i]) t.value = saved[i];
});

