function selectCommitment(type, label) {
    const feedback = document.getElementById('feedback');
    const selectedLabel = document.getElementById('selected-commitment-label');

    if (selectedLabel) {
        selectedLabel.textContent = label || type;
    }

    if (!feedback) return;

    feedback.classList.remove('hidden');
    feedback.classList.add('animate-pulse');

    setTimeout(() => {
        feedback.classList.remove('animate-pulse');
    }, 1200);

    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 7000);

    console.log('Compromiso seleccionado:', type);
}
