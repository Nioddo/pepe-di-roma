import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from '../../services/usuariosService';
import { mensajeDeError } from '../../services/api';
import { hayErrores, validarDni, validarEmail, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { Editor } from '../../components/Editor/Editor';
import { SelectField, TextField } from '../../components/Field/Field';
import { Badge, type BadgeTono } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Rol, Usuario } from '../../types';

type Campo = 'email' | 'dni';

const ROLES: { value: Rol; label: string; tono: BadgeTono }[] = [
  { value: 'CLIENTE', label: 'Cliente', tono: 'off' },
  { value: 'EMPLEADO', label: 'Empleado', tono: 'info' },
  { value: 'ADMIN', label: 'Administrador', tono: 'brand' }
];
const rolDe = (rol: Rol) => ROLES.find((r) => r.value === rol) ?? ROLES[0];

interface FormUsuarioProps {
  titulo: string;
  inicial: { email: string; dni: string; rol: Rol };
  textoGuardar: string;
  onGuardar: (datos: { email: string; dni: string; rol: Rol }) => Promise<void>;
  onCerrar: () => void;
  /** Cuando el admin se edita a sí mismo no puede quitarse el rol. */
  bloquearRol?: boolean;
}

function FormUsuario({ titulo, inicial, textoGuardar, onGuardar, onCerrar, bloquearRol = false }: FormUsuarioProps) {
  const [email, setEmail] = useState(inicial.email);
  const [dni, setDni] = useState(inicial.dni);
  const [rol, setRol] = useState<Rol>(inicial.rol);
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [guardando, setGuardando] = useState(false);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos = { email: validarEmail(email), dni: validarDni(dni) };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({ email: email.trim(), dni: dni.trim(), rol });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Editor titulo={titulo} onSubmit={enviar} onCancelar={onCerrar} guardando={guardando} textoGuardar={textoGuardar}>
      <TextField
        label="Email"
        type="email"
        autoComplete="off"
        value={email}
        error={errores.email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrores((er) => ({ ...er, email: '' }));
        }}
      />
      <TextField
        label="DNI"
        inputMode="numeric"
        hint="7 u 8 números, sin puntos. Es la clave para ingresar."
        value={dni}
        error={errores.dni}
        onChange={(e) => {
          setDni(e.target.value);
          setErrores((er) => ({ ...er, dni: '' }));
        }}
      />
      <SelectField
        label="Rol"
        hint={bloquearRol ? 'No podés quitarte el rol de administrador a vos mismo.' : undefined}
        disabled={bloquearRol}
        options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
        value={rol}
        onChange={(e) => setRol(e.target.value as Rol)}
      />
    </Editor>
  );
}

/** Cuentas del sitio: clientes, empleados y administradores. */
export function AdminUsers() {
  const { usuario: yo } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(getUsuarios);
  const [editando, setEditando] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);
  const [borrando, setBorrando] = useState<number | null>(null);
  const botonNuevo = useRef<HTMLButtonElement>(null);

  const usuarios = (data ?? []).slice().sort((a, b) => a.id - b.id);

  const eliminar = async (u: Usuario) => {
    const ok = await confirmar({
      titulo: '¿Eliminar la cuenta?',
      texto: `¿Seguro que querés eliminar la cuenta de ${u.email}? No va a poder ingresar más. Si tiene reservas, pedidos u opiniones, primero hay que borrarlos.`
    });
    if (!ok) return;
    setBorrando(u.id);
    try {
      await deleteUsuario(u.id);
      toast.success(`Eliminaste la cuenta de ${u.email}.`);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setBorrando(null);
    }
  };

  const columnas: Columna<Usuario>[] = [
    {
      clave: 'email',
      titulo: 'Email',
      render: (u) => (
        <>
          <strong>{u.email}</strong>
          {u.id === yo?.id && <span className="cell-note">Tu cuenta</span>}
        </>
      )
    },
    { clave: 'dni', titulo: 'DNI', numerica: true, render: (u) => u.dni },
    { clave: 'rol', titulo: 'Rol', render: (u) => <Badge tono={rolDe(u.rol).tono}>{rolDe(u.rol).label}</Badge> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      tituloOculto: true,
      render: (u) => (
        <RowActions>
          <Button variant="secondary" size="sm" aria-expanded={editando === u.id} onClick={() => setEditando(editando === u.id ? null : u.id)}>
            Editar
          </Button>
          <Button variant="danger-quiet" size="sm" disabled={u.id === yo?.id} loading={borrando === u.id} onClick={() => eliminar(u)}>
            Eliminar
          </Button>
        </RowActions>
      )
    }
  ];

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={3} height={62} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar las cuentas" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    contenido = (
      <>
        {creando && (
          <div className="admin-usuarios__alta">
            <FormUsuario
              titulo="Nueva cuenta"
              textoGuardar="Crear cuenta"
              inicial={{ email: '', dni: '', rol: 'EMPLEADO' }}
              onCerrar={() => {
                setCreando(false);
                botonNuevo.current?.focus();
              }}
              onGuardar={async (datos) => {
                try {
                  await createUsuario(datos);
                  toast.success(`Creaste la cuenta de ${datos.email}.`);
                  setCreando(false);
                  recargar();
                } catch (err) {
                  toast.error(mensajeDeError(err));
                }
              }}
            />
          </div>
        )}
        <DataTable
          columnas={columnas}
          filas={usuarios}
          getKey={(u) => u.id}
          minWidth={720}
          caption="Todas las cuentas. El DNI funciona como clave para ingresar."
          detalle={(u) =>
            editando === u.id && (
              <FormUsuario
                titulo={`Editar ${u.email}`}
                textoGuardar="Guardar cambios"
                inicial={u}
                bloquearRol={u.id === yo?.id}
                onCerrar={() => setEditando(null)}
                onGuardar={async (datos) => {
                  try {
                    await updateUsuario(u.id, datos);
                    toast.success(`Guardaste la cuenta de ${datos.email}.`);
                    setEditando(null);
                    recargar();
                  } catch (err) {
                    toast.error(mensajeDeError(err));
                  }
                }}
              />
            )
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        lead="Las cuentas de clientes, empleados y administradores. Podés crear, corregir datos, cambiar roles o eliminar."
        compact
        actions={
          <Button ref={botonNuevo} onClick={() => setCreando(true)} disabled={creando}>
            Nueva cuenta
          </Button>
        }
      />
      <div className="wrap page">{contenido}</div>
    </>
  );
}
