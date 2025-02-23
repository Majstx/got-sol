import QRCode from 'qrcode';

export async function generatePaymentQR(label: string, recipient: string, amount?: number) {
    try {
        // Base URL for your payment page
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://got-sol-two.vercel.app';
        
        // Construct payment URL with parameters
        const paymentUrl = new URL('/new', baseUrl);
        paymentUrl.searchParams.append('label', label);
        paymentUrl.searchParams.append('recipient', recipient);
        if (amount) {
            paymentUrl.searchParams.append('amount', amount.toString());
        }

        // Generate QR code
        const qrDataUrl = await QRCode.toDataURL(paymentUrl.toString(), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return qrDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
} 