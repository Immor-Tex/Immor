import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { motion, LazyMotion, domAnimation } from 'framer-motion';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <LazyMotion features={domAnimation}>
        <motion.main 
          className="flex-grow pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </LazyMotion>
      <Footer />
    </div>
  );
};