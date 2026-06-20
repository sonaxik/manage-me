import 'bootstrap/dist/css/bootstrap.min.css'
import { useState, useEffect } from 'react'
import { projectService } from './api/ProjectService'
import { userService } from './api/UserService'
import { storyService } from './api/StoryService'
import { taskService } from './api/TaskService'
import { notificationService } from './api/NotificationService'
import type { Story, StoryStatus, StoryPriority } from './types/Story'
import type { Task, TaskPriority } from './types/Task'
import type { Project } from './types/Project'
import type { Notification, NotificationPriority } from './types/Notification'

const STATUS_BADGE: Record<string, string> = {
  todo:  'bg-secondary',
  doing: 'bg-warning text-dark',
  done:  'bg-success',
}
const STATUS_LABEL: Record<string, string> = {
  todo:  'Do zrobienia',
  doing: 'W trakcie',
  done:  'Zakończone',
}
const PRIORITY_BADGE: Record<string, string> = {
  niski:  'bg-success',
  sredni: 'bg-warning text-dark',
  wysoki: 'bg-danger',
}
const PRIORITY_LABEL: Record<string, string> = {
  niski:  'Niski',
  sredni: 'Średni',
  wysoki: 'Wysoki',
}
const KANBAN_HEADER: Record<string, string> = {
  todo:  'bg-secondary text-white',
  doing: 'bg-warning text-dark',
  done:  'bg-success text-white',
}
const NOTIF_PRIORITY_BADGE: Record<string, string> = {
  low:    'bg-secondary',
  medium: 'bg-warning text-dark',
  high:   'bg-danger',
}
const NOTIF_PRIORITY_LABEL: Record<string, string> = {
  low:    'Niski',
  medium: 'Średni',
  high:   'Wysoki',
}

function App() {
  const user = userService.getUser();

  const [projekty, setProjekty] = useState<Project[]>(projectService.getAll())
  const [nazwa, setNazwa] = useState('')
  const [opis, setOpis] = useState('')
  const [edytowanyId, setEdytowanyId] = useState<string | null>(null)
  const [aktywnyProjekt, setAktywnyProjekt] = useState<Project | null>(projectService.getActiveProject())

  const [historyjki, setHistoryjki] = useState<Story[]>(aktywnyProjekt ? storyService.getByProject(aktywnyProjekt.id) : [])
  const [nazwaHistoryjki, setNazwaHistoryjki] = useState('')
  const [opisHistoryjki, setOpisHistoryjki] = useState('')
  const [priorytetHistoryjki, setPriorytetHistoryjki] = useState<StoryPriority>('niski')
  const [edytowanyHistoryjkaId, setEdytowanyHistoryjkaId] = useState<string | null>(null)
  const [statusHistoryjki, setStatusHistoryjki] = useState<StoryStatus>('todo')
  const [wybranaHistoryjka, setWybranaHistoryjka] = useState<Story | null>(null)

  const [zadania, setZadania] = useState<Task[]>(wybranaHistoryjka ? taskService.getByStory(wybranaHistoryjka.id) : [])
  const [nazwaZadania, setNazwaZadania] = useState('')
  const [opisZadania, setOpisZadania] = useState('')
  const [priorytetZadania, setPriorytetZadania] = useState<TaskPriority>('niski')
  const [przewidywanyCzasZadania, setPrzewidywanyCzasZadania] = useState(0)
  const [edytowanyZadanieId, setEdytowanyZadanieId] = useState<string | null>(null)

  const [pokazKanban, setPokazKanban] = useState(false)
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [dialogPowiadomienie, setDialogPowiadomienie] = useState<Notification | null>(null)
  const [nieprzeczytane, setNieprzeczytane] = useState(() => notificationService.getUnreadCount(user.id))
  const [pokazPowiadomienia, setPokazPowiadomienia] = useState(false)
  const [powiadomienia, setPowiadomienia] = useState<Notification[]>([])
  const [wybranePowiadomienie, setWybranePowiadomienie] = useState<Notification | null>(null)

  useEffect(() => {document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light')}, [darkMode]);

  function dodajProjekt() {
    projectService.create(nazwa, opis)
    setProjekty(projectService.getAll())
    setNazwa('')
    setOpis('')
    userService.getAll().filter(u => u.role === 'admin').forEach(u => wyslijPowiadomienie('Nowy projekt', `Utworzono projekt "${nazwa}"`, 'high', u.id));
  }

  function usunProjekt(id: string) {
    projectService.delete(id)
    setProjekty(projectService.getAll())
  }

  function edytujProjekt(projekt: Project) {
    setEdytowanyId(projekt.id)
    setNazwa(projekt.name)
    setOpis(projekt.description)
  }

  function zapiszProjekt() {
    if (!edytowanyId) return
    projectService.update(edytowanyId, nazwa, opis)
    setProjekty(projectService.getAll())
    setEdytowanyId(null)
    setNazwa('')
    setOpis('')
  }

  function wybierzProjekt(projekt: Project) {
    projectService.setActiveProject(projekt.id)
    setAktywnyProjekt(projekt)
    setHistoryjki(storyService.getByProject(projekt.id))
  }

  function anulujWyborProjektu() {
    projectService.clearActiveProject()
    setAktywnyProjekt(null)
    setHistoryjki([])
    setWybranaHistoryjka(null)
    setZadania([])
    setPokazKanban(false)
  }

  function dodajHistoryjke() {
    if (!aktywnyProjekt) return
    storyService.create(nazwaHistoryjki, opisHistoryjki, priorytetHistoryjki, aktywnyProjekt.id, user.id)
    setHistoryjki(storyService.getByProject(aktywnyProjekt.id))
    setNazwaHistoryjki('')
    setOpisHistoryjki('')
    setPriorytetHistoryjki('niski')
  }

  function usunHistoryjke(id: string) {
    if (!aktywnyProjekt) return
    storyService.delete(id)
    setHistoryjki(storyService.getByProject(aktywnyProjekt.id))
  }

  function edytujHistoryjke(historyjka: Story) {
    setEdytowanyHistoryjkaId(historyjka.id)
    setNazwaHistoryjki(historyjka.name)
    setOpisHistoryjki(historyjka.description)
    setPriorytetHistoryjki(historyjka.priority)
  }

  function zapiszHistoryjke() {
    if (!edytowanyHistoryjkaId || !aktywnyProjekt) return
    storyService.update(edytowanyHistoryjkaId, nazwaHistoryjki, opisHistoryjki, priorytetHistoryjki)
    setHistoryjki(storyService.getByProject(aktywnyProjekt.id))
    setEdytowanyHistoryjkaId(null)
    setNazwaHistoryjki('')
    setOpisHistoryjki('')
    setPriorytetHistoryjki('niski')
  }

  function zmienStatus(id: string, nowyStatus: StoryStatus) {
    if (!aktywnyProjekt) return
    storyService.updateStatus(id, nowyStatus)
    setHistoryjki(storyService.getByProject(aktywnyProjekt.id))
  }

  function wybierzHistoryjke(historyjka: Story) {
    setWybranaHistoryjka(historyjka)
    setZadania(taskService.getByStory(historyjka.id))
  }

  function anulujWyborHistoryjki() {
    setWybranaHistoryjka(null)
    setZadania([])
    setPokazKanban(false)
  }

  function dodajZadanie() {
    if (!wybranaHistoryjka) return
    taskService.create(nazwaZadania, opisZadania, priorytetZadania, wybranaHistoryjka.id, przewidywanyCzasZadania)
    setZadania(taskService.getByStory(wybranaHistoryjka.id))
    setNazwaZadania('')
    setOpisZadania('')
    setPriorytetZadania('niski')
    setPrzewidywanyCzasZadania(0)
    wyslijPowiadomienie('Nowe zadanie', `Dodano zadanie "${nazwaZadania}" do historyjki "${wybranaHistoryjka.name}"`, 'medium', wybranaHistoryjka.ownerId);
  }

  function edytujZadanie(zadanie: Task) {
    setEdytowanyZadanieId(zadanie.id)
    setNazwaZadania(zadanie.name)
    setOpisZadania(zadanie.description)
    setPriorytetZadania(zadanie.priority)
    setPrzewidywanyCzasZadania(zadanie.estimatedHours)
  }

  function zapiszZadanie() {
    if (!edytowanyZadanieId || !wybranaHistoryjka) return
    taskService.update(edytowanyZadanieId, nazwaZadania, opisZadania, priorytetZadania, przewidywanyCzasZadania)
    setZadania(taskService.getByStory(wybranaHistoryjka.id))
    setEdytowanyZadanieId(null)
    setNazwaZadania('')
    setOpisZadania('')
    setPriorytetZadania('niski')
    setPrzewidywanyCzasZadania(0)
  }

  function usunZadanie(id: string) {
    if (!wybranaHistoryjka) return;
    const zadanie = zadania.find(z => z.id === id);
    taskService.delete(id);
    setZadania(taskService.getByStory(wybranaHistoryjka.id));
    if (zadanie) wyslijPowiadomienie('Usunięto zadanie', `Zadanie "${zadanie.name}" zostało usunięte z historyjki "${wybranaHistoryjka.name}"`, 'medium', wybranaHistoryjka.ownerId);
  }


  function przypiszOsobe(taskId: string, userId: string) {
    if (!wybranaHistoryjka) return
    taskService.assign(taskId, userId)
    setZadania(taskService.getByStory(wybranaHistoryjka.id))
    const odswiezonaHistoryjka = storyService.getById(wybranaHistoryjka.id)
    if (odswiezonaHistoryjka) setWybranaHistoryjka(odswiezonaHistoryjka)
    wyslijPowiadomienie('Przypisano do zadania', `Zostałeś przypisany do zadania`, 'high', userId)
    wyslijPowiadomienie('Status zadania zmieniony', `Zadanie zmieniło status na "W trakcie"`, 'low', wybranaHistoryjka.ownerId)
  }

  function zakonczZadanie(taskId: string) {
    if (!wybranaHistoryjka) return
    taskService.complete(taskId)
    setZadania(taskService.getByStory(wybranaHistoryjka.id))
    const odswiezonaHistoryjka = storyService.getById(wybranaHistoryjka.id)
    if (odswiezonaHistoryjka) setWybranaHistoryjka(odswiezonaHistoryjka)
    wyslijPowiadomienie('Zadanie zakończone', `Zadanie zmieniło status na "Zakończone"`, 'medium', wybranaHistoryjka.ownerId)
  }

  function obliczZrealizowaneGodziny(zadanie: Task): number {
    if (!zadanie.startedAt) return 0
    const koniec = zadanie.completedAt ?? new Date().toISOString()
    const milisekundy = new Date(koniec).getTime() - new Date(zadanie.startedAt).getTime()
    return Math.round(milisekundy / (1000 * 60 * 60))
  }

  function nazwaPrzypisanejOsoby(zadanie: Task): string {
    if (!zadanie.assigneeId) return 'Nieprzypisane'
    const osoba = userService.getById(zadanie.assigneeId)
    return osoba ? `${osoba.firstName} ${osoba.lastName}` : 'Nieprzypisane'
  }

  function wyslijPowiadomienie(title: string, message: string, priority: NotificationPriority, recipientId: string) {
    const n = notificationService.create(title, message, priority, recipientId);
    if(recipientId === user.id){
      setNieprzeczytane(notificationService.getUnreadCount(user.id));
      if(priority === "medium" || priority === "high")
        setDialogPowiadomienie(n);
    }
  }

  function otworzWidokPowiadomien() {
    setPowiadomienia(notificationService.getForUser(user.id))
    setPokazPowiadomienia(true)
  }

  function otworzPowiadomienie(n: Notification) {
    notificationService.markAsRead(n.id)
    setWybranePowiadomienie({ ...n, isRead: true })
    setPowiadomienia(notificationService.getForUser(user.id))
    setNieprzeczytane(notificationService.getUnreadCount(user.id))
  }

  function zamknijPowiadomienia() {
    setPokazPowiadomienia(false)
    setWybranePowiadomienie(null)
  }

  function oznaczJakoPrzeczytane(id: string) {
    notificationService.markAsRead(id)
    setPowiadomienia(notificationService.getForUser(user.id))
    setNieprzeczytane(notificationService.getUnreadCount(user.id))
  }

  function oznaczWszystkieJakoPrzeczytane() {
    notificationService.markAllAsRead(user.id)
    setPowiadomienia(notificationService.getForUser(user.id))
    setNieprzeczytane(0)
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar bg-body-tertiary shadow-sm sticky-top">
        <div className="container-fluid px-4">
          <span className="navbar-brand fw-bold fs-4">ManageMe</span>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link btn-sm p-0 text-decoration-none navbar-text" onClick={otworzWidokPowiadomien}>
              Powiadomienia
              {nieprzeczytane > 0 && (
                <span className="badge bg-danger ms-1">{nieprzeczytane}</span>
              )}
            </button>
            <span className="navbar-text">
              {user.firstName} {user.lastName}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setDarkMode(d => !d)}
            >
              {darkMode ? '☀️ Jasny' : '🌙 Ciemny'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">

        {pokazPowiadomienia ? (
          /* ══════════ WIDOK POWIADOMIEŃ ══════════ */
          <div>
            <button className="btn btn-link p-0 mb-3 text-decoration-none" onClick={zamknijPowiadomienia}>
              ← Projekty
            </button>

            {wybranePowiadomienie ? (
              /* ── Szczegóły powiadomienia ── */
              <div>
                <button className="btn btn-link p-0 mb-3 text-decoration-none" onClick={() => setWybranePowiadomienie(null)}>
                  ← Powiadomienia
                </button>
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0">{wybranePowiadomienie.title}</h5>
                      <span className={`badge ${NOTIF_PRIORITY_BADGE[wybranePowiadomienie.priority]}`}>
                        {NOTIF_PRIORITY_LABEL[wybranePowiadomienie.priority]}
                      </span>
                    </div>
                    <p className="text-muted small mb-3">
                      {new Date(wybranePowiadomienie.date).toLocaleString('pl-PL')}
                    </p>
                    <p className="mb-0">{wybranePowiadomienie.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Lista powiadomień ── */
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fw-bold mb-0">Powiadomienia</h2>
                  <button className="btn btn-outline-secondary btn-sm" onClick={oznaczWszystkieJakoPrzeczytane}>
                    Oznacz wszystkie jako przeczytane
                  </button>
                </div>
                {powiadomienia.length === 0 && (
                  <p className="text-muted">Brak powiadomień.</p>
                )}
                {[...powiadomienia].reverse().map(n => (
                  <div key={n.id} className={`card mb-2 ${!n.isRead ? 'border-primary' : ''}`}>
                    <div className="card-body py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="fw-bold">{n.title}</span>
                          {!n.isRead && <span className="badge bg-primary ms-2">Nowe</span>}
                          <p className="text-muted small mb-1">{new Date(n.date).toLocaleString('pl-PL')}</p>
                          <p className="mb-0 small">{n.message}</p>
                        </div>
                        <span className={`badge ms-2 flex-shrink-0 ${NOTIF_PRIORITY_BADGE[n.priority]}`}>
                          {NOTIF_PRIORITY_LABEL[n.priority]}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer d-flex gap-2 py-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => otworzPowiadomienie(n)}>
                        Szczegóły
                      </button>
                      {!n.isRead && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => oznaczJakoPrzeczytane(n.id)}>
                          Oznacz jako przeczytane
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : aktywnyProjekt ? (
          <div>
            {/* ── Nagłówek projektu ── */}
            <button className="btn btn-link p-0 mb-3 text-decoration-none" onClick={anulujWyborProjektu}>
              ← Projekty
            </button>
            <h2 className="fw-bold">{aktywnyProjekt.name}</h2>
            <p className="text-muted mb-4">{aktywnyProjekt.description}</p>
            <hr />

            {wybranaHistoryjka ? (
              /* ══════════ WIDOK ZADAŃ ══════════ */
              <div>
                <button className="btn btn-link p-0 mb-3 text-decoration-none" onClick={anulujWyborHistoryjki}>
                  ← Historyjki
                </button>

                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="fw-bold mb-0">{wybranaHistoryjka.name}</h4>
                  <span className={`badge ${PRIORITY_BADGE[wybranaHistoryjka.priority]}`}>
                    {PRIORITY_LABEL[wybranaHistoryjka.priority]}
                  </span>
                  <span className={`badge ${STATUS_BADGE[wybranaHistoryjka.status]}`}>
                    {STATUS_LABEL[wybranaHistoryjka.status]}
                  </span>
                </div>
                <p className="text-muted mb-4">{wybranaHistoryjka.description}</p>

                {/* Formularz zadania */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title mb-3">
                      {edytowanyZadanieId ? 'Edytuj zadanie' : 'Nowe zadanie'}
                    </h6>
                    <div className="row g-2">
                      <div className="col-md">
                        <input
                          className="form-control"
                          value={nazwaZadania}
                          onChange={e => setNazwaZadania(e.target.value)}
                          placeholder="Nazwa zadania"
                        />
                      </div>
                      <div className="col-md">
                        <input
                          className="form-control"
                          value={opisZadania}
                          onChange={e => setOpisZadania(e.target.value)}
                          placeholder="Opis"
                        />
                      </div>
                      <div className="col-md-auto">
                        <select
                          className="form-select"
                          value={priorytetZadania}
                          onChange={e => setPriorytetZadania(e.target.value as TaskPriority)}
                        >
                          <option value="niski">Niski</option>
                          <option value="sredni">Średni</option>
                          <option value="wysoki">Wysoki</option>
                        </select>
                      </div>
                      <div className="col-md-auto">
                        <input
                          className="form-control"
                          type="number"
                          value={przewidywanyCzasZadania}
                          onChange={e => setPrzewidywanyCzasZadania(Number(e.target.value))}
                          placeholder="Czas (h)"
                          style={{ width: 100 }}
                        />
                      </div>
                      <div className="col-md-auto">
                        <button
                          className="btn btn-primary w-100"
                          onClick={edytowanyZadanieId ? zapiszZadanie : dodajZadanie}
                        >
                          {edytowanyZadanieId ? 'Zapisz' : 'Dodaj'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przełącznik lista / kanban */}
                <div className="d-flex justify-content-end mb-3">
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${!pokazKanban ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPokazKanban(false)}
                    >
                      ☰ Lista
                    </button>
                    <button
                      className={`btn btn-sm ${pokazKanban ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPokazKanban(true)}
                    >
                      ⊞ Kanban
                    </button>
                  </div>
                </div>

                {pokazKanban ? (
                  /* ── Kanban ── */
                  <div className="row g-3">
                    {(['todo', 'doing', 'done'] as const).map(status => (
                      <div key={status} className="col-md-4">
                        <div className="card h-100">
                          <div className={`card-header fw-bold d-flex justify-content-between align-items-center ${KANBAN_HEADER[status]}`}>
                            {STATUS_LABEL[status]}
                            <span className="badge bg-white text-dark">
                              {zadania.filter(z => z.status === status).length}
                            </span>
                          </div>
                          <div className="card-body p-2">
                            {zadania.filter(z => z.status === status).map(z => (
                              <div key={z.id} className="card mb-2">
                                <div className="card-body p-2 d-flex flex-column gap-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <p className="fw-bold mb-0 small">{z.name}</p>
                                    <span className={`badge ms-1 flex-shrink-0 ${PRIORITY_BADGE[z.priority]}`}>
                                      {PRIORITY_LABEL[z.priority]}
                                    </span>
                                  </div>
                                  <p className="text-muted mb-0 small">{z.description}</p>
                                  <div className="d-flex justify-content-end">
                                    <span className="text-muted small fst-italic">{nazwaPrzypisanejOsoby(z)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── Lista zadań ── */
                  <div>
                    {zadania.map(zadanie => (
                      <div key={zadanie.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="fw-bold mb-0">{zadanie.name}</h6>
                            <div className="d-flex gap-1">
                              <span className={`badge ${PRIORITY_BADGE[zadanie.priority]}`}>
                                {PRIORITY_LABEL[zadanie.priority]}
                              </span>
                              <span className={`badge ${STATUS_BADGE[zadanie.status]}`}>
                                {STATUS_LABEL[zadanie.status]}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted small mb-2">{zadanie.description}</p>
                          <div className="text-muted small">
                            Szacowany: <strong>{zadanie.estimatedHours}h</strong>
                            {' · '}Przepracowane: <strong>{obliczZrealizowaneGodziny(zadanie)}h</strong>
                            {' · '}Osoba: <strong>{nazwaPrzypisanejOsoby(zadanie)}</strong>
                            {' · '}
                            {zadanie.status === 'todo' && <>Dodano: <strong>{new Date(zadanie.createdAt).toLocaleDateString('pl-PL')}</strong></>}
                            {zadanie.status === 'doing' && <>Start: <strong>{zadanie.startedAt ? new Date(zadanie.startedAt).toLocaleDateString('pl-PL') : '—'}</strong></>}
                            {zadanie.status === 'done' && <>Zakończono: <strong>{zadanie.completedAt ? new Date(zadanie.completedAt).toLocaleDateString('pl-PL') : '—'}</strong></>}
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center gap-2 flex-wrap">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => edytujZadanie(zadanie)}>
                            Edytuj
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => usunZadanie(zadanie.id)}>
                            Usuń
                          </button>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={zadanie.assigneeId ?? ''}
                            onChange={e => przypiszOsobe(zadanie.id, e.target.value)}
                          >
                            <option value="" disabled>Przypisz osobę</option>
                            {userService.getAll().filter(u => u.role !== 'admin').map(u => (
                              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                          </select>
                          {zadanie.assigneeId && zadanie.status !== 'done' && (
                            <button
                              className="btn btn-outline-success btn-sm ms-auto"
                              onClick={() => zakonczZadanie(zadanie.id)}
                            >
                              ✓ Zakończ
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ══════════ WIDOK HISTORYJEK ══════════ */
              <div>
                {/* Formularz historyjki */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title mb-3">
                      {edytowanyHistoryjkaId ? 'Edytuj historyjkę' : 'Nowa historyjka'}
                    </h6>
                    <div className="row g-2">
                      <div className="col-md">
                        <input
                          className="form-control"
                          value={nazwaHistoryjki}
                          onChange={e => setNazwaHistoryjki(e.target.value)}
                          placeholder="Nazwa historyjki"
                        />
                      </div>
                      <div className="col-md">
                        <input
                          className="form-control"
                          value={opisHistoryjki}
                          onChange={e => setOpisHistoryjki(e.target.value)}
                          placeholder="Opis historyjki"
                        />
                      </div>
                      <div className="col-md-auto">
                        <select
                          className="form-select"
                          value={priorytetHistoryjki}
                          onChange={e => setPriorytetHistoryjki(e.target.value as StoryPriority)}
                        >
                          <option value="niski">Niski</option>
                          <option value="sredni">Średni</option>
                          <option value="wysoki">Wysoki</option>
                        </select>
                      </div>
                      <div className="col-md-auto">
                        <button
                          className="btn btn-primary w-100"
                          onClick={edytowanyHistoryjkaId ? zapiszHistoryjke : dodajHistoryjke}
                        >
                          {edytowanyHistoryjkaId ? 'Zapisz' : 'Dodaj'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtr statusu */}
                <div className="btn-group mb-4">
                  <button
                    className={`btn btn-sm ${statusHistoryjki === 'todo' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusHistoryjki('todo')}
                  >
                    Do zrobienia
                  </button>
                  <button
                    className={`btn btn-sm ${statusHistoryjki === 'doing' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setStatusHistoryjki('doing')}
                  >
                    W trakcie
                  </button>
                  <button
                    className={`btn btn-sm ${statusHistoryjki === 'done' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setStatusHistoryjki('done')}
                  >
                    Zakończone
                  </button>
                </div>

                {/* Karty historyjek */}
                {historyjki.filter(h => h.status === statusHistoryjki).map(historyjka => (
                  <div key={historyjka.id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0">{historyjka.name}</h6>
                        <div className="d-flex gap-1">
                          <span className={`badge ${PRIORITY_BADGE[historyjka.priority]}`}>
                            {PRIORITY_LABEL[historyjka.priority]}
                          </span>
                          <span className={`badge ${STATUS_BADGE[historyjka.status]}`}>
                            {STATUS_LABEL[historyjka.status]}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted small mb-2">{historyjka.description}</p>
                      <div className="text-muted small">
                        Dodano: <strong>{new Date(historyjka.createdAt).toLocaleDateString('pl-PL')}</strong>
                        {' · '}Właściciel: <strong>{(() => { const u = userService.getById(historyjka.ownerId); return u ? `${u.firstName} ${u.lastName}` : '—' })()}</strong>
                      </div>
                    </div>
                    <div className="card-footer d-flex align-items-center gap-2 flex-wrap">
                      <button className="btn btn-primary btn-sm" onClick={() => wybierzHistoryjke(historyjka)}>
                        Otwórz
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => edytujHistoryjke(historyjka)}>
                        Edytuj
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => usunHistoryjke(historyjka.id)}>
                        Usuń
                      </button>
                      <select
                        className="form-select form-select-sm ms-auto"
                        style={{ width: 'auto' }}
                        value={historyjka.status}
                        onChange={e => zmienStatus(historyjka.id, e.target.value as StoryStatus)}
                      >
                        <option value="todo">Do zrobienia</option>
                        <option value="doing">W trakcie</option>
                        <option value="done">Zakończone</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ══════════ LISTA PROJEKTÓW ══════════ */
          <div>
            <h2 className="fw-bold mb-4">Projekty</h2>

            {/* Formularz projektu */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-3">{edytowanyId ? 'Edytuj projekt' : 'Nowy projekt'}</h6>
                <div className="row g-2">
                  <div className="col-md">
                    <input
                      className="form-control"
                      value={nazwa}
                      onChange={e => setNazwa(e.target.value)}
                      placeholder="Nazwa projektu"
                    />
                  </div>
                  <div className="col-md">
                    <input
                      className="form-control"
                      value={opis}
                      onChange={e => setOpis(e.target.value)}
                      placeholder="Opis projektu"
                    />
                  </div>
                  <div className="col-md-auto">
                    <button
                      className="btn btn-primary w-100"
                      onClick={edytowanyId ? zapiszProjekt : dodajProjekt}
                    >
                      {edytowanyId ? 'Zapisz' : 'Dodaj projekt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Siatka kart projektów */}
            <div className="row row-cols-1 row-cols-md-3 g-3">
              {projekty.map(projekt => (
                <div key={projekt.id} className="col">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">{projekt.name}</h5>
                      <p className="card-text text-muted">{projekt.description}</p>
                    </div>
                    <div className="card-footer d-flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => wybierzProjekt(projekt)}>
                        Wybierz
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => edytujProjekt(projekt)}>
                        Edytuj
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => usunProjekt(projekt.id)}>
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {dialogPowiadomienie && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDialogPowiadomienie(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{dialogPowiadomienie.title}</h5>
                <button className="btn-close" onClick={() => setDialogPowiadomienie(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-1">{dialogPowiadomienie.message}</p>
                <p className="text-muted small mb-0">
                  {new Date(dialogPowiadomienie.date).toLocaleString('pl-PL')}
                </p>
              </div>
              <div className="modal-footer">
                <span className={`badge ${NOTIF_PRIORITY_BADGE[dialogPowiadomienie.priority]}`}>
                  {NOTIF_PRIORITY_LABEL[dialogPowiadomienie.priority]}
                </span>
                <button className="btn btn-primary" onClick={() => setDialogPowiadomienie(null)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
