import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Library from './pages/Library'

import Reader from './pages/Reader'
import Settings from './pages/Settings'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Library />} />
          <Route path="reader/:id" element={<Reader />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
