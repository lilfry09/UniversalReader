import { Suspense, lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

const Layout = lazy(() => import('./Layout'))
const Library = lazy(() => import('./pages/Library'))
const Reader = lazy(() => import('./pages/Reader'))
const Settings = lazy(() => import('./pages/Settings'))

function RouteFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center text-gray-500">
      正在加载...
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Library />} />
            <Route path="reader/:id" element={<Reader />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
