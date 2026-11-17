import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Changes from './pages/Changes'
import Explain from './pages/Explain'
import Insights from './pages/Insights'
import Landing from './pages/Landing'
import Parent from './pages/Parent'
import Plan from './pages/Plan'
import { Practice, Solve } from './pages/Practice'
import Recovery from './pages/Recovery'
import Settings from './pages/Settings'
import Teacher from './pages/Teacher'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/solve/:id" element={<Solve />} />
          <Route path="/explain" element={<Explain />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/parent" element={<Parent />} />
          <Route path="/changes" element={<Changes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}
