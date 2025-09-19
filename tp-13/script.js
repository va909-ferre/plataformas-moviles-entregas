// Obtener referencias a los elementos del DOM
const recipesContainer = document.getElementById('recipes-container');
const loadingSpinner = document.getElementById('loadingSpinner');
const categoryButtons = document.querySelectorAll('.d-flex button');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const modalBody = document.querySelector('#recipeModal .modal-body');

// Función para mostrar/ocultar el spinner
const toggleSpinner = (show) => {
    loadingSpinner.classList.toggle('d-none', !show);
};

// Función para obtener y mostrar las recetas
const fetchRecipes = async (category) => {
    // URL de la API para listar por área
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${category}`;
    
    toggleSpinner(true); // Mostrar el spinner
    recipesContainer.innerHTML = ''; // Limpiar el contenedor anterior

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.meals) {
            data.meals.forEach(meal => {
                // Crear la tarjeta (card) para cada receta
                const card = document.createElement('div');
                card.classList.add('col');
                card.innerHTML = `
                    <div class="card h-100 shadow-sm">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <h5 class="card-title">${meal.strMeal}</h5>
                            <button class="btn btn-outline-primary mt-3" data-id="${meal.idMeal}">
                                Ver Receta
                            </button>
                        </div>
                    </div>
                `;
                recipesContainer.appendChild(card);
            });
        } else {
            recipesContainer.innerHTML = '<p class="text-center">No se encontraron recetas.</p>';
        }
    } catch (error) {
        console.error('Error al obtener las recetas:', error);
        recipesContainer.innerHTML = '<p class="text-center text-danger">Ocurrió un error al cargar las recetas. Inténtalo de nuevo más tarde.</p>';
    } finally {
        toggleSpinner(false); // Ocultar el spinner
    }
};

// Función para obtener y mostrar los detalles de la receta
const fetchRecipeDetails = async (id) => {
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    
    toggleSpinner(true);
    modalBody.innerHTML = ''; // Limpiar el modal

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const meal = data.meals[0];

        if (meal) {
            // Generar la lista de ingredientes
            let ingredientsList = '';
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient) {
                    ingredientsList += `<li>${ingredient} - ${measure}</li>`;
                } else {
                    break;
                }
            }
            
            // Llenar el modal con los detalles
            modalBody.innerHTML = `
                <div class="text-center mb-3">
                    <img src="${meal.strMealThumb}" class="img-fluid rounded" alt="${meal.strMeal}">
                </div>
                <h3 class="mb-3">${meal.strMeal}</h3>
                <p><strong>Categoría:</strong> ${meal.strCategory}</p>
                <p><strong>País:</strong> ${meal.strArea}</p>
                <h5>Ingredientes:</h5>
                <ul class="list-unstyled">${ingredientsList}</ul>
                <h5>Instrucciones:</h5>
                <p>${meal.strInstructions}</p>
            `;
            recipeModal.show(); // Mostrar el modal
        }
    } catch (error) {
        console.error('Error al obtener los detalles:', error);
        modalBody.innerHTML = '<p class="text-center text-danger">No se pudieron cargar los detalles de la receta.</p>';
    } finally {
        toggleSpinner(false);
    }
};

// Manejar los clics en los botones de categoría
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        fetchRecipes(category);
    });
});

// Manejar los clics en los botones "Ver Receta" de las tarjetas
recipesContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const recipeId = e.target.dataset.id;
        if (recipeId) {
            fetchRecipeDetails(recipeId);
        }
    }
});

// Cargar la primera categoría al inicio (ej. Comida China)
document.addEventListener('DOMContentLoaded', () => {
    fetchRecipes('Chinese');
});