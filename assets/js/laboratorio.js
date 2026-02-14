/**
 * d:\Mis archivos\Proyecto\assets\js\laboratorio.js
 * Lógica 3D para el Laboratorio Interactivo usando Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
});

let scene, camera, renderer;
let ecosystemGroup, pollutionGroup, particlesMesh;
let fishes = [];
let trashItems = [];
let clock;
let isPolluted = false; // Estado para controlar si el ecosistema está colapsando

function initThreeJS() {
    const canvas = document.getElementById('ocean-canvas');
    if (!canvas) return;

    // --- 1. CONFIGURACIÓN DE LA ESCENA ---
    scene = new THREE.Scene();
    
    // Colores para los estados
    const cleanColor = new THREE.Color('#0077be');
    
    // Niebla: Simula la densidad del agua. 
    // Density 0.02 = Clara, 0.08 = Contaminada
    scene.fog = new THREE.FogExp2(cleanColor, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 1;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- 2. ILUMINACIÓN ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // --- 3. OBJETOS 3D ---
    ecosystemGroup = new THREE.Group(); // Grupo para vida marina
    pollutionGroup = new THREE.Group(); // Grupo para basura
    scene.add(ecosystemGroup);
    scene.add(pollutionGroup);

    // A. Partículas de Ambiente (Plancton/Burbujas)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x88c6f1,
        transparent: true,
        opacity: 0.6
    });
    particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // B. Peces (Representados por conos estilizados)
    const fishGeo = new THREE.ConeGeometry(0.1, 0.4, 8);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xff7f50, roughness: 0.4 });
    
    for(let i=0; i<50; i++) {
        const fish = new THREE.Mesh(fishGeo, fishMat.clone()); // Clonar material para cambiar color individualmente
        // Posición aleatoria
        fish.position.set((Math.random()-0.5)*25, (Math.random()-0.5)*15, (Math.random()-0.5)*10);
        fish.rotation.z = -Math.PI / 2; // Apuntar hacia adelante
        // Datos propios para animación individual
        fish.userData = { 
            speed: 0.02 + Math.random() * 0.03, 
            offset: Math.random() * 100,
            originalY: fish.position.y,
            dead: false
        };
        ecosystemGroup.add(fish);
        fishes.push(fish);
    }

    // C. Basura (Cubos oscuros e irregulares)
    const trashGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const trashMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });

    for(let i=0; i<80; i++) {
        const trash = new THREE.Mesh(trashGeo, trashMat);
        trash.position.set((Math.random()-0.5)*30, (Math.random()-0.5)*20, (Math.random()-0.5)*15);
        trash.rotation.set(Math.random(), Math.random(), Math.random());
        trash.visible = false; // Oculto al inicio
        pollutionGroup.add(trash);
        trashItems.push(trash);
    }

    // --- 4. ANIMACIÓN (LOOP) ---
    clock = new THREE.Clock();
    animate();

    // --- 5. RESPONSIVIDAD ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // 1. Animación de Peces (depende del estado de contaminación)
    fishes.forEach(fish => {
        if (isPolluted) {
            // --- EFECTO DE MUERTE ---
            // El pez se vuelve gris
            fish.material.color.setHex(0x555555);
            // Se voltea panza arriba (Rotación Z hacia PI)
            fish.rotation.z = THREE.MathUtils.lerp(fish.rotation.z, Math.PI, 0.05);
            // Flota hacia la superficie (Y aumenta)
            fish.position.y += 0.015;
            // Si sube mucho, lo reseteamos abajo para que siga el ciclo de "muerte continua"
            if(fish.position.y > 10) fish.position.y = -10;

        } else {
            // --- VIDA NORMAL ---
            fish.material.color.setHex(0xff7f50); // Color vivo
            fish.rotation.z = -Math.PI / 2; // Posición de nado
            
            // Nado hacia la izquierda
            fish.position.x -= fish.userData.speed;
            // Movimiento ondulatorio suave
            fish.position.y = fish.userData.originalY + Math.sin(time * 2 + fish.userData.offset) * 0.5;
            
            // Loop infinito horizontal
            if(fish.position.x < -15) fish.position.x = 15;
        }
    });

    // 2. Animación de Basura
    trashItems.forEach((trash, idx) => {
        if(trash.visible) {
            trash.rotation.x += 0.01;
            trash.rotation.y += 0.01;
            trash.position.y += Math.sin(time + idx) * 0.005; // Flotación más notoria
        }
    });

    // 3. Efectos de Cámara y Partículas (Temblor si está contaminado)
    if (isPolluted) {
        camera.position.x = Math.sin(time * 5) * 0.05;
        camera.position.y = 1 + Math.cos(time * 3) * 0.05;
        if(particlesMesh) particlesMesh.rotation.y = time * 0.05; // Partículas giran rápido
    } else {
        camera.position.x = 0;
        // La posición Y de la cámara se mantiene en 1 para evitar saltos
        if(particlesMesh) particlesMesh.rotation.y = time * 0.02; // Corriente suave
    }

    if(renderer && scene && camera) renderer.render(scene, camera);
}

// --- 6. INTEGRACIÓN CON INTERFAZ (Sobrescribir funciones globales) ---

// Sobrescribir applyDegradation (CONTAMINAR)
window.applyDegradation = function(type) {
    isPolluted = true;
    
    // A. Efectos 3D (Three.js)
    if(scene && scene.fog) {
        // Color tóxico (Verde/Marrón oscuro)
        gsap.to(scene.fog.color, { r: 0.2, g: 0.25, b: 0.1, duration: 2 }); 
        gsap.to(scene.fog, { density: 0.06, duration: 2 });
    }
    // Mostrar basura
    trashItems.forEach(t => t.visible = true);
    // Cambiar color de partículas a "suciedad"
    if(particlesMesh) particlesMesh.material.color.setHex(0x8b8c7a);

    // B. Efectos de "Destrucción" de la Página (DOM)
    const body = document.body;
    const nav = document.querySelector('nav');
    const cards = document.querySelectorAll('.bg-deep-abyss\\/50');

    // 1. Filtro tóxico global
    body.style.transition = "filter 2s ease";
    body.style.filter = "contrast(1.2) sepia(0.8) hue-rotate(-50deg) blur(0.5px)";
    
    // 2. Romper la Navbar (Inclinarla)
    if(nav) {
        nav.style.transition = "transform 1s ease";
        nav.style.transform = "translate(-50%, 0) rotate(-3deg) translateY(10px)";
    }

    // 3. Desordenar las tarjetas (Rotación aleatoria)
    cards.forEach(card => {
        const randomRot = (Math.random() * 6) - 3; // Entre -3 y 3 grados
        card.style.transition = "transform 0.5s ease";
        card.style.transform = `rotate(${randomRot}deg)`;
    });

    updateStatus("Ecosistema Colapsado", "text-red-600", "bg-red-600");
};

// Sobrescribir applyRestoration (LIMPIAR)
window.applyRestoration = function(type) {
    isPolluted = false;

    // A. Efectos 3D (Three.js)
    if(scene && scene.fog) {
        // Volver a azul océano
        gsap.to(scene.fog.color, { r: 0, g: 0.46, b: 0.74, duration: 2 });
        gsap.to(scene.fog, { density: 0.02, duration: 2 });
    }
    // Ocultar basura
    trashItems.forEach(t => t.visible = false);
    // Restaurar color partículas
    if(particlesMesh) particlesMesh.material.color.setHex(0x88c6f1);

    // B. Restaurar la Página (DOM)
    const body = document.body;
    const nav = document.querySelector('nav');
    const cards = document.querySelectorAll('.bg-deep-abyss\\/50');

    // 1. Quitar filtros
    body.style.filter = "none";

    // 2. Enderezar Navbar
    if(nav) {
        nav.style.transform = "translate(-50%, 0) rotate(0deg)";
    }

    // 3. Enderezar tarjetas
    cards.forEach(card => {
        card.style.transform = "none";
    });

    updateStatus("Recuperándose", "text-primary", "bg-primary");
};

// Sobrescribir resetEnvironment
window.resetEnvironment = function() {
    window.applyRestoration();
    updateStatus("Saludable", "text-green-400", "bg-green-400");
};

// Helper para actualizar el texto de estado en la UI
function updateStatus(text, textColorClass, dotColorClass) {
    const statusText = document.getElementById('ocean-status');
    const statusDot = document.getElementById('ocean-health');
    
    if(statusText && statusDot) {
        statusText.textContent = text;
        statusText.className = `text-sm ${textColorClass}`;
        statusDot.className = `w-3 h-3 rounded-full animate-pulse ${dotColorClass}`;
    }
}