import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Layout } from './components/Layout/Layout';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
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
import { NotFound } from './pages/NotFound/NotFound';

/** Estados globales: notificaciones, confirmación antes de eliminar y sesión. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>{children}</AuthProvider>
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

        <Route path="admin/menu" element={<RequireAuth personal><AdminMenu /></RequireAuth>} />
        <Route path="admin/reservas" element={<RequireAuth personal><AdminReservations /></RequireAuth>} />
        <Route path="admin/pedidos" element={<RequireAuth personal><AdminOrders /></RequireAuth>} />

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
