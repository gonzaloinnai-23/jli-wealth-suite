# Setup de Supabase (auth + persistencia)

Este sitio puede correr en **dos modos**:

| Modo | Cuándo | Auth | Datos |
|---|---|---|---|
| **Demo localStorage** | `supabase-config.js` está vacío | Cualquiera entra como `demo` (fallback) | Sólo localStorage del navegador |
| **Producción** | `supabase-config.js` tiene URL + anon-key | Email + contraseña real | localStorage + Supabase Postgres |

El sitio detecta el modo automáticamente al cargar. Pasar a producción son **5 pasos** (~15 min) sin necesidad de tocar código del cliente.

---

## 1. Crear el proyecto Supabase

1. Andá a https://supabase.com y creá una cuenta (gratis).
2. **New project**:
   - Name: `jli-wealth-suite`
   - Database password: generá una fuerte (anotala, te puede pedir)
   - Region: la más cercana a tus usuarios (ej. `us-east-1`)
3. Esperá ~2 minutos a que el proyecto se provision.

## 2. Habilitar email + contraseña

1. **Authentication → Providers → Email**.
2. Asegurate que **Enable Email provider** esté ON.
3. **Confirm email**:
   - ON → más seguro, el usuario recibe correo de verificación.
   - OFF → más simple para probar (podés activarlo después).
4. **Save**.

> Si dejaste Confirm email ON, también andá a **Authentication → URL Configuration** y ajustá la **Site URL** y los **Redirect URLs** a tu dominio (ej. `https://jli-wealth-suite.vercel.app`). Los links del mail van a apuntar ahí.

## 3. Correr la migración SQL

1. **SQL Editor → New query**.
2. Copiá el contenido completo de `db/schema.sql` (en este repo) y pegalo.
3. **Run**.
4. Verificá que aparezcan dos tablas en **Table editor**: `objetivos` y `cartera_actual`.
5. En **Authentication → Policies** chequeá que las 8 policies estén activas (4 por tabla: select, insert, update, delete).

## 4. Copiar credenciales al cliente

1. **Settings → API**.
2. Copiá los dos valores:
   - **Project URL** (ej. `https://abcd1234.supabase.co`)
   - **anon public** key (la larga que empieza con `eyJ...`)
3. Pegá en `public/proto/lib/supabase-config.js`:
   ```js
   window.SUPABASE_CONFIG = {
     url:     'https://abcd1234.supabase.co',
     anonKey: 'eyJhbGci...',
   };
   ```
4. Commit + push.

> El `anon-key` es seguro de exponer en el cliente porque la base está protegida con Row Level Security (las policies del paso 3): cada usuario sólo puede leer/escribir su propia fila.

## 5. Verificar

1. Esperá que Vercel termine el build (~1 min).
2. Abrí el sitio.
3. Deberías ver el overlay de login pidiendo **email + contraseña**.
4. Click **Crear cuenta** → registrate con un email.
5. Si tenías "Confirm email" en ON, abrí el mail y clickeá el link.
6. Logueate. Llenar Objetivos y subir un CSV en Cartera actual.
7. Cerrar sesión, volver a entrar en otra computadora o ventana incógnita → tus datos deberían aparecer.

---

## Rollback

Para volver al modo demo sin tocar la base:
- Vaciá `supabase-config.js` (dejá `url: ''` y `anonKey: ''`).
- Commit + push.
- El sitio vuelve a permitir entrada con cualquier credencial y los datos quedan sólo en localStorage.

## Reset de datos de un usuario

```sql
delete from public.objetivos      where user_id = '<uuid>';
delete from public.cartera_actual where user_id = '<uuid>';
```

(`auth.users` tiene el UUID; o desde el dashboard buscando por email)

## Eliminar un usuario

```sql
-- Borra la cuenta del Auth + cascade a objetivos / cartera_actual
delete from auth.users where email = 'usuario@dominio.com';
```
