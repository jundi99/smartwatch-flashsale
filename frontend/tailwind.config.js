/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4f46e5',
                    hover: '#4338ca',
                },
                secondary: '#111827',
                accent: '#10b981',
                danger: '#ef4444',
                light: '#f9fafb',
                dark: '#1f2937'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-in-down': 'slideInDown 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
}