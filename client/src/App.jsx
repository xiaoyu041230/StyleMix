import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed' 
import Messages from './pages/Messages' 
import ChatBox from './pages/ChatBox' 
import Connections from './pages/Connections' 
import Discover from './pages/Discover' 
import Profile from './pages/Profile' 
import CreatePost from './pages/CreatePost'  

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Login />}>
          <Route index element={<Feed/>}/>
          <Route Path='messages' element={<Messages/>}/>
          <Route Path='massages/:userID' element={<ChatBox/>}/>
          <Route Path='connections' element={<Connections/>}/>
          <Route Path='discover' element={<Discover/>}/>
          <Route Path='profile' element={<Profile/>}/>
          <Route Path='profile/:profileID' element={<Profile/>}/>
          <Route Path='create-post' element={<CreatePost/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App