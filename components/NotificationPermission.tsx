import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptic';

interface NotificationPermissionProps {
    onPermissionUpdate: (permission: NotificationPermission) => void;
}

const NotificationPermission: React.FC<NotificationPermissionProps> = ({ onPermissionUpdate }) => {
    const [status, setStatus] = useState(Notification.permission);

    const requestPermission = async () => {
        triggerHaptic();
        if (!("Notification" in window)) {
            alert("Este navegador não suporta notificações de desktop");
            setStatus('denied');
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            setStatus(permission);
            onPermissionUpdate(permission);
        }
    };
    
    if (status === 'granted') {
        return null;
    }

    return (
        <div className="bg-base-200 p-6 rounded-xl text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Ativar Lembretes</h2>
            <p className="text-neutral/60 mb-4">
                Para receber lembretes de medicamentos e consultas, precisamos da sua permissão para enviar notificações.
            </p>
            {status === 'denied' ? (
                <p className="text-red-500">
                    As notificações foram bloqueadas. Por favor, habilite-as nas configurações do seu navegador para usar os lembretes.
                </p>
            ) : (
                <button
                    onClick={requestPermission}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 shadow-lg"
                >
                    Permitir Notificações
                </button>
            )}
        </div>
    );
};

export default NotificationPermission;
