import { AuthProvider } from '@/contexts/AuthContext'
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext'
import AppRouter from '@/router'

function App() {
  return (
    <AuthProvider>
      <WebsiteSettingsProvider>
        <AppRouter />
      </WebsiteSettingsProvider>
    </AuthProvider>
  )
}

export default App
