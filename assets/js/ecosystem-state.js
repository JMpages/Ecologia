/**
 * ecosystem-state.js
 * Aplica los efectos de destrucción del ecosistema a todo el sitio web.
 * Lee el estado global desde localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DEFINIR LÓGICA DE REINICIO GLOBAL (Para todas las páginas excepto laboratorio que ya la tiene)
    if (!window.location.pathname.includes('laboratorio.html')) {
        window.resetEnvironment = function() {
            const cleanState = {
                trash: false,
                bleaching: false,
                fishing: false,
                oil: false,
                noise: false
            };
            localStorage.setItem('ocean_pollution_state', JSON.stringify(cleanState));
            window.location.reload();
        };

        // 2. INYECTAR BOTÓN DE REINICIO SI NO EXISTE
        if (!document.getElementById('floating-reset-btn')) {
            const btn = document.createElement('button');
            btn.id = 'floating-reset-btn';
            // Mismos estilos que en laboratorio.html
            btn.className = 'hidden fixed bottom-8 right-8 z-[9999] px-6 py-4 bg-primary text-deep-abyss font-bold rounded-full shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-110 transition-all items-center gap-3 border-4 border-white/20';
            btn.innerHTML = '<span class="material-symbols-outlined text-3xl">restart_alt</span> <span class="hidden md:inline text-lg">Reiniciar Escenario</span>';
            btn.onclick = window.resetEnvironment;
            document.body.appendChild(btn);
        }
    }

    // Evitar conflicto en laboratorio.html (ya tiene su propia lógica avanzada)
    if (window.location.pathname.includes('laboratorio.html')) return;

    const state = JSON.parse(localStorage.getItem('ocean_pollution_state'));
    const activeCount = state ? Object.values(state).filter(Boolean).length : 0;
    
    // 3. CONTROLAR VISIBILIDAD DEL BOTÓN
    const resetBtn = document.getElementById('floating-reset-btn');
    if (resetBtn) {
        if (activeCount > 0) {
            resetBtn.classList.remove('hidden');
            resetBtn.classList.add('flex');
        } else {
            resetBtn.classList.add('hidden');
            resetBtn.classList.remove('flex');
        }
    }
    
    // Si todo está sano, no hacemos nada
    if (activeCount === 0) {
        document.body.style.overflowX = '';
        return;
    }
    
    // Evitar scroll horizontal por rotaciones
    document.body.style.overflowX = 'hidden';

    // 1. APLICAR FILTROS VISUALES AL CUERPO (Atmósfera)
    let filters = [];
    if (state.trash) filters.push('sepia(0.6) hue-rotate(-30deg)'); // Agua sucia
    if (state.bleaching) filters.push('brightness(1.1) contrast(0.9) grayscale(0.4)'); // Calor/Muerte
    if (state.fishing) filters.push('saturate(0.2) brightness(0.9)'); // Vacío
    if (state.oil) filters.push('brightness(0.6) sepia(0.5) contrast(1.2)'); // Petróleo
    if (state.noise) filters.push('blur(1px) contrast(1.2)'); // Ruido visual

    if (filters.length > 0) {
        document.body.style.transition = "filter 2s ease, transform 2s ease";
        document.body.style.filter = filters.join(' ');
    }

    // 2. EFECTO DE DESTRUCCIÓN DE LA UI (Rotación y Caos)
    // Buscamos el contenedor principal
    const mainContainer = document.querySelector('main') || document.querySelector('section') || document.querySelector('.animate-float');
    
    if (mainContainer && activeCount > 0) {
        // Detener animaciones suaves si existen
        mainContainer.classList.remove('animate-float'); 
        
        // Aplicar distorsión caótica
        const chaos = activeCount * 2.5; // AUMENTADO: Mucho más caos
        const rot = (Math.random() - 0.5) * chaos; // Rotación más fuerte
        const skew = (Math.random() - 0.5) * chaos; // Inclinación más fuerte
        const scale = 1 - (chaos * 0.02); // Se encoge un poco más
        
        mainContainer.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        mainContainer.style.transform = `rotate(${rot}deg) skewX(${skew}deg) scale(${scale})`;
        
        // DESTRUCCIÓN INTERNA: Romper elementos individuales (tarjetas, artículos)
        const innerElements = document.querySelectorAll('article, .group, .visual-card, .mini-info-card');
        innerElements.forEach((el, idx) => {
            // Determinismo visual basado en índice para que parezca roto pero estático
            const sign = idx % 2 === 0 ? 1 : -1;
            const randomRot = sign * (Math.random() * activeCount * 3); // Rotación interna duplicada
            const randomY = (Math.random() * activeCount * 10); // Desplazamiento vertical mayor
            
            el.style.transition = "transform 0.5s ease";
            el.style.transform = `translateY(${randomY}px) rotate(${randomRot}deg)`;
            el.style.opacity = Math.max(0.7, 1 - (activeCount * 0.05));
        });
    }

    // 3. ROMPER LA BARRA DE NAVEGACIÓN (Navbar)
    const nav = document.querySelector('nav');
    if (nav && activeCount > 0) {
        const navLogo = nav.querySelector('a[href="index.html"]');
        const navMenu = nav.querySelector('.hidden.md\\:flex'); // CORREGIDO: Doble escape para selector válido
        
        if(navLogo && navMenu) {
             const separation = activeCount * 10; // IGUALADO AL LABORATORIO
             const rotation = activeCount * 1;
             
             navLogo.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
             navMenu.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
             
             navLogo.style.transform = `translateX(-${separation}px) rotate(-${rotation}deg)`;
             navMenu.style.transform = `translateX(${separation}px) rotate(${rotation}deg)`;
             
             // Grieta visual (borde rojo)
             const navContainer = nav.querySelector('div');
             if(navContainer) {
                 navContainer.style.borderColor = `rgba(255, 50, 50, ${activeCount * 0.2})`;
                 navContainer.style.boxShadow = `0 0 ${activeCount * 5}px rgba(255,0,0,${activeCount * 0.1})`;
             }
        }
    }
});
