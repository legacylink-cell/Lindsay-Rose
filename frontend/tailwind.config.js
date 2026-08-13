/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                fontFamily: {
                        serif: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                },
                fontWeight: {
                        '600': '600',
                        '700': '700',
                        '800': '800',
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        brand: {
                                green: '#1F5B3A',
                                greenDark: '#16442B',
                                greenLight: '#4CAF50',
                                greenBright: '#4CAF50',
                                cream: '#FFF7E6',
                                sage: '#EAF3EC',
                                amber: '#F4C542',
                                amberLight: '#F7D673',
                                ink: '#333333',
                        },
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                },
                boxShadow: {
                        soft: '0 10px 40px -12px rgba(31, 91, 58, 0.18)',
                        lift: '0 24px 60px -20px rgba(31, 91, 58, 0.28)',
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
