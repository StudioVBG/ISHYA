-- ─────────────────────────────────────────────────────────────────────────────
-- Field-level guards sur tickets et returns
-- ─────────────────────────────────────────────────────────────────────────────
-- L'audit a flagué que les RLS UPDATE policies pour user (auth.uid() = user_id)
-- couvrent la ligne entière : un client peut donc, via supabase-js direct,
-- modifier ses propres tickets/retours sur des colonnes sensibles
-- (priority, assigned_to, status arbitraire, type/refund_amount sur returns).
--
-- Postgres ne supporte pas le UPDATE policy par colonne. On utilise des
-- triggers BEFORE UPDATE qui rejettent les écritures sur ces colonnes
-- quand l'appelant n'est PAS service_role (le backend admin tourne en
-- service_role et reste libre).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.tickets_user_field_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.priority is distinct from old.priority then
    raise exception 'Cannot modify ticket.priority';
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    raise exception 'Cannot modify ticket.assigned_to';
  end if;
  if new.category is distinct from old.category then
    raise exception 'Cannot modify ticket.category';
  end if;
  if new.order_id is distinct from old.order_id then
    raise exception 'Cannot modify ticket.order_id';
  end if;
  if new.resolved_at is distinct from old.resolved_at then
    raise exception 'Cannot modify ticket.resolved_at';
  end if;
  if new.closed_at is distinct from old.closed_at then
    raise exception 'Cannot modify ticket.closed_at';
  end if;
  -- Le client peut faire passer son ticket vers "waiting_internal" quand il
  -- répond. Tout autre transition est réservée à l'admin.
  if new.status is distinct from old.status
     and new.status::text not in ('waiting_internal') then
    raise exception 'Cannot set ticket.status to %', new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists tickets_user_field_guard on public.tickets;
create trigger tickets_user_field_guard
before update on public.tickets
for each row execute function public.tickets_user_field_guard();

create or replace function public.returns_user_field_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.status is distinct from old.status then
    raise exception 'Cannot modify return.status';
  end if;
  if new.refund_amount is distinct from old.refund_amount then
    raise exception 'Cannot modify return.refund_amount';
  end if;
  if new.refund_method is distinct from old.refund_method then
    raise exception 'Cannot modify return.refund_method';
  end if;
  if new.tracking_number is distinct from old.tracking_number then
    raise exception 'Cannot modify return.tracking_number';
  end if;
  if new.approved_at is distinct from old.approved_at then
    raise exception 'Cannot modify return.approved_at';
  end if;
  if new.received_at is distinct from old.received_at then
    raise exception 'Cannot modify return.received_at';
  end if;
  if new.refunded_at is distinct from old.refunded_at then
    raise exception 'Cannot modify return.refunded_at';
  end if;

  return new;
end;
$$;

drop trigger if exists returns_user_field_guard on public.returns;
create trigger returns_user_field_guard
before update on public.returns
for each row execute function public.returns_user_field_guard();
