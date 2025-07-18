// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaTelegram } from 'react-icons/fa';

const SocialIcon = ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none fs-4 mx-3">
        {children}
    </a>
);

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <motion.div
        className="card bg-dark text-white p-5 text-center h-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
    >
        <div className="fs-1 text-primary mb-4">{icon}</div>
        <h3 className="fs-2 fw-bold text-white mb-3">{title}</h3>
        <p className="text-light lead">{description}</p>
    </motion.div>
);

const TestimonialCard = ({ quote, author, role }: { quote: string, author:string, role:string }) => (
    <motion.div
        className="card bg-dark text-white p-4 h-100"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
    >
        <p className="fst-italic text-light fs-5">"{quote}"</p>
        <div className="d-flex align-items-center mt-4">
            <img className="rounded-circle me-3" src={`https://i.pravatar.cc/150?u=${author}`} alt={author} style={{ width: '48px', height: '48px' }} />
            <div>
                <p className="fw-bold text-white mb-0">{author}</p>
                <p className="text-sm text-primary mb-0">{role}</p>
            </div>
        </div>
    </motion.div>
);

export default function LandingPage() {
    return (
        <div className="bg-dark text-white">
            <div className="position-relative vh-100 d-flex flex-column justify-content-center align-items-center text-center p-3 overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50"></div>
                    <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600" alt="Marketplace" className="w-100 h-100 object-cover" />
                </div>
                <div className="position-relative">
                    <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="display-1 fw-bolder mb-4 text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        C9 Marketplace
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="lead text-light mx-auto mb-5" style={{ maxWidth: '800px' }}>
                        The modern, direct, and commission-free platform to exchange goods. Your community marketplace awaits.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
                        <Link to="/signup" className="btn btn-primary btn-lg px-5 py-3 me-2">Get Started</Link>
                        <Link to="/login" className="btn btn-outline-light btn-lg px-5 py-3 ms-2">Sign In</Link>
                    </motion.div>
                </div>
            </div>
            <div className="py-5 px-3 container text-center">
                <h2 className="display-4 fw-bold mb-5">Why Choose Us?</h2>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    <div className="col"><FeatureCard icon="💰" title="Zero Commission" description="You keep 100% of your sale. We don't take a cut, ensuring maximum value for sellers." /></div>
                    <div className="col"><FeatureCard icon="💬" title="Real-Time Chat" description="Communicate instantly and directly with buyers and sellers to negotiate and arrange pickups." /></div>
                    <div className="col"><FeatureCard icon="🛡️" title="Simple & Secure" description="A streamlined, no-fuss interface focused on connecting people in a secure environment." /></div>
                </div>
            </div>
            <div className="bg-secondary bg-opacity-25 py-5 px-3">
                <div className="container text-center">
                     <h2 className="display-4 fw-bold mb-5">What Our Users Say</h2>
                     <div className="row row-cols-1 row-cols-md-2 g-4 mx-auto" style={{ maxWidth: '900px' }}>
                        <div className="col"><TestimonialCard quote="Sold my old laptop in a day! The direct chat made it so easy to coordinate with the buyer." author="Alex Johnson" role="Seller" /></div>
                        <div className="col"><TestimonialCard quote="Found the exact textbook I needed for a great price. No hidden fees or complicated checkout." author="Samantha Bee" role="Buyer" /></div>
                     </div>
                </div>
            </div>
            <footer className="bg-black py-5 text-center">
                <div className="container">
                    <p className="fs-4 fw-semibold mb-4">Join the C9 Community</p>
                    <div className="d-flex justify-content-center mb-5">
                        <SocialIcon href="#"><FaFacebook /></SocialIcon>
                        <SocialIcon href="#"><FaTwitter /></SocialIcon>
                        <SocialIcon href="#"><FaInstagram /></SocialIcon>
                        <SocialIcon href="#"><FaLinkedin /></SocialIcon>
                        <SocialIcon href="#"><FaGithub /></SocialIcon>
                        <SocialIcon href="#"><FaTelegram /></SocialIcon>
                    </div>
                    <p className="text-muted">© 2025 C9 Marketplace. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
