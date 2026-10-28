-- =========================================================
-- BASE DE LA TIENDA
-- Pegalo en el SQL Editor de Supabase y apreta Run.
-- Despues cambia las categorias y los productos por los de tu rubro.
-- =========================================================

-- ===== TABLAS =====
create table categorias (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table productos (
  id           bigint generated always as identity primary key,
  nombre       text not null,
  descripcion  text,
  precio       numeric(10,2) not null check (precio >= 0),
  stock        int not null default 0 check (stock >= 0),
  imagen_url   text,
  categoria_id bigint references categorias(id),
  activo       boolean not null default true
);

-- Los usuarios los maneja Supabase Auth (auth.users).
-- Aca guardamos lo que Auth no guarda: el nombre y el rol.
create table perfiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol    text not null default 'cliente' check (rol in ('cliente', 'admin'))
);

create table pedidos (
  id         bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id),
  total      numeric(10,2) not null check (total >= 0),
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'confirmado', 'cancelado')),
  creado     timestamptz not null default now()
);

create table pedido_items (
  id              bigint generated always as identity primary key,
  pedido_id       bigint not null references pedidos(id) on delete cascade,
  producto_id     bigint not null references productos(id),
  cantidad        int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)  -- la foto del precio
);

-- ===== SEGURIDAD: cerramos las tablas al publico =====
-- Con la clave publica no se puede leer ni escribir nada.
-- Nuestro backend entra igual porque usa la clave secreta.
alter table categorias   enable row level security;
alter table productos    enable row level security;
alter table perfiles     enable row level security;
alter table pedidos      enable row level security;
alter table pedido_items enable row level security;

-- ===== DATOS DE EJEMPLO (vivero) =====
insert into categorias (nombre) values ('Cactus'), ('Frambuesa'), ('Romero'), ('Tulipanes');

insert into productos (nombre, descripcion, precio, stock, categoria_id, imagen_url) values
  ('Cactus 1', 'Cactus para decorar tu espacio.', 5000, 10, (select id from categorias where nombre = 'Cactus'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/captus1.jpeg'),
  ('Cactus 2', 'Otra variedad de cactus.', 6000, 9, (select id from categorias where nombre = 'Cactus'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/captus2.jpeg'),
  ('Frambuesa 1', 'Planta de frambuesa.', 7000, 5, (select id from categorias where nombre = 'Frambuesa'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/frambuesa1.jpeg'),
  ('Frambuesa 2', 'Otra planta de frambuesa.', 7500, 3, (select id from categorias where nombre = 'Frambuesa'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/frambuesa2.jpeg'),
  ('Romero 1', 'Planta aromática de romero.', 4000, 10, (select id from categorias where nombre = 'Romero'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/romero1.jpeg'),
  ('Romero 2', 'Otra planta de romero.', 4500, 10, (select id from categorias where nombre = 'Romero'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/romero2.jpeg'),
  ('Tulipanes 1', 'Planta de tulipanes.', 8000, 2, (select id from categorias where nombre = 'Tulipanes'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/tulipanes1.jpeg'),
  ('Tulipanes 2', 'Otra variedad de tulipanes.', 8500, 1, (select id from categorias where nombre = 'Tulipanes'), 'https://kthsegndrxafctfihdnb.supabase.co/storage/v1/object/public/fotos_plantas/tulipanes2.jpeg');
