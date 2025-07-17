// src/components/NotificationToast.tsx
interface NotificationData {
    productName: string;
    buyerUsername: string;
}

interface NotificationToastProps {
    notification: NotificationData;
    onAccept: () => void;
    onDecline: () => void;
}

export default function NotificationToast({ notification, onAccept, onDecline }: NotificationToastProps) {
    return (
        <div className="fixed top-5 right-5 bg-indigo-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 animate-fade-in-down">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">New Purchase Request!</p>
                    <p className="text-sm mt-1">
                        User <span className="font-semibold">{notification.buyerUsername}</span> wants to buy your item: <span className="font-semibold">{notification.productName}</span>.
                    </p>
                </div>
                <button onClick={onDecline} className="ml-4 text-2xl font-bold leading-none">×</button>
            </div>
            <div className="flex justify-end space-x-2 mt-3">
                <button onClick={onDecline} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold">Decline</button>
                <button onClick={onAccept} className="px-3 py-1 bg-green-500 hover:bg-green-400 rounded text-xs font-semibold">Accept & Chat</button>
            </div>
        </div>
    );
}
