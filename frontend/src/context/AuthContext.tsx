import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createUsuario, loginUsuario } from '../services/usuariosService';
import { guardarSesion, leerSesion } from '../utils/sesion';
import type { Usuario } from '../types';

interface AuthApi {
  usuario: Usuario | null;
  ingresar: (email: string, dni: string) => Promise<Usuario>;
  registrar: (email: string, dni: string) => Promise<Usuario>;
  salir: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => leerSesion());

  const abrirSesion = useCallback((u: Usuario) => {
    setUsuario(u);
    guardarSesion(u);
    return u;
  }, []);

  const ingresar = useCallback(
    async (email: string, dni: string) => {
      return abrirSesion(await loginUsuario(email, dni));
    },
    [abrirSesion]
  );

  const registrar = useCallback(
    async (email: string, dni: string) => {
      const nuevo = await createUsuario({ email: email.trim(), dni: dni.trim(), rol: 'CLIENTE' });
      return abrirSesion(nuevo);
    },
    [abrirSesion]
  );

  const salir = useCallback(() => {
    setUsuario(null);
    guardarSesion(null);
  }, []);

  const api = useMemo(() => ({ usuario, ingresar, registrar, salir }), [usuario, ingresar, registrar, salir]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
