<h1 align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/readme-banner-dark.png"><img src="docs/images/readme-banner-light.png" alt="Cited dentro de DeepSeek Harness: pregunta a tus documentos y recibe una respuesta con su fuente" width="1280"></picture></h1>

<p align="center">Tus documentos. Tu agente. Una respuesta que puedes comprobar.</p>

[![Licencia: Apache-2.0](https://img.shields.io/badge/licencia-Apache--2.0-171717)](LICENSE)
[![Rango de dsh-tools](https://img.shields.io/badge/dsh--tools-0.1%20%2F%200.2-171717)](#compatibilidad)
[![CI](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml/badge.svg)](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml)
![Estado: desarrollo inicial](https://img.shields.io/badge/estado-desarrollo%20inicial-DDF469?labelColor=171717)

[English](README.md) · [Español](README.es.md) · [中文](README.zh.md)

**Cited dentro de DeepSeek Harness.** Dos herramientas nativas permiten a tu agente buscar en una instalación de [Cited](https://github.com/RonnieGex/cited) y responder desde sus documentos con citas numeradas. El plugin se conecta a la instalación que configures mediante `POST /api/mcp`.

**Desarrollo inicial.** La instalación y una respuesta real con cita se probaron sin interfaz. Siguen sin verificarse los clics de instalación en escritorio y una respuesta con modelo real mediante `cited_ask`. Consulta la [tabla de compatibilidad](#compatibilidad) con fechas.

[Cómo funciona](#cómo-funciona) · [Respuesta real](#una-respuesta-real) · [Instalar](#instalar) · [Configurar](#configurar) · [Herramientas](#las-dos-herramientas) · [Token](#tu-token) · [Compatibilidad](#compatibilidad) · [Desarrollo](#desarrollo) · [Licencia](#licencia)

## Cómo funciona

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/how-it-works-dark.png"><img src="docs/images/how-it-works-light.png" alt="Pega el enlace del plugin, configura url y token, pregunta a tu agente y recibe una respuesta citada" width="1280"></picture>

1. Pega el enlace del repositorio en **Plugins → Add plugin**.
2. Abre la configuración del plugin y llena **url** y **token**.
3. Pregunta a tu agente. `cited_search` devuelve pasajes numerados; el agente los usa para responder con `[1]`.

Cited aloja los documentos y la búsqueda. DeepSeek Harness aloja al agente y este plugin. Estas herramientas nativas no necesitan una fila de cliente MCP en `cordis.yml`.

## Una respuesta real

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/real-answer-dark.png"><img src="docs/images/real-answer-light.png" alt="Corrida real sin interfaz: cited_search devuelve cafe-la-horquilla.md, Precios; DeepSeek responde que la afinación cuesta 380 pesos [1]" width="1280"></picture>

El **2026-10-09**, un nuevo `DSH_HOME` temporal instaló el plugin desde GitHub. DeepSeek buscó en los documentos públicos de muestra de Cited y respondió:

> A bicycle tune-up costs 380 pesos [1].

La imagen presenta la pregunta guardada, la llamada real, el pasaje y la respuesta. No es una captura de escritorio. [Texto completo](docs/evidence/headless-answer.txt) · [Registro de ejecución](docs/evidence/headless-answer.json). La búsqueda usó palabras clave sin proveedor de embeddings; el agente usó un modelo real de DeepSeek. Las 19 tablas de la base de muestras quedaron sin cambios después de buscar. Los gráficos se comparten en inglés entre las tres versiones; esta página explica íntegramente su contenido.

## Instalar

En DeepSeek Harness, abre **Plugins → Add plugin** y pega:

```text
https://github.com/RonnieGex/dsh-cited
```

También funciona la forma corta:

```text
github:RonnieGex/dsh-cited
```

El repositorio incluye `lib/`: instalar no requiere compilar ni dar permiso `allowBuilds`. El administrador de plugins muestra `dsh-cited` y su descripción. La nueva instalación desde GitHub sin interfaz terminó correctamente. El administrador de paquetes reportó dependencias pares del anfitrión ausentes; el harness en ejecución las proporcionó correctamente. La ruta de la interfaz está documentada, pero no se probó haciendo clic.

Necesitas DeepSeek Harness dentro del rango declarado, un servidor Cited en ejecución con MCP habilitado y su token. El plugin declara Node `>=22.19`; aquí se desarrolla y verifica con Node 24.

## Configurar

Abre la configuración del plugin:

| Campo | Valor |
|---|---|
| `url` | Dirección de Cited, por ejemplo `https://cited.example.com`. El plugin agrega `/api/mcp` o lo conserva cuando ya está presente. |
| `token` | El `CITED_MCP_TOKEN` del servidor. Marcado como campo secreto. |
| `timeoutMs` | Tiempo límite positivo por llamada en milisegundos; **30000** por omisión. |

Sin token en el servidor, el endpoint MCP de Cited está apagado. Genera localmente un token aleatorio largo, establece `CITED_MCP_TOKEN` en el entorno del servidor y escribe el mismo valor en el plugin. No lo pongas en prompts, capturas ni Git.

`url` y `token` comienzan vacíos para permitir instalar antes de configurar. Una llamada reporta el campo faltante como error de herramienta sin romper el harness. Después de llenar ambos, pide al agente que busque una frase presente en tus documentos.

## Las dos herramientas

| Herramienta | Entrada | Resultado |
|---|---|---|
| `cited_search` | `query: string`, `limit?: integer` de **1 a 8**, **5** por omisión | `{ passages: [{ n, document, heading, position, excerpt }] }` |
| `cited_ask` | `question: string`, `sessionId?: string` | `{ status, answer, citations }`; estado `answered` o `refused` |

**Busca y deja que tu agente responda.** `cited_search` recupera pasajes sin llamar al modelo de respuestas de Cited. Cada uno incluye fuente y número de cita. Sin coincidencias no hay pasajes, tampoco una respuesta inventada. El modelo del agente y cualquier proveedor de embeddings configurado todavía pueden generar cargos.

**Deja que Cited redacte.** `cited_ask` ejecuta el proceso de respuestas de Cited y devuelve una respuesta citada o una negativa explícita. Las citas contienen los campos del pasaje más `lead`, la longitud del texto superpuesto. Reutiliza `sessionId` para guardar una conversación y su hilo en Cited. Esto puede consumir el presupuesto del modelo del servidor. El servidor vivo de prueba no tiene modelo de respuestas conectado, así que allí solo se ejercitó el error. Las pruebas unitarias cubren `answered` y `refused`.

## Tu token

- Se envía como `Authorization: Bearer` al endpoint configurado; no se agrega a los argumentos de herramientas ni a su salida normal.
- El esquema lo marca como secreto para el manejo de campos del harness. Esto no demuestra cifrado en reposo. Protege la configuración y usa HTTPS en servidores remotos.
- Se oculta en los errores de transporte, junto con las credenciales en URL. Autorización rechazada, endpoint apagado, tiempo agotado y host inaccesible se convierten en errores breves de herramienta.
- El plugin no tiene base propia de documentos. Cited guarda los documentos y las conversaciones creadas mediante `cited_ask`.

## Compatibilidad

Rango declarado de `@deepseek-ai/dsh-tools`:

```text
>=0.1.6-alpha.2 <0.3.0-0 || >=0.2.0-rc.0 <0.3.0-0
```

Un rango no demuestra cada versión. Los clientes MCP siguientes se conectan directamente a **Cited**, sin pasar por este plugin nativo.

| Cliente | Fecha | Evidencia y límite |
|---|---|---|
| DeepSeek Harness 0.1.6-alpha.2, CLI desde código fuente | 2026-10-09 | Nueva instalación desde GitHub y respuesta real de DeepSeek con `cited_search` en estado headless aislado. [Registro](docs/evidence/headless-answer.json); [gate](evidence/gate.txt). |
| DeepSeek Harness 0.2.0-rc.2, CLI incluido | 2026-10-09 | Verificación anterior: instalación desde GitHub sin compilar y respuesta real de búsqueda. No se repitió aquí. [Procedencia](docs/evidence/compatibility.md). |
| Claude Code → Cited MCP | 2026-10-09 | Verificación anterior: conexión y listado de ambas herramientas. No se afirma llamada por un modelo. [Procedencia](docs/evidence/compatibility.md). |
| Codex → Cited MCP | 2026-10-09 | Verificación anterior: conexión y listado de ambas herramientas. No se afirma llamada por un modelo. [Procedencia](docs/evidence/compatibility.md). |
| Cursor → Cited MCP | 2026-10-09 | Solo documentado; no probado. [Procedencia](docs/evidence/compatibility.md). |

Sin verificar: clics de instalación en escritorio, respuesta viva de `cited_ask` mediante el plugin, otros sistemas operativos y despliegues remotos por HTTPS. Esta evidencia no requiere controlar el escritorio.

## Desarrollo

Usa **Node 24**. Mantén DeepSeek Harness compilado en `../deepseek-harness` o apunta `DSH_INSTALL` a su raíz:

```sh
npx -y -p node@24 node scripts/link-host-deps.mjs
npx -y -p node@24 npm test
npx -y -p node@24 node scripts/build.mjs --check
npx -y -p node@24 npm run gate
```

Antes del gate, apunta `CITED_REPO` a un checkout compilado de Cited con `scripts/mcp-seed.ts` y `.next/` (valor predeterminado: `../cited`). Crea muestras y un `DSH_HOME` temporal en `.tmp/gate`, inicia Cited en el puerto **3231**, instala el plugin local, verifica tarjeta y herramientas y escanea la historia de Git con **gitleaks**. Cambia `CITED_PORT` para usar otro puerto libre. Nunca usa el perfil de escritorio.

`src/` es el código fuente; `lib/` es el artefacto distribuido. `npm run build` actualiza `lib/` después de cambios de ejecución. Este cambio documental conserva ambos directorios.

CI ejecuta pruebas portables de transporte, módulo, paquete, herramientas y documentación, equivalencia del build y escaneo de secretos. La composición real del Loader y el gate se ejecutan localmente con checkouts externos; CI no afirma cubrir esas integraciones.

Para renderizar usa la dependencia Playwright existente de Cited y Chromium instalado. Apunta `CITED_REPO` a ese checkout (predeterminado del render: `../community-main`):

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

El render usa evidencia guardada sin conexión. Una captura nueva usa un modelo real y su llave API. Consulta la [guía de recursos y evidencia](docs/readme-assets.md), el [manual](docs/project-manual.md) y las [reglas de contribución](CONTRIBUTING.md).

## Licencia

[Apache-2.0](LICENSE). Conserva [NOTICE](NOTICE) en redistribuciones. Outfit usa la [SIL Open Font License](docs/fonts/outfit/OFL.txt). Consulta la [procedencia de recursos](docs/readme-assets.md).

<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/brand/katalis-flame-192.png"><img src="docs/brand/katalis-flame-ink-192.png" alt="" height="48"></picture> <a href="https://katalis.dev">Built by Katalis</a></p>
