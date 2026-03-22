import React from 'react';

const ShareButton: React.FC<{ opportunity: any }> = ({ opportunity }) => {
    const shareOnWhatsApp = () => {
        const url = `https://example.com/opportunity/${opportunity.id}`;  // Replace with actual opportunity URL.
        const message = `Check out this opportunity: ${url}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button onClick={shareOnWhatsApp}>
            Share on WhatsApp
        </button>
    );
};

export default ShareButton;