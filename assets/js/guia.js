function toggleAction(checkbox) {
    const item = checkbox.parentElement;
    if (checkbox.checked) {
        item.classList.add('bg-primary/20', 'border-primary/50');
        item.classList.remove('bg-white/5');
    } else {
        item.classList.remove('bg-primary/20', 'border-primary/50');
        item.classList.add('bg-white/5');
    }
    updateProgress();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const total = checkboxes.length;
    const percentage = Math.round((checked / total) * 100);

    const circle = document.getElementById('progress-circle');
    const text = document.getElementById('progress-text');

    circle.style.strokeDasharray = `${percentage}, 100`;
    text.textContent = `${percentage}%`;
}

function showTip(actionId) {
    const tips = {
        action1: "💡 Tip Pro: Usa una botella reutilizable y lleva tus propias bolsas de tela. Reduce hasta 500 plásticos al año por persona.",
        action2: "💡 Tip Pro: Organiza limpiezas mensuales en tu comunidad. Un solo evento puede recoger hasta 100kg de basura.",
        action3: "💡 Tip Pro: Busca el sello azul MSC (Marine Stewardship Council) en productos del mar.",
        action4: "💡 Tip Pro: Crea contenido educativo en redes. Comparte infografías sobre contaminación marina.",
        action5: "💡 Tip Pro: Elige productos con certificación ecológica. Evita microperlas en exfoliantes.",
        action6: "💡 Tip Pro: Únete a organizaciones como Greenpeace o WWF. Tu voz cuenta en las elecciones."
    };
    alert(tips[actionId]);
}