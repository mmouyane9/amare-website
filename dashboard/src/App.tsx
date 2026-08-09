import { Toaster } from 'sonner'

import { AuthProvider } from '@/contexts/AuthContext'
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext'
import AppRouter from '@/router'

function App() {
  return (
    <AuthProvider>
      <WebsiteSettingsProvider>
        <AppRouter />
        <Toaster position="bottom-left" richColors />
      </WebsiteSettingsProvider>
    </AuthProvider>
  )
}

export default App
