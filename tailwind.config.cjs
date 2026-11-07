// Regenerate after editing index.html: npx tailwindcss@3.4.17 --minify -o assets/portfolio.css
module.exports = {
    content: ['./index.html'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Gilroy', 'Gilroy-Regular', 'Gilroy-Medium', 'Gilroy-Bold', 'sans-serif'],
                mono: ['Gilroy', 'Gilroy-Medium', 'sans-serif'],
            },
            colors: {
                zinc: {
                    850: '#18181c',
                    900: '#111114',
                    925: '#0c0c0f',
                    950: '#070709',
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'blob': 'blob 12s infinite alternate',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'marquee': 'marquee 28s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
                'float': 'float 4s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(22px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '50%': { transform: 'translate(25px, -35px) scale(1.08)' },
                    '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                }
            }
        }
    }
}
