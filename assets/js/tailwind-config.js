/** @type {import('tailwindcss').Config} */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                // 1. Base y Fondo (Preservados para mantener la atmósfera Deep Sea)
                'deep-abyss': '#0f172a',
                'ocean-depth': '#1e293b',

                // 2. Gradientes del Fondo (Preservados para no romper el efecto visual)
                'caribbean-blue': '#00B4D8',
                'tropical-teal': '#0077B6',
                'ocean-green': '#03045E',

                // 3. Nueva Paleta "Ocean" (Sustituyendo y expandiendo)
                ocean: {
                    dark: '#2D5A8B',
                    medium: '#5687BC',
                    light: '#A8D1F0',
                    box: '#88C6F1',
                    coral: '#FF7F50',
                    accent: '#FFD700',
                },

                // 4. Alias para compatibilidad (Mapeando a la nueva paleta)
                'primary': '#88C6F1',     // = ocean.box (Reemplaza el azul anterior)
                'coral-glow': '#FF7F50',  // = ocean.coral (Reemplaza el rosa anterior)
                'sun-ray': '#FFD700',     // = ocean.accent
                'kelp-forest': '#10b981', // Se mantiene (no hay verde en la nueva paleta)
            }
        }
    }
}