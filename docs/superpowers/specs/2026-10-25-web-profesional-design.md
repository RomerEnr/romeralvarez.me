# Diseño: web profesional de Romer Alvarez

Fecha: 2026-10-25 · Estado: pendiente de aprobación

## Por qué

Romer se muda a Italia el 10 de noviembre de 2026 y quiere trabajar como platform
engineer, como freelance y en remoto para empresas de Italia o de fuera. Hoy
romeralvarez.me es un blog en español de 2024 (plantilla AstroPaper sobre Astro 2)
con la bio desactualizada y el HTTPS roto. La web nueva tiene que ser su marca
personal: enseñar sus proyectos y sus vídeos profesionales (aún por grabar), y
convertir visitas en llamadas con clientes o empresas.

## Objetivos

- Que quien llegue entienda en cinco segundos quién es Romer, qué hace y cómo contactar.
- Que Google y los buscadores de IA (ChatGPT, Perplexity, Claude) le encuentren y le citen.
- Tres idiomas (inglés, italiano y español) que se mantengan sin esfuerzo.
- Que publicar un proyecto, un vídeo o un artículo sea crear un archivo Markdown.

## No objetivos

- Blog personal de vida en Italia. Va aparte, más adelante.
- CMS visual, comentarios, newsletter o tienda.
- Hablar de trámites.

## Anti-objetivos (sería un fracaso aunque funcione)

- Que mantener tres idiomas sea tan pesado que la web se abandone otra vez.
- Que parezca una plantilla genérica o un listado de logos de tecnologías.
- Que haya más de un botón principal compitiendo por la atención.

## Restricciones

- Mismo repo `RomerEnr/romeralvarez.me`, GitHub Pages y dominio `romeralvarez.me`
  (DNS en Namecheap, ya apuntando a GitHub Pages).
- Coste cero de hosting.
- Sin atribución de Claude en commits. Cambios pequeños directos a `main`; la reconstrucción va en PR.

## Enfoques considerados

| Enfoque | A favor | En contra |
| --- | --- | --- |
| **A. Rehacer el Astro actual (elegido)** | Control total del SEO, gratis, y la web con su CI/CD es un proyecto que enseñar | Más trabajo inicial |
| B. Plantilla de portfolio Astro | Más rápido | Aspecto genérico, código que sobra |
| C. Framer o similar | Edición visual sin código | De pago, menos control SEO, no demuestra perfil técnico |

Romer eligió A el 2026-10-25.

## Marca y mensaje

- Marca: su nombre, **Romer Alvarez**. RomerEnr queda como usuario de GitHub.
- Misma frase en web, LinkedIn, GitHub y YouTube (las IAs premian la coherencia entre perfiles).
- Titular de partida (editable): *Platform Engineer. I build cloud platforms on AWS and
  Kubernetes that make life easier for developers.*
- Tono: cercano y sencillo, como su README de GitHub. Hechos concretos en vez de autobombo.
- Un único botón principal en toda la web: **Let's talk**, que abre su calendario de reservas.

## Páginas

| Página | Contenido |
| --- | --- |
| Inicio | Titular, foto, tres proyectos destacados, último vídeo, último artículo, Let's talk |
| Projects | Listado y una página por proyecto: problema, qué hizo, resultado (con números si los hay), stack, enlace al repo y al vídeo |
| Videos | Listado y una página por vídeo: embed ligero de YouTube (carga al pulsar), resumen, capítulos y transcripción |
| Blog | Artículos técnicos. Se migran los 10 actuales en español |
| Work with me | Hasta tres servicios, cómo trabaja, precio orientativo "desde", preguntas frecuentes |
| About | Su historia: de Tenerife a Italia, de fullstack a plataforma |
| 404 | En los tres idiomas |

Mientras no haya vídeos, la sección Videos no sale en el menú y la portada no muestra ese bloque.

## Idiomas

Inglés es el idioma principal; italiano y español son traducciones.

**URLs.** Inglés en la raíz (`/`, `/projects/...`), italiano en `/it/...` y español en
`/es/...`. Se usa el i18n nativo de Astro (`i18n.routing.prefixDefaultLocale: false`).
Los slugs se mantienen en inglés en los tres idiomas, para que cambiar de idioma sea
cambiar el prefijo.

**Textos de la interfaz** (menú, botones, pie, títulos de sección): un archivo por idioma,
`src/i18n/en.json`, `it.json` y `es.json`, con las mismas claves. Una prueba en el build
falla si a un idioma le falta una clave.

**Contenido** (proyectos, vídeos, artículos, páginas como About o Work with me): un
archivo Markdown por idioma en la misma ruta relativa:

```
src/content/projects/en/argocd-on-eks.md
src/content/projects/it/argocd-on-eks.md
src/content/projects/es/argocd-on-eks.md
```

El mismo nombre de archivo une las traducciones; no hace falta ningún campo extra.

**Cómo se mantiene sin esfuerzo:**

1. Romer escribe en el idioma que le salga más cómodo.
2. Las traducciones se generan después (pidiéndoselas a Claude en un PR) y Romer las revisa.
3. Si falta una traducción, esa página no se publica en ese idioma: no se muestra en sus
   listados, el selector de idioma lleva al idioma que sí existe y no se genera `hreflang`
   para ella. Así nunca hay páginas vacías ni a medio traducir.
4. `npm run i18n:check` lista qué contenidos faltan en cada idioma.

Los 10 artículos actuales están en español: se publican en `/es/blog/...` y, más
adelante, se traducen los que interesen al inglés y al italiano.

**SEO multilingüe:** `hreflang` para cada traducción existente más `x-default` al inglés,
`lang` correcto en `<html>`, sitemap con alternates y `og:locale`.

## SEO para Google y para IAs

- Datos estructurados JSON-LD: `Person` y `ProfilePage` en About e inicio,
  `VideoObject` en cada vídeo, `BlogPosting` en artículos, `FAQPage` en Work with me,
  `BreadcrumbList`.
- `/llms.txt` generado en el build: quién es, qué ofrece y enlaces a páginas clave.
- `robots.txt` con sitemap declarado y permiso explícito a `OAI-SearchBot`,
  `Claude-SearchBot` y `PerplexityBot`.
- Imagen para redes generada por página (el proyecto ya usa satori).
- Fecha de actualización visible en proyectos y artículos.
- Todo el contenido en HTML estático; nada importante dentro de imágenes ni cargado con JavaScript.
- Redirecciones de las URLs antiguas (`/blog/<slug>` → `/es/blog/<slug>`, `/categorias/...`)
  con páginas de redirección estáticas, para no perder lo que ya esté indexado.

## Técnico

- Astro 5 con content collections, MDX y Tailwind. Se parte de lo que hay pero se
  reescriben layouts y páginas; se eliminan React y las piezas de AstroPaper que no se usen.
- Despliegue: el workflow actual de GitHub Actions actualizado (`withastro/action` y
  `deploy-pages` en versiones actuales, Node 22).
- Analítica sin cookies (Cloudflare Web Analytics), así no hace falta banner.
- Reserva de llamadas con Cal.com (enlace, sin incrustar).
- Modo claro y oscuro, diseño responsive, accesible.

## Lo que hace Romer

- Arreglar el HTTPS en GitHub Pages (quitar y volver a poner el dominio, Enforce HTTPS).
- Revisar y ajustar el titular, los servicios y el precio orientativo.
- Crear la cuenta de Cal.com y pasar el enlace.
- Foto para la portada.
- Dar de alta Google Search Console y Bing Webmaster cuando esté publicada.

## Decisiones tomadas por Claude (revisar)

- Inglés como idioma principal en la raíz, porque busca clientes en remoto.
- Slugs en inglés en los tres idiomas.
- Ocultar traducciones que falten en vez de mostrar el texto en otro idioma.
- Cloudflare Web Analytics y Cal.com como herramientas.
- Servicios de partida: Kubernetes y GitOps con ArgoCD en AWS, CI/CD con GitHub Actions,
  observabilidad con Grafana y OpenTelemetry.

## Para quien lo construya

- Diseño visual concreto (tipografía, color), con la condición de que no parezca una plantilla.
- Contenido de ejemplo para un primer proyecto (la propia web como proyecto) mientras
  Romer prepara los demás.
