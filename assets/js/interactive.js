// Scripts Interactivos para el Proyecto de Conciencia Ambiental Marina

// Función para aplicar degradación visual
function applyDegradation(type) {
    const body = document.body;
    body.classList.add('degraded');
    // Aquí se podría agregar lógica específica por tipo
    console.log('Degradación aplicada:', type);
}

// Función para aplicar restauración visual
function applyRestoration(type) {
    const body = document.body;
    body.classList.remove('degraded');
    body.classList.add('restored');
    setTimeout(() => body.classList.remove('restored'), 2000);
    console.log('Restauración aplicada:', type);
}

// Función para reiniciar entorno
function resetEnvironment() {
    const body = document.body;
    body.classList.remove('degraded', 'restored');
}

// Función para toggle acciones
function toggleAction(checkbox) {
    if (checkbox.checked) {
        checkbox.parentElement.classList.add('bg-primary/20');
    } else {
        checkbox.parentElement.classList.remove('bg-primary/20');
    }
}

// Función para mostrar tips
function showTip(actionId) {
    const tips = {
        action1: "Usa bolsas reutilizables y evita productos empaquetados en plástico.",
        action2: "Únete a eventos locales de limpieza o organiza uno en tu comunidad.",
        action3: "Elige pescaderías certificadas por sostenibilidad marina.",
        action4: "Comparte información en redes sociales y habla con amigos y familia.",
        action5: "Opta por productos biodegradables y de origen natural.",
        action6: "Firma peticiones y vota por candidatos pro-ambientales."
    };
    alert(tips[actionId]);
}

// Función para seleccionar compromiso
function selectCommitment(type) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 5000);
    console.log('Compromiso seleccionado:', type);
}

// Inicializar gráficos con Chart.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Chart.js está disponible
    if (typeof Chart !== 'undefined') {
        // Gráfico de Cadena Trófica
        const cadenaCanvas = document.getElementById('cadenaChart');
        if (cadenaCanvas) {
            const cadenaCtx = cadenaCanvas.getContext('2d');
            new Chart(cadenaCtx, {
                type: 'bar',
                data: {
                    labels: ['Fitoplancton', 'Zooplancton', 'Peces Pequeños', 'Peces Grandes', 'Mamíferos'],
                    datasets: [{
                        label: 'Población Afectada (%)',
                        data: [20, 35, 50, 70, 85],
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
                        y: { beginAtZero: true, max: 100 }
                    }
                }
            });
        }

        // Gráfico de Ecosistemas Críticos
        const ecosistemasCanvas = document.getElementById('ecosistemasChart');
        if (ecosistemasCanvas) {
            const ecosistemasCtx = ecosistemasCanvas.getContext('2d');
            new Chart(ecosistemasCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Arrecifes de Coral', 'Manglares', 'Praderas Marinas', 'Bosques de Kelp'],
                    datasets: [{
                        data: [40, 25, 20, 15],
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
        }

        // Gráfico de Impacto Humano
        const impactoCanvas = document.getElementById('impactoChart');
        if (impactoCanvas) {
            const impactoCtx = impactoCanvas.getContext('2d');
            new Chart(impactoCtx, {
                type: 'line',
                data: {
                    labels: ['2010', '2015', '2020', '2025'],
                    datasets: [{
                        label: 'Microplásticos en Dieta Humana (partículas/kg)',
                        data: [100, 200, 350, 500],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        tension: 0.4
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
        }
    }
});
