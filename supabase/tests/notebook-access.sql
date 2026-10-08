-- Run on the dedicated project as an administrator. All fixtures roll back.
-- This checks database authorization, not email delivery or browser sync.
begin;
insert into auth.users(id) values
 ('00000000-0000-4000-a000-000000000001'),
 ('00000000-0000-4000-a000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000001',true);
select revision from public.save_learning_notebook(
 '00000000-0000-4000-a000-000000000001',0,
 '{"version":1,"lessons":{},"topics":{},"verified":{}}');
do $$ begin
 begin
  perform public.save_learning_notebook('00000000-0000-4000-a000-000000000001',0,
   '{"version":1,"lessons":{},"topics":{},"verified":{}}');
  raise exception 'Stale write accepted';
 exception when sqlstate '40001' then null; end;
 begin
  perform public.save_learning_notebook('00000000-0000-4000-a000-000000000002',0,
   '{"version":1,"lessons":{},"topics":{},"verified":{}}');
  raise exception 'Wrong-owner write accepted';
 exception when sqlstate '42501' then null; end;
 begin
  perform public.save_learning_notebook('00000000-0000-4000-a000-000000000001',1,'{}');
  raise exception 'Malformed snapshot accepted';
 exception when check_violation then null; end;
 begin
  perform public.save_learning_notebook('00000000-0000-4000-a000-000000000001',1,
   jsonb_build_object('version',1,'lessons',jsonb_build_object('D001',repeat('x',2000001)),
    'topics','{}'::jsonb,'verified','{}'::jsonb));
  raise exception 'Oversized snapshot accepted';
 exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000002',true);
do $$ begin
 if exists(select 1 from public.learning_notebooks) then
  raise exception 'Another account can read the notebook';
 end if;
 if has_table_privilege('anon','public.learning_notebooks','SELECT')
 or has_table_privilege('authenticated','public.learning_notebooks','UPDATE')
 or has_function_privilege('anon','public.save_learning_notebook(uuid,bigint,jsonb)','EXECUTE') then
  raise exception 'Unexpected direct or anonymous privileges';
 end if;
end $$;
rollback;
