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
            btn.className = 'hidden fixed bottom-24 right-6 md:right-10 z-[9999] px-6 py-4 bg-primary text-deep-abyss font-bold rounded-full shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-110 transition-all items-center gap-3 border-4 border-white/20 cursor-pointer flex';
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
        // Asegurar posición correcta por si acaso
        resetBtn.classList.replace('bottom-8', 'bottom-24'); 
        
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

    // 1. CREAR WRAPPER PARA AISLAR EL BOTÓN DE LOS FILTROS
    // Esto evita que el botón fixed se rompa o se vaya al fondo
    let contentWrapper = document.getElementById('global-destruction-wrapper');
    if (!contentWrapper) {
        contentWrapper = document.createElement('div');
        contentWrapper.id = 'global-destruction-wrapper';
        contentWrapper.style.width = '100%';
        contentWrapper.style.minHeight = '100vh';
        
        // Mover todo el contenido excepto scripts y el botón al wrapper
        const children = Array.from(document.body.children);
        children.forEach(child => {
            if (child.tagName !== 'SCRIPT' && child.id !== 'floating-reset-btn' && child.id !== 'impact-feedback-container') {
                contentWrapper.appendChild(child);
            }
        });
        document.body.insertBefore(contentWrapper, document.body.firstChild);
    }

    // 2. APLICAR FILTROS VISUALES AL WRAPPER (Atmósfera)
    let filters = [];
    if (state.trash) filters.push('sepia(0.6) hue-rotate(-30deg)'); // Agua sucia
    if (state.bleaching) filters.push('brightness(1.1) contrast(0.9) grayscale(0.4)'); // Calor/Muerte
    if (state.fishing) filters.push('saturate(0.2) brightness(0.9)'); // Vacío
    if (state.oil) filters.push('brightness(0.6) sepia(0.5) contrast(1.2)'); // Petróleo
    if (state.noise) filters.push('blur(1px) contrast(1.2)'); // Ruido visual
    
    // Blur acumulativo (Igual que en laboratorio pero suave)
    if (activeCount > 0) filters.push(`blur(${activeCount * 0.3}px)`);

    if (filters.length > 0) {
        contentWrapper.style.transition = "filter 2s ease";
        contentWrapper.style.filter = filters.join(' ');
    }

    // 3. EFECTO DE DESTRUCCIÓN DE LA UI (Rotación y Caos)
    // Buscamos el contenedor principal
    const mainContainer = document.querySelector('main') || document.querySelector('section') || document.querySelector('.animate-float');
    
    if (mainContainer && activeCount > 0) {
        // Detener animaciones suaves si existen
        mainContainer.classList.remove('animate-float'); 
        
        // Aplicar distorsión caótica
        const chaos = activeCount * 1.5; // REDUCIDO: Caos controlado
        const rot = (Math.random() - 0.5) * chaos; 
        const skew = (Math.random() - 0.5) * chaos; 
        const scale = 1 - (chaos * 0.01); 
        
        // Desplazamiento global
        const x = (Math.random() - 0.5) * chaos;
        
        mainContainer.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        mainContainer.style.transform = `translateX(${x}px) rotate(${rot}deg) skewX(${skew}deg) scale(${scale})`;
        
        // DESTRUCCIÓN INTERNA: Romper elementos individuales (tarjetas, artículos)
        // AÑADIDO: .glass-card y footer a para que afecte a las nuevas tarjetas del dashboard y enlaces del pie de página.
        const innerElements = document.querySelectorAll('article, .group, .visual-card, .mini-info-card, .glass-card, footer a');
        innerElements.forEach((el, idx) => {
            // Determinismo visual basado en índice para que parezca roto pero estático
            const sign = idx % 2 === 0 ? 1 : -1;
            const randomRot = sign * (Math.random() * activeCount * 5); // Rotación interna muy fuerte
            const randomY = (Math.random() * activeCount * 20); // Elementos cayendo
            
            el.style.transition = "transform 0.5s ease";
            el.style.transform = `translateY(${randomY}px) rotate(${randomRot}deg)`;
            el.style.opacity = Math.max(0.7, 1 - (activeCount * 0.05));
        });
    }

    // 3. ROMPER LA BARRA DE NAVEGACIÓN (Navbar)
    const nav = document.querySelector('nav');
    if (nav && activeCount > 0) {
        // Destrucción individual de enlaces (sin mover el contenedor principal para no romper el centrado)
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach((link) => {
             const chaos = activeCount * 3;
             const x = (Math.random() - 0.5) * chaos;
             const y = (Math.random() - 0.5) * chaos;
             const rot = (Math.random() - 0.5) * chaos * 2;
             
             link.style.display = 'inline-block';
             link.style.transition = "transform 0.5s ease";
             link.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        });

        // Grieta visual (borde rojo)
        const navContainer = nav.querySelector('div');
        if(navContainer) {
             navContainer.style.borderColor = `rgba(255, 50, 50, ${activeCount * 0.2})`;
             navContainer.style.boxShadow = `0 0 ${activeCount * 5}px rgba(255,0,0,${activeCount * 0.1})`;
        }
    }
});
