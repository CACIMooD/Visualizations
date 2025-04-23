import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'

export function initialize (config) {
  const mainElement = document.getElementById(config.element)
  const root = createRoot(mainElement)

  root.render(
    <React.StrictMode>
      <App config={config} />
    </React.StrictMode>
  )
}
