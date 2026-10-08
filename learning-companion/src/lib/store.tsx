import React, {createContext,useContext,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {allTopicIds,lessons,modules} from './content';
import {initialState,parseBackup} from './planner';
import {readStored,writeStored} from './storage';
import {reconcileReminders} from './notifications';
import {supabase} from './supabase';
import {progressOnly,syncDecision} from './sync-policy';
import type {LearningState} from './types';
type Status='local'|'syncing'|'synced'|'pending'|'conflict';
type Store={state:LearningState;loaded:boolean;error:string;notice:string;syncStatus:Status;update:(fn:(s:LearningState)=>LearningState)=>Promise<boolean>;importBackup:(text:string)=>Promise<boolean>;importGuest:()=>Promise<boolean>;syncNow:()=>Promise<void>;resolveConflict:(choice:'local'|'cloud')=>Promise<void>;dismiss:()=>void};
const Context=createContext<Store|null>(null);
export function LearningProvider({children,scope='guest'}:{children:React.ReactNode;scope?:string}){
 const [state,setState]=useState(initialState),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[syncStatus,setSyncStatus]=useState<Status>('local');
 const latest=useRef(state),revision=useRef(0),dirty=useRef(false),writable=useRef(true),active=useRef(true),queue=useRef(Promise.resolve()),syncQueued=useRef(false),notifyQueue=useRef(Promise.resolve());
 const signedIn=scope!=='guest';
 const lastSchedule=useRef('');
 const parse=(value:unknown)=>parseBackup(JSON.stringify(value),lessons.map(l=>l.id),allTopicIds,modules.map(m=>m.id));
 const persist=async(next:LearningState,rev=revision.current,pending=dirty.current)=>{
  await writeStored(JSON.stringify(signedIn?{format:2,state:next,revision:rev,dirty:pending}:next),scope);
  latest.current=next;revision.current=rev;dirty.current=pending;if(active.current)setState(next);
 };
 const schedule=(next:LearningState,force=false)=>{const key=JSON.stringify([next.settings,lessons.filter(l=>next.lessons[l.id]?.completedAt).map(l=>l.id)]);if(!force&&key===lastSchedule.current)return;lastSchedule.current=key;notifyQueue.current=notifyQueue.current.then(async()=>{if(!active.current)return;try{await reconcileReminders(next);}catch{if(active.current)setNotice('Progress saved. Check notification permissions on this device.');}});};
 const enqueue=<T,>(fn:()=>Promise<T>):Promise<T>=>{const operation=queue.current.then(fn);queue.current=operation.then(()=>{},()=>{});return operation;};
 const sync=async(choice?:'local'|'cloud')=>{
  if(!signedIn||!supabase||!writable.current||!active.current)return;
  setSyncStatus('syncing');
  try{
   const {data:remote,error:readError}=await supabase.from('learning_notebooks').select('revision,payload').eq('user_id',scope).maybeSingle();
   if(readError)throw readError;
   if(!active.current)return;
   const remoteRevision=remote?.revision??0;
   const cloud=parse({...remote?.payload??progressOnly(initialState()),settings:latest.current.settings});
   cloud.settings=latest.current.settings;
   const decision=syncDecision(dirty.current,revision.current,remoteRevision);
   if(decision==='conflict'&&!choice){setSyncStatus('conflict');return;}
   if(choice){
    // Keep both versions locally before an explicit replacement.
    await writeStored(JSON.stringify({local:latest.current,cloud,revision:remoteRevision}),`${scope}:conflict:${Date.now()}`);
   }
   if(choice==='cloud'||(!choice&&decision==='pull')){
    await persist(cloud,remoteRevision,false);schedule(cloud);
   }else{
    const {data:saved,error:saveError}=await supabase.rpc('save_learning_notebook',{p_user_id:scope,p_revision:choice==='local'?remoteRevision:revision.current,p_payload:progressOnly(latest.current)}).single<{revision:number}>();
    if(saveError){if(saveError.code==='40001'){setSyncStatus('conflict');return;}throw saveError;}
    if(!active.current)return;
    await persist(latest.current,saved!.revision,false);
   }
   setSyncStatus('synced');
  }catch{if(active.current)setSyncStatus('pending');}
 };
 const syncNow=()=>{if(syncQueued.current)return queue.current;syncQueued.current=true;return enqueue(()=>sync()).finally(()=>{syncQueued.current=false;});};
 useEffect(()=>{
  active.current=true;
  void enqueue(async()=>{
   try{
    const raw=await readStored(scope);
    if(raw){const stored=JSON.parse(raw),value=signedIn?stored.state:stored;
     const restored=parse(value);restored.settings.reminders=value.settings.reminders;
     if(signedIn&&(stored.format!==2||!Number.isSafeInteger(stored.revision)||stored.revision<0||typeof stored.dirty!=='boolean'))throw new Error('Invalid notebook metadata');
     latest.current=restored;revision.current=signedIn?stored.revision:0;dirty.current=signedIn?stored.dirty:false;if(active.current)setState(restored);
    }
    schedule(latest.current);
   }catch{writable.current=false;if(active.current)setError('Could not load saved data. Existing data is preserved; import a valid backup to recover.');}
   finally{if(active.current)setLoaded(true);}
  }).then(()=>syncNow());
  const listener=AppState.addEventListener('change',s=>{if(s==='active'){void syncNow();schedule(latest.current,true);}});
  const interval=setInterval(()=>{void syncNow();},30000);
  return()=>{active.current=false;listener.remove();clearInterval(interval);};
  // This provider is keyed by account ID: each mount owns one immutable scope.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[scope]);
 const update:Store['update']=async fn=>{
  const ok=await enqueue(async()=>{
   if(!active.current)return false;
   if(!writable.current){setError('Import a valid backup before saving.');return false;}
   try{const next=fn(latest.current);const changed=JSON.stringify(progressOnly(next))!==JSON.stringify(progressOnly(latest.current));await persist(next,revision.current,dirty.current||(signedIn&&changed));schedule(next);return true;}catch{setError('Your change could not be saved.');return false;}
  });
  if(ok)void syncNow();return ok;
 };
 const importBackup:Store['importBackup']=text=>enqueue(async()=>{
  try{
   const next=parseBackup(text,lessons.map(l=>l.id),allTopicIds,modules.map(m=>m.id));
   for(const l of lessons)if(next.lessons[l.id]?.completedAt&&!l.prerequisites.every(id=>next.lessons[id]?.completedAt))throw new Error('Missing lesson prerequisites');
   for(const m of modules)if(next.verified[m.id]&&(!m.prerequisites.every(id=>next.verified[id])||!allTopicIds.filter(id=>id.startsWith(`${m.id}.`)).every(id=>next.topics[id])))throw new Error('Missing module prerequisites');
   await persist(next,revision.current,signedIn);writable.current=true;setError('');setNotice('Notebook imported. Reminders are off on this device.');schedule(next);await sync();return true;
  }catch(e){setError(`Import failed: ${String(e)}`);return false;}
 });
 const importGuest=async()=>{const raw=await readStored();if(!raw){setNotice('There is no guest notebook on this device.');return false;}return importBackup(raw);};
 return <Context.Provider value={{state,loaded,error,notice,syncStatus,update,importBackup,importGuest,syncNow,resolveConflict:choice=>enqueue(()=>sync(choice)),dismiss:()=>{setError('');setNotice('');}}}>{children}</Context.Provider>;
}
export function useLearning(){const store=useContext(Context);if(!store)throw new Error('LearningProvider missing');return store;}
