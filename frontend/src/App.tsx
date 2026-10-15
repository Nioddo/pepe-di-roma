import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ContenidoProvider } from './context/ContenidoContext';
import { Layout } from './components/Layout/Layout';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { AdminLayout } from './components/AdminNav/AdminNav';
import { Home } from './pages/Home/Home';
import { Menu } from './pages/Menu/Menu';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Reserve } from './pages/Reserve/Reserve';
import { MyReservations } from './pages/MyReservations/MyReservations';
import { Order } from './pages/Order/Order';
import { MyOrders } from './pages/MyOrders/MyOrders';
import { AdminMenu } from './pages/AdminMenu/AdminMenu';
import { AdminReservations } from './pages/AdminReservations/AdminReservations';
import { AdminOrders } from './pages/AdminOrders/AdminOrders';
import { AdminSalon } from './pages/AdminSalon/AdminSalon';
import { AdminContent } from './pages/AdminContent/AdminContent';
import { AdminReviews } from './pages/AdminReviews/AdminReviews';
import { AdminUsers } from './pages/AdminUsers/AdminUsers';
import { Survey } from './pages/Survey/Survey';
import { AdminHistory } from './pages/AdminHistory/AdminHistory';
import { AdminMetrics } from './pages/AdminMetrics/AdminMetrics';
import { NotFound } from './pages/NotFound/NotFound';

/** Estados globales: notificaciones, confirmación antes de eliminar, sesión y textos del sitio. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <ContenidoProvider>{children}</ContenidoProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

/** Navegación entre pantallas. Las de cliente y las de gestión piden sesión. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="registrarse" element={<Register />} />

        <Route path="reservar" element={<RequireAuth><Reserve /></RequireAuth>} />
        <Route path="reservar/:id" element={<RequireAuth><Reserve /></RequireAuth>} />
        <Route path="mis-reservas" element={<RequireAuth><MyReservations /></RequireAuth>} />
        <Route path="pedido" element={<RequireAuth><Order /></RequireAuth>} />
        <Route path="mis-pedidos" element={<RequireAuth><MyOrders /></RequireAuth>} />
        <Route path="opinar" element={<Survey />} />

        <Route path="admin" element={<RequireAuth personal><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="reservas" element={<AdminReservations />} />
          <Route path="historial" element={<AdminHistory />} />
          <Route path="metricas" element={<AdminMetrics />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="salon" element={<AdminSalon />} />
          <Route path="contenido" element={<AdminContent />} />
          <Route path="opiniones" element={<AdminReviews />} />
          <Route path="usuarios" element={<RequireAuth rol="ADMIN"><AdminUsers /></RequireAuth>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
