# PrioMed · Frontend

Interfaz web de **PrioMed**, un prototipo académico que prioriza el acceso a consulta
especializada en el sistema de salud colombiano. Un médico remite un caso, el sistema propone una
prioridad (BAJA / MEDIA / ALTA) y la explica, y **una persona la valida antes de que quede
confirmada**. El regulador (Ministerio de Salud) solo ve indicadores agregados y anonimizados.

> Todos los datos de esta aplicación son sintéticos. No hay nombres, documentos ni registros de
> pacientes reales. No es un dispositivo médico ni debe usarse para decisiones clínicas.

## Pantallas

| Rol       | Ruta            | Qué hace                                                                                              |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| (ninguno) | `/ingreso`      | Inicio de sesión simulado: se elige un rol, sin credenciales.                                         |
| Médico    | `/remision`     | Formulario de remisión, resultado de `POST /classify`, explicación y validación humana.               |
| IPS       | `/cola`         | Cola ordenada por prioridad y días en espera, con filtros por especialidad y prioridad.               |
| IPS       | `/cola/:id`     | La misma cola con el panel de explicación de la remisión elegida (`GET /referrals/{id}/explanation`). |
| Regulador | `/cumplimiento` | Tablero MGTE: `referrals_processed`, `avg_wait_days` y `pct_within_mgte_threshold`.                   |

Cada rol solo ve sus pantallas: cualquier otra ruta lo devuelve a su inicio.

## Cómo correrlo

Requiere Node.js 22 o superior.

```bash
npm install
cp .env.example .env   # opcional en desarrollo
npm run dev
```

La aplicación abre en `http://localhost:5173`. En desarrollo la API se simula con MSW, así que no
hace falta ningún backend.

### Probar los estados con la API simulada

- **Guardrail**: escriba en el caso «dolor torácico», «disnea», «síncope», «pensamientos de muerte»
  o «herida por arma de fuego». La prioridad será ALTA con origen `guardrail`.
- **Modelo (ML)**: sin señales de alarma, la prioridad depende de la urgencia elegida (0, 1 o 2).
- **Error al clasificar**: incluya el texto `[simular error]` en el caso.
- **Error y reintento en la explicación**: en la cola, abra `REM-SIM-0007`; falla la primera vez y
  carga al reintentar.
- **204 por privacidad**: en el tablero, elija la especialidad «Reumatología», o «IPS de
  demostración C» con la semana 37.

## Variables de entorno

| Variable             | Descripción                                                                                               | Valor por defecto                         |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `VITE_API_URL`       | URL base de la API, sin barra final.                                                                      | vacío (mismo origen)                      |
| `VITE_USE_MOCKS`     | `true` simula la API con MSW en el navegador; `false` usa la API real.                                    | `true` en desarrollo, `false` al compilar |
| `VITE_MOCK_CLASSIFY` | Con mocks activos, `false` envía `POST /classify` al servicio real y deja simulado el resto (modo mixto). | `true`                                    |

## Integración con el servicio de clasificación real

`priomed-classification-service` solo ofrece `POST /classify`. El **modo mixto** envía esa llamada al
servicio real y mantiene simulados la validación, la cola, la explicación y el tablero:

```bash
# Terminal 1, en priomed-classification-service
uvicorn priomed_classification.api:app --port 8000

# Terminal 2, en priomed-frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_USE_MOCKS=true
VITE_MOCK_CLASSIFY=false
npm run dev
```

El servicio debe autorizar el origen del frontend por CORS; por defecto admite
`http://localhost:5173` y `http://localhost:4173` (variable `PRIOMED_CORS_ORIGINS`).

Las señales de alarma llegan como códigos (`dolor_toracico`, `sincope`, ...) y se traducen en
`src/domain/senalesAlarma.ts`. Un código sin traducción se muestra tal cual, nunca se oculta.

## Scripts

| Script              | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con MSW activo.          |
| `npm run build`     | Verifica tipos y genera `dist/`.                |
| `npm run preview`   | Sirve el contenido de `dist/`.                  |
| `npm run lint`      | ESLint y verificación de formato con Prettier.  |
| `npm run format`    | Aplica Prettier.                                |
| `npm run typecheck` | `tsc --noEmit` en modo estricto.                |
| `npm test`          | Pruebas con Vitest y React Testing Library.     |
| `npm run check`     | Lint, typecheck, pruebas y build, en ese orden. |

El workflow `.github/workflows/ci.yml` corre lint, typecheck, pruebas y build en cada push a `main`
y en cada pull request.

## Estructura de carpetas

```
src/
  api/              types.ts (contrato único de la API) y client.ts (fetch + VITE_API_URL)
  domain/           etiquetas y orden de prioridad, catálogos de demostración
  components/ui/    solo lo compartido: Button, Priority, SelectField, StatusMessage
  layout/           AppShell: cabecera, rol activo y pie
  features/
    sesion/         rol simulado, pantalla de ingreso y guardas de ruta
    remision/       formulario y página de remisión, hook de POST /classify
    clasificacion/  resultado y validación humana (confirmar / corregir)
    cola/           cola priorizada, filtros y orden
    explicacion/    panel de explicación con carga, error y reintento
    cumplimiento/   tablero MGTE y manejo del 204
  mocks/            manejadores de MSW y datos sintéticos (navegador y pruebas)
  test/             configuración de Vitest y render con proveedores
```

Los tipos del contrato (`ClassifyRequest`, `ClassifyResponse`, etc.) viven únicamente en
`src/api/types.ts` y los reutilizan el cliente, los hooks, los componentes y MSW.

## Contrato de la API

`POST /classify` es el contrato del servicio de clasificación:

```
request:  { referral_id: string, text: string, structured_urgency: 0 | 1 | 2 }
response: { referral_id, priority: "LOW" | "MEDIUM" | "HIGH", source: "guardrail" | "ml",
            high_score: number, alarm_signs: string[], requires_human_review: boolean }
```

`GET /referrals/{id}/explanation` y `GET /compliance-aggregate?ips=&specialty=&week=` siguen las
rutas pedidas para el producto. Los siguientes puntos son **supuestos de este frontend** que hay que
acordar con el backend antes de conectarlo a una API real:

- `POST /referrals/{id}/review` (`{ action: "confirmed" | "corrected", final_priority }`) para
  registrar la validación humana.
- `GET /referrals?specialty=&priority=` para la cola.
- La forma del cuerpo de la explicación (`summary`, `factors`).
- `pct_within_mgte_threshold` se interpreta como porcentaje de 0 a 100.

## Decisiones de diseño

**Dirección: «señalética de triage».** La referencia es la señalización hospitalaria y la manilla de
triage, no un tablero SaaS.

- **Banda de prioridad.** Es el único gesto fuerte de la interfaz: una franja lateral con trama
  propia por nivel (ALTA sólida, MEDIA diagonal, BAJA punteada), acompañada siempre de un icono con
  forma distinta (triángulo, rombo, círculo) y de la palabra. El color nunca es la única señal: se
  lee en escala de grises y con daltonismo. BAJA es azul y no verde para no sugerir «todo bien» ni
  depender del par rojo/verde.
- **Validación humana visible.** El resultado dice «Sin confirmar. Requiere validación humana.»
  hasta que el servicio registra la acción de una persona. Si guardar falla, sigue sin confirmar.
- **Tipografía.** Atkinson Hyperlegible para texto y datos (distingue `0/O` y `1/l`, útil en
  identificadores y cifras) con cifras tabulares; Barlow Condensed 600 solo para la palabra de
  prioridad y las cifras grandes, con aire de letrero.
- **Paleta.** Fondo niebla `#EEF2F1`, superficies blancas, tinta `#14262B`, petróleo `#0F5560` para
  acciones y foco, carmín `#B3212E` (ALTA), ámbar oscuro `#8A5A00` (MEDIA) y azul acero `#2F5D8A`
  (BAJA). Todos los pares de texto cumplen contraste WCAG AA (mínimo medido: 5,25:1).
- **Tokens.** Colores, tipografía, espaciados y radios están definidos como variables CSS en el
  bloque `@theme` de `src/index.css`; Tailwind genera las utilidades a partir de ellos.
- **Forma.** Bordes de 1 px, radio de 4 px, sin sombras ni degradados. Contenido alineado a la
  izquierda.
- **Voz.** Trato de «usted», verbos directos, botones que dicen lo que hacen. Los errores explican
  qué pasó y qué hacer. El 204 del tablero se presenta como información («No hay datos suficientes
  para mostrar»), nunca como error.
- **Accesibilidad.** HTML semántico, enlace «Saltar al contenido», foco visible de 3 px, etiquetas
  en todos los campos, errores asociados con `aria-describedby`, regiones `aria-live` para los
  resultados y respeto de `prefers-reduced-motion`. En la cola, al elegir una remisión el foco pasa
  al título de su explicación.
- **Responsive.** Una columna desde 360 px; dos columnas (formulario/resultado, cola/explicación)
  desde 1024 px. En móvil la explicación reemplaza a la lista y ofrece «Volver a la cola».

## Dependencias fuera del stack base

El stack pedido es React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, Vitest,
React Testing Library, MSW, ESLint y Prettier. Además se agregaron:

| Dependencia                                                         | Por qué                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `@fontsource/atkinson-hyperlegible`, `@fontsource/barlow-condensed` | Fuentes autoalojadas: la herramienta no hace llamadas a servidores de fuentes de terceros. |
| `@vitejs/plugin-react`, `@tailwindcss/vite`                         | Integraciones oficiales de React y Tailwind 4 con Vite.                                    |
| `jsdom`                                                             | DOM para correr React Testing Library en Vitest.                                           |
| `@testing-library/jest-dom`, `@testing-library/user-event`          | Aserciones de DOM legibles e interacción realista (teclado, clics) en las pruebas.         |
| `typescript-eslint`, `@eslint/js`, `globals`                        | Base necesaria para que ESLint entienda TypeScript y el entorno del navegador.             |
| `eslint-plugin-react-hooks`                                         | Reglas de hooks de React.                                                                  |
| `eslint-plugin-jsx-a11y`                                            | Detecta problemas de accesibilidad en el marcado; relevante para una herramienta clínica.  |
| `eslint-config-prettier`                                            | Evita conflictos entre ESLint y Prettier.                                                  |

No se usa ninguna librería de componentes, de iconos ni de gráficos: los iconos son SVG propios.

## Pruebas

- `features/remision/ReferralPage.test.tsx`: etiquetas, validación, envío a `POST /classify`, error
  y reintento.
- `features/clasificacion/ClassificationResult.test.tsx`: la prioridad no queda confirmada sin
  acción humana; confirmar, corregir y fallo al guardar.
- `features/cumplimiento/CompliancePage.test.tsx`: indicadores, 204 tratado como falta de datos por
  privacidad y error real.
- `features/cola`, `features/explicacion`, `features/sesion` y `App.test.tsx`: orden y filtros,
  carga/error/reintento y acceso por rol.

## Limitaciones conocidas

- La sesión es simulada: el rol se guarda en `sessionStorage` y no hay autenticación ni
  autorización reales. Las guardas de ruta son de interfaz, no de seguridad.
- La clasificación, la explicación y los agregados de MSW son reglas sintéticas, no el modelo real.
