import { motion } from 'framer-motion';
import '../styles/NotFound.css';

export const NotFound = () => {
  return (
    <div className="notfound-container">
      <motion.div
        className="notfound-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="notfound-badge">404</div>
        <h1>Page not found</h1>
        <p>
          We couldn&apos;t find the page you were looking for. Check the address
          or return to the dashboard.
        </p>
        <a className="notfound-button" href="/">
          Back to dashboard
        </a>
      </motion.div>
    </div>
  );
};

