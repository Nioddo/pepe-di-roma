import { useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mensajeDeError } from '../../services/api';
import { hayErrores, validarDni, validarEmail, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { AuthLayout } from '../../components/AuthLayout/AuthLayout';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { TextField } from '../../components/Field/Field';
import { Notice } from '../../components/Notice/Notice';
import { Button } from '../../components/Button/Button';
import type { DestinoLogin } from '../../components/RequireAuth/RequireAuth';
import { useFoto } from '../../hooks/useSitio';

type Campo = 'email' | 'dni';

export function Register() {
  const { registrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const destino = useLocation().state as DestinoLogin | null;
  const formRef = useRef<HTMLFormElement>(null);
  const foto = useFoto('registrarse.foto');

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
      await registrar(email, dni);
      toast.success('Listo, ya tenés tu cuenta. Benvenuto a la famiglia.');
      navigate(destino?.desde ?? '/', { replace: true });
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout foto={foto.src} fotoAlt={foto.alt}>
      <PageHeader inline title="Registrarse" lead="Creá tu cuenta y sumate a la famiglia." />

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
          hint="Sin puntos. Lo vas a usar para ingresar."
          value={dni}
          error={errores.dni}
          onChange={(e) => {
            setDni(e.target.value);
            limpiar('dni');
          }}
        />
        <Button type="submit" block loading={enviando}>
          Crear cuenta
        </Button>
      </form>

      <p className="auth__alt">
        ¿Ya tenés cuenta?{' '}
        <Link to="/ingresar" state={destino}>
          Ingresá
        </Link>
      </p>
    </AuthLayout>
  );
}
