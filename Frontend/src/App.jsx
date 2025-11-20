import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import { Toaster} from 'react-hot-toast'

import Homepage from './pages/Homepage'
import ProblemsPage from './pages/ProblemsPage'
import Problempage from './pages/Problempage'
import DashboardPage from './pages/DashboardPage'


function App() {

  const { isSignedIn,isLoaded } = useUser()

  if(!isLoaded) return null;
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/dashboard' element={isSignedIn ? <DashboardPage /> : <Navigate to='/' />} />
        <Route path='/problems' element={isSignedIn ? <ProblemsPage /> : <Navigate to='/' />} />
        <Route path='/problem/:id' element={isSignedIn ? <Problempage/> : <Navigate to='/' />} />
        
      </Routes>
    <Toaster />
    </>
  );
}

export default App
