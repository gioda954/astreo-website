-- Historical editions can contain bottle-only orders. Public orders still require at least one case
-- through application validation; this relaxed database check is only needed for imported history.
alter table public.orders drop constraint if exists orders_cases_quantity_check;
alter table public.orders
  add constraint orders_cases_quantity_check check (cases_quantity between 0 and 100);

do $$ begin
  create type public.club_status as enum ('non_membro', 'membro');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.club_contacts (
  phone text primary key,
  email text,
  status public.club_status not null default 'non_membro',
  last_contacted_at timestamptz,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists club_contacts_touch on public.club_contacts;
create trigger club_contacts_touch
  before update on public.club_contacts
  for each row execute function public.touch_updated_at();

alter table public.club_contacts enable row level security;

create policy club_contacts_staff_read on public.club_contacts
  for select to authenticated using (public.is_active_staff());
create policy club_contacts_staff_insert on public.club_contacts
  for insert to authenticated
  with check (public.is_active_staff() and updated_by = auth.uid());
create policy club_contacts_staff_update on public.club_contacts
  for update to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff() and updated_by = auth.uid());

grant select, insert, update on table public.club_contacts to authenticated;
