create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First account created becomes the owner/admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_first_admin
  after insert on auth.users
  for each row execute function public.handle_first_admin();

create table public.jewelry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  category text not null default 'Otros',
  status text not null default 'disponible' check (status in ('disponible','apartada','vendida')),
  images text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.jewelry to anon;
grant select, insert, update, delete on public.jewelry to authenticated;
grant all on public.jewelry to service_role;
alter table public.jewelry enable row level security;

create policy "Public can view unsold jewelry" on public.jewelry for select to anon, authenticated
  using (status <> 'vendida');
create policy "Admins view all jewelry" on public.jewelry for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert jewelry" on public.jewelry for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update jewelry" on public.jewelry for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete jewelry" on public.jewelry for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger jewelry_touch before update on public.jewelry
  for each row execute function public.touch_updated_at();

create index jewelry_created_idx on public.jewelry (created_at desc);