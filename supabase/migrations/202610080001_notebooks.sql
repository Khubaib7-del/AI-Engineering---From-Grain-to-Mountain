create table public.learning_notebooks (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check (revision >= 0),
 payload jsonb not null,
 updated_at timestamptz not null default now(),
 constraint payload_size check (octet_length(payload::text) <= 2000000),
 constraint payload_shape check (
  jsonb_typeof(payload) = 'object' and payload ?& array['version','lessons','topics','verified'] and payload->'version' = '1'::jsonb
  and jsonb_typeof(payload->'lessons') = 'object'
  and jsonb_typeof(payload->'topics') = 'object'
  and jsonb_typeof(payload->'verified') = 'object'
  and not (payload ? 'settings')
 )
);
alter table public.learning_notebooks enable row level security;
revoke all on public.learning_notebooks from anon, authenticated;
grant select on public.learning_notebooks to authenticated;
create policy own_notebook on public.learning_notebooks for select to authenticated using ((select auth.uid()) = user_id);

-- Serialize changes and reject stale writes. No client can choose another owner.
create function public.save_learning_notebook(p_user_id uuid, p_revision bigint, p_payload jsonb)
returns setof public.learning_notebooks
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint;
begin
 if auth.uid() is null or auth.uid() <> p_user_id then
  raise exception 'Authentication mismatch' using errcode='42501';
 end if;
 insert into public.learning_notebooks(user_id, revision, payload)
 values(p_user_id, 0, '{"version":1,"lessons":{},"topics":{},"verified":{}}')
 on conflict (user_id) do nothing;
 select revision into current_revision from public.learning_notebooks where user_id=p_user_id for update;
 if current_revision <> p_revision then
  raise exception 'Notebook changed on another device' using errcode='40001';
 end if;
 return query update public.learning_notebooks set payload=p_payload, revision=current_revision+1, updated_at=now()
 where user_id=p_user_id returning *;
end;
$$;
revoke all on function public.save_learning_notebook(uuid,bigint,jsonb) from public, anon;
grant execute on function public.save_learning_notebook(uuid,bigint,jsonb) to authenticated;
