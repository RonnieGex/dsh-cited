# Revisión adversarial independiente

Fecha: 2026-10-09. Revisor: Codex `/root/r7_review`, sin autoría del contrato ni de la implementación. Rama: `docs/brand-logos`. Base: `262f2132e79742c9d1e123dd41e1296755644ab8`. Revisión emitida después de leer `2026-10-09-step-8-verify.md`, antes del archivo y commit.

**Veredicto: PASS WITH GAPS.** Blocker: 0. Major: 0. Minor: 1.

## Alcance y evidencia

Leí el encargo R7, el estándar SDD, el contrato y el diff completo de fuentes, pruebas, CI y documentación, incluidos archivos nuevos. No hay modificación de src/lib, dependencias, lockfile ni evidencia original. Revisé visualmente los dieciocho PNG: banner, how-it-works y real-answer, en EN/ES/ZH y ambos temas. DeepSeek acompaña las etiquetas de presentación, conserva su dibujo y no sustituye la flama de Katalis. No detecté recortes ni cambios en la transcripción.

Ejecuté de forma independiente con Node 24.21.0:

```sh
node --test tests/brand-logos.test.mjs
```

Resultado: exit 0, 2/2 pruebas. El viewBox y la geometría coinciden con el SVG fuente; los hashes están fijados fuera del inventario mutable. El helper evita insertar marcas dentro de código y atributos. La equivalencia de las transcripciones permanece en el renderer existente.

Ejecuté desde el workspace una comprobación Node con `readFileSync`, `createHash('sha256')` y `fetch(record.url)` sobre los tres inventarios: las 20 marcas únicas coinciden con sus fuentes publicadas y los assets compartidos tienen bytes idénticos. DeepSeek coincide en los tres repositorios con SHA-256 `7a55a0a7391d116eba7d32807d6838478f9209f6034612941e74fbb14934e2ef`, simple-icons 16.34.0.

Contrasté la verificación con logs: 70/70 pruebas, build aprobado, dieciocho renders sin recortes, imágenes rotas ni solicitudes externas, y dos rutas curl 200. La base local no existe antes ni después; las pruebas utilizan fixtures aislados. La procedencia, licencia y uso nominativo están documentados y la CI incluye las pruebas nuevas.

## Hallazgos

1. **Minor, RISK: el escaneo amplio encuentra un fixture local ignorado.** `r7-gitleaks.json` registra una detección redactada en `.tmp/gate/logs/smoke/gate-overlay.yml:5`. Comprobé con `git check-ignore` que está ignorado y con `git ls-files --error-unmatch` que no está versionado. No aparece en el diff de producto. El reporte de verificación lo identifica como fixture sintético previo; no se silenció el detector ni se alteró ese archivo. El cierre debe registrar los escaneos del contenido preparado y del historial antes de publicar, como ya exige la tarea 8.4.

No encontré defectos Blocker o Major en el cambio. El archivo puede continuar con este resultado explícito; el commit y PR no quedan aprobados por una afirmación de escaneo total limpio que sería falsa. Este reporte no declara ejecutados los pasos de cierre posteriores.

## Comprobación independiente de fuentes

Este programa se ejecutó desde el workspace con Node 24.21.0 y `--input-type=module`, recibido por stdin desde un here-string PowerShell:

```js
import fs from 'node:fs';
import crypto from 'node:crypto';
const dirs=['community-brand-logos/docs/brand/logos/','dsh-cited/docs/brand/logos/','cited-landing/assets/brand/logos/'];
const records = new Map();
for(const dir of dirs){const m=JSON.parse(fs.readFileSync(dir+'sources.json'));for(const [name,r] of Object.entries(m)){const data=fs.readFileSync(dir+r.file);const hash=crypto.createHash('sha256').update(data).digest('hex'); if(hash!==r.sha256)throw Error(dir+name+' local hash mismatch');if(records.has(name)&&records.get(name).sha256!==hash)throw Error(name+' cross repo mismatch');records.set(name,r);}}
const results=await Promise.all([...records].map(async ([name,r])=>{const response=await fetch(r.url);if(!response.ok)throw Error(name+' HTTP '+response.status);const b=Buffer.from(await response.arrayBuffer());const hash=crypto.createHash('sha256').update(b).digest('hex');return {name,match:hash===r.sha256,hash};}));
console.log(JSON.stringify({unique:records.size,results},null,2));
if(results.some(r=>!r.match))process.exitCode=1;
```

Salida: exit 0; `unique:20`; todos los `match:true`. Cada hash devuelto coincide con el inventario publicado en este cambio. La comprobación descargó únicamente los SVG públicos, sin enviar textos de clientes.

## Issues

- RISK: detección en fixture local ignorado, fuera del cambio y sin supresión; conservar el resultado y comprobar el contenido publicado en el cierre.
