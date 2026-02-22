/**
 * ocean-bg.js
 * Fondo interactivo de partículas marinas para secciones informativas.
 * Crea un efecto inmersivo de "estar bajo el agua" sin saturar la lectura.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ocean-canvas');
    if (!canvas) return;

    // Configuración básica Three.js
    const scene = new THREE.Scene();
    // Niebla azulada para profundidad
    const cleanColor = new THREE.Color('#0077be');
    scene.fog = new THREE.FogExp2(cleanColor, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Iluminación suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // --- SISTEMA DE PARTÍCULAS MEJORADO ---
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
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount);

    for(let i=0; i<particlesCount; i++) {
        posArray[i*3] = (Math.random() - 0.5) * 50;
        posArray[i*3+1] = (Math.random() - 0.5) * 30;
        posArray[i*3+2] = (Math.random() - 0.5) * 30;
        speedArray[i] = Math.random() * 0.02 + 0.01; // Velocidad de ascenso
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('speed', new THREE.BufferAttribute(speedArray, 1));

    const particlesMat = new THREE.PointsMaterial({
        size: 0.15,
        map: getSoftTexture(),
        transparent: true,
        opacity: 0.5, // Un poco más sutil que en el laboratorio para no distraer
        color: 0x88c6f1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Animación
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Movimiento individual de partículas (Burbujas subiendo)
        const positions = particlesMesh.geometry.attributes.position.array;
        const speeds = particlesMesh.geometry.attributes.speed.array;
        
        for(let i=0; i<particlesCount; i++) {
            positions[i*3+1] += speeds[i];
            if(positions[i*3+1] > 15) positions[i*3+1] = -15; // Loop infinito
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
        
        // Rotación global suave (Corriente)
        particlesMesh.rotation.y = time * 0.02;

        renderer.render(scene, camera);
    }
    animate();

    // Responsividad
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});