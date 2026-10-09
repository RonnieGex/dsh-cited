# Validación automatizada y base de datos

npm test: 65/65. node scripts/build.mjs --check: GREEN, dos archivos idénticos a src. CITED_REPO=../community-cap npm run gate: GREEN 14/14.

Logs completos según repo: r5-tests.log, r5-green.log, r5-gate.log, r5-lint.log y r5-types.log.

Desde katalis-dev, node tasks/snapshot-agents-r5.mjs before: 19 tablas, lectura sin inicialización previa. node tasks/snapshot-agents-r5.mjs after: 19 tablas, conteos y hashes idénticos. Base medida: community-readme/.data/katalis.sqlite, muestras públicas. Plugin y landing no poseen base propia.

Se preservan snapshot-original.mjs, database-snapshot.mjs y ambos JSON. Reproducción desde esta carpeta: node snapshot-local.mjs <ruta-absoluta-sqlite-publica> before; ejecutar validaciones; node snapshot-local.mjs <misma-ruta> after. El helper abre DatabaseSync readOnly, consulta tablas no internas desde sqlite_master, hace SELECT * por tabla, ordena JSON y calcula SHA-256, sin inicializar ni migrar. El gate registra además su base desechable aislada y su perfil headless.
