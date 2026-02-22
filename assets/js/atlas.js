document.addEventListener('DOMContentLoaded', function() {
    // --- 1. CONFIGURACIÓN DE DATOS Y CATEGORÍAS ---

    // Categorías para los marcadores, con su ícono y color asociado
    const categories = {
        arrecife: {
            name: 'Arrecifes',
            icon: 'waves', // Material Symbols icon name
            color: '#fb7185' // text-coral-glow
        },
        manglar: {
            name: 'Manglares',
            icon: 'forest', // Material Symbols icon name
            color: '#10b981' // text-kelp-forest
        },
        impacto: {
            name: 'Zonas de Impacto',
            icon: 'warning', // Material Symbols icon name
            color: '#f59e0b' // text-yellow-500
        },
        pesca: {
            name: 'Zonas de Pesca',
            icon: 'phishing',
            color: '#38bdf8' // text-primary
        }
    };

    // Datos de los marcadores de ecosistemas marinos de Panamá
    const markersData = [
        {
            coords: [9.34, -82.25],
            title: 'Archipiélago de Bocas del Toro',
            description: 'Hogar del 95% de las especies de coral del Caribe panameño. Zona de alta biodiversidad.',
            category: 'arrecife',
            risk: 'Alto',
            cause: 'Turismo masivo no regulado, sedimentación y aguas residuales.',
            image: 'https://sanblascatamaran.com/wp-content/uploads/2024/04/Bocas-del-Toro-sailing.webp'
        },
        {
            coords: [9.55, -78.95],
            title: 'Comarca Guna Yala',
            description: 'Extenso sistema arrecifal gestionado por la comunidad Guna. Barrera natural crítica.',
            category: 'arrecife',
            risk: 'Medio',
            cause: 'Aumento del nivel del mar y blanqueamiento de corales.',
            image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweq_OL22mWgXoJr09Dg-uGtwlxAiltyrj3zaQIgFOqQHXuMZ5mCGJnc6iC1c-xZrMkzfGG-CY_loSlzTSZe4mfTpp_p2V4SDAP2-8d4LjmNvQrfUvltEkfrKxhUd1Py7dPNt0gI5tQ=w408-h725-k-no'
        },
        {
            coords: [7.50, -81.75],
            title: 'Parque Nacional Coiba',
            description: 'Patrimonio de la Humanidad (UNESCO). Vital para la migración de especies pelágicas.',
            category: 'arrecife',
            risk: 'Bajo',
            cause: 'Pesca ilegal esporádica y presión climática global.',
            image: 'https://coiba.gob.pa/wp-content/uploads/2018/10/coiba_noticia_12_oct_2018_00.jpg'
        },
        {
            coords: [9.02, -79.45],
            title: 'Humedal Bahía de Panamá',
            description: 'Sitio Ramsar crítico para aves migratorias, adyacente a la ciudad.',
            category: 'impacto',
            risk: 'Crítico',
            cause: 'Desarrollo urbano descontrolado y contaminación directa.',
            image: 'https://static.tvn-2.com/clip/6a9af1e0-80f2-4422-97eb-4074a0053341_16-9-aspect-ratio_default_0.webp'
        },
        {
            coords: [8.40, -78.15],
            title: 'Golfo de San Miguel (Darién)',
            description: 'Estuario más grande de Panamá, con extensos manglares.',
            category: 'manglar',
            risk: 'Medio',
            cause: 'Tala ilegal de mangle y sedimentación agrícola.',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEJQWqYeXm9kdcmtRj4QmWO41eklxIfxQe6Q&s'
        },
        {
            coords: [8.40, -79.00],
            title: 'Archipiélago de las Perlas',
            description: 'Zona de afloramiento rica en nutrientes. Importante para la pesca artesanal, turismo y avistamiento de cetáceos.',
            category: 'pesca',
            risk: 'Medio',
            cause: 'Sobrepesca artesanal y desarrollo turístico en islas.',
            image: 'https://www.emprendedorestrella.com/content/20170613115225-1.jpg'
        },
        {
            coords: [7.75, -81.10],
            title: 'Golfo de Montijo',
            description: 'Humedal de Importancia Internacional (Ramsar).',
            category: 'manglar',
            risk: 'Alto',
            cause: 'Actividad agrícola intensiva y uso de agroquímicos.',
            image: 'https://www.pacificadvent.com/wp-content/uploads/Eduardo-Estrada-Racheria-Island-01-scaled.jpg.webp'
        },
        {
            coords: [7.62, -80.00],
            title: 'RVS Isla Iguana',
            description: 'Refugio de vida silvestre con importantes arrecifes coralinos.',
            category: 'arrecife',
            risk: 'Alto',
            cause: 'Blanqueamiento por El Niño y turismo de alto impacto.',
            image: 'https://milpolleras.com/wp-content/uploads/2023/11/isla-iguana.jpg'
        },
        {
            coords: [9.40, -79.86],
            title: 'Punta Galeta (Colón)',
            description: 'Laboratorio natural de manglares y arrecifes del Caribe.',
            category: 'manglar',
            risk: 'Alto',
            cause: 'Expansión portuaria y riesgo de derrames de petróleo.',
            image: 'https://pbs.twimg.com/media/D2CpHGYXQAAe7oE.jpg'
        },
        {
            coords: [6.50, -81.50],
            title: 'Cordillera de Coiba',
            description: 'Área Marina Protegida de gran extensión en el Pacífico.',
            category: 'pesca',
            risk: 'Bajo',
            cause: 'Pesca industrial ilegal en zonas limítrofes (IUU).',
            image: 'https://imgs.mongabay.com/wp-content/uploads/sites/25/2020/09/09225911/Planeta-Vivo-2020-Foto-Antonio-Busiello-WWF-US-768x512.jpg'
        }
    ];

    // --- 2. INICIALIZACIÓN DEL MAPA ---

    // Capas base de mapas
    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2', {
        maxZoom: 20
    });

    const baseLayers = {
        "Satélite": googleHybrid, // Google Maps Híbrido (Satélite + Calles/Etiquetas estilo Mapa)
        "Estándar": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        })
    };

    // Detectar móvil para ajustar zoom inicial
    const isMobile = window.innerWidth < 1024;
    // Inicializar el mapa
    const map = L.map('panama-map', {
        center: [8.5, -80.0],
        zoom: isMobile ? 6 : 7,
        layers: [baseLayers.Estándar], // Capa por defecto: Mapa Estándar
        attributionControl: false // Ocultar texto de atribución (Copyright)
    });

    // --- 3. CREACIÓN DE MARCADORES Y CAPAS ---

    const layerGroups = {};
    const markerBounds = [];

    markersData.forEach(markerInfo => {
        const categoryKey = markerInfo.category;
        const categoryConfig = categories[categoryKey];

        // Crear el grupo de capa si no existe
        if (!layerGroups[categoryKey]) {
            layerGroups[categoryKey] = L.layerGroup();
        }

        // Crear ícono personalizado con Material Symbols
        const customIcon = L.divIcon({
            html: `<div class="map-marker-icon" style="background-color: ${categoryConfig.color};">
                       <span class="material-symbols-outlined">${categoryConfig.icon}</span>
                   </div>`,
            className: 'custom-leaflet-icon', // Clase para estilos base (sin borde, etc.)
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        // Crear el marcador
        const marker = L.marker(markerInfo.coords, { icon: customIcon });

        // Determinar colores de riesgo
        let riskColorClass = 'text-green-400';
        let riskBgClass = 'bg-green-400';
        
        if (markerInfo.risk === 'Crítico') {
            riskColorClass = 'text-red-500';
            riskBgClass = 'bg-red-500';
        } else if (markerInfo.risk === 'Alto') {
            riskColorClass = 'text-orange-400';
            riskBgClass = 'bg-orange-400';
        } else if (markerInfo.risk === 'Medio') {
            riskColorClass = 'text-yellow-400';
            riskBgClass = 'bg-yellow-400';
        }

        // Crear el contenido del popup
        const popupContent = `
            <div class="map-popup-content min-w-[200px]">
                <!-- Imagen compacta y clicable -->
                <div class="w-full h-12 mb-2 rounded-lg overflow-hidden relative group cursor-pointer" onclick="window.openImageModal('${markerInfo.image}', '${markerInfo.title}')">
                    <img src="${markerInfo.image}" alt="${markerInfo.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span class="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all">zoom_in</span>
                    </div>
                </div>
                <h3 class="font-bold text-sm flex items-center gap-2 leading-tight" style="color: ${categoryConfig.color};">
                    <span class="material-symbols-outlined text-base">${categoryConfig.icon}</span>
                    ${markerInfo.title}
                </h3>
                <p class="text-xs mt-1 text-slate-300 line-clamp-3 leading-snug">${markerInfo.description}</p>
                
                <div class="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${riskBgClass} animate-pulse"></span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Riesgo:</span>
                        <span class="text-[10px] font-bold ${riskColorClass}">${markerInfo.risk}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 leading-tight">
                        <strong class="text-slate-200">Causa:</strong> ${markerInfo.cause}
                    </p>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 260 });
        
        // Añadir marcador al grupo de capa correspondiente
        marker.addTo(layerGroups[categoryKey]);

        // Guardar coordenadas para ajustar el zoom
        markerBounds.push(markerInfo.coords);
    });

    // --- 4. AÑADIR CONTROLES AL MAPA ---

    // Añadir todas las capas de marcadores al mapa por defecto
    Object.values(layerGroups).forEach(layer => layer.addTo(map));

    // --- 5. CONTROLES PERSONALIZADOS ESTILO GOOGLE MAPS ---

    // A. Control de Pantalla Completa (Top Right)
    const FullscreenControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'gmaps-fullscreen-control leaflet-bar');
            container.innerHTML = '<span class="material-symbols-outlined">fullscreen</span>';
            container.title = "Pantalla completa";
            
            container.onclick = function() {
                const mapContainer = document.getElementById('panama-map');
                if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen().catch(err => {
                        console.error(`Error al intentar pantalla completa: ${err.message}`);
                    });
                    container.innerHTML = '<span class="material-symbols-outlined">fullscreen_exit</span>';
                } else {
                    document.exitFullscreen();
                    container.innerHTML = '<span class="material-symbols-outlined">fullscreen</span>';
                }
            };

            // Escuchar cambios de pantalla completa (por si se sale con ESC)
            document.addEventListener('fullscreenchange', () => {
                const modal = document.getElementById('map-image-modal');
                const mapContainer = document.getElementById('panama-map');

                if (!document.fullscreenElement) {
                    container.innerHTML = '<span class="material-symbols-outlined">fullscreen</span>';
                    // Forzar redibujado del mapa al salir
                    setTimeout(() => { map.invalidateSize(); }, 100);
                    
                    // Si salimos de pantalla completa y el modal estaba en el mapa, devolverlo al body
                    if (modal && modal.parentElement === mapContainer) {
                        document.body.appendChild(modal);
                    }
                } else {
                    // Forzar redibujado al entrar
                    setTimeout(() => { map.invalidateSize(); }, 100);
                    
                    // Si entramos a pantalla completa y el modal está abierto, moverlo al mapa
                    if (modal && !modal.classList.contains('opacity-0')) {
                        mapContainer.appendChild(modal);
                    }
                }
            });

            return container;
        }
    });
    map.addControl(new FullscreenControl());

    // B. Control de Capas y Filtros (Barra Horizontal Inferior)
    const HorizontalControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'map-controls-container');
            L.DomEvent.disableClickPropagation(container); // Evitar que clicks en el panel muevan el mapa

            // 1. Botón de Tipo de Mapa (Satélite / Estándar)
            const mapTypeBtn = document.createElement('div');
            mapTypeBtn.className = 'map-type-btn';
            // Imagen por defecto (Previsualización de Satélite porque estamos en Mapa Estándar)
            mapTypeBtn.style.backgroundImage = "url('https://mt1.google.com/vt/lyrs=y&x=38&y=62&z=7')";
            mapTypeBtn.innerHTML = '<div class="map-type-label">Satélite</div>';
            
            let currentBaseLayer = 'Estándar';

            mapTypeBtn.onclick = function() {
                if (currentBaseLayer === 'Estándar') {
                    // Cambiar a Satélite
                    map.removeLayer(baseLayers['Estándar']);
                    map.addLayer(baseLayers['Satélite']);
                    currentBaseLayer = 'Satélite';
                    
                    // Actualizar botón para mostrar Mapa
                    mapTypeBtn.style.backgroundImage = "url('https://a.tile.openstreetmap.org/7/38/62.png')";
                    mapTypeBtn.querySelector('.map-type-label').textContent = 'Mapa';
                } else {
                    // Cambiar a Estándar
                    map.removeLayer(baseLayers['Satélite']);
                    map.addLayer(baseLayers['Estándar']);
                    currentBaseLayer = 'Estándar';
                    
                    // Actualizar botón para mostrar Satélite
                    mapTypeBtn.style.backgroundImage = "url('https://mt1.google.com/vt/lyrs=y&x=38&y=62&z=7')";
                    mapTypeBtn.querySelector('.map-type-label').textContent = 'Satélite';
                }
            };
            container.appendChild(mapTypeBtn);

            // 2. Lista Horizontal de Filtros (Chips)
            const filtersScroll = document.createElement('div');
            filtersScroll.className = 'map-filters-scroll';

            for (const key in categories) {
                const cat = categories[key];
                const chip = document.createElement('div');
                chip.className = 'filter-chip active'; // Activo por defecto
                chip.dataset.category = key;
                
                // Restaurar colores de fondo
                chip.style.backgroundColor = cat.color;
                chip.style.color = '#0f172a';

                chip.innerHTML = `
                    <span class="material-symbols-outlined">${cat.icon}</span>
                    <span class="filter-name">${cat.name}</span>
                `;

                chip.onclick = function() {
                    const isActive = chip.classList.contains('active');
                    if (isActive) {
                        // Desactivar
                        chip.classList.remove('active');
                        chip.style.backgroundColor = 'transparent';
                        chip.style.color = '#94a3b8';
                        map.removeLayer(layerGroups[key]);
                    } else {
                        // Activar
                        chip.classList.add('active');
                        chip.style.backgroundColor = cat.color;
                        chip.style.color = '#0f172a';
                        map.addLayer(layerGroups[key]);
                    }
                };
                filtersScroll.appendChild(chip);
            }
            container.appendChild(filtersScroll);

            return container;
        },
        onRemove: function(map) {},
    });
    map.addControl(new HorizontalControl());

    // Ajustar el mapa para que todos los marcadores sean visibles
    if (markerBounds.length > 0) {
        const padding = isMobile ? [20, 20] : [50, 50];
        map.fitBounds(markerBounds, { padding: padding });
    }

    // Gráfico de Estadísticas de Panamá
    const panamaStatsCtx = document.getElementById('panamaStats').getContext('2d');
    
    // Configuración de ejes dinámica (se invierte si es móvil)
    const valueAxisConfig = {
        beginAtZero: true,
        suggestedMax: 1600,
        ticks: {
            color: '#e2e8f0',
            font: { size: isMobile ? 10 : 12, weight: '600' },
            callback: function(value) {
                return Number(value).toLocaleString();
            }
        },
        grid: { color: 'rgba(148, 163, 184, 0.2)' }
    };
    
    const categoryAxisConfig = {
        ticks: {
            color: '#e2e8f0',
            font: { size: isMobile ? 10 : 12, weight: '600' }
        },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
    };

    new Chart(panamaStatsCtx, {
        type: 'bar',
        data: {
            labels: ['Arrecifes (km²)', 'Manglares (miles ha)', 'Peces Marinos (spp)', 'Protección Marina (%)'],
            datasets: [{
                label: 'Datos Oficiales',
                data: [808, 177, 1500, 54.3], // Datos aprox: 770+38 km2 arrecifes, 177k ha manglares, 1500 spp peces, 54.3% protección
                backgroundColor: ['#fb7185', '#10b981', '#38bdf8', '#f59e0b'],
                borderColor: '#0f172a',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el CSS controle la altura
            indexAxis: isMobile ? 'y' : 'x', // Barras horizontales en móvil para leer mejor
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: isMobile ? valueAxisConfig : categoryAxisConfig,
                y: isMobile ? categoryAxisConfig : valueAxisConfig
            }
        }
    });

    // Gráfico de Áreas Protegidas
    const protectedAreasCtx = document.getElementById('protectedAreas').getContext('2d');
    new Chart(protectedAreasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Océano Protegido (54.3%)', 'Sin Protección (45.7%)'],
            datasets: [{
                data: [54.3, 45.7],
                backgroundColor: ['#10b981', '#334155'],
                borderColor: '#0f172a',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el CSS controle la altura
            cutout: '70%', // Dona más fina y elegante
            plugins: {
                legend: {
                    position: 'bottom', // Siempre abajo para ahorrar espacio horizontal
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 12, weight: '600' },
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Sección interactiva: Datos curiosos
    const curiosityGrid = document.querySelector('.curiosity-grid');
    const curiosityButtons = document.querySelectorAll('.curiosity-btn');
    const curiosityAnswers = document.querySelectorAll('.curiosity-answer');

    const closeAllCuriosities = () => {
        curiosityAnswers.forEach((item) => {
            item.classList.add('hidden');
            item.hidden = true;
        });
        curiosityButtons.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    };

    closeAllCuriosities();

    if (curiosityGrid) {
        curiosityGrid.addEventListener('click', (event) => {
            const button = event.target.closest('.curiosity-btn');
            if (!button) return;

            const targetId = button.dataset.target;
            const answer = document.getElementById(targetId);
            if (!answer) return;

            const wasClosed = answer.hidden;
            closeAllCuriosities();

            if (wasClosed) {
                answer.classList.remove('hidden');
                answer.hidden = false;
                button.setAttribute('aria-expanded', 'true');
            }
        });
    }

    // Sección interactiva: Consecuencias Ambientales (Desplegables)
    const consequencesGrid = document.querySelector('.consequences-grid');
    
    if (consequencesGrid) {
        consequencesGrid.addEventListener('click', (event) => {
            const button = event.target.closest('.consequence-btn');
            if (!button) return;

            const article = button.closest('article');
            const content = article.querySelector('.consequence-content');
            const chevron = button.querySelector('.chevron');

            const isOpen = !content.classList.contains('hidden');

            // Lógica de Acordeón: Cerrar todos los demás antes de abrir el actual
            if (!isOpen) {
                const allArticles = consequencesGrid.querySelectorAll('article');
                allArticles.forEach(otherArticle => {
                    if (otherArticle !== article) {
                        const otherContent = otherArticle.querySelector('.consequence-content');
                        const otherChevron = otherArticle.querySelector('.chevron');
                        const otherButton = otherArticle.querySelector('.consequence-btn');
                        
                        if (!otherContent.classList.contains('hidden')) {
                            otherContent.classList.add('hidden');
                            otherChevron.classList.remove('rotate-180');
                            otherButton.classList.remove('bg-white/5');
                        }
                    }
                });
            }

            if (isOpen) {
                content.classList.add('hidden');
                chevron.classList.remove('rotate-180');
                button.classList.remove('bg-white/5');
            } else {
                content.classList.remove('hidden');
                chevron.classList.add('rotate-180');
                button.classList.add('bg-white/5');
            }
        });
    }

    // Sección interactiva: Ejemplos visuales
    const visualFilterButtons = document.querySelectorAll('.visual-filter-btn');
    const visualCarousel = document.getElementById('visual-carousel');
    const visualPrev = document.getElementById('visual-prev');
    const visualNext = document.getElementById('visual-next');

    // Intercala tarjetas de contaminación y saludables en el orden visual.
    if (visualCarousel) {
        const contaminationCards = Array.from(visualCarousel.querySelectorAll('.visual-card[data-group="contaminacion"]'));
        const healthyCards = Array.from(visualCarousel.querySelectorAll('.visual-card[data-group="saludable"]'));
        const maxLength = Math.max(contaminationCards.length, healthyCards.length);

        for (let i = 0; i < maxLength; i++) {
            if (contaminationCards[i]) visualCarousel.appendChild(contaminationCards[i]);
            if (healthyCards[i]) visualCarousel.appendChild(healthyCards[i]);
        }
    }
    
    // Clonar elementos para efecto infinito
    if (visualCarousel) {
        const originalCards = Array.from(visualCarousel.children);
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            visualCarousel.appendChild(clone);
        });
    }

    visualFilterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            visualFilterButtons.forEach((btn) => btn.classList.remove('bg-white/10'));
            button.classList.add('bg-white/10');

            // Seleccionar todas las tarjetas (incluyendo clones)
            const allCards = visualCarousel.querySelectorAll('.visual-card');
            allCards.forEach((card) => {
                const group = card.dataset.group;
                const show = filter === 'todos' || filter === group;
                card.classList.toggle('hidden', !show);
            });
            
            // Resetear scroll al filtrar para evitar espacios vacíos
            visualCarousel.scrollLeft = 0;
        });
    });

    if (visualCarousel && visualPrev && visualNext) {
        const scrollStep = 420;

        // Función auxiliar para mover con flechas
        const handleArrowClick = (direction) => {
            // 1. Pausar auto-scroll temporalmente
            if (visualCarousel.dataset.isAutoScrolling !== 'false') {
                visualCarousel.dataset.tempPause = 'true';
            }
            
            // 2. Usar scroll suave para las flechas
            visualCarousel.style.scrollBehavior = 'smooth';
            visualCarousel.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });

            // 3. Restaurar comportamiento después de la animación (aprox 500ms)
            setTimeout(() => {
                visualCarousel.dataset.tempPause = 'false';
                visualCarousel.style.scrollBehavior = 'auto'; // Volver a auto para el loop infinito
            }, 500);
        };

        visualPrev.addEventListener('click', () => {
            handleArrowClick(-1);
        });

        visualNext.addEventListener('click', () => {
            handleArrowClick(1);
        });
    }

    // Funcionalidad de Scroll Infinito + Arrastre
    if (visualCarousel) {
        let isAutoScrolling = true;
        const speed = 0.5; // Velocidad media constante

        // Asegurar que el comportamiento por defecto sea instantáneo para evitar conflictos
        visualCarousel.style.scrollBehavior = 'auto';

        // Bucle de animación infinita
        function animateCarousel() {
            // Solo mover automáticamente si no estamos interactuando y no hay pausa temporal
            if (isAutoScrolling && visualCarousel.dataset.tempPause !== 'true') {
                visualCarousel.scrollLeft += speed;
            }

            // Reset infinito: Si llegamos a la mitad (final del set original), volvemos al inicio
            // Se ejecuta SIEMPRE para mantener la ilusión de infinito, incluso arrastrando
            if (visualCarousel.scrollLeft >= (visualCarousel.scrollWidth / 2)) {
                visualCarousel.scrollLeft = 0;
            } else if (visualCarousel.scrollLeft <= 0) {
                // Permitir scroll infinito hacia la izquierda también
                visualCarousel.scrollLeft = (visualCarousel.scrollWidth / 2) - 1;
            }

            requestAnimationFrame(animateCarousel);
        }
        // Iniciar animación
        requestAnimationFrame(animateCarousel);

        // Pausar al mantener presionado (PC y Móvil)
        const pauseScroll = () => { isAutoScrolling = false; };
        const resumeScroll = () => { isAutoScrolling = true; };

        visualCarousel.addEventListener('mousedown', pauseScroll);
        visualCarousel.addEventListener('touchstart', pauseScroll, { passive: true });

        visualCarousel.addEventListener('mouseup', resumeScroll);
        visualCarousel.addEventListener('mouseleave', resumeScroll);
        visualCarousel.addEventListener('touchend', resumeScroll);
    }

    // --- 6. MODAL DE IMAGEN (Lightbox) ---
    // Inyectar el modal en el DOM si no existe
    if (!document.getElementById('map-image-modal')) {
        const modalHTML = `
            <div id="map-image-modal" class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300" onclick="window.closeImageModal(event)">
                <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                    <button onclick="window.closeImageModal(event)" class="absolute -top-12 right-0 md:-right-12 text-white hover:text-primary transition-colors p-2 bg-black/50 rounded-full md:bg-transparent">
                        <span class="material-symbols-outlined text-3xl md:text-4xl">close</span>
                    </button>
                    <img id="map-modal-img" src="" alt="" class="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10 object-contain bg-black">
                    <h3 id="map-modal-title" class="text-white text-lg md:text-xl font-bold mt-4 text-center drop-shadow-md"></h3>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    window.openImageModal = function(imageSrc, title) {
        if (window.isDraggingCarousel) return; // Evitar abrir si se está arrastrando

        const modal = document.getElementById('map-image-modal');
        const img = document.getElementById('map-modal-img');
        const titleEl = document.getElementById('map-modal-title');
        const mapContainer = document.getElementById('panama-map');
        
        if(modal && img && titleEl) {
            // Lógica de Pantalla Completa: Mover el modal al contenedor correcto
            if (document.fullscreenElement === mapContainer) {
                mapContainer.appendChild(modal);
            } else {
                document.body.appendChild(modal);
            }

            img.src = imageSrc;
            titleEl.textContent = title;
            modal.classList.remove('opacity-0', 'pointer-events-none');
            document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
        }
    };

    window.closeImageModal = function(event) {
        if (event) {
            const isBackground = event.target.id === 'map-image-modal';
            const isCloseBtn = event.target.closest('button');
            if (!isBackground && !isCloseBtn) return;
        }
        
        const modal = document.getElementById('map-image-modal');
        if(modal) {
            modal.classList.add('opacity-0', 'pointer-events-none');
            document.body.style.overflow = '';
        }
    };
});
