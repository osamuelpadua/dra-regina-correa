# Atrium Rehab — Página de Vendas

Landing page estática da **Atrium Rehab** (reabilitação cardiorrespiratória e ortopédica, atendimento domiciliar em Belém/PA).

Site 100% estático (HTML + CSS + JS, sem build), pronto para hospedar em qualquer lugar (Netlify, Vercel, GitHub Pages, etc.).

## Estrutura

```
.
├── index.html              # página única
├── css/styles.css          # estilos
├── js/main.js              # reveal-on-scroll, FAQ accordion, carrossel de depoimentos
├── assets/img/             # imagens otimizadas (AVIF + WebP + JPEG)
│   ├── hero.*  filsec.*  beat.*
│   └── depoimentos/        # dep-01..dep-09 (prints de depoimentos)
├── favicon.svg
├── robots.txt
└── sitemap.xml
```

## Como pré-visualizar localmente

Qualquer servidor estático serve. Exemplos:

```bash
npx --yes serve .
# ou
python -m http.server 8000
```

Depois abra `http://localhost:3000` (serve) ou `http://localhost:8000` (python).

> Abrir o `index.html` direto pelo `file://` também funciona, mas um servidor evita pequenas diferenças de cache/headers.

## Performance

- O HTML original (~350 KB) tinha 3 imagens embutidas em base64. Elas foram **extraídas e convertidas** para AVIF/WebP/JPEG com `<picture>` e `loading="lazy"`.
- A imagem do hero usa `fetchpriority="high"` + `preload` (é o LCP).
- O `index.html` final tem ~36 KB.

### Reprocessar imagens (se precisar trocar alguma)

As imagens vieram de um script com [`sharp`](https://sharp.pixelplumbing.com/). Para regenerar, instale `sharp` e gere os formatos `.avif` / `.webp` / `.jpg` mantendo os nomes em `assets/img/`.

## Conteúdo

- **WhatsApp:** (91) 99380-4185 — todos os CTAs "Agendar uma avaliação" abrem o WhatsApp com mensagem pré-preenchida.
- **Instagram:** [@atrium.rehab](https://instagram.com/atrium.rehab)
- **Depoimentos:** carrossel automático na seção "Histórias" (setas, dots, swipe no toque, pausa no hover).

### Pendências (placeholders marcados com `<!-- TODO -->` no `index.html`)

- [ ] **Bairros / raio de atendimento** exatos na FAQ ("Atendem em quais regiões?").
- [ ] (Opcional) **Fonte Elgraine**: há `@font-face` comentado no topo do `css/styles.css` para substituir as fontes serifadas quando os arquivos da Elgraine estiverem disponíveis.

> ⚠️ **Privacidade dos depoimentos:** alguns prints contêm nomes, fotos e imagens de pacientes. Confirme que há **consentimento** para uso público antes de publicar.
