import React from 'react';
import { createPortal } from 'react-dom';
import { NotificationItem } from '../types';

interface NotificationsProps {
    notifications: NotificationItem[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
    return createPortal(
        <div className="fixed top-5 right-5 z-[9999] space-y-3">
            {notifications.map(notif => (
                <div key={notif.id} className="notification w-80 bg-black/80 backdrop-blur-lg border border-[var(--accent-color)] rounded-lg shadow-lg p-4">
                    <h4 className="font-bold text-lg text-[var(--accent-color)] font-orbitron">{notif.title}</h4>
                    <p className="text-white text-sm">{notif.message}</p>
                </div>
            ))}
        </div>,
        document.body
    );
};

export default Notifications;