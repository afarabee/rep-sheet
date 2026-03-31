import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import History from '@/pages/History'
import BodyComp from '@/pages/BodyComp'
import Settings from '@/pages/Settings'
import Calendar from '@/pages/Calendar'
import Library from '@/pages/Library'
import ActiveWorkout from '@/pages/ActiveWorkout'
import Templates from '@/pages/Templates'
import FiveByFiveSetup from '@/pages/FiveByFiveSetup'
import FiveByFiveWorkout from '@/pages/FiveByFiveWorkout'
import Goals from '@/pages/Goals'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/body-comp" element={<BodyComp />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/workout/active" element={<ActiveWorkout />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/workout/5x5/setup" element={<FiveByFiveSetup />} />
          <Route path="/workout/5x5/active" element={<FiveByFiveWorkout />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
