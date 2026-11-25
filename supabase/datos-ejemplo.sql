-- AMAC: vacantes de ejemplo para la demo (8 vacantes activas).
--
-- Antes de correrlo:
--   1. Registre una cuenta de EMPRESA desde la aplicacion (/registro-empresa).
--   2. Abra Supabase -> SQL Editor, pegue este archivo y ejecutelo.
--
-- Las vacantes se publican a nombre de la primera empresa registrada.
-- No contiene cuentas, contrasenas ni llaves. Es seguro correrlo una sola vez;
-- si lo corre otra vez se duplican las vacantes.

do $$
declare
  empresa uuid;
begin
  select id into empresa
  from public.perfiles
  where rol = 'empresa'
  order by creado_en
  limit 1;

  if empresa is null then
    raise exception 'Primero registre una cuenta de empresa desde la aplicacion.';
  end if;

  insert into public.vacantes
    (empresa_id, titulo, sueldo, ubicacion, horario, categoria, descripcion, requisitos, prestaciones, telefono_contacto, estado, creada_en)
  values
    (empresa, 'Recepcionista', 9500, 'Centro, Monterrey', 'Matutino', 'Atención al cliente',
     'Recibir a los huéspedes con amabilidad, contestar el teléfono y apoyar con reservaciones.',
     E'Buen trato con las personas\nPuntualidad\nSaber usar teléfono y computadora a nivel básico',
     E'Prestaciones de ley\nVales de despensa\nComida en el trabajo', '8112345678', 'activa', now() - interval '2 days'),

    (empresa, 'Cajero(a)', 8800, 'Santa Catarina', 'Medio tiempo', 'Comercio y ventas',
     'Cobrar en caja, dar el cambio correcto y mantener ordenada el área de cobro.',
     E'Honestidad\nSaber sumar y dar cambio\nGanas de aprender el sistema de caja',
     E'Prestaciones de ley\nDescuento en compras', '8123456789', 'activa', now() - interval '3 days'),

    (empresa, 'Vigilante', 10200, 'San Nicolás de los Garza', 'Vespertino', 'Seguridad y vigilancia',
     'Vigilar la entrada de la residencial, registrar visitas y avisar de cualquier situación.',
     E'Responsabilidad\nBuena condición para estar de pie\nExperiencia previa deseable',
     E'Prestaciones de ley\nUniforme\nAguinaldo', NULL, 'activa', now() - interval '4 days'),

    (empresa, 'Auxiliar administrativo', 9800, 'Monterrey', 'Matutino', 'Administración',
     'Archivar documentos, capturar datos en hojas de cálculo y atender llamadas del despacho.',
     E'Orden y atención al detalle\nManejo básico de computadora\nBuena letra y ortografía',
     E'Prestaciones de ley\nVales de despensa\nCapacitación pagada', '8134567890', 'activa', now() - interval '5 days'),

    (empresa, 'Ayudante de cocina', 8500, 'Guadalupe', 'Fines de semana', 'Cocina y alimentos',
     'Preparar ingredientes, lavar utensilios y apoyar en el servicio de comida corrida.',
     E'Higiene y limpieza\nResistencia para trabajar de pie\nSe aprende en el trabajo',
     E'Comida en el trabajo\nPropinas compartidas', NULL, 'activa', now() - interval '6 days'),

    (empresa, 'Auxiliar de limpieza', 8200, 'San Pedro Garza García', 'Matutino', 'Limpieza y mantenimiento',
     'Mantener limpias las áreas comunes de una plaza comercial y reportar desperfectos.',
     E'Responsabilidad\nCuidado con los materiales de limpieza',
     E'Prestaciones de ley\nUniforme y material incluido', '8145678901', 'activa', now() - interval '8 days'),

    (empresa, 'Asesor de atención telefónica', 9200, 'Monterrey', 'Vespertino', 'Atención al cliente',
     'Atender llamadas de clientes, resolver dudas frecuentes y dar seguimiento a sus solicitudes.',
     E'Voz clara y paciencia\nSaber escuchar\nManejo básico de computadora',
     E'Prestaciones de ley\nCapacitación pagada\nBono de puntualidad', '8156789012', 'activa', now() - interval '9 days'),

    (empresa, 'Mentor para emprendedores', 11000, 'San Pedro Garza García', 'Medio tiempo', 'Otro',
     'Compartir su experiencia con personas que inician un negocio y orientarlas en sus primeros pasos.',
     E'Experiencia dirigiendo o administrando un negocio\nGusto por enseñar',
     E'Pago por sesión\nHorario flexible', NULL, 'activa', now() - interval '10 days');
end;
$$;
