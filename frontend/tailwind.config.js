// This is the object to replace inside tailwind.config.js
theme: {
    extend: {
        colors: {
            'primary': {
                DEFAULT: '#4f46e5', // A strong, accessible indigo
                'hover': '#4338ca', // A slightly darker shade for interaction
            },
            'background': '#111827',    // The primary dark background (gray-900)
            'surface': '#1f2937',       // For cards and elevated elements (gray-800)
            'muted': '#4b5563',         // For borders and secondary text (gray-600)
            'subtle': '#9ca3af',        // For placeholder text and icons (gray-400)
        },
        boxShadow: {
            'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }
    },
},