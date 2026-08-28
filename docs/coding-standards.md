# Coding Standards — E-CAKRA

## Bahasa
- Kode: **English** (variabel, fungsi, tipe)
- UI & komentar bisnis: **Bahasa Indonesia**

## TypeScript
- Gunakan `strict: true` — tidak ada `any` kecuali terpaksa dan diberi komentar
- Selalu definisikan tipe return fungsi async
- Gunakan `interface` untuk tipe data domain, `type` untuk union/alias

## Penamaan
| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| Komponen React | PascalCase | `LoginPage`, `StatusBadge` |
| Fungsi/hook | camelCase | `useAuth`, `formatDate` |
| Konstanta | UPPER_SNAKE_CASE | `API_BASE_URL` |
| File komponen | PascalCase.tsx | `LoginPage.tsx` |
| File utilitas | camelCase.ts | `formatDate.ts` |

## Struktur Komponen
```tsx
// 1. Imports
// 2. Types/interfaces lokal
// 3. Komponen
// 4. Export default
```

## Styling
- Gunakan CSS variables dari `styles/variables.css`
- Hindari inline style kecuali untuk nilai dinamis
- Gunakan class yang sudah ada: `.card`, `.btn-primary`, `.badge-*`

## API & Error Handling
- Semua API call melalui `src/lib/axios.ts`
- Selalu tangani error dengan try/catch atau `.catch()`
- Gunakan `logger.error()` bukan `console.error()` langsung

## Git
- Commit message: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Branch: `feature/nama-fitur`, `fix/nama-bug`
- Tidak push langsung ke `main`
