// src/components/LoadingScreen.tsx
import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-dark">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="position-relative" style={{ width: '128px', height: '128px' }}
            >
                <motion.div
                    className="w-100 h-100 border border-4 border-primary rounded-circle"
                    animate={{ rotate: 360 }}
                    transition={{ ease: "linear", duration: 1.5, repeat: Infinity }}
                />
                <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center">
                    <span className="text-white fs-1 fw-bold">C9</span>
                </div>
            </motion.div>
        </div>
    );
}