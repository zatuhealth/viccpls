create table public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'parent',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);
create table public.household_invites (
  code text primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null,
  used_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.households to authenticated;
grant select, insert, update, delete on public.household_members to authenticated;
grant select, insert, update, delete on public.household_invites to authenticated;
grant all on public.households, public.household_members, public.household_invites to service_role;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;

create or replace function public.is_household_member(_hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.household_members where household_id = _hid and user_id = auth.uid())
$$;

create policy "members read household" on public.households for select to authenticated using (public.is_household_member(id));
create policy "members update household" on public.households for update to authenticated using (public.is_household_member(id)) with check (public.is_household_member(id));
create policy "members see co-members" on public.household_members for select to authenticated using (public.is_household_member(household_id));
create policy "members read invites" on public.household_invites for select to authenticated using (public.is_household_member(household_id));
create policy "members create invites" on public.household_invites for insert to authenticated with check (public.is_household_member(household_id) and created_by = auth.uid());

create or replace function public.my_household()
returns uuid language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select household_id into hid from public.household_members where user_id = auth.uid() order by created_at limit 1;
  if hid is null then
    insert into public.households(owner_id) values (auth.uid()) returning id into hid;
    insert into public.household_members(household_id, user_id, role) values (hid, auth.uid(), 'owner');
  end if;
  return hid;
end $$;

create or replace function public.accept_invite(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select household_id into hid from public.household_invites where code = upper(_code) and used_by is null;
  if hid is null then raise exception 'Invite code not valid or already used'; end if;
  update public.household_invites set used_by = auth.uid() where code = upper(_code);
  delete from public.household_members where user_id = auth.uid() and household_id <> hid
    and household_id in (select id from public.households h where not exists (select 1 from public.household_members m where m.household_id = h.id and m.user_id <> auth.uid()));
  insert into public.household_members(household_id, user_id, role) values (hid, auth.uid(), 'parent') on conflict do nothing;
  return hid;
end $$;
revoke execute on function public.my_household(), public.accept_invite(text) from anon;
grant execute on function public.my_household(), public.accept_invite(text), public.is_household_member(uuid) to authenticated;
alter publication supabase_realtime add table public.households;