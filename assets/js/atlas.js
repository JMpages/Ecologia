document.addEventListener('DOMContentLoaded', function() {
    // Inicializar mapa de Panamá
    const map = L.map('panama-map').setView([8.5, -80.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marcadores de ecosistemas marinos de Panamá
    const markers = [
        {
            coords: [9.34, -82.25],
            title: 'Arrecifes de Bocas del Toro',
            description: 'Más de 200 especies de coral, hogar de tortugas marinas y delfines.',
            icon: '🏝️'
        },
        {
            coords: [9.15, -79.85],
            title: 'San Blas - Arrecifes Únicos',
            description: 'Arrecifes de coral únicos con especies endémicas.',
            icon: '🪸'
        },
        {
            coords: [8.92, -79.53],
            title: 'Canal de Panamá',
            description: 'Zona crítica con alto tráfico marítimo y contaminación.',
            icon: '🚢'
        },
        {
            coords: [7.85, -80.35],
            title: 'Manglares de Darién',
            description: 'Extensos manglares que protegen la costa y albergan biodiversidad.',
            icon: '🌿'
        },
        {
            coords: [8.45, -78.15],
            title: 'Golfo de Chiriquí',
            description: 'Zona de pesca sostenible con manglares protegidos.',
            icon: '🐟'
        }
    ];

    markers.forEach(marker => {
        L.marker(marker.coords)
            .addTo(map)
            .bindPopup(`<div class="text-center"><h3 class="font-bold text-lg">${marker.icon} ${marker.title}</h3><p class="text-sm mt-2">${marker.description}</p></div>`);
    });

    // Gráfico de Estadísticas de Panamá
    const panamaStatsCtx = document.getElementById('panamaStats').getContext('2d');
    new Chart(panamaStatsCtx, {
        type: 'bar',
        data: {
            labels: ['Arrecifes de Coral', 'Manglares', 'Especies Marinas', 'Zonas Protegidas'],
            datasets: [{
                label: 'Hectáreas / Especies',
                data: [15000, 25000, 1200, 85000],
                backgroundColor: '#38bdf8',
                borderColor: '#0f172a',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Gráfico de Áreas Protegidas
    const protectedAreasCtx = document.getElementById('protectedAreas').getContext('2d');
    new Chart(protectedAreasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Parques Nacionales', 'Refugios de Vida Silvestre', 'Zonas Marinas Protegidas', 'Áreas Privadas'],
            datasets: [{
                data: [45, 30, 20, 5],
                backgroundColor: ['#fb7185', '#38bdf8', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
});