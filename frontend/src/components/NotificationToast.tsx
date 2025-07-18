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
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className="toast show bg-primary text-white" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">New Purchase Request!</strong>
                    <button type="button" className="btn-close" onClick={onDecline} aria-label="Close"></button>
                </div>
                <div className="toast-body">
                    User <span className="fw-bold">{notification.buyerUsername}</span> wants to buy your item: <span className="fw-bold">{notification.productName}</span>.
                </div>
                <div className="mt-2 p-2 border-top border-light-subtle">
                    <button onClick={onAccept} className="btn btn-success btn-sm me-2">Accept & Chat</button>
                    <button onClick={onDecline} className="btn btn-secondary btn-sm">Decline</button>
                </div>
            </div>
        </div>
    );
}
