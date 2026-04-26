import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0055A2',
          colorLink: '#0055A2',
          borderRadius: 8,
        },
        components: {
          Menu: {
            itemColor: '#333',
            itemSelectedColor: '#0055A2',
            itemHoverColor: '#0055A2',
          },
          Button: {
            colorPrimary: '#E6A100',
          },
        },
      }}
    >
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
