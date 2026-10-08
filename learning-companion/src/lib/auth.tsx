import React, {createContext, useContext, useEffect, useState} from 'react';
import {AppState} from 'react-native';
import type {Session} from '@supabase/supabase-js';
import {supabase} from './supabase';
const Auth = createContext<{session:Session|null; ready:boolean; recovery:boolean; error:string; finishRecovery:()=>void}>({session:null,ready:false,recovery:false,error:'',finishRecovery:()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}) {
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(!supabase),[recovery,setRecovery]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  if(!supabase)return;
  let active=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{if(active){setSession(next);setReady(true);if(event==='PASSWORD_RECOVERY')setRecovery(true);}});
  void supabase.auth.getSession().then(({data,error:e})=>{if(active){setSession(data.session);if(e)setError(e.message);setReady(true);}}).catch(()=>{if(active){setError('Could not restore your sign-in. Your local notebook is preserved.');setReady(true);}});
  const app=AppState.addEventListener('change',s=>{if(s==='active')supabase?.auth.startAutoRefresh();else supabase?.auth.stopAutoRefresh();});
  return()=>{active=false;subscription.unsubscribe();app.remove();};
 },[]);
 return <Auth.Provider value={{session,ready,recovery,error,finishRecovery:()=>setRecovery(false)}}>{children}</Auth.Provider>;
}
export const useAuth=()=>useContext(Auth);
