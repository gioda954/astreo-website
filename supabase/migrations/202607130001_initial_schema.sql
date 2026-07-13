create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'collaboratore');
create type public.fulfillment_type as enum ('spedizione', 'ritiro');
create type public.contact_status as enum ('da_contattare', 'contattato', 'confermato');
create type public.payment_status as enum ('non_pagato', 'parziale', 'pagato');
create type public.delivery_status as enum ('da_programmare', 'programmata', 'consegnata');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  presentation text,
  role public.user_role not null default 'collaboratore',
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vintage text not null,
  description text not null,
  case_price_cents integer not null check (case_price_cents > 0),
  shipping_price_cents integer not null default 0 check (shipping_price_cents >= 0),
  bottles_per_case integer not null default 6 check (bottles_per_case > 0),
  delivery_note text not null default '',
  charity_note text not null default '',
  goal_bottles integer not null default 1000 check (goal_bottles >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index campaigns_single_active_idx on public.campaigns (is_active) where is_active;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  receipt_token uuid not null unique default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null,
  fulfillment_type public.fulfillment_type not null,
  shipping_address text,
  cases_quantity integer not null check (cases_quantity between 1 and 100),
  bottles_quantity integer not null check (bottles_quantity > 0),
  notes text,
  product_name text not null,
  vintage text not null,
  bottles_per_case integer not null check (bottles_per_case > 0),
  case_price_cents integer not null check (case_price_cents > 0),
  shipping_price_cents integer not null default 0 check (shipping_price_cents >= 0),
  expected_total_cents integer not null check (expected_total_cents >= 0),
  collected_total_cents integer not null default 0 check (collected_total_cents >= 0),
  contact_status public.contact_status not null default 'da_contattare',
  payment_status public.payment_status not null default 'non_pagato',
  delivery_status public.delivery_status not null default 'da_programmare',
  assignee_id uuid references public.profiles(id),
  privacy_accepted_at timestamptz not null,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipping_requires_address check (fulfillment_type <> 'spedizione' or char_length(coalesce(shipping_address, '')) >= 8),
  constraint cancellation_has_reason check (cancelled_at is null or char_length(coalesce(cancellation_reason, '')) >= 3)
);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_campaign_idx on public.orders(campaign_id);
create index orders_status_idx on public.orders(contact_status, payment_status, delivery_status);
create index orders_assignee_idx on public.orders(assignee_id);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  body text not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value text not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_order_idx on public.activity_log(order_id, created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and not disabled)
$$;
create or replace function public.is_active_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and not disabled)
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger campaigns_touch before update on public.campaigns for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce((new.raw_user_meta_data->>'role')::public.user_role,'collaboratore'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.audit_order_change() returns trigger language plpgsql security definer set search_path = public as $$
declare changed jsonb := '{}'::jsonb;
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log(order_id,actor_id,action,details) values(new.id,auth.uid(),'ordine_creato',jsonb_build_object('code',new.code));
  else
    if old.assignee_id is distinct from new.assignee_id then changed := changed || jsonb_build_object('assegnatario',new.assignee_id); end if;
    if old.contact_status is distinct from new.contact_status then changed := changed || jsonb_build_object('contatto',new.contact_status); end if;
    if old.payment_status is distinct from new.payment_status then changed := changed || jsonb_build_object('pagamento',new.payment_status); end if;
    if old.delivery_status is distinct from new.delivery_status then changed := changed || jsonb_build_object('consegna',new.delivery_status); end if;
    if old.collected_total_cents is distinct from new.collected_total_cents then changed := changed || jsonb_build_object('incassato',new.collected_total_cents); end if;
    if old.cancelled_at is distinct from new.cancelled_at then changed := changed || jsonb_build_object('annullato',new.cancelled_at,'motivo',new.cancellation_reason); end if;
    if changed <> '{}'::jsonb then insert into public.activity_log(order_id,actor_id,action,details) values(new.id,auth.uid(),'ordine_aggiornato',changed); end if;
  end if;
  return new;
end $$;
create trigger orders_audit after insert or update on public.orders for each row execute function public.audit_order_change();

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.orders enable row level security;
alter table public.internal_notes enable row level security;
alter table public.message_templates enable row level security;
alter table public.app_settings enable row level security;
alter table public.activity_log enable row level security;

create policy profiles_staff_read on public.profiles for select to authenticated using (public.is_active_staff());
create policy profiles_self_update on public.profiles for update to authenticated using (id=auth.uid() and public.is_active_staff()) with check (id=auth.uid());
create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy campaigns_staff_read on public.campaigns for select to authenticated using (public.is_active_staff());
create policy campaigns_admin_write on public.campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy orders_staff_read on public.orders for select to authenticated using (public.is_active_staff());
create policy orders_staff_update on public.orders for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy notes_staff_read on public.internal_notes for select to authenticated using (public.is_active_staff());
create policy notes_staff_insert on public.internal_notes for insert to authenticated with check (public.is_active_staff() and author_id=auth.uid());
create policy templates_staff_read on public.message_templates for select to authenticated using (public.is_active_staff());
create policy templates_admin_write on public.message_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_staff_read on public.app_settings for select to authenticated using (public.is_active_staff());
create policy settings_admin_write on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy activity_staff_read on public.activity_log for select to authenticated using (public.is_active_staff());
create policy activity_staff_insert on public.activity_log for insert to authenticated with check (public.is_active_staff() and actor_id=auth.uid());

insert into public.campaigns(name,vintage,description,case_price_cents,shipping_price_cents,bottles_per_case,delivery_note,charity_note,goal_bottles,is_active)
values('Astreo — annata 2020','2026','Taglio Bordolese elegante e raffinato, 50% Cabernet Sauvignon e 50% Merlot, affinato due anni in botti di rovere.',9900,2000,6,'Consegna prevista in meno di un mese.','Il 100% dei profitti sarà donato in beneficenza attraverso i progetti indicati.',1000,true);

insert into public.app_settings(key,value) values('bank_details',E'Azienda Agricola Masari - società agricola semplice\nBCC Veneta\nIT98X0880760820000000002872');
insert into public.message_templates(key,name,body) values('ordine_pronto','Ordine pronto',E'Ciao {{nome_cliente}}! Sono {{nome_collaboratore}} {{presentazione_collaboratore}}.\n\nTi contatto perché abbiamo preparato il tuo ordine di vino Astreo e possiamo procedere con pagamento e {{consegna_o_ritiro}}.\n\n{{numero_casse}} {{cassa_o_casse}} = {{totale_casse}}{{testo_spedizione}}, per un totale di {{totale_ordine}}.\n\nLe coordinate:\n\n{{coordinate_bancarie}}\n\nGrazie mille ancora per credere in questo progetto, il vino quest’anno è veramente spettacolare.');
