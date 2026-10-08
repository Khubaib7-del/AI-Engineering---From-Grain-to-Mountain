create or replace function public.save_learning_notebook(p_user_id uuid, p_revision bigint, p_payload jsonb)
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
  raise exception 'Notebook changed on another device' using errcode='PT409';
 end if;
 return query update public.learning_notebooks set payload=p_payload, revision=current_revision+1, updated_at=now()
 where user_id=p_user_id returning *;
end;
$$;
revoke all on function public.save_learning_notebook(uuid,bigint,jsonb) from public, anon;
grant execute on function public.save_learning_notebook(uuid,bigint,jsonb) to authenticated;

