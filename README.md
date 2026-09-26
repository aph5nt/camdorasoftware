# Camdora Software Ltd

Company website for Camdora Software Ltd (UK, company number 08693594).

Live: https://camdora.software

## Stack

Static HTML and CSS. No build step.

- `index.html` - the page
- `styles.css` - styling, light theme
- `site.js` - nav state, scroll reveal, hero network animation
- `CNAME` - custom domain for GitHub Pages

## Hosting

GitHub Pages serves the `main` branch root. Cloudflare fronts the domain.

Cloudflare DNS records:

| Type  | Name | Value                  | Proxy    |
|-------|------|------------------------|----------|
| A     | @    | 185.199.108.153        | DNS only |
| A     | @    | 185.199.109.153        | DNS only |
| A     | @    | 185.199.110.153        | DNS only |
| A     | @    | 185.199.111.153        | DNS only |
| CNAME | www  | aph5nt.github.io       | DNS only |

Keep the records "DNS only" until GitHub has issued its certificate, then
turn the proxy on if wanted. Cloudflare SSL/TLS mode must be **Full**.

## Local preview

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.
