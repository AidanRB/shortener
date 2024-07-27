# shortener
shortens links. deploys to cloudflare workers.

## deployment (no wrangler)
1. log into cloudflare and [create a worker](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)
    - choose hello world
    - deploy
2. add/find your worker's domain  
    either:
    - add a custom domain in the worker's settings > triggers > custom domains
    - take note of the domain in the worker's settings > triggers > routes
3. configure the worker in its settings > variables
    - `domain`: the domain from step 2, either custom or from the routes  
        example: `link.example.com` or `short.cloudflare-###.workers.dev`
    - `errorpage`: html for the not found page  
        example: `<html><body>Please email <a href="mailto:email@example.com">email@example.com</a></body></html>`
    - `key`: the secret key name for creating links  
        example: `superSecretKey`
4. add the worker's code
    - click "edit code" at the top right of the page
    - paste the contents of [index.ts](https://github.com/AidanRB/shortener/blob/main/index.ts) into index.ts

## usage

### web interface
- open the domain from step 2
- enter your long url and key
- click shorten

### http request
send a POST request to the domain from step 2
- headers `Content-Type: application/json`
- body `{"your_key_here":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}`

example: `curl "https://link.example.com/" -X POST -H "Content-Type: application/json" --data '{"superSecretKey":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'`

### [tools.hcps.win](https://tools.hcps.win/qrlabels)
- enter urls in "URL for QR" spaces
- enter your domain in "URL shortener URL"
- enter your key in "URL shortener key"
- click "Shorten"