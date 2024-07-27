const headersJSON = {
	"content-type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
}

const headersHTML = {
	"content-type": "text/html;charset=UTF-8",
	"Access-Control-Allow-Origin": "*",
}

function randomString(length: number): string {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function isValidHttpUrl(string: string): boolean {
	let url;

	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

interface ShortenRequest {
	[key: string]: string
}

export default {
	async fetch(request, env, ctx): Promise<Response> {

		// Shorten a link
		if (request.method == 'POST') {

			// Generate a random short link until it is unique
			let short = ''
			do {
				short = randomString(6)
			} while (await env.links.get(short) != null);
			let requestData: ShortenRequest

			// Ensure the request is JSON
			try {
				requestData = await request.json()
			} catch (error) {
				return new Response('{"error": "Invalid JSON"}', {
					status: 400,
					headers: headersJSON,
				})
			}

			// Ensure the request has a link
			if (requestData[env.key] == null) {
				return new Response('{"error": "Missing link"}', {
					status: 400,
					headers: headersJSON,
				})
			}

			// Ensure the link is valid
			if (!isValidHttpUrl(requestData[env.key])) {
				return new Response('{"error": "Invalid link"}', {
					status: 400,
					headers: headersJSON,
				})
			}

			// Add the link to the database
			await env.links.put(short, requestData[env.key])

			// Return the shortened link
			return new Response('{"link": "https://' + env.domain + '/' + short + '"}', {
				headers: headersJSON,
			})
		}

		// Return the link if it exists
		if (request.method == 'GET') {
			let value;
			try {
				value = await env.links.get(request.url.split('/').pop()!)
			} catch (error) {
				return new Response(env.errorpage, {
					headers: headersHTML,
				})
			}

			if (value == null) {
				return new Response(env.errorpage, {
					headers: headersHTML,
				})
			}

			// Redirect to the link
			return Response.redirect(value, 302)
		}

		if (request.method == 'OPTIONS') {
			return new Response('', {
				headers: headersJSON,
			})
		}

		return new Response('Method not supported')
	},
} satisfies ExportedHandler<Env>
