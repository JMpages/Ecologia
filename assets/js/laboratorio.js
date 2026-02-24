/**
 * d:\Mis archivos\Proyecto\assets\js\laboratorio.js
 * LÃ³gica 3D para el Laboratorio Interactivo usando Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initWhatIfInteraction();
    initDecisionQuizSimulator();
    initDragDecideSimulator();
    updateButtonUX(); // Inicializar estado de botones
    updateEnvironmentVisuals(); // APLICAR ESTADO VISUAL Y DESTRUCCIÓN AL CARGAR
});

let scene, camera, renderer;
let ecosystemGroup, pollutionGroup, particlesMesh;
let dirLight, ambientLight; 
let fishes = [];
let trashItems = [];
let clock;

let pollutionState = JSON.parse(localStorage.getItem('ocean_pollution_state')) || {
    trash: false,     // Contaminación plástica
    bleaching: false, // Blanqueamiento/Calentamiento
    fishing: false,   // Sobrepesca
    oil: false,       // Derrame de petróleo
    noise: false      // Contaminación acústica
};

function initThreeJS() {
    const canvas = document.getElementById('ocean-canvas');
    if (!canvas) return;

    // --- 1. CONFIGURACIï¿½"N DE LA ESCENA ---
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

    // --- 2. ILUMINACIï¿½"N ---
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // --- 3. OBJETOS 3D ---
    ecosystemGroup = new THREE.Group(); // Grupo para vida marina
    pollutionGroup = new THREE.Group(); // Grupo para basura
    scene.add(ecosystemGroup);
    scene.add(pollutionGroup);

    // A. PartÃ­culas de Ambiente (Plancton/Burbujas)
    // Helper para textura suave (Burbujas/Plancton)
    const getSoftTexture = () => {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(16,16,0,16,16,16);
        g.addColorStop(0,'rgba(255,255,255,1)');
        g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,32,32);
        return new THREE.CanvasTexture(c);
    };

    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 2000; // Más denso para inmersión
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount); // Velocidad individual

    for(let i=0; i<particlesCount; i++) {
        posArray[i*3] = (Math.random() - 0.5) * 50;
        posArray[i*3+1] = (Math.random() - 0.5) * 30;
        posArray[i*3+2] = (Math.random() - 0.5) * 30;
        speedArray[i] = Math.random() * 0.02 + 0.01; // Velocidad de ascenso variable
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('speed', new THREE.BufferAttribute(speedArray, 1));

    const particlesMat = new THREE.PointsMaterial({
        size: 0.15, // Más grandes y visibles
        map: getSoftTexture(), // Textura circular suave
        transparent: true,
        opacity: 0.6,
        color: 0x88c6f1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // B. Peces (Mejorados: Geometría Procedural Low-Poly con Aletas)
    // 1. Geometrías reutilizables
    const bodyGeo = new THREE.SphereGeometry(0.2, 7, 7);
    bodyGeo.scale(1.8, 0.9, 0.6); // Cuerpo ovalado
    
    const tailGeo = new THREE.ConeGeometry(0.15, 0.4, 3); // Cola triangular
    tailGeo.rotateZ(Math.PI / 2); 
    tailGeo.translate(-0.5, 0, 0);

    const finGeo = new THREE.ConeGeometry(0.1, 0.3, 3); // Aleta dorsal
    finGeo.rotateZ(-Math.PI / 4);
    finGeo.translate(0, 0.25, 0);

    const sideFinGeo = new THREE.ConeGeometry(0.06, 0.2, 3); // Aletas laterales
    sideFinGeo.rotateX(Math.PI / 2);

    const fishColors = [0xff7f50, 0xffa07a, 0xffd700, 0x4682b4, 0x20b2aa, 0xff6b6b];

    for(let i=0; i<70; i++) {
        const fishGroup = new THREE.Group();
        
        // Material único por pez para control de color
        const baseColor = fishColors[Math.floor(Math.random() * fishColors.length)];
        const mat = new THREE.MeshStandardMaterial({ 
            color: baseColor, 
            roughness: 0.4, 
            flatShading: true 
        });

        const body = new THREE.Mesh(bodyGeo, mat);
        const tail = new THREE.Mesh(tailGeo, mat);
        const dorsal = new THREE.Mesh(finGeo, mat);
        
        const rFin = new THREE.Mesh(sideFinGeo, mat);
        rFin.position.set(0.1, -0.1, 0.15);
        rFin.rotation.z = -Math.PI/4;
        rFin.rotation.y = Math.PI/4;

        const lFin = new THREE.Mesh(sideFinGeo, mat);
        lFin.position.set(0.1, -0.1, -0.15);
        lFin.rotation.z = -Math.PI/4;
        lFin.rotation.y = -Math.PI/4;

        fishGroup.add(body, tail, dorsal, rFin, lFin);

        // Variación de tamaño
        const s = 0.8 + Math.random() * 0.7;
        fishGroup.scale.set(s, s, s);

        // PosiciÃ³n aleatoria
        fishGroup.position.set((Math.random()-0.5)*35, (Math.random()-0.5)*22, (Math.random()-0.5)*15);
        
        fishGroup.userData = { 
            speed: 0.02 + Math.random() * 0.04, 
            offset: Math.random() * 100,
            originalY: fishGroup.position.y,
            originalColor: new THREE.Color(baseColor),
            material: mat // Referencia al material compartido
        };
        ecosystemGroup.add(fishGroup);
        fishes.push(fishGroup);
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

    // --- 4. ANIMACIï¿½"N (LOOP) ---
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

    // 1. AnimaciÃ³n de Peces (Lógica compleja según estado)
    fishes.forEach((fishGroup, index) => {
        const { speed, offset, originalY, material, originalColor } = fishGroup.userData;

        // A. SOBREPESCA: Ocultar el 80% de los peces
        // Si hay derrame de petróleo, también mueren/desaparecen muchos
        if ((pollutionState.fishing || pollutionState.oil) && index % 5 !== 0) {
            fishGroup.visible = false;
        } else {
            fishGroup.visible = true;
        }
        if (!fishGroup.visible) return;

        // B. BLANQUEAMIENTO: Color pálido
        if (pollutionState.bleaching) {
            material.color.lerp(new THREE.Color(0xdddddd), 0.05);
        } else if (pollutionState.oil) {
            material.color.lerp(new THREE.Color(0x111111), 0.1); // Negro por petróleo
        } else if (pollutionState.trash) {
            material.color.lerp(new THREE.Color(0x555555), 0.05); // Gris por suciedad
        } else {
            material.color.lerp(originalColor, 0.05);
        }

        // C. MOVIMIENTO
        if (pollutionState.trash || pollutionState.oil) {
            // --- EFECTO DE MUERTE ---
            fishGroup.rotation.z = THREE.MathUtils.lerp(fishGroup.rotation.z, Math.PI, 0.05); // Panza arriba
            fishGroup.position.y += 0.01; // Flotar
            if(fishGroup.position.y > 10) fishGroup.position.y = -10;
        } else if (pollutionState.noise) {
            // --- PÁNICO POR RUIDO ---
            fishGroup.rotation.z = (Math.random() - 0.5) * 0.5; 
            fishGroup.position.x -= speed * 3; // Nadan muy rápido huyendo
            fishGroup.position.y = originalY + Math.sin(time * 10 + offset) * 1.5; // Movimiento errático
            if(fishGroup.position.x < -15) fishGroup.position.x = 15;
        } else {
            // --- VIDA NORMAL ---
            fishGroup.rotation.z = 0; 
            fishGroup.position.x -= speed;
            fishGroup.position.y = originalY + Math.sin(time * 2 + offset) * 0.5;
            // Coleteo suave (rotación en Y)
            fishGroup.rotation.y = Math.sin(time * 10 + offset) * 0.15; 

            if(fishGroup.position.x < -15) fishGroup.position.x = 15;
        }
    });

    // 2. AnimaciÃ³n de Basura
    trashItems.forEach((trash, idx) => {
        if(trash.visible) {
            trash.rotation.x += 0.01;
            trash.rotation.y += 0.01;
            trash.position.y += Math.sin(time + idx) * 0.005; // FlotaciÃ³n mÃ¡s notoria
        }
    });

    // 3. Efectos de CÃ¡mara y PartÃ­culas (Deterioro del Ecosistema)
    const activeCount = Object.values(pollutionState).filter(Boolean).length;
    
    if (activeCount > 0) {
        // Temblor acumulativo: Más problemas = Más caos y mareo
        let shakeIntensity = 0.08 * activeCount; // AUMENTADO: Temblor mucho más fuerte
        if (pollutionState.noise) shakeIntensity += 0.15; // Ruido añade vibración extra
        
        // Movimiento de cámara "borracho" o inestable
        camera.position.x = Math.sin(time * (5 + activeCount)) * shakeIntensity;
        camera.position.y = 1 + Math.cos(time * (3 + activeCount)) * (shakeIntensity * 0.5);
        
        // Comportamiento de partículas según el desastre
        if (particlesMesh) {
            // Animación base: Subir como burbujas
            const positions = particlesMesh.geometry.attributes.position.array;
            const speeds = particlesMesh.geometry.attributes.speed.array;
            const count = positions.length / 3;
            
            for(let i=0; i<count; i++) {
                // Subir en Y (más lento si hay petróleo)
                positions[i*3+1] += speeds[i] * (pollutionState.oil ? 0.2 : 1);
                
                // Reinicio infinito al llegar arriba
                if(positions[i*3+1] > 15) {
                    positions[i*3+1] = -15;
                }
            }
            particlesMesh.geometry.attributes.position.needsUpdate = true;

            if (pollutionState.oil) {
                // Petróleo: Ya gestionado en la velocidad individual
            } else if (pollutionState.noise) {
                // Ruido: Vibración caótica
                particlesMesh.position.x = (Math.random() - 0.5) * 0.1;
            } else {
                // Corrientes fuertes por defecto en otros desastres
                particlesMesh.rotation.y = time * (0.05 * (activeCount + 1));
            }
        }
    } else {
        camera.position.x = 0;
        // La posiciÃ³n Y de la cÃ¡mara se mantiene en 1 para evitar saltos
        if(particlesMesh) particlesMesh.rotation.y = time * 0.02; // Corriente suave
    }

    // Efecto Estroboscópico para el RUIDO (Estrés visual)
    if (pollutionState.noise && dirLight) {
        // Parpadeo aleatorio simulando luces de alarma o fallos eléctricos
        if (Math.random() > 0.9) {
            dirLight.intensity = 0.1; 
        } else {
            dirLight.intensity = 1.2; 
        }
    }

    if(renderer && scene && camera) renderer.render(scene, camera);
}

// --- DICCIONARIO DE MENSAJES EDUCATIVOS ---
const actionMessages = {
    // Negativos
    basura: {
        title: "Asfixia por Plástico",
        text: "El plástico bloquea la luz y asfixia a la fauna al ser ingerido."
    },
    reciclaje: { // Mapeado a blanqueamiento
        title: "Estrés Térmico",
        text: "El calor expulsa algas vitales, blanqueando y matando corales."
    },
    pesca: {
        title: "Colapso Trófico",
        text: "La sobrepesca rompe la cadena alimenticia y desequilibra el mar."
    },
    petroleo: {
        title: "Toxicidad Química",
        text: "El petróleo bloquea el oxígeno y asfixia a la fauna marina."
    },
    ruido: {
        title: "Desorientación Acústica",
        text: "El ruido de motores desorienta y estresa a peces y cetáceos."
    },
    // Positivos
    limpieza: {
        title: "Recuperación de Hábitat",
        text: "Retirar basura reactiva la luz y la vida en el arrecife."
    },
    proteccion: {
        title: "Regeneración Natural",
        text: "Zonas protegidas permiten a los corales sanar sin estrés."
    },
    sostenible: {
        title: "Equilibrio Poblacional",
        text: "Respetar vedas permite a las especies reproducirse y repoblar."
    },
    reforestacion: {
        title: "Filtración Biológica",
        text: "Restaurar manglares filtra toxinas y limpia el agua naturalmente."
    },
    regulacion: {
        title: "Silencio Submarino",
        text: "Menos ruido permite a las especies comunicarse y orientarse."
    }
};

// --- 6. INTEGRACIï¿½"N CON INTERFAZ (Sobrescribir funciones globales) ---

// Sobrescribir applyDegradation (CONTAMINAR)
window.applyDegradation = function(type) {
    console.log("Aplicando degradación:", type); // Verificación en consola
    // Activar estado específico
    if(type === 'basura') pollutionState.trash = true;
    if(type === 'reciclaje') pollutionState.bleaching = true; // Mapeado a blanqueamiento
    if(type === 'pesca') pollutionState.fishing = true;
    if(type === 'petroleo') pollutionState.oil = true;
    if(type === 'ruido') pollutionState.noise = true;
    
    // Mostrar mensaje educativo negativo
    showActionFeedback(type, true);
    
    updateEnvironmentVisuals();
};

// Función centralizada para actualizar gráficos y DOM según estado
function updateEnvironmentVisuals() {
    // 0. GUARDAR ESTADO GLOBAL (Persistencia para todo el ecosistema)
    localStorage.setItem('ocean_pollution_state', JSON.stringify(pollutionState));

    const { trash, bleaching, fishing, oil, noise } = pollutionState;
    const activeCount = Object.values(pollutionState).filter(Boolean).length;

    // 0.5. ASEGURAR QUE EL BOTÓN DE REINICIO EXISTA (Si no está en el HTML)
    if (!document.getElementById('floating-reset-btn')) {
        const btn = document.createElement('button');
        btn.id = 'floating-reset-btn';
        btn.className = 'hidden fixed bottom-24 right-10 z-[9999] px-6 py-4 bg-primary text-deep-abyss font-bold rounded-full shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-110 transition-all items-center gap-3 border-4 border-white/20';
        btn.innerHTML = '<span class="material-symbols-outlined text-3xl">restart_alt</span> <span class="hidden md:inline text-lg">Reiniciar Escenario</span>';
        btn.onclick = window.resetEnvironment;
        document.body.appendChild(btn);
    }

    // --- 1. EFECTOS DOM (Graduales) ---
    const simContainer = document.getElementById('simulation-container') || document.body;
    const nav = document.querySelector('nav');
    const overlay = document.getElementById('immersion-overlay');
    const restorationCard = document.getElementById('restoration-card');
    const mainContainer = document.querySelector('.max-w-7xl');
    const hudContainer = document.getElementById('hud-container');
    const negativeCard = document.getElementById('negative-card');
    const navLogo = document.querySelector('nav a[href="index.html"]');
    const navMenu = document.querySelector('nav .hidden.md\\:flex');
    const resetBtn = document.getElementById('floating-reset-btn');

    let filters = [];
    // Filtros específicos
    if (trash) filters.push('sepia(0.6) hue-rotate(-30deg)'); // Agua sucia
    if (bleaching) filters.push('brightness(1.1) contrast(0.9) grayscale(0.4)'); // Luz cegadora/muerta (Ajustado)
    if (fishing) filters.push('saturate(0.2) brightness(0.9)'); // Vacío (Ajustado)
    if (oil) filters.push('brightness(0.6) sepia(0.5) contrast(1.2)'); // Oscuridad tóxica (Más visible)
    if (noise) filters.push('blur(1px) contrast(1.2)'); // Vibración visual

    // Filtro acumulativo (Desenfoque aumenta con cada problema)
    if (activeCount > 0) filters.push(`blur(${activeCount * 0.3}px)`); // REDUCIDO: Blur más suave y gradual

    simContainer.style.transition = "filter 2s ease";
    simContainer.style.filter = filters.length > 0 ? filters.join(' ') : 'none';
    
    // Overlay inmersivo
    if (overlay) {
        let overlayGradient = 'none';
        if (oil) {
            overlayGradient = 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)';
        } else if (trash) {
            overlayGradient = 'radial-gradient(circle at center, transparent 40%, rgba(60, 50, 30, 0.6) 100%)';
        } else if (noise) {
            overlayGradient = 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 3px)';
        }
        overlay.style.background = overlayGradient;
        
        // Animación de vibración para ruido
        if (noise) overlay.classList.add('animate-pulse');
        else overlay.classList.remove('animate-pulse');
    }

    // CONTROL DEL BOTÓN DE REINICIO (Lógica Robusta)
    let finalResetBtn = document.getElementById('floating-reset-btn');
    
    // CORRECCIÓN CRÍTICA: Si el botón está dentro del contenedor con filtro, moverlo al body
    if (finalResetBtn && finalResetBtn.parentElement !== document.body) {
        document.body.appendChild(finalResetBtn);
    }

    // PROTECCIÓN DE NOTIFICACIONES: Mover al body para evitar filtros de destrucción
    const feedbackContainer = document.getElementById('impact-feedback-container');
    if (feedbackContainer && feedbackContainer.parentElement !== document.body) {
        document.body.appendChild(feedbackContainer);
    }

    // Asegurar estilos y eventos siempre
    if (finalResetBtn) {
        finalResetBtn.className = 'hidden fixed bottom-24 right-6 md:right-10 z-[9999] px-6 py-4 bg-primary text-deep-abyss font-bold rounded-full shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-110 transition-all items-center gap-3 border-4 border-white/20 cursor-pointer';
        // Forzar el evento onclick directamente
        finalResetBtn.onclick = function() { window.resetEnvironment(); };

        if (activeCount > 0) {
            finalResetBtn.classList.remove('hidden');
            finalResetBtn.classList.add('flex');
        } else {
            finalResetBtn.classList.add('hidden');
            finalResetBtn.classList.remove('flex');
        }
    }
    
    // Navbar se mantiene fija (Corrección solicitada)
    if(nav) {
        // Mantener posición central original, la destrucción será interna en los links
        nav.style.transform = "translate(-50%, 0)";
        nav.style.opacity = "1";
    }

    // DESTRUCCIÓN DE LA PÁGINA (Contenedor Principal)
    const containersToDestroy = [mainContainer, hudContainer].filter(Boolean);
    
    containersToDestroy.forEach(container => {
        if (activeCount > 0) {
            if(container.classList.contains('animate-float')) container.classList.remove('animate-float'); // Detener flotación suave
            
            // Caos progresivo: Rotación, Skew y Desplazamiento
            const chaos = activeCount * 1.5; // REDUCIDO: Para que no se rompa tanto
            const rot = (Math.random() - 0.5) * chaos * 0.5; 
            const skew = (Math.random() - 0.5) * chaos * 0.5;
            const scale = 1 - (chaos * 0.01); 
            
            // Añadir desplazamiento aleatorio para "desencajar" la web
            const x = (Math.random() - 0.5) * chaos;
            const y = (Math.random() - 0.5) * chaos;

            container.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            container.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) skewX(${skew}deg) scale(${scale})`;
        } else {
            if(container === mainContainer) container.classList.add('animate-float');
            container.style.transform = "";
        }
    });

    // --- EFECTO DE RUPTURA LITERAL (Separación de elementos) ---
    
    // 1. Romper la Navbar (Mover cada link individualmente)
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length > 0) {
        if (activeCount > 0) {
            navLinks.forEach((link) => {
                // Caos individual para cada enlace
                const chaos = activeCount * 3;
                const x = (Math.random() - 0.5) * chaos;
                const y = (Math.random() - 0.5) * chaos;
                const rot = (Math.random() - 0.5) * chaos * 2;
                
                link.style.display = 'inline-block'; // Asegurar que transform funcione
                link.style.transition = "transform 0.5s ease";
                link.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
            });
            
            // El contenedor de la nav se agrieta (borde rojo)
            if(nav) nav.querySelector('div').style.borderColor = `rgba(255, 50, 50, ${activeCount * 0.2})`;
        } else {
            navLinks.forEach(link => {
                link.style.transform = "none";
            });
            if(nav) nav.querySelector('div').style.borderColor = "rgba(255, 255, 255, 0.2)";
        }
    }

    // 2. Romper las Tarjetas (Separarlas violentamente)
    if (negativeCard && restorationCard) {
        if (activeCount > 0) {
            // Tarjeta negativa se cae a la izquierda
            const negRot = -0.5 * activeCount; // REDUCIDO
            const negX = -5 * activeCount; // REDUCIDO: Se aleja menos
            const negY = 2 * activeCount; // Cae menos
            
            negativeCard.style.transition = "transform 0.5s ease";
            negativeCard.style.transform = `translate(${negX}px, ${negY}px) rotate(${negRot}deg)`;
            negativeCard.style.borderColor = `rgba(255, 0, 0, ${activeCount * 0.15})`;

            // CAOS INTERNO: Los botones de la tarjeta negativa se "descuajeringan"
            const negButtons = negativeCard.querySelectorAll('button');
            negButtons.forEach((btn, idx) => {
                if (activeCount >= 3) {
                    // Aleatoriedad determinista basada en índice
                    const randR = (idx % 2 === 0 ? 1 : -1) * (activeCount * 2); // REDUCIDO
                    const randY = activeCount * 2;
                    btn.style.transform = `translateY(${randY}px) rotate(${randR}deg)`;
                    btn.style.opacity = 0.8;
                } else {
                    btn.style.transform = "none";
                    btn.style.opacity = 1;
                }
            });

        } else {
            negativeCard.style.transform = "none";
            negativeCard.style.borderColor = "rgba(255, 255, 255, 0.1)";
            negativeCard.querySelectorAll('button').forEach(b => b.style.transform = "none");
        }
    }

    // RESALTAR TARJETA DE RESTAURACIÓN (La solución)
    if (restorationCard) {
        if (activeCount > 0) {
            // Estilo de "Salvación" - ESTABILIDAD VISUAL
            restorationCard.classList.remove('border-white/10', 'bg-deep-abyss/50');
            restorationCard.classList.add('border-green-400', 'bg-deep-abyss/90', 'shadow-[0_0_40px_rgba(74,222,128,0.4)]', 'z-30', 'relative');
            
            if (activeCount >= 3) {
                // Estado crítico: Resaltar mucho pero mantener estable para facilitar el clic
                restorationCard.classList.add('animate-pulse', 'ring-4', 'ring-green-500', 'shadow-[0_0_80px_rgba(74,222,128,0.8)]');
                restorationCard.style.transform = `scale(1.05)`; // Solo escala, sin desplazamiento ni rotación
            } else {
                restorationCard.style.transform = `scale(1.02)`;
            }
        } else {
            // Restaurar estado normal
            restorationCard.classList.add('border-white/10', 'bg-deep-abyss/50');
            restorationCard.classList.remove('border-green-400', 'bg-deep-abyss/90', 'shadow-[0_0_40px_rgba(74,222,128,0.4)]', 'z-30', 'relative', 'animate-pulse', 'ring-4', 'ring-green-500', 'shadow-[0_0_80px_rgba(74,222,128,0.8)]');
            restorationCard.style.transform = "";
        }
    }

    // --- 2. EFECTOS 3D (Three.js) ---
    if(scene && scene.fog) {
        let targetColor = new THREE.Color('#0077be'); // Azul limpio
        let targetDensity = 0.02;

        if (oil) {
            targetColor.setHex(0x222211); // Negro verdoso (Aclarado para visibilidad)
            targetDensity = 0.10; // Menos denso para ver los peces
            
            // Efecto Atmósfera: Oscuridad tóxica
            gsap.to(ambientLight, { intensity: 0.2, duration: 2 }); // Luz ambiente muy baja
            gsap.to(dirLight.color, { r: 0.4, g: 0.5, b: 0.2, duration: 2 }); // Luz solar verdosa/enferma
            if(particlesMesh) gsap.to(particlesMesh.material.color, { r: 0.1, g: 0.1, b: 0.1, duration: 2 }); // Partículas negras (crudo)

        } else if (noise) {
            targetColor.setHex(0x220044); // Tono púrpura estresante
            targetDensity = 0.01; // Claro pero vibrante
            
            // Efecto Atmósfera: Luces de alerta
            gsap.to(ambientLight, { intensity: 0.4, duration: 0.5 });
            gsap.to(dirLight.color, { r: 1, g: 0.2, b: 0.2, duration: 0.5 }); // Luz roja de alarma

        } else if (trash && bleaching) {
            targetColor.setHex(0x888877); // Gris sucio
            targetDensity = 0.08;
        } else if (trash) {
            targetColor.setHex(0x4a4e32); // Marrón pantano
            targetDensity = 0.07;
            // Agua turbia
            if(particlesMesh) gsap.to(particlesMesh.material.color, { r: 0.4, g: 0.3, b: 0.2, duration: 2 });

        } else if (bleaching) {
            targetColor.setHex(0xddeeff); // Blanco neblina (calor)
            targetDensity = 0.05;
            
            // Efecto Atmósfera: Calor extremo
            gsap.to(ambientLight, { intensity: 0.9, duration: 2 }); // Mucha luz ambiente
            gsap.to(dirLight, { intensity: 1.5, duration: 2 }); // Sol abrasador
            gsap.to(dirLight.color, { r: 1, g: 1, b: 0.8, duration: 2 }); // Tono amarillento
            if(particlesMesh) gsap.to(particlesMesh.material.color, { r: 1, g: 1, b: 0.9, duration: 2 }); // Partículas blancas

        } else if (fishing) {
            targetColor.setHex(0x001133); // Azul oscuro vacío
            targetDensity = 0.03;
            // Soledad: Luz fría y tenue
            gsap.to(ambientLight, { intensity: 0.3, duration: 2 });
            gsap.to(dirLight.color, { r: 0.5, g: 0.5, b: 1, duration: 2 });
        } else {
            // RESTAURACIÓN: Vuelta a la normalidad
            gsap.to(ambientLight, { intensity: 0.6, duration: 2 });
            gsap.to(dirLight, { intensity: 0.8, duration: 2 });
            gsap.to(dirLight.color, { r: 1, g: 1, b: 1, duration: 2 });
            if(particlesMesh) gsap.to(particlesMesh.material.color, { r: 0.53, g: 0.77, b: 0.94, duration: 2 }); // Azul original
            
        }

        gsap.to(scene.fog.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 2 });
        gsap.to(scene.fog, { density: targetDensity, duration: 2 });
    }

    // Basura visible solo si hay contaminación plástica
    trashItems.forEach(t => t.visible = trash);

    // Mensaje de estado
    const statusMsg = activeCount === 0 ? "Saludable" : activeCount === 3 ? "Colapso Total" : "En Peligro";
    const colorClass = activeCount === 0 ? "text-green-400" : "text-red-600";
    updateStatus(statusMsg, colorClass, activeCount === 0 ? "bg-green-400" : "bg-red-600");
    
    // Actualizar UX de botones (Feedback visual)
    updateButtonUX();
}

// Sobrescribir applyRestoration (LIMPIAR)
window.applyRestoration = function(type) {
    // Soluciones Progresivas: Cada acción arregla su problema correspondiente
    if(type === 'limpieza') pollutionState.trash = false;
    if(type === 'proteccion') pollutionState.bleaching = false; // Arregla blanqueamiento
    if(type === 'sostenible') pollutionState.fishing = false;
    if(type === 'reforestacion') pollutionState.oil = false; // Manglares filtran el agua
    if(type === 'regulacion') pollutionState.noise = false; // Nuevo: Arregla ruido
    
    // Mostrar mensaje educativo positivo
    showActionFeedback(type, false);
    
    updateEnvironmentVisuals();
};

// Nueva función para resaltar la tarjeta de restauración
window.highlightRestoration = function() {
    const card = document.getElementById('restoration-card');
    if (card) {
        // Scroll suave hacia la tarjeta
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Efecto visual de resaltado
        card.classList.add('ring-4', 'ring-green-400', 'scale-105', 'shadow-[0_0_50px_rgba(74,222,128,0.5)]');
        setTimeout(() => {
            card.classList.remove('ring-4', 'ring-green-400', 'scale-105', 'shadow-[0_0_50px_rgba(74,222,128,0.5)]');
        }, 2000);
    }
};

// Sobrescribir resetEnvironment
window.resetEnvironment = function() {
    // Reinicio total
    pollutionState.trash = false;
    pollutionState.bleaching = false;
    pollutionState.fishing = false;
    pollutionState.oil = false;
    pollutionState.noise = false;
    updateEnvironmentVisuals();
};

// Nueva función para mostrar notificaciones educativas
function showActionFeedback(type, isNegative) {
    const container = document.getElementById('impact-feedback-container');
    const data = actionMessages[type];
    
    if (!container || !data) return;

    // Icon mapping
    const icons = {
        basura: 'delete_forever',
        reciclaje: 'thermostat', // Blanqueamiento
        pesca: 'set_meal',
        petroleo: 'oil_barrel',
        ruido: 'graphic_eq',
        limpieza: 'cleaning_services',
        proteccion: 'shield',
        sostenible: 'eco',
        reforestacion: 'forest',
        regulacion: 'volume_off'
    };
    const iconName = icons[type] || (isNegative ? 'dangerous' : 'check_circle');

    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.style.pointerEvents = "auto"; // Permitir clicks en la tarjeta
    
    // Estilos base
    let classes = "relative mb-4 rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transform transition-all duration-500 translate-y-[-20px] opacity-0 overflow-hidden border-l-4 group hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10";
    
    // Estilos específicos (Rojo para negativo, Verde/Azul para positivo)
    if (isNegative) {
        // Fondo con patrón de advertencia sutil
        classes += " bg-gradient-to-r from-red-950/95 to-black/90 border-red-500 text-white";
        notif.innerHTML = `
            <!-- Botón de Cerrar -->
            <button onclick="this.closest('div.group').remove()" class="absolute top-2 right-2 p-1 text-red-300/50 hover:text-white hover:bg-red-500/20 rounded-full transition-colors z-50">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>
            
            <!-- Elemento Visual de Fondo (Mancha tóxica) -->
            <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative p-5">
                <div class="absolute -right-6 -top-6 text-red-600/10 pointer-events-none">
                    <span class="material-symbols-outlined text-[120px]">${iconName}</span>
                </div>
                <div class="relative z-10 flex items-start gap-5">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] relative overflow-hidden group-hover:bg-red-500/20 transition-colors">
                            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50"></div>
                            <span class="material-symbols-outlined text-3xl text-red-500 animate-pulse">${iconName}</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-black tracking-widest uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Alerta Crítica</span>
                        </div>
                        <h4 class="font-bold text-xl text-white mb-1 tracking-tight">${data.title}</h4>
                        <p class="text-sm text-slate-300 leading-relaxed font-light">${data.text}</p>
                    </div>
                </div>
            </div>`;
    } else {
        // Fondo con patrón de tecnología/limpieza
        classes += " bg-gradient-to-r from-blue-950/95 to-black/90 border-cyan-400 text-white";
        notif.innerHTML = `
            <!-- Botón de Cerrar -->
            <button onclick="this.closest('div.group').remove()" class="absolute top-2 right-2 p-1 text-cyan-300/50 hover:text-white hover:bg-cyan-500/20 rounded-full transition-colors z-50">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>

            <!-- Elemento Visual de Fondo (Brillo limpio) -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative p-5">
                <div class="absolute -right-6 -top-6 text-cyan-500/10 pointer-events-none">
                    <span class="material-symbols-outlined text-[120px]">${iconName}</span>
                </div>
                <div class="relative z-10 flex items-start gap-5">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)] relative overflow-hidden group-hover:bg-cyan-400/20 transition-colors">
                            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50"></div>
                            <span class="material-symbols-outlined text-3xl text-cyan-400">${iconName}</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-black tracking-widest uppercase text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">Restauración Exitosa</span>
                        </div>
                        <h4 class="font-bold text-xl text-white mb-1 tracking-tight">${data.title}</h4>
                        <p class="text-sm text-white leading-relaxed font-medium">${data.text}</p>
                    </div>
                </div>
            </div>`;
    }
    
    notif.className = classes;
    
    // Limpiar notificaciones anteriores para no saturar
    container.innerHTML = '';
    container.appendChild(notif);

    // Animación de entrada
    requestAnimationFrame(() => {
        notif.classList.remove('translate-y-[-20px]', 'opacity-0');
    });
}

// --- MEJORA UX: Feedback Visual de Botones ---
function updateButtonUX() {
    const mapping = [
        { prop: 'trash', threat: 'btn-threat-basura', sol: 'btn-sol-limpieza' },
        { prop: 'bleaching', threat: 'btn-threat-reciclaje', sol: 'btn-sol-proteccion' },
        { prop: 'fishing', threat: 'btn-threat-pesca', sol: 'btn-sol-sostenible' },
        { prop: 'oil', threat: 'btn-threat-petroleo', sol: 'btn-sol-reforestacion' },
        { prop: 'noise', threat: 'btn-threat-ruido', sol: 'btn-sol-regulacion' }
    ];

    mapping.forEach(({ prop, threat, sol }) => {
        const isActive = pollutionState[prop];
        const tBtn = document.getElementById(threat);
        const sBtn = document.getElementById(sol);

        // Estado del botón de Amenaza
        if (tBtn) {
            if (isActive) {
                tBtn.classList.remove('bg-white/5', 'border-transparent');
                tBtn.classList.add('bg-red-500/20', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.3)]');
            } else {
                tBtn.classList.add('bg-white/5', 'border-transparent');
                tBtn.classList.remove('bg-red-500/20', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.3)]');
            }
        }

        // Estado del botón de Solución (Solo activo si hay problema)
        if (sBtn) {
            if (isActive) {
                sBtn.classList.remove('opacity-40', 'grayscale', 'pointer-events-none');
                sBtn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'animate-pulse');
            } else {
                sBtn.classList.add('opacity-40', 'grayscale', 'pointer-events-none');
                sBtn.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'animate-pulse');
            }
        }
    });
}

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

// SecciÃ³n "¿QuÃ© pasarÃ­a si...?"
function initWhatIfInteraction() {
    const blocks = [
        document.getElementById('whatif-block-a'),
        document.getElementById('whatif-block-b')
    ].filter(Boolean);

    const nextButton = document.getElementById('whatif-next-btn');
    const responseCard = document.getElementById('whatif-response-card');
    const responseBadge = document.getElementById('whatif-response-badge');
    const responseTitle = document.getElementById('whatif-response-title');
    const responseText = document.getElementById('whatif-response-text');
    const questionButtons = document.querySelectorAll('.whatif-question');

    if (!blocks.length || !nextButton || !responseCard || !responseBadge || !responseTitle || !responseText || !questionButtons.length) {
        return;
    }

    let activeBlock = 0;

    function renderBlock() {
        blocks.forEach((block, idx) => {
            block.classList.toggle('hidden', idx !== activeBlock);
        });
        nextButton.innerHTML = activeBlock === 0
            ? 'Siguiente <span class="material-symbols-outlined text-lg">arrow_forward</span>'
            : 'Volver al Bloque A <span class="material-symbols-outlined text-lg">restart_alt</span>';
    }

    nextButton.addEventListener('click', () => {
        activeBlock = (activeBlock + 1) % blocks.length;
        renderBlock();
    });

    function animateResponseCard() {
        responseCard.classList.remove('hidden', 'opacity-100', 'translate-y-0', 'scale-100');
        responseCard.classList.add('opacity-0', 'translate-y-3', 'scale-[0.98]');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                responseCard.classList.remove('opacity-0', 'translate-y-3', 'scale-[0.98]');
                responseCard.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            });
        });
    }

    questionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const question = button.dataset.question || 'Pregunta';
            const answer = button.dataset.answer || 'Sin respuesta disponible';
            const tone = button.dataset.tone || 'neutral';

            animateResponseCard();
            responseTitle.textContent = question;
            responseText.textContent = answer;

            if (tone === 'positive') {
                responseBadge.textContent = 'Impacto positivo';
                responseBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-primary/20 text-primary mb-3';
            } else {
                responseBadge.textContent = 'Impacto negativo';
                responseBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-red-500/20 text-red-300 mb-3';
            }
        });
    });

    renderBlock();
}

// Mini simulador "Elige tu decisiÃ³n"
function initDecisionSimulator() {
    const options = document.querySelectorAll('.decision-option');
    const tint = document.getElementById('decision-screen-tint');
    const feedback = document.getElementById('decision-feedback');
    const title = document.getElementById('decision-title');
    const text = document.getElementById('decision-text');
    const icon = document.getElementById('decision-icon');
    const wave = document.getElementById('decision-wave');

    if (!options.length || !tint || !feedback || !title || !text || !icon || !wave) {
        return;
    }

    function animateFeedback() {
        feedback.classList.remove('hidden', 'opacity-100', 'translate-y-0');
        feedback.classList.add('opacity-0', 'translate-y-3');
        wave.classList.remove('opacity-0', 'animate-pulse');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                feedback.classList.remove('opacity-0', 'translate-y-3');
                feedback.classList.add('opacity-100', 'translate-y-0');
                wave.classList.add('opacity-100', 'animate-pulse');
            });
        });
    }

    function setDecision(option) {
        const tone = option.dataset.tone || 'good';
        const messageTitle = option.dataset.title || 'Consecuencia de esta decisiÃ³n';
        const messageText = option.dataset.text || '';
        const messageIcon = option.dataset.icon || '🌊';

        if (tone === 'bad') {
            tint.style.background = 'rgba(185, 28, 28, 0.18)';
            tint.style.opacity = '1';
            icon.textContent = messageIcon;
            title.textContent = messageTitle;
            text.textContent = messageText;
            wave.className = 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-red-300/70 to-transparent';
            options.forEach((btn) => btn.classList.remove('ring-2', 'ring-green-300', 'ring-red-300'));
            option.classList.add('ring-2', 'ring-red-300');
        } else {
            tint.style.background = 'rgba(22, 163, 74, 0.18)';
            tint.style.opacity = '1';
            icon.textContent = messageIcon;
            title.textContent = messageTitle;
            text.textContent = messageText;
            wave.className = 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-green-300/70 to-transparent';
            options.forEach((btn) => btn.classList.remove('ring-2', 'ring-green-300', 'ring-red-300'));
            option.classList.add('ring-2', 'ring-green-300');
        }

        animateFeedback();
    }

    options.forEach((button) => {
        button.addEventListener('mouseleave', () => {
            tint.style.opacity = '0';
        });
        button.addEventListener('mouseenter', () => setDecision(button));
        button.addEventListener('click', () => setDecision(button));
    });
}

// Mini simulador por preguntas: "El oceano depende de ti..."
function initDecisionQuizSimulator() {
    const tint = document.getElementById('decision-screen-tint');
    const feedback = document.getElementById('decision-feedback');
    const title = document.getElementById('decision-title');
    const text = document.getElementById('decision-text');
    const icon = document.getElementById('decision-icon');
    const wave = document.getElementById('decision-wave');

    const progress = document.getElementById('decision-progress');
    const progressBar = document.getElementById('decision-progress-bar');
    const questionText = document.getElementById('decision-question-text');
    const optionA = document.getElementById('decision-option-a');
    const optionB = document.getElementById('decision-option-b');
    const prevBtn = document.getElementById('decision-prev-btn');
    const nextBtn = document.getElementById('decision-next-btn');

    if (!tint || !feedback || !title || !text || !icon || !wave || !progress || !progressBar || !questionText || !optionA || !optionB || !prevBtn || !nextBtn) {
        return;
    }

    const questionBank = [
        {
            q: 'Tras una actividad en playa, ¿que decision tiene menor impacto en tortugas y peces costeros?',
            options: [
                {
                    heading: 'Dejo envases y envolturas porque luego pasa el aseo municipal',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'El plastico puede tardar mas de 400 anios en degradarse y afectar a tortugas, peces y aves marinas.'
                },
                {
                    heading: 'Clasifico residuos y me llevo reciclables al salir',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Ayudas a reducir la contaminacion y proteges la vida marina, mejorando el equilibrio del ecosistema.'
                }
            ]
        },
        {
            q: 'En casa, ¿que accion reduce mejor la contaminacion que finalmente llega al oceano?',
            options: [
                {
                    heading: 'Verter aceite usado por el fregadero',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'El vertido de aceite reduce oxigeno y afecta organismos marinos desde la base de la cadena alimentaria.'
                },
                {
                    heading: 'Guardar aceite usado y llevarlo a un punto autorizado',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Evitas contaminacion en cuerpos de agua y contribuyes a mantener ecosistemas marinos mas saludables.'
                }
            ]
        },
        {
            q: 'Si compras bebidas con frecuencia, ¿que habito disminuye mas el residuo plastico marino?',
            options: [
                {
                    heading: 'Usar botellas desechables en cada salida',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'Se incrementa el volumen de residuos de un solo uso y el riesgo para fauna como tortugas y peces.'
                },
                {
                    heading: 'Llevar botella reutilizable y recargar agua',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Disminuyes residuos persistentes y ayudas a proteger habitats marinos a mediano y largo plazo.'
                }
            ]
        },
        {
            q: 'En una jornada comunitaria, ¿que decision genera un cambio mas sostenible?',
            options: [
                {
                    heading: 'Recoger basura una vez, sin separar ni registrar hallazgos',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'El impacto positivo se reduce y no se identifican fuentes de residuos para prevenir nueva contaminacion.'
                },
                {
                    heading: 'Participar en limpiezas con separacion de residuos y educacion local',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Se reduce la basura marina y se fortalece una cultura ambiental que protege playas y ecosistemas.'
                }
            ]
        },
        {
            q: 'Cuando visitas una isla, ¿que accion protege mejor los arrecifes cercanos?',
            options: [
                {
                    heading: 'Caminar sobre zonas coralinas para tomar fotos',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'El contacto fisico rompe estructuras coralinas y afecta refugios de peces juveniles.'
                },
                {
                    heading: 'Respetar zonas delimitadas y no tocar corales',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Ayudas a conservar arrecifes funcionales y a mantener su biodiversidad.'
                }
            ]
        },
        {
            q: 'Si organizas un evento en playa, ¿que decision reduce mas residuos?',
            options: [
                {
                    heading: 'Usar vasos y cubiertos de un solo uso',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'Aumenta residuos que pueden terminar en el mar por viento o lluvia.'
                },
                {
                    heading: 'Usar vajilla reutilizable y puntos de basura',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Disminuyes desechos y facilitas una gestion adecuada de residuos.'
                }
            ]
        },
        {
            q: 'En temporada de lluvias, ¿que habito ayuda mas al oceano desde la ciudad?',
            options: [
                {
                    heading: 'Botar basura en cunetas y desagues',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'Los residuos viajan por drenajes hacia rios y finalmente al mar.'
                },
                {
                    heading: 'Mantener limpios drenajes y separar desechos',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Reduces el arrastre de residuos y proteges ecosistemas costeros.'
                }
            ]
        },
        {
            q: 'Si compras mariscos, ¿que decision favorece mejor la sostenibilidad marina?',
            options: [
                {
                    heading: 'Comprar especies sin revisar su origen',
                    tone: 'bad',
                    icon: 'status',
                    title: 'Consecuencia de esta decision',
                    text: 'Puede aumentar la presion sobre especies y zonas de pesca vulnerables.'
                },
                {
                    heading: 'Elegir productos de pesca responsable',
                    tone: 'good',
                    icon: 'status',
                    title: 'Impacto de esta decision',
                    text: 'Apoyas practicas que cuidan poblaciones y habitats marinos.'
                }
            ]
        }
    ];

    function pickRandomQuestions(pool, count) {
        // Algoritmo Fisher-Yates para una aleatoriedad real y robusta
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    let questions = pickRandomQuestions(questionBank, 4);
    let currentQuestion = 0;
    let quizFinished = false;
    let selectedByQuestion = new Array(questions.length).fill(null);
    let currentDisplayOptions = [];

    function animateFeedback() {
        feedback.classList.remove('hidden', 'opacity-100', 'translate-y-0');
        feedback.classList.add('opacity-0', 'translate-y-3');
        wave.classList.remove('opacity-0', 'animate-pulse');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                feedback.classList.remove('opacity-0', 'translate-y-3');
                feedback.classList.add('opacity-100', 'translate-y-0');
                wave.classList.add('opacity-100', 'animate-pulse');
            });
        });
    }

    function paintTint(tone) {
        if (tone === 'bad') {
            tint.style.background = 'rgba(185, 28, 28, 0.18)';
        } else if (tone === 'good') {
            tint.style.background = 'rgba(22, 163, 74, 0.18)';
        } else {
            tint.style.background = 'rgba(56, 189, 248, 0.16)';
        }
        tint.style.opacity = '1';
    }

    function clearSelectionVisuals() {
        [optionA, optionB].forEach((btn) => btn.classList.remove('ring-4', 'ring-green-400', 'ring-red-500', 'bg-green-500/20', 'bg-red-500/20', 'border-green-400', 'border-red-500', 'scale-[1.02]', 'opacity-50'));
    }

    function styleChoiceButton(button, option) {
        // MEJORA VISUAL: Botones más atractivos con gradientes y elevación
        // Ajuste Mobile: p-4 en lugar de p-6 para ganar espacio horizontal
        button.className = 'decision-option group relative text-left p-4 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:to-white/5 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col justify-center min-h-[100px] md:min-h-[160px]';
        button.innerHTML = `
            <div class="w-full">
                <h3 class="text-sm md:text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors">${option.heading}</h3>
            </div>
        `;
    }

    function showResult(option) {
        paintTint(option.tone);
        wave.className = option.tone === 'bad'
            ? 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-red-300/70 to-transparent'
            : 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-green-300/70 to-transparent';
        icon.textContent = option.tone === 'bad' ? '🟥' : '🟢';
        title.textContent = option.title;
        text.textContent = option.text;
        animateFeedback();
    }

    function selectOption(index) {
        selectedByQuestion[currentQuestion] = currentDisplayOptions[index];
        const isGood = currentDisplayOptions[index].tone === 'good';
        
        clearSelectionVisuals();
        const selectedButton = index === 0 ? optionA : optionB;
        const otherButton = index === 0 ? optionB : optionA;

        // Feedback visual fuerte al seleccionar
        if (isGood) {
            selectedButton.classList.add('ring-4', 'ring-green-400', 'bg-green-500/20', 'border-green-400', 'scale-[1.02]');
            paintTint('good');
        } else {
            selectedButton.classList.add('ring-4', 'ring-red-500', 'bg-red-500/20', 'border-red-500', 'scale-[1.02]');
            paintTint('bad');
        }
        
        // Opacar la opción no seleccionada
        otherButton.classList.add('opacity-50');
    }

    function renderQuestion() {
        if (quizFinished) return;
        const question = questions[currentQuestion];
        const total = questions.length;
        // Aleatorizar el orden de las opciones (50/50) para evitar patrones predecibles
        currentDisplayOptions = Math.random() < 0.5
            ? [question.options[0], question.options[1]]
            : [question.options[1], question.options[0]];

        questionText.textContent = question.q;
        progress.textContent = `Pregunta ${currentQuestion + 1} de ${total}`;
        progressBar.style.width = `${((currentQuestion + 1) / total) * 100}%`;

        styleChoiceButton(optionA, currentDisplayOptions[0]);
        styleChoiceButton(optionB, currentDisplayOptions[1]);
        clearSelectionVisuals();
        tint.style.opacity = '0';

        prevBtn.disabled = currentQuestion === 0;
        prevBtn.classList.toggle('opacity-40', currentQuestion === 0);
        nextBtn.textContent = currentQuestion === total - 1 ? 'Ver resultado' : 'Siguiente';

        const selected = selectedByQuestion[currentQuestion];
        if (selected) {
            const selectedButton = selected === currentDisplayOptions[0] ? optionA : optionB;
            const otherButton = selected === currentDisplayOptions[0] ? optionB : optionA;
            
            // Restaurar estado visual si ya se respondió
            const isGood = selected.tone === 'good';
            if (isGood) {
                selectedButton.classList.add('ring-4', 'ring-green-400', 'bg-green-500/20', 'border-green-400');
                paintTint('good');
            } else {
                selectedButton.classList.add('ring-4', 'ring-red-500', 'bg-red-500/20', 'border-red-500');
                paintTint('bad');
            }
            otherButton.classList.add('opacity-50');
        }
    }

    // Eliminados los eventos mouseenter/mouseleave que causaban el parpadeo molesto del fondo
    optionA.addEventListener('click', () => selectOption(0));
    optionB.addEventListener('click', () => selectOption(1));

    prevBtn.addEventListener('click', () => {
        if (quizFinished) return;
        if (currentQuestion > 0) {
            currentQuestion -= 1;
            renderQuestion();
        }
    });

    function showFinalResults() {
        const total = questions.length;
        let score = 0;
        const lines = questions.map((question, index) => {
            const selectedOption = selectedByQuestion[index];
            const isCorrect = selectedOption && selectedOption.tone === 'good';
            if (isCorrect) score += 1;
            const reasonText = selectedOption ? selectedOption.text : 'No se seleccionó una respuesta en esta pregunta.';
            const selectedLabel = selectedOption ? selectedOption.heading : 'Sin respuesta seleccionada';
            return `
                <details class="bg-white/5 border border-white/10 rounded-xl p-3">
                    <summary class="cursor-pointer list-none flex items-center gap-2">
                        <span class="material-symbols-outlined text-base ${isCorrect ? 'text-green-300' : 'text-red-300'}">${isCorrect ? 'check_circle' : 'cancel'}</span>
                        <strong>Pregunta ${index + 1}: ${isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta'}</strong>
                    </summary>
                    <div class="mt-2 text-sm text-slate-200">
                        <div><strong>Tu respuesta:</strong> ${selectedLabel}</div>
                        <div class="text-slate-300 mt-1"><strong>Motivo:</strong> ${reasonText}</div>
                    </div>
                </details>
            `;
        });

        quizFinished = true;
        prevBtn.disabled = true;
        prevBtn.classList.add('opacity-40');
        nextBtn.textContent = 'Reiniciar cuestionario';

        paintTint(score >= 3 ? 'good' : 'bad');
        icon.className = `material-symbols-outlined text-2xl leading-none ${score >= 3 ? 'text-green-300' : 'text-coral-glow'}`;
        icon.textContent = score >= 3 ? 'workspace_premium' : 'waves';
        title.textContent = `Resultado final: ${score} de ${total}`;
        const intro = score >= 3
            ? 'Buen trabajo. Tus decisiones ayudan al oceano.'
            : 'Puedes mejorar. Cada decision cuenta para proteger el oceano.';
        text.innerHTML = `${intro}<br><br><span class="text-sm text-slate-300">Haz clic en cada pregunta para ver la explicación correspondiente.</span><br><br><div class="space-y-2">${lines.join('')}</div>`;
        wave.className = score >= 3
            ? 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-green-300/70 to-transparent'
            : 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-red-300/70 to-transparent';
        animateFeedback();
    }

    function restartQuiz() {
        questions = pickRandomQuestions(questionBank, 4);
        currentQuestion = 0;
        quizFinished = false;
        selectedByQuestion = new Array(questions.length).fill(null);
        feedback.classList.add('hidden');
        tint.style.opacity = '0';
        nextBtn.textContent = 'Siguiente';
        renderQuestion();
    }

    nextBtn.addEventListener('click', () => {
        if (quizFinished) {
            restartQuiz();
            return;
        }
        const selectedOption = selectedByQuestion[currentQuestion];
        if (!selectedOption) {
            paintTint('bad');
            icon.className = 'material-symbols-outlined text-2xl leading-none text-amber-300';
            icon.textContent = 'warning';
            title.textContent = 'Selecciona una opción';
            text.textContent = 'Elige una respuesta antes de pasar a la siguiente pregunta.';
            wave.className = 'mt-4 h-2 rounded-full bg-gradient-to-r from-transparent via-amber-300/70 to-transparent';
            animateFeedback();
            return;
        }

        if (currentQuestion < questions.length - 1) {
            currentQuestion += 1;
            renderQuestion();
            return;
        }

        showFinalResults();
    });

    renderQuestion();
}

// Simulador Drag & Drop: "Arrastra y decide"
function initDragDecideSimulator() {
    const items = document.querySelectorAll('.drag-item');
    const zones = [
        { id: 'drop-contamina', zone: 'contamina', tint: 'rgba(185, 28, 28, 0.20)' },
        { id: 'drop-protege', zone: 'protege', tint: 'rgba(22, 163, 74, 0.20)' }
    ];
    const tintLayer = document.getElementById('drag-decide-tint');
    const feedback = document.getElementById('drag-feedback');
    const feedbackTitle = document.getElementById('drag-feedback-title');
    const feedbackText = document.getElementById('drag-feedback-text');
    const resetButton = document.getElementById('drag-reset-btn');
    const floatingItems = document.getElementById('floating-items');
    const progressText = document.getElementById('drag-progress-text');
    const progressBar = document.getElementById('drag-progress-bar');

    if (!items.length || !tintLayer || !feedback || !floatingItems || !progressText || !progressBar) {
        return;
    }

    let draggedItem = null;
    const initialItemsParent = floatingItems;
    const initialOrder = Array.from(items);
    
    let totalItems = items.length;
    let score = 0;

    // Función centralizada para manejar el evento de soltar (Drop)
    // Funciona tanto para Mouse como para Touch
    function handleDropLogic(zoneElement, item) {
        const entry = zones.find(z => z.id === zoneElement.id);
        if (!entry) return;

        // Limpieza visual
        zoneElement.classList.remove('ring-4', 'ring-white/40', 'scale-[1.02]');
        
        // Resetear estilos de arrastre (especialmente los de touch)
        item.classList.remove('opacity-50', 'scale-110', 'z-50');
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.zIndex = '';
        item.style.width = '';

        setPlacedStyle(item, true);

        const dropItems = zoneElement.querySelector('.drop-items');
        if (dropItems) dropItems.appendChild(item);

        // Feedback Visual
        tintLayer.style.background = entry.tint;
        tintLayer.style.opacity = '1';
        setTimeout(() => { tintLayer.style.opacity = '0'; }, 500);

        const isCorrect = item.dataset.correctZone === entry.zone;
        const colorClass = isCorrect ? 'bg-green-500/20' : 'bg-red-500/20';
        
        zoneElement.classList.add(colorClass);
        setTimeout(() => zoneElement.classList.remove(colorClass), 600);

        const title = isCorrect ? `✅ Correcto: ${item.dataset.label}` : `❌ Incorrecto: ${item.dataset.label}`;
        showFeedback(title, item.dataset.explanation, isCorrect);
        recalculateState();
        draggedItem = null;
    }

    function setPlacedStyle(item, placed) {
        const textDiv = item.querySelector('.card-text');
        const imgContainer = item.querySelector('.card-img-container');

        if (placed) {
            // Modo "Icono Compacto" (Clash Royale en tablero)
            item.classList.remove('w-full');
            item.classList.add('w-16', 'h-16', 'rounded-lg'); // Cuadrado pequeño
            if (textDiv) textDiv.classList.add('hidden');
            if (imgContainer) {
                imgContainer.classList.remove('h-20', 'md:h-24');
                imgContainer.classList.add('h-full');
            }
        } else {
            // Modo "Carta Completa" (En mano)
            item.classList.add('w-full');
            item.classList.remove('w-16', 'h-16', 'rounded-lg');
            if (textDiv) textDiv.classList.remove('hidden');
            if (imgContainer) {
                imgContainer.classList.add('h-20', 'md:h-24');
                imgContainer.classList.remove('h-full');
            }
        }
    }

    function updateProgress() {
        const classifiedItems = document.querySelectorAll('.drop-zone .drag-item').length;
        const percentage = totalItems > 0 ? (classifiedItems / totalItems) * 100 : 0;
        
        if (progressText) progressText.textContent = `${classifiedItems} / ${totalItems}`;
        if (progressBar) progressBar.style.width = `${percentage}%`;

        if (classifiedItems === totalItems) {
            setTimeout(showFinalResult, 800);
        } else {
            const isFinalFeedback = feedbackText.textContent.includes("Tus decisiones demuestran");
            if (!feedback.classList.contains('hidden') && isFinalFeedback) {
                 feedback.classList.add('hidden');
            }
        }
    }

    function recalculateState() {
        let newScore = 0;
        const contaminaZone = document.getElementById('drop-contamina');
        const protegeZone = document.getElementById('drop-protege');

        if (contaminaZone) {
            contaminaZone.querySelectorAll('.drag-item').forEach(item => {
                if (item.dataset.correctZone === 'contamina') newScore++;
            });
        }
        if (protegeZone) {
            protegeZone.querySelectorAll('.drag-item').forEach(item => {
                if (item.dataset.correctZone === 'protege') newScore++;
            });
        }
        score = newScore;
        updateProgress();
    }

    function showFinalResult() {
        const finalScore = score;
        const percentage = totalItems > 0 ? (finalScore / totalItems) * 100 : 0;
        let title, message;

        if (percentage >= 80) {
            title = `¡Excelente! ${finalScore}/${totalItems} correctos`;
            message = "Tus decisiones demuestran un gran conocimiento sobre cómo proteger nuestros océanos. ¡Sigue así!";
        } else if (percentage >= 50) {
            title = `¡Buen trabajo! ${finalScore}/${totalItems} correctos`;
            message = "Vas por buen camino. Algunas decisiones son complejas, pero cada acierto es una victoria para el mar.";
        } else {
            title = `Se puede mejorar: ${finalScore}/${totalItems} correctos`;
            message = "No te preocupes. Lo importante es aprender. Revisa las explicaciones y vuelve a intentarlo para fortalecer tu conocimiento.";
        }
        showFeedback(title, message, percentage >= 50);
    }

    function showFeedback(title, message, isCorrect) {
        feedbackTitle.textContent = title;
        feedbackText.textContent = message;
        feedback.classList.remove('hidden', 'opacity-100', 'translate-y-0', 'border-green-400/40', 'border-red-400/40', 'border-amber-400/40');
        feedback.classList.add('opacity-0', 'translate-y-3');

        if (isCorrect === true) {
            feedback.classList.add('border-green-400/40');
        } else if (isCorrect === false) {
            feedback.classList.add('border-red-400/40');
        } else {
            feedback.classList.add('border-amber-400/40');
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                feedback.classList.remove('opacity-0', 'translate-y-3');
                feedback.classList.add('opacity-100', 'translate-y-0');
            });
        });
    }

    items.forEach((item) => {
        item.addEventListener('dragstart', (event) => {
            draggedItem = item;
            item.classList.add('opacity-50', 'scale-110', 'z-50');
            setPlacedStyle(item, false);
            event.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('opacity-50', 'scale-110', 'z-50');
            }
            draggedItem = null;
        });

        // --- SOPORTE TÁCTIL (Móvil / F12) ---
        item.addEventListener('touchstart', (e) => {
            if(e.cancelable) e.preventDefault(); // Evitar scroll mientras arrastras
            draggedItem = item;
            
            // Feedback visual inmediato
            item.classList.add('opacity-50', 'scale-110', 'z-50');
            setPlacedStyle(item, false);

            // Calcular posición inicial para el arrastre
            const touch = e.touches[0];
            const rect = item.getBoundingClientRect();
            item.dataset.offsetX = touch.clientX - rect.left;
            item.dataset.offsetY = touch.clientY - rect.top;
            
            // Convertir a posición fija para que siga el dedo libremente
            item.style.width = rect.width + 'px'; // Mantener ancho
            item.style.position = 'fixed';
            item.style.zIndex = '1000';
            item.style.left = (touch.clientX - item.dataset.offsetX) + 'px';
            item.style.top = (touch.clientY - item.dataset.offsetY) + 'px';
        }, { passive: false });

        item.addEventListener('touchmove', (e) => {
            if(e.cancelable) e.preventDefault();
            if (!draggedItem) return;
            const touch = e.touches[0];
            // Mover el elemento con el dedo
            item.style.left = (touch.clientX - item.dataset.offsetX) + 'px';
            item.style.top = (touch.clientY - item.dataset.offsetY) + 'px';
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            if (!draggedItem) return;
            const touch = e.changedTouches[0];
            
            // Ocultar brevemente para detectar qué hay debajo (la zona de drop)
            item.style.display = 'none';
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            item.style.display = '';
            
            const zoneElement = target ? target.closest('.drop-zone') : null;
            
            if (zoneElement) {
                handleDropLogic(zoneElement, draggedItem);
            } else {
                // Si no se soltó en una zona, resetear estilos
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
                item.style.zIndex = '';
                item.style.width = '';
                item.classList.remove('opacity-50', 'scale-110', 'z-50');
                draggedItem = null;
            }
        });
    });

    zones.forEach((entry) => {
        const zoneElement = document.getElementById(entry.id);
        if (!zoneElement) return;

        zoneElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            zoneElement.classList.add('ring-4', 'ring-white/40', 'scale-[1.02]');
        });

        zoneElement.addEventListener('dragleave', () => {
            zoneElement.classList.remove('ring-4', 'ring-white/40', 'scale-[1.02]');
        });

        zoneElement.addEventListener('drop', (event) => {
            event.preventDefault();
            if (!draggedItem) return;
            handleDropLogic(zoneElement, draggedItem);
        });
    });

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            score = 0;
            initialOrder.forEach((item) => {
                initialItemsParent.appendChild(item);
                setPlacedStyle(item, false);
            });
            
            feedback.classList.add('hidden');
            recalculateState();
        });
    }
    
    recalculateState();
}
