# Regresiones

npm test: 65/65. node scripts/build.mjs --check: GREEN, dos archivos idénticos a src. CITED_REPO=../community-cap npm run gate: GREEN 14/14.

Se conservan las verificaciones de evidencia canónica, precio sustentado, Markdown escapado y token. La comparación de transcripción restaura sólo la numeración del chip de fuente; no normaliza globalmente puntuación. El render Cited comprueba fuente de 20px, dos líneas sin envoltura, tres márgenes de 22px, padding inicial de 22px, filas de 24px, ausencia de filete y límites de 70px/36px. La prueba landing verifica cited_search dentro de .agent-evidence en cada página, además de los captions exactos.
