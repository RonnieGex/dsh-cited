# dsh-cited (Español)

**Cited dentro de DeepSeek Harness.** Busca en los documentos de una instalación de [Cited](https://katalis.dev) y
responde desde ellos, con citas numeradas, desde cualquier agente del harness.

Versión completa en inglés: [README.md](README.md).

## Instalar

En DeepSeek Harness abre **Plugins → Add plugin** y pega:

```
github:RonnieGex/dsh-cited
```

El paquete trae su `lib/` compilado y versionado, así que la instalación no compila nada ni pide `allowBuilds`. Aparece
la tarjeta **Cited** con la descripción del paquete.

## Configurar

En la tarjeta, dos campos:

- `url`: la dirección de tu instalación de Cited, por ejemplo `https://cited.example.com`. El plugin llama a
  `<url>/api/mcp`.
- `token`: el valor de `CITED_MCP_TOKEN` de esa instalación, marcado como secreto.
- `timeoutMs`: cuánto puede tardar una llamada. 30 segundos por omisión.

Sin configurar, las herramientas responden un error claro que nombra el campo que falta, sin romper el harness. Una
instalación sin `CITED_MCP_TOKEN` tiene el endpoint apagado: genera un valor largo y aleatorio, arráncala con él y dale
el mismo valor al plugin.

## Las dos herramientas

- `cited_search { query, limit? (1 a 8) }`: los pasajes que coinciden, con documento, sección, posición y texto,
  numerados para que el modelo los cite como `[1]`. Nunca llama a un modelo de chat.
- `cited_ask { question, sessionId? }`: la respuesta con sus citas, o la negativa honesta cuando los documentos no
  tienen la respuesta.

## Seguridad

El token viaja solo en la cabecera `Authorization: Bearer` hacia la `url` configurada. Nunca se escribe en registros ni
en resultados, y ningún error —`401`, `403`, `404`, tiempo de espera o host inalcanzable— lo incluye.

## Estado probado

Probado en Windows con Node v24.11.0 contra un DeepSeek Harness compilado desde su repositorio y un Cited local servido
en el puerto 3231: pruebas unitarias verdes, instalación aislada en un `DSH_HOME` temporal, la capa `# == dsh-cited` en
`--dump-config`, la tarjeta del plugin, y `cited_search` devolviendo pasajes de `samples/`. `cited_ask` devuelve la
negativa honesta porque esa instalación de prueba no tiene proveedor de chat. Lo demás no está verificado.

## Licencia

Apache-2.0. Ver `LICENSE` y `NOTICE`. Built by Katalis.
