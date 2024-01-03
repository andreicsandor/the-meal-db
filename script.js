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

function moveSearchToTop() {
  const container = document.getElementById("container");
    container.classList.add("top-position");

    const searchBar = document.getElementById("ingredientInput");
    searchBar.classList.add("narrow-bar");

    const logo = document.getElementById("logo");
    logo.style.display = "none";
}

function searchMeals() {
  showLoading();

  const ingredient = document.getElementById("ingredientInput").value;
  fetchMealsByIngredient(ingredient)
      .then((data) => {
          if (data.meals) {
              setTimeout(() => {
                  hideLoading();
                  document.getElementById("results").innerHTML = "";
                  moveSearchToTop();
                  setTimeout(() => {
                    data.meals.forEach((meal) => {
                        fetchMealDetails(meal.idMeal).then((detailData) => {
                            if (detailData.meals) {
                                displayMeal(detailData.meals[0]);
                            }
                        });
                    });
                  }, 400);
                  document.getElementById("results").style.display = "grid";
              }, 2000);
          } else {
            setTimeout(() => {
                hideLoading();
                document.getElementById("logo").style.display = "block";
                document.getElementById("ingredientInput").value = "";
            }, 2000);
        }
      })
      .catch((error) => {
          console.error(error);
          setTimeout(() => {
            hideLoading();
            document.getElementById("logo").style.display = "block";
            document.getElementById("ingredientInput").value = "";
        }, 2000);
      });
}

function showLoading() {
  document.getElementById("logo").style.display = "none";
  
  document.getElementById("ingredientInput").style.display = "none";
  document.getElementById("searchButton").style.display = "none";

  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";

  document.getElementById("ingredientInput").style.display = "block";
  document.getElementById("searchButton").style.display = "block";
}

function displayMeal(meal) {
  const resultsDiv = document.getElementById("results");

  const mealCard = `
      <div class="meal-card">
          <img src="${meal.strMealThumb}" alt="Meal Image" class="meal-image">
          <div class="card-body">
              <h5 class="card-title">${meal.strMeal}</h5>
              <p class="card-text">${meal.strCategory} Category</p>
          </div>
      </div>`;
  resultsDiv.innerHTML += mealCard;
}

document.addEventListener("DOMContentLoaded", attachEventListeners);
