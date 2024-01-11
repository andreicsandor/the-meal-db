const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

let currentMealId = null;

function getMealsByIngredient(ingredient) {
  return (
    fetch(`${API_BASE_URL}/filter.php?i=${ingredient}`, {
      method: "GET",
    })
      .then((response) => {
        // Throw error if receiving bad response from server
        if (!response.ok) {
          throw new Error("Failed to fetch meals.");
        }
        // Return server response as JSON
        return response.json();
      })
      .then((data) => {
        // Throw error if response does not contain data
        if (!data.meals) {
          throw new Error("No meals found.");
        }
        return data;
      })
      // Catch error
      .catch((error) => {
        throw error;
      })
  );
}

function getMealDetails(mealId) {
  return (
    fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`, {
      method: "GET",
    })
      .then((response) => {
        // Throw error if receiving bad response from server
        if (!response.ok) {
          throw new Error("Failed to fetch meal details.");
        }
        // Return server response as JSON
        return response.json();
      })
      .then((data) => {
        // Throw error if response does not contain data
        if (!data.meals) {
          throw new Error("No meals found.");
        }
        return data;
      })
      // Catch error
      .catch((error) => {
        throw error;
      })
  );
}

function attachEventListeners() {
  document.getElementById("submitSearchButton").addEventListener("click", searchMeals);
  document.getElementById('deleteButton').addEventListener('click', closeModalAndDeleteMeal);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
}

function moveSearchToTop() {
  // Move the container with the search bar & button to the top of the page
  const searchContainer = document.getElementById("searchContainer");
  searchContainer.classList.add("top-position");

  // Update the seach bar & button UI
  const searchBar = document.getElementById("searchInput");
  searchBar.classList.add("narrow-bar");

  // Remove the logo
  const logo = document.getElementById("logo");
  logo.style.display = "none";
}

function clearMessages() {
  const initialPageMessage = document.getElementById("initialPageMessage");
  const resultsPageMessage = document.getElementById("resultsPageMessage");
  initialPageMessage.style.display = "none";
  resultsPageMessage.style.display = "none";
}

function searchMeals() {
  // Check if the search bar & button are at the top of the page
  const isTopPosition = document
    .getElementById("searchContainer")
    .classList.contains("top-position");

  // Select the results div
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );

  // Select the message divs
  const initialPageMessage = document.getElementById("initialPageMessage");
  const resultsPageMessage = document.getElementById("resultsPageMessage");

  // Clear any previous messages
  clearMessages();

  if (!isTopPosition) {
    // Show the home loading transition if the search bar & button are not at the top of the page
    document.getElementById("logo").style.display = "none";
    document.getElementById("searchInput").style.display = "none";
    document.getElementById("submitSearchButton").style.display = "none";
    document.getElementById("initialPageMessage").style.display = "none";
    document.getElementById("initialPageSpinner").style.display = "block";
  } else {
    // Replace the inner HTML of the results div with the spinner animation
    const resultsDiv = document.getElementById("searchResultsContainer");
    resultsDiv.innerHTML =
      '<div class="results-page-spinner"><i class="fa fa-spinner fa-spin"></i></div>';
    resultsDiv.style.display = "flex";
    resultsDiv.style.justifyContent = "center";
    resultsDiv.style.alignItems = "center";
  }

  const ingredient = document.getElementById("searchInput").value;
  getMealsByIngredient(ingredient)
    .then((data) => {
      // Treat the case when there are meals
      if (data.meals) {
        // Remove the loading animation after 2 seconds
        setTimeout(() => {
          if (!isTopPosition) {
            document.getElementById("initialPageSpinner").style.display =
              "none";
            document.getElementById("searchInput").style.display = "block";
            document.getElementById("submitSearchButton").style.display =
              "block";
            moveSearchToTop();
          } else {
            searchResultsContainer.innerHTML = "";
          }

          // Fetch and add the meal cards after the search bar is moved to the top of the page
          data.meals.forEach((meal) => {
            // Fetch the meal category
            getMealDetails(meal.idMeal).then((detailData) => {
              if (detailData.meals) {
                appendMealToResults(detailData.meals[0]);
              }
            });
          });

          setTimeout(() => {
            searchResultsContainer.classList.add("animate-results");
            searchResultsContainer.style.display = "grid";
            setTimeout(() => {
              searchResultsContainer.classList.remove("animate-results");
            }, 550);
          }, 500);
        }, 2000);
      }
    })
    .catch((error) => {
      console.error(error);
      // Remove the loading animation after 2 seconds
      setTimeout(() => {
        if (!isTopPosition) {
          document.getElementById("initialPageSpinner").style.display = "none";
          document.getElementById("searchInput").style.display = "block";
          document.getElementById("submitSearchButton").style.display = "block";
          document.getElementById("logo").style.display = "block";
        }
        // Reset the search bar input
        document.getElementById("searchInput").value = "";
        // Clear the previous results & hide the results div
        searchResultsContainer.innerHTML = ``;
        searchResultsContainer.style.display = "none";

        // Display error message
        if (!isTopPosition) {
          initialPageMessage.innerHTML = "Upps, no meals found!";
          initialPageMessage.style.display = "block";
        } else {
          resultsPageMessage.innerHTML = "Upps, no meals found!";
          resultsPageMessage.style.display = "flex";
        }
      }, 2000);
    });
}

function appendMealToResults(meal) {
  // Select the results div
  const searchResultsContainer = document.getElementById("searchResultsContainer");

  // Create a new div element for the meal card
  const mealCardElement = document.createElement("div");
  mealCardElement.className = "meal-card";
  mealCardElement.setAttribute("data-mealid", meal.idMeal);
  mealCardElement.innerHTML = `
      <img src="${meal.strMealThumb}" alt="Meal Image" class="meal-image">
      <div class="card-body">
          <h5 class="card-title">${meal.strMeal}</h5>
          <p class="card-text">${meal.strCategory} Category</p>
      </div>`;

  // Append the meal card element to the results
  searchResultsContainer.appendChild(mealCardElement);

  // Attach event listener to the meal card
  mealCardElement.addEventListener('click', () => openModal(meal.idMeal));
}

function openModal(mealId) {
  currentMealId = mealId;
  
  getMealDetails(mealId).then(detailData => {
      if (detailData.meals) {
          const meal = detailData.meals[0];

          const formattedInstructions = meal.strInstructions.replace(/\r\n/g, '<br>');

          const modalContentContainer = document.getElementById('modalContentContainer');
          modalContentContainer.innerHTML = `
              <div class="modal-content">
                  <h5 class="modal-title">${meal.strMeal}</h5>
                  <h4 class="modal-subtitle">${meal.strArea} & ${meal.strCategory}</h4>
                  <p class="modal-text">${formattedInstructions}</p>
              </div>
              <img class="modal-image" src="${meal.strMealThumb}" alt="Meal Image">
          `;

          const modal = document.getElementById('mealDetailsModal');
          modal.style.display = 'block';
      }
  });
}

function closeModal() {
  document.getElementById('mealDetailsModal').style.display = 'none';
}

function deleteMeal() {
  if (currentMealId) {
    const mealCardToRemove = document.querySelector(`.meal-card[data-mealid="${currentMealId}"]`);
    if (mealCardToRemove) {
      mealCardToRemove.remove();
    }
  }
  currentMealId = null;
}

function closeModalAndDeleteMeal() {
  closeModal();
  deleteMeal();
}

// Attach event listeners when page is loaded
document.addEventListener("DOMContentLoaded", attachEventListeners);
