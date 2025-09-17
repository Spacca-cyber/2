
const mercadopago = require('mercadopago');
const qrcode = require('qrcode');


// Chaves de produção Mercado Pago via variáveis de ambiente
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

mercadopago.configurations.setAccessToken(ACCESS_TOKEN);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido" })
    };
  }

  // Lê todos os valores enviados para montar a preferência
  const items = Array.isArray(body.items) && body.items.length > 0 ? body.items : [
    {
      title: body.title || "Produto Exemplo",
      unit_price: Number(body.unit_price) || 10,
      quantity: Number(body.quantity) || 1
    }
  ];

  const preference = {
    items,
    payer: body.payer,
    back_urls: body.back_urls,
    auto_return: body.auto_return
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    const init_point = response.body.init_point;

    // Gera QR Code do link de pagamento
    const qrCodeDataUrl = await qrcode.toDataURL(init_point);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: response.body.id,
        init_point,
        qr_code: qrCodeDataUrl,
        public_key: PUBLIC_KEY
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
