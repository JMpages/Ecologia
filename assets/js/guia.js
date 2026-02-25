function toggleAction(checkbox) {
    const card = checkbox.closest('.mission-card');
    if (!card) return;

    if (checkbox.checked) {
        // Estilos de Misión Completada
        card.classList.remove('border-white/10');
        card.classList.add('border-green-400', 'bg-green-500/10', 'shadow-[0_0_30px_rgba(74,222,128,0.2)]');
        
        // Icono animado
        const icon = card.querySelector('.mission-icon');
        if(icon) icon.classList.add('text-green-400', 'scale-110', 'bg-green-500/20');
    } else {
        // Estilos de Misión Pendiente
        card.classList.add('border-white/10');
        card.classList.remove('border-green-400', 'bg-green-500/10', 'shadow-[0_0_30px_rgba(74,222,128,0.2)]');
        
        const icon = card.querySelector('.mission-icon');
        if(icon) icon.classList.remove('text-green-400', 'scale-110', 'bg-green-500/20');
    }

    updateProgress();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const total = checkboxes.length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

    // Actualizar Círculo
    const circle = document.getElementById('progress-circle');
    const text = document.getElementById('progress-text');
    
    if (circle) circle.style.strokeDasharray = `${percentage}, 100`;
    if (text) text.textContent = `${percentage}%`;

    // Actualizar Rango
    updateRank(percentage);

    // Mostrar Certificado si 100%
    const certificate = document.getElementById('certificate-section');
    if (certificate) {
        if (percentage === 100) {
            certificate.classList.remove('hidden');
            if (certificate.dataset.shown !== 'true') {
                certificate.dataset.shown = 'true';
                setTimeout(() => {
                    certificate.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        } else {
            certificate.classList.add('hidden');
            certificate.dataset.shown = 'false';
        }
    }
}

function updateRank(percentage) {
    const rankTitle = document.getElementById('rank-title');
    const rankIcon = document.getElementById('rank-icon');
    const rankDesc = document.getElementById('rank-desc');

    if (!rankTitle || !rankIcon) return;

    let rank = { title: "Turista Costero", icon: "waves", desc: "Comienza tu viaje cuidando la orilla.", color: "text-slate-400" };

    if (percentage > 0 && percentage <= 25) rank = { title: "Aprendiz de Marea", icon: "surfing", desc: "Estás aprendiendo a fluir con la naturaleza.", color: "text-cyan-400" };
    else if (percentage > 25 && percentage <= 50) rank = { title: "Explorador de Arrecifes", icon: "scuba_diving", desc: "Tu impacto empieza a profundizar.", color: "text-blue-400" };
    else if (percentage > 50 && percentage <= 80) rank = { title: "Defensor del Océano", icon: "shield", desc: "Proteges activamente la vida marina.", color: "text-purple-400" };
    else if (percentage > 80 && percentage < 100) rank = { title: "Guardián de los Mares", icon: "trident", desc: "Un líder en la conservación.", color: "text-orange-400" };
    else if (percentage === 100) rank = { title: "Leyenda Azul", icon: "workspace_premium", desc: "El océano te reconoce como su aliado total.", color: "text-green-400" };

    rankTitle.textContent = rank.title;
    rankTitle.className = `text-3xl font-black uppercase tracking-tighter ${rank.color} drop-shadow-md transition-all duration-300`;
    rankIcon.textContent = rank.icon;
    rankIcon.className = `material-symbols-outlined text-6xl mb-2 ${rank.color} animate-bounce`;
    if(rankDesc) rankDesc.textContent = rank.desc;
}

function buildTipText(actionId) {
    const tips = {
        action1: "Tip: Usa una botella reutilizable y lleva tus propias bolsas de tela. ¡Puedes reducir hasta 500 plásticos al año por persona!",
        action2: "Tip: Organiza limpiezas mensuales en tu comunidad. Un solo evento puede recoger hasta 100 kg de basura.",
        action3: "Tip: Reducir el uso de agua en casa disminuye aguas residuales y la contaminación que llega a ríos y océanos.",
        action4: "Tip: Crea contenido educativo en redes. Comparte infografías sobre contaminación marina.",
        action5: "Tip: No alimentes fauna marina; altera su comportamiento natural, la cadena alimenticia y puede causar enfermedades.",
        action6: "Tip: Involúcrate en consultas públicas y procesos comunitarios sobre proyectos que afecten el mar.",
        action7: "Tip: Coloca recipientes de separación en un punto visible de tu casa para volver el hábito automático.",
        action8: "Tip: Llevar tu termo todos los días evita decenas de envases desechables cada mes.",
        action9: "Tip: Reporta con foto, ubicación y fecha para que las autoridades puedan actuar más rápido.",
        action10: "Tip: Una charla corta con ejemplos locales genera más impacto que solo compartir datos generales."
    };
    return tips[actionId] || "Tip: Cada pequeña acción sostenida en el tiempo genera un gran impacto en el océano.";
}

function showTip(actionId) {
    const checkbox = document.getElementById(actionId);
    if (!checkbox) return;

    const card = checkbox.closest('.mission-card');
    if (!card) return;

    // Verificar si ya existe el tip en esta tarjeta
    const existingTip = card.querySelector('.guide-tip');

    // Limpiar tips previos (de otras tarjetas o de esta misma si vamos a togglear)
    document.querySelectorAll('.guide-tip').forEach(t => t.remove());

    // Si existía en esta tarjeta, significa que el usuario quiere cerrarlo.
    if (existingTip) return;

    // Crear el contenedor del tip
    const tip = document.createElement('div');
    tip.className = 'guide-tip mt-4 pt-4 border-t border-white/10';
    
    const fullText = buildTipText(actionId);
    const cleanText = fullText.startsWith('Tip:') ? fullText.replace('Tip:', '').trim() : fullText;

    tip.innerHTML = `
        <div class="bg-blue-950/50 rounded-xl p-4 border border-cyan-500/30 flex gap-3 items-start shadow-lg">
            <span class="material-symbols-outlined text-yellow-400 text-xl shrink-0 mt-0.5">lightbulb</span>
            <div>
                <h4 class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">Consejo</h4>
                <p class="text-slate-200 text-sm leading-relaxed">${cleanText}</p>
            </div>
        </div>
    `;

    card.appendChild(tip);
}

// --- PRUEBA DE CONOCIMIENTO (Quiz Inicial) ---

const knowledgeQuestions = [
    // Dificultad Baja
    {
        id: 1,
        type: 'multiple',
        difficulty: 'baja',
        q: "¿Cuál es el principal objetivo de reducir el uso de plásticos de un solo uso?",
        options: [
            "Que se vean más bonitas las playas",
            "Evitar que terminen en el océano y dañen la fauna",
            "Ahorrar dinero en la compra de bolsas",
            "Hacer que la basura pese menos"
        ],
        correct: 1,
        feedback: "Exacto. Los plásticos de un solo uso son una de las mayores fuentes de contaminación marina y tardan cientos de años en degradarse."
    },
    {
        id: 2,
        type: 'boolean',
        difficulty: 'baja',
        q: "Los manglares ayudan a proteger las costas de la erosión y las tormentas.",
        options: ["Cierto", "Falso"],
        correct: 0,
        feedback: "¡Correcto! Las raíces de los manglares estabilizan el suelo y actúan como barrera natural contra el oleaje."
    },
    {
        id: 3,
        type: 'multiple',
        difficulty: 'baja',
        q: "¿Qué acción simple puedes hacer en casa para ayudar al océano?",
        options: [
            "Tirar el aceite por el fregadero",
            "Separar los residuos para reciclar",
            "Dejar el grifo abierto",
            "Usar más productos desechables"
        ],
        correct: 1,
        feedback: "Muy bien. El reciclaje evita que los residuos lleguen a los vertederos y, eventualmente, al mar."
    },
    // Dificultad Media
    {
        id: 4,
        type: 'multiple',
        difficulty: 'media',
        q: "¿Qué efecto tiene el exceso de nutrientes (aguas residuales/fertilizantes) en el mar?",
        options: [
            "Alimenta a los peces y crecen más",
            "Provoca eutrofización y zonas muertas sin oxígeno",
            "Hace que el agua sea más cristalina",
            "No tiene ningún efecto importante"
        ],
        correct: 1,
        feedback: "Correcto. El exceso de nutrientes causa un crecimiento explosivo de algas que consumen todo el oxígeno, matando a otras especies."
    },
    {
        id: 5,
        type: 'boolean',
        difficulty: 'media',
        q: "El blanqueamiento de corales es un proceso natural y saludable para el arrecife.",
        options: ["Cierto", "Falso"],
        correct: 1,
        feedback: "¡Es Falso! El blanqueamiento es una respuesta al estrés (como el calor) donde el coral expulsa las algas que le dan vida, pudiendo morir."
    },
    // Dificultad Alta
    {
        id: 6,
        type: 'multiple',
        difficulty: 'alta',
        q: "¿Qué porcentaje aproximado del oxígeno que respiramos proviene del océano?",
        options: ["10%", "30%", "Más del 50%", "90%"],
        correct: 2,
        feedback: "Así es. El fitoplancton en el océano produce más de la mitad del oxígeno de la Tierra, más que todos los bosques juntos."
    },
    {
        id: 7,
        type: 'match', // Pareo simplificado: Seleccionar la pareja correcta
        difficulty: 'alta',
        q: "Selecciona la relación CORRECTA entre amenaza y consecuencia:",
        options: [
            "Ruido submarino -> Blanqueamiento de corales",
            "Redes fantasma -> Atrapamiento de fauna",
            "Petróleo -> Eutrofización",
            "Aguas residuales -> Asfixia física inmediata"
        ],
        correct: 1,
        feedback: "Correcto. Las redes abandonadas (fantasmas) siguen pescando y matando animales indefinidamente."
    }
];

let currentQuizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

window.startKnowledgeTest = function() {
    const invite = document.getElementById('knowledge-test-invite');
    const container = document.getElementById('knowledge-quiz-container');
    
    invite.classList.add('hidden');
    container.classList.remove('hidden');
    
    // Preparar preguntas: Aleatorizar y seleccionar 7
    currentQuizQuestions = shuffleArray([...knowledgeQuestions]).slice(0, 7);
    currentQuizIndex = 0;
    quizScore = 0;
    
    renderQuizQuestion();
};

function renderQuizQuestion() {
    const qData = currentQuizQuestions[currentQuizIndex];
    const qEl = document.getElementById('quiz-question');
    const optsEl = document.getElementById('quiz-options');
    const progressEl = document.getElementById('quiz-progress');
    const scoreEl = document.getElementById('quiz-score');
    const feedbackEl = document.getElementById('quiz-feedback');
    
    // Reset UI
    feedbackEl.classList.add('translate-y-full'); // Ocultar deslizando hacia abajo
    optsEl.innerHTML = '';
    optsEl.classList.remove('pointer-events-none'); // Habilitar clicks
    
    // Update Info
    progressEl.textContent = `Pregunta ${currentQuizIndex + 1} de ${currentQuizQuestions.length}`;
    scoreEl.textContent = quizScore;
    qEl.textContent = qData.q;
    
    // Aleatorizar opciones (guardando el índice correcto original)
    let optionsWithIndices = qData.options.map((opt, i) => ({ text: opt, originalIndex: i }));
    optionsWithIndices = shuffleArray(optionsWithIndices);
    
    // Render Options
    optionsWithIndices.forEach((optObj, idx) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-3 md:p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 text-slate-200 font-medium text-base md:text-lg group flex items-center gap-3 h-full';
        
        // Letra A, B, C...
        const letter = String.fromCharCode(65 + idx);
        
        btn.innerHTML = `
            <span class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors">${letter}</span>
            <span>${optObj.text}</span>
        `;
        
        btn.onclick = () => handleQuizAnswer(optObj.originalIndex, qData, btn, optionsWithIndices);
        optsEl.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, qData, btnElement, currentOptions) {
    const isCorrect = selectedIndex === qData.correct;
    const feedbackEl = document.getElementById('quiz-feedback');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackIconContainer = document.getElementById('feedback-icon-container');
    const optsEl = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('quiz-next-btn');

    // Deshabilitar más clicks
    optsEl.classList.add('pointer-events-none');

    // Estilos visuales en el botón seleccionado
    if (isCorrect) {
        btnElement.classList.remove('bg-white/5', 'border-white/10');
        btnElement.classList.add('bg-green-500/20', 'border-green-400', 'ring-2', 'ring-green-400/50');
        quizScore += 10; // 10 puntos por correcta
        document.getElementById('quiz-score').textContent = quizScore;
        
        // Feedback Positivo (Estilos internos de la barra)
        feedbackEl.classList.remove('border-red-500/30');
        feedbackEl.classList.add('border-green-500/30');
        feedbackIconContainer.className = 'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 text-xl md:text-2xl bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]';
        feedbackIconContainer.innerHTML = '<span class="material-symbols-outlined">check</span>';
        feedbackTitle.textContent = "¡Correcto!";
        feedbackTitle.className = "text-base md:text-lg font-bold text-green-400 mb-0.5";
    } else {
        btnElement.classList.remove('bg-white/5', 'border-white/10');
        btnElement.classList.add('bg-red-500/20', 'border-red-400', 'ring-2', 'ring-red-400/50', 'opacity-50');
        
        // Resaltar la correcta
        const buttons = optsEl.querySelectorAll('button');
        currentOptions.forEach((opt, idx) => {
            if (opt.originalIndex === qData.correct) {
                buttons[idx].classList.add('bg-green-500/20', 'border-green-400', 'ring-2', 'ring-green-400/50');
            }
        });

        // Feedback Negativo (Estilos internos de la barra)
        feedbackEl.classList.remove('border-green-500/30');
        feedbackEl.classList.add('border-red-500/30');
        feedbackIconContainer.className = 'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 text-xl md:text-2xl bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]';
        feedbackIconContainer.innerHTML = '<span class="material-symbols-outlined">close</span>';
        feedbackTitle.textContent = "Incorrecto";
        feedbackTitle.className = "text-base md:text-lg font-bold text-red-400 mb-0.5";
    }

    feedbackText.textContent = qData.feedback;
    feedbackEl.classList.remove('translate-y-full'); // Mostrar deslizando hacia arriba
    
    // Configurar botón siguiente
    nextBtn.onclick = () => {
        if (currentQuizIndex < currentQuizQuestions.length - 1) {
            currentQuizIndex++;
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    };
}

function showQuizResults() {
    const content = document.getElementById('quiz-content');
    const results = document.getElementById('quiz-results');
    const feedbackEl = document.getElementById('quiz-feedback');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const text = document.getElementById('result-text');
    
    content.classList.add('hidden');
    results.classList.remove('hidden');
    if (feedbackEl) feedbackEl.classList.add('translate-y-full');
    
    const percentage = (quizScore / (currentQuizQuestions.length * 10)) * 100;
    
    if (percentage >= 80) {
        icon.textContent = 'workspace_premium';
        icon.className = 'material-symbols-outlined text-8xl mb-4 text-green-400 animate-bounce';
        title.textContent = '¡Excelente Conocimiento!';
        text.textContent = `Obtuviste ${quizScore} puntos. Estás más que listo para las misiones.`;
    } else if (percentage >= 50) {
        icon.textContent = 'thumb_up';
        icon.className = 'material-symbols-outlined text-8xl mb-4 text-cyan-400';
        title.textContent = 'Buen Trabajo';
        text.textContent = `Obtuviste ${quizScore} puntos. Tienes una buena base para empezar.`;
    } else {
        icon.textContent = 'school';
        icon.className = 'material-symbols-outlined text-8xl mb-4 text-yellow-400';
        title.textContent = 'Aprenderás Mucho';
        text.textContent = `Obtuviste ${quizScore} puntos. Esta guía te será de mucha utilidad.`;
    }
}

window.closeQuiz = function() {
    const container = document.getElementById('knowledge-quiz-container');
    container.classList.add('hidden');
    // Opcional: Scroll suave a las misiones
    document.querySelector('.max-w-7xl > .text-center').scrollIntoView({ behavior: 'smooth' });
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- MINIJUEGO: OCEAN DROP (Estilo Pou) ---

let gameLoopId;
let gameScore = 0;
let gameTime = 60;
let gameItems = [];
let playerX = 0;
let lastTime = 0;
let spawnTimer = 0;
let isGameRunning = false;
let currentPlayerName = "Anónimo"; // Variable para el nombre real
let particles = []; // Sistema de partículas
let difficultyMultiplier = 1; // Multiplicador de dificultad
let timerInterval; // Para el contador de tiempo

// Configuración de Items
const ITEM_TYPES = [
    { type: 'good', emoji: '🦐', points: 10, speed: 200, color: '#FF7F50' },
    { type: 'good', emoji: '🌿', points: 5, speed: 180, color: '#4ade80' },
    { type: 'good', emoji: '🐟', points: 15, speed: 250, color: '#38bdf8' },
    { type: 'bad', emoji: '🛢️', points: -20, speed: 220, color: '#1e293b' },
    { type: 'bad', emoji: '🥤', points: -10, speed: 200, color: '#ef4444' },
    { type: 'bad', emoji: '🕸️', points: -15, speed: 190, color: '#94a3b8' }
];

// Variables del Canvas
let canvas, ctx;
let playerImg = new Image();
// Usamos un emoji convertido a URL para no depender de assets externos
playerImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>🐠</text></svg>");

window.startGame = function(mode) {
    // Validar nombre si es jugador
    const nameInput = document.getElementById('player-name');
    const errorMsg = document.getElementById('name-error-msg');

    if (nameInput.value.trim() === "") {
        // UX Mejorada: Feedback visual en lugar de alert
        errorMsg.classList.remove('hidden');
        nameInput.classList.add('border-red-500', 'ring-2', 'ring-red-500/50');
        nameInput.focus();
        return;
    }
    // Limpiar errores previos
    errorMsg.classList.add('hidden');
    nameInput.classList.remove('border-red-500', 'ring-2', 'ring-red-500/50');
    currentPlayerName = nameInput.value.trim();

    const menu = document.getElementById('game-menu');
    const screen = document.getElementById('game-screen');
    const hostScreen = document.getElementById('host-screen');
    const gameOverOverlay = document.getElementById('game-over-overlay');

    menu.classList.add('hidden');
    hostScreen.classList.add('hidden');
    screen.classList.remove('hidden');
    gameOverOverlay.classList.add('hidden');

    // UX Mejorada: Modo Inmersivo Centrado (Estilo Pou / Móvil)
    // Ocultar scroll del body
    document.body.style.overflow = 'hidden';
    
    // Posicionamiento fijo centrado con backdrop oscuro
    screen.classList.remove('relative', 'mx-auto');
    screen.classList.add('fixed', 'z-[100]', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2');
    
    // Estilos inline para forzar dimensiones de "celular" y fondo oscuro
    screen.style.boxShadow = '0 0 0 100vmax rgba(15, 23, 42, 0.95)'; // Backdrop
    screen.style.width = '100%';
    screen.style.maxWidth = '450px'; // Ancho máximo tipo móvil
    screen.style.maxHeight = '90vh'; // Altura máxima para que quepa en pantalla
    screen.style.aspectRatio = '9/16'; // Mantener proporción vertical

    // Inicializar Canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Ajustar tamaño real
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    playerX = canvas.width / 2;

    // Resetear variables
    gameScore = 0;
    gameTime = 60;
    gameItems = [];
    isGameRunning = true;
    particles = [];
    difficultyMultiplier = 1;
    lastTime = performance.now();

    // Event Listeners para movimiento
    canvas.addEventListener('mousemove', handleInput);
    canvas.addEventListener('touchmove', handleInput, { passive: false });

    // Iniciar Loop
    updateUI();
    requestAnimationFrame(gameLoop);

    // Timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(timerInterval);
            return;
        }
        gameTime--;
        
        // Aumentar dificultad cada 10 segundos
        if (gameTime % 10 === 0) difficultyMultiplier += 0.1;

        updateUI();
        if (gameTime <= 0) {
            endGame();
            clearInterval(timerInterval);
        }
    }, 1000);
};

function handleInput(e) {
    if (!isGameRunning) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    let clientX;

    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }

    playerX = clientX - rect.left;
    
    // Límites
    if (playerX < 20) playerX = 20;
    if (playerX > canvas.width - 20) playerX = canvas.width - 20;
}

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Spawner
    spawnTimer += deltaTime;
    // Spawn más rápido con mayor dificultad
    if (spawnTimer > (0.5 / difficultyMultiplier)) { 
        if (Math.random() > 0.2) { // 80% chance
            const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
            gameItems.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -30,
                ...itemType,
                currentSpeed: itemType.speed * difficultyMultiplier
            });
        }
        spawnTimer = 0;
    }

    // 2. Actualizar Items
    for (let i = gameItems.length - 1; i >= 0; i--) {
        let item = gameItems[i];
        item.y += item.currentSpeed * deltaTime;

        // Dibujar Item
        ctx.font = "36px Arial"; // Un poco más grande
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 5;
        ctx.fillText(item.emoji, item.x, item.y);
        ctx.shadowBlur = 0; // Reset shadow

        // Colisión con Jugador (Radio aprox 30px)
        const dx = playerX - item.x;
        const dy = (canvas.height - 50) - item.y;
        const distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < 45) { // Hitbox un poco más generosa
            // Comido
            gameScore += item.points;
            
            // Feedback visual simple
            const color = item.points > 0 ? '#4ade80' : '#f87171';
            showFloatingText(item.points > 0 ? `+${item.points}` : `${item.points}`, item.x, item.y, color);
            
            // Efecto de partículas
            createParticles(item.x, item.y, item.color);

            // Screen shake si es malo
            if (item.points < 0) screenShake();

            gameItems.splice(i, 1);
            updateUI();
        } else if (item.y > canvas.height + 20) {
            // Salió de pantalla
            gameItems.splice(i, 1);
        }
    }

    // 2.5 Actualizar y Dibujar Partículas
    updateParticles(deltaTime);

    // 3. Dibujar Jugador
    // Revertido a la versión estable (sin transformaciones complejas) para asegurar que se vea
    ctx.drawImage(playerImg, playerX - 30, canvas.height - 80, 60, 60);

    requestAnimationFrame(gameLoop);
}

// Sistema de Partículas Simple
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            life: 0.5, // Duración en segundos
            color: color,
            size: Math.random() * 5 + 2
        });
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        p.size *= 0.95; // Encoger

        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.life * 2; // Fade out
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }
}

let shakeDuration = 0;
function screenShake() {
    const canvas = document.getElementById('game-canvas');
    canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
    setTimeout(() => {
        canvas.style.transform = 'none';
    }, 100);
}

function showFloatingText(text, x, y, color) {
    // Añadimos el texto como una partícula especial que sube
    particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: -100, // Sube
        life: 0.8,
        text: text,
        color: color,
        isText: true
    });
}

// Modificar updateParticles para manejar texto
const originalUpdateParticles = updateParticles;
updateParticles = function(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        
        if (p.isText) {
            p.y += p.vy * deltaTime;
            p.life -= deltaTime;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.save();
                ctx.globalAlpha = Math.min(1, p.life * 2);
                ctx.fillStyle = p.color;
                ctx.font = "bold 24px Arial";
                ctx.shadowColor = "black";
                ctx.shadowBlur = 2;
                ctx.fillText(p.text, p.x, p.y);
                ctx.restore();
            }
            continue; // Saltar lógica normal de partículas
        }
    }
    // Llamar a la lógica original para partículas normales
    originalUpdateParticles(deltaTime);
}

function updateUI() {
    document.getElementById('game-score').textContent = gameScore;
    document.getElementById('game-timer').textContent = gameTime;
}

function endGame() {
    isGameRunning = false;
    document.getElementById('final-score').textContent = gameScore;
    document.getElementById('game-over-overlay').classList.remove('hidden');
    
    // --- ENVIAR PUNTAJE REAL AL SERVIDOR PHP ---
    fetch('../backend/save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: currentPlayerName,
            score: gameScore
        })
    })
    .then(response => console.log("Puntaje guardado"))
    .catch(error => console.error("Error guardando puntaje:", error));

    // Si estamos en modo certificado, esto podría contar como misión cumplida si score > X
    if (gameScore > 100) {
        // Lógica opcional para desbloquear algo
    }
}

window.exitGame = function() {
    isGameRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('game-menu').classList.remove('hidden');
    
    // Restaurar estilos de ventana normal
    document.body.style.overflow = '';
    const screen = document.getElementById('game-screen');
    
    screen.classList.add('relative', 'mx-auto');
    screen.classList.remove('fixed', 'z-[100]', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2');
    
    // Limpiar estilos inline
    screen.style.boxShadow = '';
    screen.style.width = '';
    screen.style.maxWidth = '';
    screen.style.maxHeight = '';
    screen.style.aspectRatio = '';

    // Detener simulación de host si existe
    if (hostInterval) clearInterval(hostInterval);
};

// --- MODO ANFITRIÓN (Simulación para Presentación) ---
let hostInterval;

window.initHostMode = function() {
    const menu = document.getElementById('game-menu');
    const hostScreen = document.getElementById('host-screen');
    const qrImg = document.getElementById('game-qr-code');
    const list = document.getElementById('leaderboard-list');

    menu.classList.add('hidden');
    hostScreen.classList.remove('hidden');

    // Limpiar puntajes anteriores al iniciar sala (Opcional)
    fetch('../backend/reset_scores.php');

    // Generar QR real apuntando a la URL actual
    const currentUrl = window.location.href;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

    // Limpiar lista
    list.innerHTML = '';
    
    // POLLING REAL: Consultar PHP cada 2 segundos
    hostInterval = setInterval(() => {
        fetch('../backend/get_scores.php')
            .then(response => response.json())
            .then(players => {
                // Si no hay jugadores
                if (!players || players.length === 0) {
                    list.innerHTML = '<div class="text-center text-slate-500 py-10 italic">Esperando jugadores...</div>';
                    return;
                }

                // Ordenar por puntaje (Mayor a menor)
                players.sort((a, b) => b.score - a.score);

                // Renderizar lista
                list.innerHTML = players.map((p, i) => `
                    <div class="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 transition-all hover:bg-white/10">
                        <div class="flex items-center gap-3">
                            <span class="font-bold ${i === 0 ? 'text-yellow-400 text-xl' : 'text-slate-400'} w-8">
                                ${i === 0 ? '👑' : '#' + (i + 1)}
                            </span>
                            <span class="font-bold text-white truncate max-w-[150px]">${p.name}</span>
                        </div>
                        <span class="font-mono font-bold text-cyan-400 text-xl">${p.score}</span>
                    </div>
                `).join('');
            })
            .catch(err => console.error("Error obteniendo puntajes:", err));

    }, 2000); // Actualizar cada 2 segundos
};

updateProgress();
