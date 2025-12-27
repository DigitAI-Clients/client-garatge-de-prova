# 🤖 AGENTS.md — Protocol d'Intel·ligència Artificial i Desenvolupament

**Context:** Projecte `digitai-master-template` (PWA Multi-Tenant White Label).
**Rol:** Arquitecte de Software Sènior.

Aquest document estableix les regles inquebrantables per a qualsevol Agent d'IA o Desenvolupador que contribueixi a aquest repositori. L'incompliment d'aquestes normes es considera una violació de la integritat del sistema.

---

## 1. 🗣️ Regla d'Or: Llenguatge
- **IDIOMA OBLIGATORI:** Totes les explicacions, comentaris de codi (docstrings), commits i raonaments han de ser en **CATALÀ**.
- Els noms de variables, funcions i classes han de ser en **ANGLÈS** (estàndard industrial).
  - *Exemple:* `const user = await getUserById(...)` // Correcte
  - *Comentari:* `// Recuperem l'usuari per l'ID` // Correcte

---

## 2. 🏛️ Arquitectura Neta (Clean Architecture)
El codi s'ha d'organitzar en capes estrictes. El flux de dades és unidireccional.

### 🚫 PROHIBICIONS (Strict Boundaries)
1. **La UI (`/components`) MAI** parla amb la Base de Dades. Mai importis `supabase` aquí.
2. **La UI MAI** conté lògica de negoci complexa. Només visualitza dades.
3. **Els Serveis (`/services`) MAI** retornen `Response` o `NextResponse`. Això és feina dels Actions/Route Handlers.
4. **Els Repositoris (`/repositories`) MAI** contenen lògica de negoci. Només fan traducció SQL <-> Entitat.

### ✅ EL CAMÍ CORRECTE (Data Flow)
1. **User Action** (Click) → **Server Action** (`features/*/actions.ts`)
2. **Server Action** → Valida input i crida → **Service** (`services/`)
3. **Service** → Aplica regles de negoci i crida → **Repository** (`repositories/`)
4. **Repository** → Executa Query (Supabase) i retorna → **Model (Tipus)**

---

## 3. 🛡️ Qualitat de Codi i TypeScript
La qualitat no és negociable. L'objectiu és **Zero Deute Tècnic**.

- **NO `ANY`:** L'ús de `any` està prohibit. Utilitza `unknown` amb Type Guards o defineix interfícies a `src/types`.
- **SOLID:**
  - **SRP:** Un fitxer, una responsabilitat. Si un component té més de 200 línies, divideix-lo.
  - **DIP:** Depèn d'abstraccions (Interfícies), no de concrecions.
- **DRY (Don't Repeat Yourself):** Si escrius el mateix codi tres vegades, fes-ne una utilitat o un hook.
- **Gestió d'Errors:** Mai facis un `console.log` d'un error sense gestionar-lo. Els Server Actions han de retornar `{ success: boolean, error?: string, data?: T }`.

---

## 4. ⚙️ Filosofia Configuration-Driven
Som una "Fàbrica de Webs". El codi no sap per a quin client treballa.

- **Mai hardcodejis textos o colors específics.**
- Tot branding ha de venir de variables CSS (`var(--primary)`).
- Tota configuració funcional (features activades) ha de llegir-se de `src/config/digitai.config.ts`.

---

## 5. 🔒 Seguretat Multi-Tenant
- Tota consulta a la base de dades ha de tenir en compte el `organization_id`.
- Confiem en RLS (Row Level Security), però el codi ha d'enviar explícitament l'ID de l'organització quan es creen registres.
- `process.env.NEXT_PUBLIC_ORG_ID` és la teva font de veritat per al tenant actual.

---

## 6. 📝 Workflow de Creació (Pas a Pas)
Si has de crear una funcionalitat nova (ex: Blog), segueix aquest ordre:

1. **Definir Models:** Crea els tipus a `src/types/models.ts`.
2. **Contracte (Interface):** Defineix la interfície del repositori (`IRepository`).
3. **Implementació:** Crea el repositori que compleix la interfície.
4. **Lògica:** Crea el `Service` que utilitza el repositori.
5. **Controlador:** Crea el `Server Action` per exposar el servei.
6. **Vista:** Finalment, crea la UI que crida al `Server Action`.

---

> **Nota per a l'Agent:** Abans de generar codi, respira, revisa aquestes regles i assegura't que la teva solució és la més robusta i escalable possible. Sempre em de retornar el codi complet i amb la ruta comentada a dalt de tot