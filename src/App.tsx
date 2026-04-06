import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import ErrorBoundary from '@/components/ErrorBoundary'

const Home = lazy(() => import('@/pages/Home'))
const History = lazy(() => import('@/pages/History'))
const BodyComp = lazy(() => import('@/pages/BodyComp'))
const Settings = lazy(() => import('@/pages/Settings'))
const Calendar = lazy(() => import('@/pages/Calendar'))
const Library = lazy(() => import('@/pages/Library'))
const ActiveWorkout = lazy(() => import('@/pages/ActiveWorkout'))
const Templates = lazy(() => import('@/pages/Templates'))
const FiveByFiveSetup = lazy(() => import('@/pages/FiveByFiveSetup'))
const FiveByFiveWorkout = lazy(() => import('@/pages/FiveByFiveWorkout'))
const Goals = lazy(() => import('@/pages/Goals'))
const Progress = lazy(() => import('@/pages/Progress'))

function PageLoader() {
  return (
    <div className="h-full flex items-center justify-center">
      <span className="text-[#8B7FA6] font-display text-lg uppercase tracking-widest">Loading…</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/body-comp" element={<BodyComp />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/library" element={<Library />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/workout/active" element={<ActiveWorkout />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/workout/5x5/setup" element={<FiveByFiveSetup />} />
              <Route path="/workout/5x5/active" element={<FiveByFiveWorkout />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
