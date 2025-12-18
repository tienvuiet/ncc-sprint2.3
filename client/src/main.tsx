
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { Provider } from 'react-redux'
import { store } from './store/stores'
import { Toaster } from 'sonner'



createRoot(document.getElementById('root')!).render(
     <Provider store={store}>
          <Toaster richColors position="top-right" />
          <RouterProvider router={router} />
     </Provider>


)
