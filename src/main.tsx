import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App'
import Lists from './ui/Lists'
import ListDetail from './ui/ListDetail'
import Login from './ui/Login'
import About from './ui/About'
import PoemsList from './ui/PoemsList'
import PoemEditor from './ui/PoemEditor'
import PoemView from './ui/PoemView'

const BASENAME = import.meta.env.BASE_URL || '/buddy-cam/'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { path: '/', element: <Lists /> },
    { path: '/list/:id', element: <ListDetail /> },
    { path: '/about', element: <About /> },

    // --- AJOUT ROUTES POÈMES ---
    { path: '/poems', element: <PoemsList /> },
    { path: '/poems/new', element: <PoemEditor /> },
    { path: '/poems/edit/:id', element: <PoemEditor /> },
    { path: '/poems/:id', element: <PoemView /> },
  ]},
  { path: '/login', element: <Login /> }
], { basename: BASENAME })
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)