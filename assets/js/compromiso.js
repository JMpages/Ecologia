function selectCommitment(type) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    feedback.classList.add('animate-pulse');

    // Simular envío a "blockchain"
    setTimeout(() => {
        feedback.classList.remove('animate-pulse');
        alert(`¡Compromiso "${type}" registrado exitosamente! Recibirás actualizaciones mensuales sobre el impacto global.`);
    }, 2000);

    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 8000);

    console.log('Compromiso seleccionado:', type);
}