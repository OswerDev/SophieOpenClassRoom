async function getWorks() {
  try {
    const response = await fetch('http://localhost:5678/api/works');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Works:", data);
    return data;
  } catch (error) {
    console.error("Erreur dans getWorks:", error);
    // Display a user-friendly message in the gallery
    const sectionGallery = document.getElementsByClassName("gallery")[0];
    sectionGallery.innerHTML = "<p>Impossible de charger les projets. Veuillez vérifier que le serveur backend est démarré.</p>";
    return null;
  }
}

async function getCategories() {
  try {
    const response = await fetch('http://localhost:5678/api/categories');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Categories:", data);
    return data;
  } catch (error) {
    console.error("Erreur dans getCategories:", error);
    // We'll handle this error in the init function
    return null;
  }
}

function displayGallery(works) {
  const sectionGallery = document.getElementsByClassName("gallery")[0];
  sectionGallery.innerHTML = "";

  if (!works || works.length === 0) {
    sectionGallery.innerHTML = "<p>Aucun projet à afficher.</p>";
    return;
  }

  for (let i = 0; i < works.length; i++) {
    const work = works[i];
    console.log("Affichage work:", work);

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    sectionGallery.appendChild(figure);
  }
}

function displayFilters(categories, works) {
  const filterContainer = document.getElementsByClassName("filters")[0];
  filterContainer.innerHTML = "";

  if (!categories || categories.length === 0 || !works) {
    // If we don't have categories or works, don't display filters
    return;
  }

  const btnAll = document.createElement("button");
  btnAll.textContent = "Tous";
  btnAll.classList.add("active");
  btnAll.addEventListener("click", () => {
    resetActiveButton();
    btnAll.classList.add("active");
    displayGallery(works);
  });
  filterContainer.appendChild(btnAll);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.addEventListener("click", () => {
      resetActiveButton();
      button.classList.add("active");
      const filteredWorks = works.filter(work => work.category.id === category.id);
      displayGallery(filteredWorks);
    });
    filterContainer.appendChild(button);
  });
}

function resetActiveButton() {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach(button => {
    button.classList.remove("active");
  });
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const isLoggedIn = token !== null;

  // Elements that need to be updated based on login status
  const editBar = document.getElementById('edit-bar');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const modifyBtn = document.getElementById('modify-btn');
  const modifyBtn1 = document.getElementById('modify-btn1');
  const filterContainer = document.querySelector('.filters');

  if (isLoggedIn) {
    // Show edit mode elements
    editBar.style.display = 'block';
    document.body.classList.add('edit-mode');
    loginLink.style.display = 'none';
    logoutLink.style.display = 'inline-block';
    modifyBtn.style.display = 'flex';
    modifyBtn1.style.display = 'flex';

    // Hide filter container
    if (filterContainer) {
      filterContainer.classList.add('hidden');
    }

    // Setup logout functionality
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.reload();
    });

    // Setup modify button to open modal
    modifyBtn.addEventListener('click', openGalleryModal);
    modifyBtn1.addEventListener('click', openGalleryModal);
  } else {
    // Hide edit mode elements
    editBar.style.display = 'none';
    document.body.classList.remove('edit-mode');
    loginLink.style.display = 'inline-block';
    logoutLink.style.display = 'none';
    modifyBtn.style.display = 'none';
    modifyBtn1.style.display = 'none';

    // Show filter container
    if (filterContainer) {
      filterContainer.classList.remove('hidden');
    }
  }
}

// Modal functions
let works = []; // Store works globally for modal use
let categories = []; // Store categories globally for form use

function openGalleryModal() {
  const modalContainer = document.getElementById('modal-container');
  const galleryModal = document.getElementById('gallery-modal');
  const addPhotoModal = document.getElementById('add-photo-modal');

  // Show container and gallery modal, hide add photo modal
  modalContainer.style.display = 'flex';
  galleryModal.classList.remove('hidden');
  addPhotoModal.classList.add('hidden');

  // Populate the modal gallery
  displayModalGallery();
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.style.display = 'none';

  // Reset form when closing the modal
  const addPhotoForm = document.getElementById('add-photo-form');
  if (addPhotoForm) {
    addPhotoForm.reset();
    document.getElementById('preview-image').style.display = 'none';
    document.getElementById('image-upload-container').classList.remove('has-image');
    document.getElementById('form-error').textContent = '';
    document.getElementById('validate-btn').classList.remove('active');
  }
}

function displayModalGallery() {
  const galleryContainer = document.getElementById('modal-gallery-container');
  galleryContainer.innerHTML = '';

  if (!works || works.length === 0) {
    galleryContainer.innerHTML = "<p>Aucun projet à afficher.</p>";
    return;
  }

  works.forEach(work => {
    const item = document.createElement('div');
    item.classList.add('modal-gallery-item');

    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteIcon = document.createElement('div');
    deleteIcon.classList.add('delete-icon');
    deleteIcon.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteIcon.setAttribute('data-id', work.id);
    deleteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteWork(work.id);
    });

    item.appendChild(img);
    item.appendChild(deleteIcon);
    galleryContainer.appendChild(item);
  });
}

async function deleteWork(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour supprimer un projet.');
      return;
    }

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Remove the work from our local array
    works = works.filter(work => work.id !== id);

    // Refresh both modal gallery and main gallery
    displayModalGallery();
    displayGallery(works);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression du projet.');
  }
}

function populateCategorySelect() {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '<option value="" disabled selected>Sélectionner une catégorie</option>';

  if (categories && categories.length > 0) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
}

function openAddPhotoModal() {
  const galleryModal = document.getElementById('gallery-modal');
  const addPhotoModal = document.getElementById('add-photo-modal');

  galleryModal.classList.add('hidden');
  addPhotoModal.classList.remove('hidden');

  // Populate the category select
  populateCategorySelect();
}

function initModalEvents() {
  // Close modal buttons
  document.getElementById('gallery-close-btn').addEventListener('click', closeModal);
  document.getElementById('add-photo-close-btn').addEventListener('click', closeModal);

  // Background click to close
  document.getElementById('modal-container').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-container')) {
      closeModal();
    }
  });

  // Add photo button
  document.getElementById('add-photo-btn').addEventListener('click', openAddPhotoModal);

  // Back button in add photo modal
  document.getElementById('add-photo-back-btn').addEventListener('click', () => {
    document.getElementById('add-photo-modal').classList.add('hidden');
    document.getElementById('gallery-modal').classList.remove('hidden');
  });

  // File input change event
  document.getElementById('file-input').addEventListener('change', handleFileSelect);

  // Form submit event
  document.getElementById('add-photo-form').addEventListener('submit', handleFormSubmit);

  // Form input events for validation
  document.getElementById('title').addEventListener('input', validateForm);
  document.getElementById('category').addEventListener('change', validateForm);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  const previewImage = document.getElementById('preview-image');
  const imageContainer = document.getElementById('image-upload-container');
  const formError = document.getElementById('form-error');

  if (file) {
    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      formError.textContent = 'L\'image est trop volumineuse. Taille maximale: 4 Mo.';
      event.target.value = '';
      return;
    }

    // Check file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      formError.textContent = 'Format d\'image invalide. Utilisez JPG ou PNG.';
      event.target.value = '';
      return;
    }

    formError.textContent = '';
    const reader = new FileReader();

    reader.onload = function(e) {
      previewImage.src = e.target.result;
      previewImage.style.display = 'block';
      imageContainer.classList.add('has-image');
      validateForm();
    };

    reader.readAsDataURL(file);
  } else {
    previewImage.style.display = 'none';
    imageContainer.classList.remove('has-image');
    validateForm();
  }
}

function validateForm() {
  const fileInput = document.getElementById('file-input');
  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const validateBtn = document.getElementById('validate-btn');
  
  // Check if all fields are valid
  const isFileSelected = fileInput.files.length > 0;
  const isTitleFilled = titleInput.value.trim() !== '';
  const isCategorySelected = categorySelect.value !== '' && categorySelect.value !== null;
  
  if (isFileSelected && isTitleFilled && isCategorySelected) {
    validateBtn.classList.add('active');
    validateBtn.disabled = false;
  } else {
    validateBtn.classList.remove('active');
    validateBtn.disabled = true;
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formError = document.getElementById('form-error');
  const fileInput = document.getElementById('file-input');
  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  
  // Check all fields are filled
  if (!fileInput.files[0] || !titleInput.value.trim() || !categorySelect.value) {
    formError.textContent = 'Tous les champs sont obligatoires.';
    return;
  }
  
  // Create FormData object
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('title', titleInput.value.trim());
  formData.append('category', parseInt(categorySelect.value));
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const newWork = await response.json();
    
    // Add the new work to our array
    works.push(newWork);
    
    // Refresh both the modal gallery and main gallery
    displayModalGallery();
    displayGallery(works);
    
    // Return to gallery modal
    document.getElementById('add-photo-modal').classList.add('hidden');
    document.getElementById('gallery-modal').classList.remove('hidden');
    
    // Reset form
    event.target.reset();
    document.getElementById('preview-image').style.display = 'none';
    document.getElementById('image-upload-container').classList.remove('has-image');
    document.getElementById('validate-btn').classList.remove('active');
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    formError.textContent = 'Erreur lors de l\'ajout du projet. Veuillez réessayer.';
  }
}

async function init() {
  // First check login status to setup the UI appropriately
  checkLoginStatus();
  
  // Load all works and categories
  works = await getWorks();
  categories = await getCategories();
  
  if (works) {
    displayGallery(works);
  }
  
  // Only display filters if user is not logged in
  const token = localStorage.getItem('token');
  if (!token && categories && works) {
    displayFilters(categories, works);
  } else if (token) {
    // If logged in, hide the filters
    const filterContainer = document.getElementsByClassName("filters")[0];
    filterContainer.classList.add('hidden');
    
    // Init modal events for logged-in users
    initModalEvents();
  } else {
    // If we couldn't load categories, display a message
    const filterContainer = document.getElementsByClassName("filters")[0];
    filterContainer.innerHTML = "<p>Impossible de charger les filtres. Veuillez vérifier que le serveur backend est démarré.</p>";
  }
}

init();