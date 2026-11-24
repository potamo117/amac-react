-- AMAC: esquema inicial para un proyecto Supabase nuevo.

-- Reconstruido desde la configuracion exportada el 24 de noviembre de 2026.

-- No contiene cuentas, datos personales, contrasenas ni llaves.

-- No ejecutar sobre el proyecto actual: sus tablas ya existen.

-- Requiere Supabase Auth y ejecucion como postgres.

begin;

set local search_path = public, pg_catalog;

create table public.perfiles (
  "id" uuid not null,
  "rol" text default 'candidato'::text not null,
  "nombre" text not null,
  "telefono" text,
  "edad" integer,
  "colonia" text,
  "experiencia" text,
  "giro" text,
  "aprobado" boolean default false not null,
  "creado_en" timestamp with time zone default now() not null
);

create table public.vacantes (
  "id" bigint generated ALWAYS as identity not null,
  "empresa_id" uuid not null,
  "titulo" text not null,
  "sueldo" numeric(10,2) not null,
  "ubicacion" text not null,
  "horario" text not null,
  "categoria" text not null,
  "descripcion" text not null,
  "requisitos" text not null,
  "prestaciones" text not null,
  "telefono_contacto" text,
  "estado" text default 'activa'::text not null,
  "creada_en" timestamp with time zone default now() not null
);

create table public.solicitudes (
  "id" bigint generated ALWAYS as identity not null,
  "vacante_id" bigint not null,
  "candidato_id" uuid not null,
  "estatus" text default 'Enviada'::text not null,
  "creada_en" timestamp with time zone default now() not null
);

-- Primero claves primarias y restricciones; despues relaciones.

alter table public.perfiles add constraint "perfiles_edad_check" CHECK (((edad >= 18) AND (edad <= 120)));

alter table public.perfiles add constraint "perfiles_pkey" PRIMARY KEY (id);

alter table public.perfiles add constraint "perfiles_rol_check" CHECK ((rol = ANY (ARRAY['candidato'::text, 'empresa'::text, 'admin'::text])));

alter table public.vacantes add constraint "vacantes_estado_check" CHECK ((estado = ANY (ARRAY['activa'::text, 'pausada'::text, 'cerrada'::text])));

alter table public.vacantes add constraint "vacantes_horario_check" CHECK ((horario = ANY (ARRAY['Matutino'::text, 'Vespertino'::text, 'Medio tiempo'::text, 'Fines de semana'::text])));

alter table public.vacantes add constraint "vacantes_pkey" PRIMARY KEY (id);

alter table public.vacantes add constraint "vacantes_sueldo_check" CHECK ((sueldo > (0)::numeric));

alter table public.solicitudes add constraint "solicitudes_estatus_check" CHECK ((estatus = ANY (ARRAY['Enviada'::text, 'En revisión'::text, 'Aceptada'::text, 'Rechazada'::text, 'Cancelada'::text])));

alter table public.solicitudes add constraint "solicitudes_pkey" PRIMARY KEY (id);

alter table public.solicitudes add constraint "solicitudes_vacante_id_candidato_id_key" UNIQUE (vacante_id, candidato_id);

alter table public.perfiles add constraint "perfiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public.vacantes add constraint "vacantes_empresa_id_fkey" FOREIGN KEY (empresa_id) REFERENCES perfiles(id) ON DELETE CASCADE;

alter table public.solicitudes add constraint "solicitudes_candidato_id_fkey" FOREIGN KEY (candidato_id) REFERENCES perfiles(id) ON DELETE CASCADE;

alter table public.solicitudes add constraint "solicitudes_vacante_id_fkey" FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.crear_perfil()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.perfiles (
    id,
    rol,
    nombre,
    telefono,
    edad,
    colonia,
    experiencia,
    giro
  )
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'rol' = 'empresa'
        then 'empresa'
      else 'candidato'
    end,
    coalesce(new.raw_user_meta_data->>'nombre', 'Sin nombre'),
    new.raw_user_meta_data->>'telefono',
    nullif(new.raw_user_meta_data->>'edad', '')::int,
    new.raw_user_meta_data->>'colonia',
    new.raw_user_meta_data->>'experiencia',
    new.raw_user_meta_data->>'giro'
  );

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.mi_rol()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select rol
  from public.perfiles
  where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.candidato_aprobado()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and rol = 'candidato'
      and aprobado = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.candidato_aplico(vid bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.solicitudes
    where vacante_id = vid
      and candidato_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.empresa_ve_candidato(cid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.solicitudes s
    join public.vacantes v on v.id = s.vacante_id
    where s.candidato_id = cid
      and v.empresa_id = auth.uid()
  );
$function$;

CREATE TRIGGER al_crear_usuario AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION crear_perfil();

alter table public.perfiles enable row level security;

alter table public.vacantes enable row level security;

alter table public.solicitudes enable row level security;

create policy "Cada quien edita su perfil" on public.perfiles as PERMISSIVE for UPDATE to public
  using ((id = auth.uid()))
  with check ((id = auth.uid()));

create policy "Cada quien ve su perfil" on public.perfiles as PERMISSIVE for SELECT to public
  using ((id = auth.uid()));

create policy "La empresa ve a quien aplicó a sus vacantes" on public.perfiles as PERMISSIVE for SELECT to public
  using (empresa_ve_candidato(id));

create policy "Todos ven los perfiles de empresas" on public.perfiles as PERMISSIVE for SELECT to public
  using ((rol = 'empresa'::text));

create policy "Candidato cancela si no está resuelta" on public.solicitudes as PERMISSIVE for UPDATE to public
  using (((candidato_id = auth.uid()) AND (mi_rol() = 'candidato'::text) AND (estatus = ANY (ARRAY['Enviada'::text, 'En revisión'::text]))))
  with check (((candidato_id = auth.uid()) AND (estatus = 'Cancelada'::text)));

create policy "Candidato ve las suyas; empresa ve las de sus vacantes" on public.solicitudes as PERMISSIVE for SELECT to public
  using (((candidato_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM vacantes v
  WHERE ((v.id = solicitudes.vacante_id) AND (v.empresa_id = auth.uid()))))));

create policy "Empresa cambia el estatus" on public.solicitudes as PERMISSIVE for UPDATE to public
  using (((mi_rol() = 'empresa'::text) AND (estatus <> 'Cancelada'::text) AND (EXISTS ( SELECT 1
   FROM vacantes v
  WHERE ((v.id = solicitudes.vacante_id) AND (v.empresa_id = auth.uid()))))))
  with check (((mi_rol() = 'empresa'::text) AND (estatus = ANY (ARRAY['En revisión'::text, 'Aceptada'::text, 'Rechazada'::text])) AND (EXISTS ( SELECT 1
   FROM vacantes v
  WHERE ((v.id = solicitudes.vacante_id) AND (v.empresa_id = auth.uid()))))));

create policy "Solo candidatos aprobados se postulan" on public.solicitudes as PERMISSIVE for INSERT to public
  with check (((candidato_id = auth.uid()) AND (estatus = 'Enviada'::text) AND candidato_aprobado() AND (EXISTS ( SELECT 1
   FROM vacantes v
  WHERE ((v.id = solicitudes.vacante_id) AND (v.estado = 'activa'::text))))));

create policy "El candidato sigue viendo las vacantes a las que aplicó" on public.vacantes as PERMISSIVE for SELECT to public
  using (candidato_aplico(id));

create policy "La empresa edita sus vacantes" on public.vacantes as PERMISSIVE for UPDATE to public
  using (((empresa_id = auth.uid()) AND (mi_rol() = 'empresa'::text)))
  with check (((empresa_id = auth.uid()) AND (mi_rol() = 'empresa'::text)));

create policy "Solo empresas publican, a su nombre" on public.vacantes as PERMISSIVE for INSERT to public
  with check (((empresa_id = auth.uid()) AND (mi_rol() = 'empresa'::text)));

create policy "Ver vacantes activas o las propias" on public.vacantes as PERMISSIVE for SELECT to public
  using (((estado = 'activa'::text) OR (empresa_id = auth.uid())));

-- Limitar privilegios del cliente antes de conceder los necesarios.

revoke all privileges on table public.perfiles from anon, authenticated;

revoke all privileges on table public.vacantes from anon, authenticated;

revoke all privileges on table public.solicitudes from anon, authenticated;

grant SELECT on table public.vacantes to "anon";

grant INSERT on table public.vacantes to "authenticated";

grant SELECT on table public.vacantes to "authenticated";

grant UPDATE on table public.vacantes to "authenticated";

grant SELECT on table public.solicitudes to "authenticated";

grant SELECT on table public.perfiles to "anon";

grant SELECT on table public.perfiles to "authenticated";

grant UPDATE ("colonia", "edad", "experiencia", "giro", "nombre", "telefono") on table public.perfiles to "authenticated";

grant INSERT ("candidato_id", "estatus", "vacante_id") on table public.solicitudes to "authenticated";

grant UPDATE ("estatus") on table public.solicitudes to "authenticated";

-- Permisos de secuencias usados durante la configuracion del proyecto.

grant usage on sequence public.vacantes_id_seq to authenticated;

grant usage on sequence public.solicitudes_id_seq to authenticated;

commit;