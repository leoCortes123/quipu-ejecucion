import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'

const WEB = 'http://localhost:5174'
const API = 'http://localhost:8001/api'
const OUT = new URL('./shots/', import.meta.url).pathname
const EXE = `${homedir()}/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`

mkdirSync(OUT, { recursive: true })

async function tokenDe(memberId) {
  const r = await fetch(`${API}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ member_id: memberId }),
  })
  if (!r.ok)
    throw new Error(`session ${memberId}: ${r.status} ${await r.text()}`)
  return (await r.json()).token
}

const objetivos = JSON.parse(process.argv[2])

const navegador = await chromium.launch({ executablePath: EXE })
const informe = []

for (const objetivo of objetivos) {
  const token = await tokenDe(objetivo.member)
  const contexto = await navegador.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: objetivo.tema ?? 'light',
  })

  // Zustand persist: el store se llama `quipu-auth` y guarda {state, version}.
  await contexto.addInitScript(
    ([clave, valor]) => window.localStorage.setItem(clave, valor),
    ['quipu-auth', JSON.stringify({ state: { token }, version: 0 })],
  )

  const pagina = await contexto.newPage()
  const errores = []
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()))

  await pagina.goto(`${WEB}${objetivo.ruta}`, { waitUntil: 'networkidle' })
  if (objetivo.espera) {
    await pagina
      .getByText(objetivo.espera, { exact: false })
      .first()
      .waitFor({ timeout: 20000 })
  }
  await pagina.waitForTimeout(700)

  const png = `${OUT}${objetivo.nombre}.png`
  await pagina.screenshot({ path: png, fullPage: true })

  const buffer = await pagina.screenshot({ fullPage: true })
  const texto = await pagina.locator('main').innerText()

  informe.push({
    nombre: objetivo.nombre,
    ruta: objetivo.ruta,
    como: objetivo.como,
    png,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    viewport: '1280x900',
    errores_de_consola: errores,
    texto_visible: texto,
  })

  await contexto.close()
}

await navegador.close()
writeFileSync(`${OUT}informe.json`, JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe, null, 2))
