-- Keep Data API privileges explicit. RLS policies remain the final authorization layer.
grant usage on schema public to authenticated;

grant select on table
  public.profiles,
  public.campaigns,
  public.orders,
  public.internal_notes,
  public.message_templates,
  public.app_settings,
  public.activity_log
to authenticated;

grant update on table public.profiles, public.orders to authenticated;
grant insert on table public.internal_notes, public.activity_log to authenticated;

-- Admin-only writes are granted at the SQL privilege layer, then restricted by is_admin() RLS policies.
grant insert, update, delete on table
  public.profiles,
  public.campaigns,
  public.message_templates,
  public.app_settings
to authenticated;

grant usage, select on sequence public.activity_log_id_seq to authenticated;
