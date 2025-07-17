// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaTelegram } from 'react-icons/fa';

const SocialIcon = ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-white transition duration-300 text-2xl">
        {children}
    </a>
);

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <motion.div
        className="card-base p-8 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10, boxShadow: "0px 10px 30px rgba(79, 70, 229, 0.2)" }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
    >
        <div className="text-5xl text-primary mb-4 mx-auto">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
);

const TestimonialCard = ({ quote, author, role }: { quote: string, author:string, role:string }) => (
    <motion.div
        className="card-base p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
    >
        <p className="italic text-gray-300 text-lg">"{quote}"</p>
        <div className="flex items-center mt-6">
            <img className="w-12 h-12 rounded-full mr-4" src={`https://i.pravatar.cc/150?u=${author}`} alt={author} />
            <div>
                <p className="font-bold text-white">{author}</p>
                <p className="text-sm text-primary">{role}</p>
            </div>
        </div>
    </motion.div>
);

export default function LandingPage() {
    return (
        <div className="bg-background">
            <div className="relative min-h-screen flex flex-col justify-center items-center text-center p-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600" alt="Marketplace" className="object-cover w-full h-full" />
                </div>
                <div className="relative z-20">
                    <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-extrabold mb-4 text-shadow-lg text-white">
                        C9 Marketplace
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                        The modern, direct, and commission-free platform to exchange goods. Your community marketplace awaits.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="space-x-4">
                        <Link to="/signup" className="btn-primary py-3 px-8 text-lg">Get Started</Link>
                        <Link to="/login" className="btn-secondary py-3 px-8 text-lg">Sign In</Link>
                    </motion.div>
                </div>
            </div>
            <div className="py-24 px-6 container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-16">Why Choose Us?</h2>
                <div className="grid md:grid-cols-3 gap-10">
                    <FeatureCard icon="💰" title="Zero Commission" description="You keep 100% of your sale. We don't take a cut, ensuring maximum value for sellers." />
                    <FeatureCard icon="💬" title="Real-Time Chat" description="Communicate instantly and directly with buyers and sellers to negotiate and arrange pickups." />
                    <FeatureCard icon="🛡️" title="Simple & Secure" description="A streamlined, no-fuss interface focused on connecting people in a secure environment." />
                </div>
            </div>
            <div className="bg-surface/50 py-24 px-6">
                <div className="container mx-auto text-center">
                     <h2 className="text-4xl font-bold mb-16">What Our Users Say</h2>
                     <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                        <TestimonialCard quote="Sold my old laptop in a day! The direct chat made it so easy to coordinate with the buyer." author="Alex Johnson" role="Seller" />
                        <TestimonialCard quote="Found the exact textbook I needed for a great price. No hidden fees or complicated checkout." author="Samantha Bee" role="Buyer" />
                     </div>
                </div>
            </div>
            <div className="bg-surface py-16 text-center">
                <div className="container mx-auto">
                    <p className="text-xl font-semibold mb-6">Join the C9 Community</p>
                    <div className="flex justify-center space-x-8 mb-10">
                        <SocialIcon href="#"><FaFacebook /></SocialIcon>
                        <SocialIcon href="#"><FaTwitter /></SocialIcon>
                        <SocialIcon href="#"><FaInstagram /></SocialIcon>
                        <SocialIcon href="#"><FaLinkedin /></SocialIcon>
                        <SocialIcon href="#"><FaGithub /></SocialIcon>
                        <SocialIcon href="#"><FaTelegram /></SocialIcon>
                    </div>
                    <p className="text-muted">© 2025 C9 Marketplace. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
}