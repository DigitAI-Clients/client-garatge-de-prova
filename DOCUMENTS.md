# 📚 DOCUMENTS.md — Índex de Documentació del Projecte

Benvingut al repositori `digitai-master-template`.
Aquest document serveix com a índex central per navegar per la documentació tècnica i de negoci del projecte.

## 🗂️ Índex de Fitxers Clau

### 1. Protocols i Normatives
| Fitxer | Descripció | Audiència |
| :--- | :--- | :--- |
| **`AGENTS.md`** | **[CRÍTIC]** Regles de comportament per a IA i Devs. Estàndards de codi, regles SOLID, prohibició de `any`, i arquitectura obligatòria. | Tots / IA |
| **`ENGINEERING_HANDBOOK.md`** | Manual complet d'enginyeria. Explica l'stack tecnològic (Next.js 16, Supabase), l'estructura de carpetes detallada i guies per a Juniors. | Devs |
| **`AUTOMATION_ARCHITECTURE_GUIDE.md`** | Explica la relació entre "La Fàbrica" (generador) i aquest "Master Template". Detalla com es clona i personalitza el projecte automàticament. | Arquitectes |

### 2. Tècnic i Codi
| Fitxer | Descripció | Ubicació típica |
| :--- | :--- | :--- |
| **`digitai.config.ts`** | El cor del sistema. Defineix quins mòduls estan actius, textos base i configuració del tenant. | `src/config/` |
| **`esquema.sql`** | Definició de la Base de Dades, taules, ENUMS i polítiques de seguretat RLS (Row Level Security). | Arrel |
| **`middleware.ts`** | Gestió de rutes protegides, autenticació i internacionalització (i18n). | `src/` |

---

## 🧭 Guia Ràpida d'Arquitectura

El projecte segueix una **Arquitectura Neta Modular**. Si busques alguna cosa, probablement està aquí:

- **Vols canviar un color/text global?** → `src/globals.css` o `digitai.config.ts`
- **Vols veure com es guarden les dades?** → `src/repositories/`
- **Vols entendre la lògica de negoci?** → `src/services/`
- **Vols modificar un formulari o un botó?** → `src/components/modules/`
- **Vols veure les rutes de la web?** → `src/app/[locale]/`

---

## 🆘 Com demanar ajuda?

Si ets un desenvolupador humà o un Agent IA i tens dubtes, segueix aquest procediment:

1. Consulta **`AGENTS.md`** per assegurar que compleixes els estàndards.
2. Revisa **`ENGINEERING_HANDBOOK.md`** per entendre on ubicar el teu codi.
3. Si generes codi nou, assegura't que és **Testable**, **Tipat (TypeScript)** i **Documentat en Català**.