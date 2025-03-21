async function getWorks() {
    try {
      const response = await fetch('http://localhost:5678/api/works');
      const data = await response.json();
      console.log("Works:", data);
      return data;
    } catch (error) {
      console.error("Erreur dans getWorks:", error);
    }
  }
  
  async function getCategories() {
    try {
      const response = await fetch('http://localhost:5678/api/categories');
      const data = await response.json();
      console.log("Categories:", data);
      return data;
    } catch (error) {
      console.error("Erreur dans getCategories:", error);
    }
  }
  
  function displayGallery(works) {
    const sectionGallery = document.getElementsByClassName("gallery")[0];
    sectionGallery.innerHTML = ""; // Vider la galerie avant d'ajouter les éléments
  
    for (let i = 0; i < works.length; i++){
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
  
  function displayFilters(categories, works){
    const filterContainer = document.getElementsByClassName("filters")[0];
    filterContainer.innerHTML = ""; // Vider le conteneur de filtres si besoin
  
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.addEventListener("click", () => {
      displayGallery(works);
    });
    filterContainer.appendChild(btnAll);
  
    categories.forEach(category => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.addEventListener("click", () => {
        const filteredWorks = works.filter(work => work.category.id === category.id);
        displayGallery(filteredWorks);
      });
      filterContainer.appendChild(button);
    });
  }
  
  async function init() {
    const works = await getWorks();
    const categories = await getCategories();
    if (works) {
      displayGallery(works);
    }
    if (categories && works) {
      displayFilters(categories, works);
    }
  }
  
  init();  