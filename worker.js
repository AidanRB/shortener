// src/index.ts
var headersJSON = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};
var headersHTML = {
    "content-type": "text/html;charset=UTF-8",
    "Access-Control-Allow-Origin": "*"
};
function randomString(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
var indexpage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>shortener</title>
</head>
<body>
    <script>
        function shorten() {
            const url = document.getElementById('url').value;
            const key = document.getElementById('key').value;
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: '{"' + key + '":"' + url + '"}'
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('output').style.color = 'red';
                    document.getElementById('output').innerText = data.error;
                } else {
                    document.getElementById('output').style.color = '';
                    document.getElementById('output').innerText = data.link;
                }
            });
        }
    <\/script>
    <style>
        html {
            font-family: sans-serif;
            background: #222;
            color: #fff;
        }
		input, button {
			margin-bottom: 10px;
		}
    </style>
    <form action="" method="post">
        <input type="text" name="url" id="url" placeholder="url"><br>
        <input type="password" name="key" id="key" placeholder="key"><br>
        <button type="button" onclick="shorten()">shorten</button>
    </form>
    <span id="output"></span>
</body>
</html>`;
var src_default = {
    async fetch(request, env, ctx) {
        if (request.method == "POST") {
            let short = "";
            do {
                short = randomString(6);
            } while (await env.links.get(short) != null);
            let requestData;
            try {
                requestData = await request.json();
            } catch (error) {
                return new Response('{"error": "Invalid JSON"}', {
                    status: 400,
                    headers: headersJSON
                });
            }
            if (requestData[env.key] == null) {
                return new Response('{"error": "Incorrect key"}', {
                    status: 401,
                    headers: headersJSON
                });
            }
            if (!isValidHttpUrl(requestData[env.key])) {
                return new Response('{"error": "Invalid link"}', {
                    status: 400,
                    headers: headersJSON
                });
            }
            await env.links.put(short, requestData[env.key]);
            return new Response('{"link": "https://' + env.domain + "/" + short + '"}', {
                headers: headersJSON
            });
        }
        if (request.method == "GET") {
            let short = request.url.split("/").pop();
            if (short == "") {
                return new Response(indexpage, {
                    headers: headersHTML
                });
            }
            let value;
            try {
                value = await env.links.get(short);
            } catch (error) {
                return new Response(env.errorpage, {
                    headers: headersHTML
                });
            }
            if (value == null) {
                return new Response(env.errorpage, {
                    headers: headersHTML
                });
            }
            return Response.redirect(value, 302);
        }
        if (request.method == "OPTIONS") {
            return new Response("", {
                headers: headersJSON
            });
        }
        return new Response("Method not supported");
    }
};
export {
    src_default as default
};
//# sourceMappingURL=index.js.map
