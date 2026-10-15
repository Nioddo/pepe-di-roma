import { useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mensajeDeError } from '../../services/api';
import { esPersonal } from '../../utils/sesion';
import { hayErrores, validarDni, validarEmail, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { AuthLayout } from '../../components/AuthLayout/AuthLayout';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { TextField } from '../../components/Field/Field';
import { Notice } from '../../components/Notice/Notice';
import { Button } from '../../components/Button/Button';
import type { DestinoLogin } from '../../components/RequireAuth/RequireAuth';
import foto from '../../assets/platos/pepediroma_09_gnocchi_funghi.jpg';

type Campo = 'email' | 'dni';

export function Login() {
  const { ingresar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const destino = useLocation().state as DestinoLogin | null;
  const formRef = useRef<HTMLFormElement>(null);

  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);

  const limpiar = (campo: Campo) => setErrores((e) => ({ ...e, [campo]: '' }));

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const nuevos = { email: validarEmail(email), dni: validarDni(dni) };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(formRef.current);
      return;
    }

    setEnviando(true);
    try {
      const usuario = await ingresar(email, dni);
      toast.success(`Hola de nuevo. Entraste como ${usuario.email}.`);
      navigate(destino?.desde ?? (esPersonal(usuario) ? '/admin/pedidos' : '/'), { replace: true });
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout foto={foto} fotoAlt="Gnocchi con hongos y costilla en plato blanco">
      <PageHeader inline title="Ingresar" lead="Entrá con tu email y tu DNI." />

      {destino?.aviso && <Notice>{destino.aviso}</Notice>}

      <form ref={formRef} onSubmit={enviar} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={errores.email}
          onChange={(e) => {
            setEmail(e.target.value);
            limpiar('email');
          }}
        />
        <TextField
          label="DNI"
          inputMode="numeric"
          autoComplete="off"
          hint="Sin puntos."
          value={dni}
          error={errores.dni}
          onChange={(e) => {
            setDni(e.target.value);
            limpiar('dni');
          }}
        />
        <Button type="submit" block loading={enviando}>
          Ingresar
        </Button>
      </form>

      <p className="auth__alt">
        ¿No tenés cuenta?{' '}
        <Link to="/registrarse" state={destino}>
          Registrate
        </Link>
      </p>

      <div className="auth__demo">
        Cuentas de prueba: <b>cliente@pepediroma.com.ar</b> con DNI <b>38123456</b> entra como cliente, y{' '}
        <b>admin@pepediroma.com.ar</b> con DNI <b>30111222</b> como administrador.
      </div>
    </AuthLayout>
  );
}
