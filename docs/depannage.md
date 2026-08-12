# Pieges connus

## Pièges connus

### Le serveur de dev sert un CSS périmé

Symptôme : les titres rendent à 16 px au lieu de 144, les coins arrondis
disparaissent, les bandes wordmark rapetissent. Autrement dit **toute
modification récente de `globals.css` semble ignorée**.

Cause : des processus `node` d'une session précédente restent vivants et
gardent le port 3001. Un `pnpm dev` lancé par-dessus paraît fonctionner, mais
c'est l'ancien serveur qui répond, avec son CSS figé. On a compté **huit
processus de deux générations** simultanément.

Diagnostic en une commande — comparer le disque et ce qui est servi :

```bash
curl -s http://localhost:3001/ | grep -oE '/_next/static/[^"]+\.css' | head -1 \
  | xargs -I{} curl -s "http://localhost:3001{}" | grep -c "radius-hero"
```

Si le compte est 0 alors que le token est bien dans `globals.css`, c'est ça.

Remède :
```bash
# PowerShell
Get-Process node | Stop-Process -Force
Remove-Item .next -Recurse -Force
pnpm build && pnpm start   # verifier sur le BUILD, pas sur le dev
```

⚠️ **Vérifier ce genre de symptôme sur `pnpm build` + `pnpm start`, jamais sur
le serveur de dev.** J'ai failli réécrire du CSS parfaitement fonctionnel en
me fiant à ce que servait un serveur zombie.

### Cette panne est silencieuse

Le build passe, le lint passe, le texte rétrécit. Aucun outil ne la signale.
D'où l'assertion de contrôle à garder dans toute passe de vérification
navigateur : **le `<h2>` de Choisir doit dépasser 100 px de `font-size` à
1440 px de large**. Une ligne, et elle couvre toute la famille de tokens.

