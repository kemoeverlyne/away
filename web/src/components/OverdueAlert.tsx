import { motion } from 'framer-motion';

interface OverdueAlertProps {
    count: number;
    onTakeAction: () => void;
}

export const OverdueAlert = ({ count, onTakeAction }: OverdueAlertProps) => {
    if (count === 0) return null;

    return (
        <motion.div 
            className="overdue-alert-modern"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <div>
                    <strong>Action Required: {count} Overdue Payments</strong>
                    <p style={{ margin: 0, fontSize: '14px', color: '#b91c1c', opacity: 0.8 }}>These loans have exceeded their due date and require immediate follow-up.</p>
                </div>
            </div>
            <button className="alert-btn-modern" onClick={onTakeAction}>Take Action Now</button>
        </motion.div>
    );
};

