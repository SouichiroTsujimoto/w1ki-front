import { Route, Routes } from 'react-router-dom'
import PageView from './views/PageView'
import NewPage from './views/NewPage'
import Top from './views/Top.tsx'
import Layout from './components/Layout'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<Top />} />
                <Route path='/view' element={<NewPage />} />
                <Route path='/view/:title' element={<PageView />} />
            </Route>
        </Routes>
    )
}

export default App
