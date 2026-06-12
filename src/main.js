import './css/styles.css';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://goit.global', 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

let isOfflineMode = false;

document.addEventListener('DOMContentLoaded', () => {
  const categoriesContainer = document.getElementById('categories-container');
  const petsGrid = document.getElementById('pets-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const modal = document.getElementById('pet-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');

  let currentCategory = 'all';
  let localAnimalsData = [];
  let displayedCount = 0;

  function getLimitPerPage() {
    return window.innerWidth >= 1024 ? 9 : 8;
  }

  function renderCategories() {
    if (!categoriesContainer) return;
    
    const mockCats = [
      { id: 'all', name: 'Всі' },
      { id: 'dogs', name: 'Собаки' },
      { id: 'cats', name: 'Коти' },
      { id: 'rabbits', name: 'Кролики' },
      { id: 'rodents', name: 'Гризуни' },
      { id: 'birds', name: 'Птахи' },
      { id: 'special', name: 'Тварини з особливими потребами' },
      { id: 'urgent', name: 'Терміново шукають дім' }
    ];

    categoriesContainer.innerHTML = '';

    mockCats.forEach(cat => {
      const btn = document.createElement('button');
      btn.classList.add('filter-btn');
      if (cat.id === 'all') btn.classList.add('active');
      btn.setAttribute('data-category', cat.id);
      btn.textContent = cat.name;
      categoriesContainer.appendChild(btn);
    });

    initFilterListeners();
  }

  function fetchAnimals(category = 'all', append = false) {
    if (!append) {
      if (petsGrid) petsGrid.innerHTML = '';
      displayedCount = 0;
      
      // База данных с исправленными апострофами через экранирование \'
      const realPetsData = [
        { 
          id: 1, name: 'Джек', type: 'Собака', category: 'dogs', 
          tagsText: 'Собаки', age: '4 роки', gender: 'хлопчик', 
          description: 'Дуже активний, любить грати з м\'ячиком. Потребує досвідченого господаря.',
          image: 'https://unsplash.com'
        },
        { 
          id: 2, name: 'Мія', type: 'Кіт', category: 'cats', 
          tagsText: 'Коти', age: '2 роки', gender: 'дівчинка', 
          description: 'Дуже ласкава та ніжна, але на початку трохи сором\'язлива з незнайомцями.',
          image: 'https://unsplash.com'
        },
        { 
          id: 3, name: 'Найда', type: 'Собака', category: 'special', 
          tagsText: 'Собаки &bull; Тварини з особливими потребами &bull; Терміново шукають дім', age: '5 років', gender: 'дівчинка', 
          description: 'Після аварії ми тепер шукаємо їй люблячий дім та комплексний догляд. Дуже люб\'язна душа.',
          image: 'https://unsplash.com'
        },
        { 
          id: 4, name: 'Сніжок', type: 'Кролик', category: 'rabbits', 
          tagsText: 'Кролики', age: '1 рік', gender: 'хлопчик', 
          description: 'Приручений до лотка, любить, коли його гладять по спинці.',
          image: 'https://unsplash.com'
        },
        { 
          id: 5, name: 'Кеша', type: 'Птах', category: 'birds', 
          tagsText: 'Птахи', age: '2 роки', gender: 'хлопчик', 
          description: 'Знає та говорить «Привіт» та «Я хороший». Любить дивитися у дзеркало.',
          image: 'https://unsplash.com'
        },
        { 
          id: 6, name: 'Мурчик', type: 'Кіт', category: 'urgent', 
          tagsText: 'Коти &bull; Терміново шукають дім', age: '3 роки', gender: 'хлопчик', 
          description: 'Дуже спокійний та ласкавий. Ідеальний компаньйон для тихих вечорів.',
          image: 'https://unsplash.com'
        },
        { 
          id: 7, name: 'Хома', type: 'Гризун', category: 'rodents', 
          tagsText: 'Гризуни', age: '6 місяців', gender: 'хлопчик', 
          description: 'Дуже активний вночі. Полюбляє бігати у великому колесі та ховатися у тирсу.',
          image: 'https://unsplash.com'
        },
        { 
          id: 8, name: 'Перлинка', type: 'Кіт', category: 'special', 
          tagsText: 'Коти &bull; Тварини з особливими потребами', age: '4 місяці', gender: 'дівчинка', 
          description: 'Втратила око внаслідок інфекції, але це абсолютно не заважає їй бути активною.',
          image: 'https://unsplash.com'
        },
        { 
          id: 9, name: 'Стюарт', type: 'Гризун/Миша', category: 'urgent', 
          tagsText: 'Гризуни &bull; Тварини з особливими потребами &bull; Терміново шукають дім', age: '2,5 роки', gender: 'хлопчик', 
          description: 'Дуже розумний, знає потрібні лабіринти. Отримав легку травму лапки.',
          image: 'https://unsplash.com'
        }
      ];

      const extendedData = [];
      for (let i = 0; i < 27; i++) {
        const basePet = realPetsData[i % realPetsData.length];
        extendedData.push({
          ...basePet,
          id: i + 1,
          name: i >= realPetsData.length ? `${basePet.name} II` : basePet.name
        });
      }

      if (category === 'all') {
        localAnimalsData = extendedData;
      } else if (category === 'special') {
        localAnimalsData = extendedData.filter(a => a.category === 'special' || a.tagsText.includes('особливими'));
      } else if (category === 'urgent') {
        localAnimalsData = extendedData.filter(a => a.category === 'urgent' || a.tagsText.includes('Терміново'));
      } else {
        localAnimalsData = extendedData.filter(a => a.category === category);
      }
    }

    const limit = getLimitPerPage();
    const nextPortion = localAnimalsData.slice(displayedCount, displayedCount + limit);
    
    nextPortion.forEach(animal => {
      if (petsGrid) petsGrid.appendChild(createAnimalCard(animal));
    });

    displayedCount += nextPortion.length;
    
    if (loadMoreBtn) {
      loadMoreBtn.disabled = displayedCount >= localAnimalsData.length;
    }
  }

  function createAnimalCard(animal) {
    const card = document.createElement('div');
    card.classList.add('pet-card');

    card.innerHTML = `
      <div class="pet-image-wrapper">
        <img src="${animal.image}" alt="${animal.name}" loading="lazy">
      </div>
      <div class="pet-info-block">
        <div class="pet-card-top-type">${animal.type}</div>
        <h3 class="pet-name">${animal.name}</h3>
        <div class="pet-tags-text">${animal.tagsText}</div>
        
        <div class="pet-meta-tags">
          <span><strong>Вік:</strong> ${animal.age}</span>
          <span><strong>Стать:</strong> ${animal.gender}</span>
        </div>
        
        <p class="pet-desc">${animal.description}</p>
        <button class="btn-more" data-id="${animal.id}">Дізнатись більше</button>
      </div>
    `;

    card.querySelector('.btn-more').addEventListener('click', () => openModal(animal));
    return card;
  }

  function initFilterListeners() {
    if (!categoriesContainer) return;
    categoriesContainer.addEventListener('click', (e) => {
      const targetButton = e.target.closest('.filter-btn');
      if (!targetButton) return;

      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      targetButton.classList.add('active');

      currentCategory = targetButton.getAttribute('data-category');
      fetchAnimals(currentCategory, false);
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      fetchAnimals(currentCategory, true);
    });
  }

  function openModal(animal) {
    if (!modalBody || !modal) return;
    modalBody.innerHTML = `
      <h2 style="font-size: 2rem; margin-bottom: 5px;">${animal.name}</h2>
      <p style="color: var(--color-primary); font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">${animal.type}</p>
      <img src="${animal.image}" alt="${animal.name}" style="width:100%; max-height:320px; object-fit:cover; border-radius:12px; margin-bottom:15px;">
      <p style="margin-bottom: 6px;"><strong>Вік:</strong> ${animal.age}</p>
      <p style="margin-bottom: 6px;"><strong>Стать:</strong> ${animal.gender}</p>
      <p style="margin-top: 15px; line-height: 1.6; color: #333;"><strong>Детальний опис:</strong><br>${animal.description} Вони дуже чекають на знайомство з вами в притулку. Приходьте в гості!</p>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => { 
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  renderCategories();
  fetchAnimals('all', false);
});