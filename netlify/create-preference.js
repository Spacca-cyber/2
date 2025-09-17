const mercadopago = require('mercadopago');

mercadopago.configurations.setAccessToken("APP_USR-8966953823440998-091522-d3b915673a779d47d41b14f425fbc7a8-1720960443");

exports.handler = async function(event, context) {
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

	const preference = {
		items: [
			{
				title: body.title || "Produto Exemplo",
				unit_price: Number(body.unit_price) || 10,
				quantity: Number(body.quantity) || 1
			}
		]
	};

	try {
		const response = await mercadopago.preferences.create(preference);
		return {
			statusCode: 200,
			body: JSON.stringify({ id: response.body.id, init_point: response.body.init_point })
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message })
		};
	}
};
