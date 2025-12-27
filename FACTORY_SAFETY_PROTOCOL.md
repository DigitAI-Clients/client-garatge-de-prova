# 🛡️ FACTORY SAFETY PROTOCOL (Protocol de Seguretat de la Fàbrica)

> **⚠️ ADVERTÈNCIA CRÍTICA:** > Aquest projecte (`digitai-master-template`) **NO** és una web normal. És un **MODEL** que serà clonat i injectat automàticament per una Fàbrica de Software.
>
> **Trencar aquestes regles significa aturar la producció de nous clients.**

---

## 1. Els 3 Contractes Sagrats (Interfícies Intocables)

La Fàbrica (el script generador) és "cega". No veu el teu codi, només assumeix que certes coses existeixen. Si les canvies sense avisar, la Fàbrica fallarà.

### 📜 Contracte 1: La Configuració (`src/config/digitai.config.ts`)
La Fàbrica genera aquest fitxer mitjançant manipulació de strings.

* **🚫 PROHIBIT:** Eliminar o canviar de nom propietats existents a `src/types/config.ts`.
    * *Exemple:* Si canvies `colors.primary` per `colors.main`, totes les webs noves petaran perquè la Fàbrica segueix escrivint `primary`.
* **✅ PERMÈS:** Afegir noves propietats **OPCIONALS**.
    * *Codi:* `tertiary?: string;`
    * *Per què?* Si la Fàbrica no envia aquest valor, el Template ha de tenir un valor per defecte o no fallar.
* **🚨 ALERTA:** Si fas un canvi obligatori a la config, has d'actualitzar **IMMEDIATAMENT** el generador de strings a la Fàbrica (`generateClientConfig`).

### 🔐 Contracte 2: Variables d'Entorn (`.env`)
La Fàbrica injecta les variables a Vercel via API.

* **🚫 PROHIBIT:** Afegir un `process.env.NOVA_API_KEY` al codi i esperar que funcioni màgicament.
* **✅ OBLIGATORI:** Si el teu codi necessita una variable nova:
    1.  Afegeix-la al codi amb un *fallback* o control d'errors (Lazy Loading).
    2.  Ves al script de la Fàbrica (`deployToVercel`) i afegeix-la a la llista d'injecció.
    3.  Actualitza el generador de `.env.local` per als desenvolupadors locals.

### 🗄️ Contracte 3: La Base de Dades (Schema)
La Fàbrica crea les entrades inicials a `organizations` i `projects`.

* **🚫 PROHIBIT:** Modificar l'estructura de la taula `organizations` (especialment columnes `id`, `slug`, `name`) sense coordinació total.
* **✅ PERMÈS:** Crear noves taules per a funcionalitats del Template (ex: `blog_posts`, `products`) sempre que tinguin `organization_id` i polítiques RLS.
* **🚨 INTEGRITAT:** Recorda que per esborrar una organització, has d'esborrar primer els fills. Utilitza `ON DELETE CASCADE` sempre que puguis.

---

## 2. 🏗️ Regles de Build (Zero "Eager Loading")

El servidor de Build (CI/CD) no té claus API vàlides. Si el teu codi intenta connectar-se a Stripe, OpenAI o Supabase **durant la compilació**, el build fallarà.

### ❌ EL PATRÓ MORTAL (Eager Initialization)
Mai facis això a l'arrel d'un fitxer:
```typescript
// AXIXÒ TRENCARÀ LA FÀBRICA 💀
import { Stripe } from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Explota al build!

✅ EL PATRÓ SEGUR (Lazy Singleton / Adapter)
Sempre encapsula les llibreries externes:

TypeScript

```ts
// AIXÒ ÉS SEGUR 🛡️
export class StripeGateway {
  private client: Stripe | null = null;

  getClient() {
    if (!this.client) {
      // Només s'executa quan un usuari real fa una acció
      if (!process.env.STRIPE_KEY) throw new Error("Missing Key"); 
      this.client = new Stripe(process.env.STRIPE_KEY);
    }
    return this.client;
  }
}
```

🌍 Sitemaps i Rutes Dinàmiques  
Si el teu `sitemap.ts` o una pàgina fa servir `cookies()` o `headers()` (auth), has de marcar-la com a dinàmica:

TypeScript

```ts
export const dynamic = 'force-dynamic';
```

Si no ho fas, Next.js intentarà renderitzar-la estàticament al build i fallarà.

---

### 3. 🧪 Checklist de Verificació (Abans de fer Push)
Abans de dir **"està fet"**, fes-te aquestes preguntes.  
Si falles en alguna, **NO FACIS PUSH**.

- [ ] **Build Test**: He executat `pnpm run build` en local i ha passat sense errors?
- [ ] **Env Test**: Si esborro el meu `.env.local` (o li trec les claus), el projecte compila?  
      *(Hauria de compilar, encara que no funcioni en runtime).*
- [ ] **Factory Simulation**: He executat `npx tsx scripts/test-factory.ts` i ha creat un clon, l'ha desplegat a Vercel i ha funcionat?
- [ ] **Config Check**: He modificat `src/types/config.ts`?  
      Si és que sí, he actualitzat el generador de la Fàbrica?

---

### 4. 🚒 Protocol d'Emergència
Si malgrat tot, trenques la Fàbrica i els clients nous no es generen:

1. **Stop**: Atura nous desplegaments automàtics.  
2. **Revert**: Fes `git revert` de l'últim canvi al *Master Template*.  
3. **Debug**: Executa `scripts/test-factory.ts` en local per veure on falla  
   *(GitHub clonació? Vercel Build? Supabase Insert?)*  
4. **Fix**: Aplica el fix seguint les regles de **Lazy Loading** d'aquest document.

> *"Un Arquitecte no construeix només la casa, construeix els plànols perquè es puguin fer mil cases iguals sense errors."*
---

### Què faig demà?

Demà, quan comencis a treballar o li donis instruccions a l'Agent:

1.  **Dona-li aquest arxiu (`FACTORY_SAFETY_PROTOCOL.md`)** com a part del context.
2.  Insta'l·la l'hàbit de fer `pnpm run build` sovint.
3.  Si modifiques alguna cosa estructural, recorda: **"Si toco això, la Fàbrica s'assabenta?"**. Si la resposta és no, vas bé. Si la resposta és sí, has d'anar a actualitzar el script de la Fàbrica.

Amb això, pots dormir tranquil. La teva infraestructura és sòlida. Bona nit! 🌙