import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import Homepage from './pages/Homepage'
import Problempage from './pages/Problempage'
import { Toaster} from 'react-hot-toast'

function App() {

  const { isSignedIn } = useUser()
  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/problems' element={isSignedIn ? <Problempage /> : <Navigate to='/' />} />
      </Routes>
    <Toaster />
    </>
  );
}

export default App
