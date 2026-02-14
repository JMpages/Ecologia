// Three.js para fondo oceánico dinámico
let scene, camera, renderer, particles;

function initOceanBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('ocean-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Crear partículas de agua
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.02,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 5;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (particles) particles.rotation.y += 0.002;
    if (renderer && scene && camera) renderer.render(scene, camera);
}

window.addEventListener('load', initOceanBackground);

// Actualizar estado del océano
function updateOceanStatus(degraded) {
    const health = document.getElementById('ocean-health');
    const status = document.getElementById('ocean-status');
    if (degraded) {
        health.className = 'w-3 h-3 rounded-full bg-red-400 animate-pulse';
        status.textContent = 'Contaminado';
        status.className = 'text-sm text-red-400';
    } else {
        health.className = 'w-3 h-3 rounded-full bg-green-400 animate-pulse';
        status.textContent = 'Saludable';
        status.className = 'text-sm text-green-400';
    }
}

// Modificar funciones de degradación y restauración con animaciones específicas de Panamá
window.applyDegradation = function(type) {
    document.body.classList.add('degraded');
    updateOceanStatus(true);
    // Agregar partículas de contaminación específicas
    if (type === 'basura') {
        createPlasticPollution();
    } else if (type === 'reciclaje') {
        createCoralBleaching();
    } else if (type === 'pesca') {
        createOverfishing();
    }
    console.log('Degradación aplicada:', type);
};

window.applyRestoration = function(type) {
    document.body.classList.remove('degraded');
    document.body.classList.add('restored');
    updateOceanStatus(false);
    setTimeout(() => document.body.classList.remove('restored'), 2000);
    // Limpiar partículas y restaurar
    clearPollutionParticles();
    if (type === 'limpieza') {
        restoreBeaches();
    } else if (type === 'proteccion') {
        restoreCorals();
    } else if (type === 'sostenible') {
        restoreFish();
    }
    console.log('Restauración aplicada:', type);
};

window.resetEnvironment = function() {
    document.body.classList.remove('degraded', 'restored');
    updateOceanStatus(false);
    clearPollutionParticles();
};

function clearPollutionParticles() {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
}

// Funciones específicas para animaciones de Panamá
function createPlasticPollution() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full opacity-80 animate-float';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = '4s';
        particlesContainer.appendChild(particle);
    }
    gsap.to('#ocean-canvas', { opacity: 0.3, duration: 2 });
}

function createCoralBleaching() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 bg-white rounded-full opacity-60 animate-pulse';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particlesContainer.appendChild(particle);
    }
    gsap.to('#ocean-canvas', { filter: 'hue-rotate(20deg) brightness(1.2)', duration: 3 });
}

function createOverfishing() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-3 h-3 bg-red-500 rounded-full opacity-70 animate-bounce';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 1 + 's';
        particlesContainer.appendChild(particle);
    }
    if (particles) gsap.to(particles, { scale: 0.5, duration: 2 });
}

function restoreBeaches() {
    clearPollutionParticles();
    gsap.to('#ocean-canvas', { opacity: 1, duration: 2 });
}

function restoreCorals() {
    clearPollutionParticles();
    gsap.to('#ocean-canvas', { filter: 'none', duration: 3 });
}

function restoreFish() {
    clearPollutionParticles();
    if (particles) gsap.to(particles, { scale: 1, duration: 2 });
}