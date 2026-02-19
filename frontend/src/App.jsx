import { useState } from 'react'
import CameraView from './components/CameraView'
import './App.css'

function App() {
  return (
    <>
      <h1>Face Recognition Dashboard</h1>
      <div className="card">
        <CameraView />
      </div>
    </>
  )
}

export default App
