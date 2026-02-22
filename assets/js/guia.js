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

updateProgress();
