/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Función principal autoejecutable para cargar y mostrar los productos.
(async () => {
  const productListContainer = document.getElementById('product-list');
  const bestsellerSection = document.getElementById('bestseller-section');

  if (!productListContainer || !bestsellerSection) {
    console.error("Error táctico: Faltan contenedores esenciales ('product-list', 'bestseller-section') en el DOM.");
    return;
  }

  try {
    // Obtenemos el arsenal de productos desde el archivo JSON.
    const response = await fetch('products.json');
    if (!response.ok) {
      throw new Error(`Error de red: ${response.statusText}`);
    }
    const products = await response.json();

    // Desplegamos los filtros de categoría de forma dinámica.
    setupCategoryFilters(products);

    // Dividimos el batallón: los preferidos para la galería, y luego TODOS los demás para la lista principal.
    const bestsellerProducts = products.filter(p => p.isBestseller);
    const allOtherProducts = products; // Mostramos todos los productos en la lista principal

    // Desplegamos la sección de preferidos (bestsellers) si existen.
    if (bestsellerProducts.length > 0) {
        const galleryContainer = bestsellerSection.querySelector('.fade-gallery');
        bestsellerProducts.forEach(product => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            const card = createProductCard(product);
            slide.appendChild(card);
            galleryContainer.appendChild(slide);
        });
        initializeFadeGallery();
    } else {
        bestsellerSection.style.display = 'none';
    }

    // Desplegamos todos los productos (ofertas y regulares) en una lista unificada.
    productListContainer.innerHTML = '';
    allOtherProducts.forEach(product => {
      const card = createProductCard(product);
      productListContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Fallo catastrófico al cargar los productos:", error);
    productListContainer.innerHTML = `<p class="error-message">No se pudieron cargar los productos. Inténtalo de nuevo más tarde.</p>`;
    bestsellerSection.style.display = 'none';
  }
})();

/**
 * Forja la tarjeta de presentación de un producto.
 * @param {object} product - El objeto del producto con sus datos.
 * @returns {HTMLElement} El elemento de la tarjeta del producto listo para ser insertado en el DOM.
 */
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  // Asignamos la categoría como un data-attribute para el filtrado. "General" es el fallback.
  card.dataset.category = product.category || 'General';

  // Formateador para la moneda.
  const priceFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });

  const advantagesHtml = product.advantages.map(advantage => `<li>${advantage}</li>`).join('');
  
  // Insignias dinámicas
  let badgesHtml = '';
  if (product.isBestseller) {
      badgesHtml += '<div class="bestseller-badge">Más Vendido</div>';
  }
  if (product.isFavorite) {
    badgesHtml += '<div class="favorite-badge">Recomendado</div>';
  }
  if (product.offer) {
    badgesHtml += `<div class="offer-badge">${product.offer.offerText}</div>`;
  }
  
  // Lógica de precios para la guerra psicológica
  let priceHtml = '';
  const priceToFormat = product.offer ? product.offer.offerPrice : product.price;
  const priceClass = product.offer ? 'offer-price' : 'product-price';
  
  if (product.offer) {
    priceHtml = `
      <span class="original-price">${priceFormatter.format(product.price)}</span>
      <span class="${priceClass}">${priceFormatter.format(priceToFormat)}</span>
    `;
  } else {
    priceHtml = `<span class="${priceClass}">${priceFormatter.format(priceToFormat)}</span>`;
  }


  const whatsappNumber = "521234567890"; // Reemplazar con el número real
  const askLink = `https://wa.me/${whatsappNumber}?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20producto:%20${encodeURIComponent(product.name)}`;

  card.innerHTML = `
    ${badgesHtml}
    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <h2>${product.name}</h2>
      <p class="product-description">${product.description}</p>
      <ul class="product-advantages">
        ${advantagesHtml}
      </ul>
      <div class="product-footer">
        <div class="product-price-line">
            ${priceHtml}
        </div>
        <button class="buy-button">LO QUIERO! ❤️</button>
        <a href="${askLink}" class="product-ask-button" target="_blank">Preguntar sobre este producto</a>
      </div>
    </div>
  `;

  // El centinela inteligente: ejecuta la acción dictada por el JSON.
  const buyButton = card.querySelector('.buy-button');
  if (buyButton) {
    buyButton.addEventListener('click', () => {
      const action = product.buyAction;

      // Si la acción está definida en el JSON, la ejecutamos.
      if (action && action.type) {
        switch (action.type) {
          case 'whatsapp':
            // El forjador de mensajes: toma la plantilla y la convierte en un mensaje real.
            const messageTemplate = action.message || "¡Hola! Quisiera comprar el producto: {PRODUCT_NAME}.";
            const finalMessage = messageTemplate.replace('{PRODUCT_NAME}', product.name);
            const whatsappMessage = encodeURIComponent(finalMessage);
            window.location.href = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
            break;
          case 'alert':
            alert(action.message);
            break;
          default:
            // Acción por defecto si el tipo no es reconocido
            console.warn(`Acción desconocida: ${action.type}`);
            alert(`Has seleccionado "${product.name}".`);
        }
      } else {
        // Fallback: Si no hay buyAction, usamos un alert genérico.
        alert(`¡Excelente elección! Has añadido "${product.name}" a tu canasta.`);
      }
    });
  }

  return card;
}

/**
 * Inicializa la galería hipnótica de productos más vendidos.
 */
function initializeFadeGallery() {
    const gallery = document.querySelector('.fade-gallery');
    if (!gallery) return;

    const slides = Array.from(gallery.children) as HTMLElement[];
    if (slides.length <= 1) {
        if (slides.length === 1) {
            slides[0].classList.add('active');
        }
        return;
    }

    let currentIndex = 0;

    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 5000);
}


/**
 * Construye y activa el panel de control de filtros por categoría.
 * @param {Array} products - La lista completa de productos.
 */
function setupCategoryFilters(products) {
  const filterContainer = document.getElementById('category-filters');
  if (!filterContainer) return;

  // Extraemos las categorías únicas, eliminando valores nulos o vacíos.
  // FIX: Explicitly specify the type of Set to `string` to resolve type inference issues where 'category' was being inferred as 'unknown'.
  const categories = [...new Set<string>(products.map(p => p.category).filter(Boolean))];
  
  // Creamos el botón "Todos", el comandante supremo.
  const allButton = document.createElement('button');
  allButton.className = 'filter-button active';
  allButton.textContent = 'Todos';
  allButton.dataset.filter = 'all';
  filterContainer.appendChild(allButton);

  // Creamos un batallón de botones para cada categoría.
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.textContent = category;
    button.dataset.filter = category;
    filterContainer.appendChild(button);
  });

  // Delegamos el poder de filtrar al contenedor.
  filterContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'BUTTON') return;

    // Actualizamos el estado activo del comando.
    filterContainer.querySelector('.active').classList.remove('active');
    target.classList.add('active');
    
    // Ejecutamos la maniobra de filtrado.
    filterProductViews(target.dataset.filter);
  });
}

/**
 * Ejecuta la operación de filtrado visual de productos.
 * @param {string} category - La categoría seleccionada, o 'all' para mostrar todos.
 */
function filterProductViews(category) {
  // Seleccionamos solo las unidades de producto en la lista principal. El santuario es inmune.
  const allProductCards = document.querySelectorAll('#product-list .product-card') as NodeListOf<HTMLElement>;

  allProductCards.forEach(card => {
    const cardCategory = card.dataset.category;
    // La lógica de combate: mostrar si coincide con el filtro o si el comando es "todos".
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'flex'; // Usamos flex para mantener la consistencia del layout.
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * Activa la funcionalidad del acordeón para las Preguntas Frecuentes.
 */
function initializeFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector<HTMLElement>('.faq-answer');

        if (questionButton) {
            questionButton.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Cerrar todos los demás items activos
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector<HTMLElement>('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = null;
                        }
                    }
                });

                // Abrir o cerrar el item actual
                if (answer) {
                    if (isActive) {
                        item.classList.remove('active');
                        answer.style.maxHeight = null;
                    } else {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    }
                }
            });
        }
    });
}

/**
 * Despliega animaciones al entrar en el viewport.
 */
function setupScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    if (!elementsToAnimate.length) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // La animación solo se ejecuta una vez.
            }
        });
    }, {
        threshold: 0.1 // El elemento debe ser visible al 10% para activar la animación.
    });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}


// Inicializar funcionalidades una vez que el DOM esté cargado.
document.addEventListener('DOMContentLoaded', () => {
    initializeFaqAccordion();
    setupScrollAnimations();
});
