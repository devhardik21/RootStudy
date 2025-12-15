import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Route, Router, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TeacherPage from './pages/TeacherPage.jsx'
import GroupsPage from './pages/GroupList.jsx'

const routes = createBrowserRouter([
  {
  path : "/",
  element : <TeacherPage></TeacherPage>
},
  {
  path : "/groups",
  element : <GroupsPage></GroupsPage>
},

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routes}></RouterProvider>
  </StrictMode>,
)
