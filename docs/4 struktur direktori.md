project-root/
├── public/                     # Aset statis publik yang disajikan langsung
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
│
├── src/                        # Kode sumber utama aplikasi
│   ├── assets/                 # Aset internal aplikasi
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/             # Komponen UI reusable
│   │   ├── common/             # Komponen generik: Button, Modal, Input
│   │   ├── layout/             # Header, Sidebar, Footer, MainLayout
│   │   └── features/           # Komponen spesifik fitur
│   │
│   ├── pages/                  # Halaman utama aplikasi
│   │   ├── Home/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   └── NotFound/
│   │
│   ├── routes/                 # Konfigurasi routing
│   │   ├── index.tsx
│   │   ├── protectedRoutes.tsx
│   │   └── routeTypes.ts
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useFetch.ts
│   │
│   ├── services/               # API calls, business logic, external integrations
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── authService.ts
│   │   │   └── userService.ts
│   │   └── adapters/
│   │
│   ├── store/                  # Global state management
│   │   ├── slices/
│   │   ├── index.ts
│   │   └── middleware.ts
│   │
│   ├── context/                # Context API jika dipakai
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── utils/                  # Fungsi utilitas umum
│   │   ├── formatDate.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── config/                 # Konfigurasi aplikasi
│   │   ├── env.ts
│   │   ├── constants.ts
│   │   └── appConfig.ts
│   │
│   ├── styles/                 # Styling global, tema, variabel desain
│   │   ├── globals.css
│   │   ├── theme.css
│   │   └── variables.css
│   │
│   ├── types/                  # Tipe dan interface TypeScript
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── common.ts
│   │
│   ├── lib/                    # Wrapper/helper untuk library pihak ketiga
│   │   ├── axios.ts
│   │   └── logger.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── tests/                      # Seluruh pengujian
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   ├── pages/
│   │   └── services/
│   └── e2e/
│       ├── auth/
│       ├── checkout/
│       └── dashboard/
│
├── docs/                       # Dokumentasi proyek
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   └── coding-standards.md
│
├── scripts/                    # Script otomatisasi
│   ├── build.sh
│   ├── deploy.sh
│   ├── clean.sh
│   └── seed.ts
│
├── dist/                       # Output build production
│
├── .gitignore
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── LICENSE
└── Dockerfile
