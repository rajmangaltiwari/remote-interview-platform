import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import { Toaster} from 'react-hot-toast'

import Homepage from './pages/Homepage'
import Problempage from './pages/Problempage'
import Dashboard from './pages/Dashboard'

function App() {

  const { isSignedIn,isLoaded } = useUser()

  if(!isLoaded) return null;
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/dashboard' element={isSignedIn ? <Dashboard /> : <Navigate to='/' />} />
        <Route path='/problems' element={isSignedIn ? <Problempage /> : <Navigate to='/' />} />
      </Routes>
    <Toaster />
    </>
  );
}

export default App
