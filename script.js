const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

function fetchMealsByIngredient(ingredient) {
  return fetch(`${API_BASE_URL}/filter.php?i=${ingredient}`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch meals.");
      }
      return response.json();
    })
    .then((data) => {
      if (!data.meals) {
        throw new Error("No meals found.");
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
}

function fetchMealDetails(mealId) {
  return fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch meal details.");
      }
      return response.json();
    })
    .then((data) => {
      if (!data.meals) {
        throw new Error("No meals found.");
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
}

function attachEventListeners() {
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchMeals);
}

function searchMeals() {
  const ingredient = document.getElementById("ingredientInput").value;
  fetchMealsByIngredient(ingredient)
    .then((data) => {
      if (data.meals) {
        data.meals.forEach((meal) => {
          fetchMealDetails(meal.idMeal).then((detailData) => {
            if (detailData.meals) {
              displayMeal(detailData.meals[0]);
            }
          });
        });
      } else {
        // Handle case when no meals are found
      }
    })
    .catch((error) => {
      console.error(error);
      // Handle error in UI
    });
}

function displayMeal(meal) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML += `<div><h3>${meal.strMeal}</h3><img src="${meal.strMealThumb}" alt="Meal Image"><p>Category: ${meal.strCategory}</p></div>`;
}

document.addEventListener("DOMContentLoaded", attachEventListeners);
