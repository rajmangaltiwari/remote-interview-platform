import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Homepage = () => {
    return (
        <div>
            <h1 className='p-10 text-2xl bg-blue-500 rounded w-fit '>welcom to my page</h1>
            <SignedOut>
                <SignInButton mode='modal' />
            </SignedOut>

            <SignedIn>
                <SignOutButton />
                <UserButton />
            </SignedIn>

            
            <button className='btn btn-secondary'onClick={()=> toast.success("this is success")}>click me</button>
        </div>
    )
}

export default Homepage