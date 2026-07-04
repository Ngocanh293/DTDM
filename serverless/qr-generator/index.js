const QRCode = require('qrcode');

exports.handler = async (event) => {
    try {
        let text;
        if (event.body) {
            const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            text = body.text;
        } else {
            text = event.text;
        }
        
        if (!text) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: 'Text parameter is required' }),
            };
        }

        // Tạo ảnh QR Code dạng Data URL (ví dụ: data:image/png;base64,iVBOR...)
        const qrCodeDataUrl = await QRCode.toDataURL(text);
        
        // Chỉ lấy chuỗi Base64 (bỏ phần data:image/png;base64,)
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ qrCodeImage: base64Data })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ error: err.message })
        };
    }
};
