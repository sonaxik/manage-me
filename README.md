# ManageMe

Projekt zaliczeniowy z przedmiotu **Programowanie aplikacji webowych** — laboratoria.

## Opis

Aplikacja do zarządzania projektami w stylu Agile. Umożliwia tworzenie projektów, historyjek użytkownika oraz zadań z widokiem tablicy Kanban. Obsługuje tryb ciemny/jasny.

## Technologie

- React 19
- TypeScript
- Vite
- Bootstrap 5.3

## Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Budowanie wersji produkcyjnej
npm run build
```

Aplikacja dostępna pod adresem `http://localhost:5173`.

Dane przechowywane są w `localStorage` przeglądarki — nie jest wymagane żadne zewnętrzne API ani baza danych.

## Struktura projektu

```
src/
├── api/                  # Warstwa serwisów (mock API via localStorage)
│   ├── ProjectService.ts
│   ├── StoryService.ts
│   ├── TaskService.ts
│   └── UserService.ts
├── types/                # Modele danych (interfejsy TypeScript)
│   ├── Project.ts
│   ├── Story.ts
│   ├── Task.ts
│   └── User.ts
├── App.tsx               # Główny komponent aplikacji (cały widok)
├── main.tsx              # Punkt wejściowy React
└── index.css             # Globalne style
```
