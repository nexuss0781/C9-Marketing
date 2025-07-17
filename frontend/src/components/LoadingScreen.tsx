// src/components/LoadingScreen.tsx
import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-32 h-32"
            >
                <motion.div
                    className="w-full h-full border-4 border-indigo-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ ease: "linear", duration: 1.5, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">C9</span>
                </div>
            </motion.div>
        </div>
    );
}