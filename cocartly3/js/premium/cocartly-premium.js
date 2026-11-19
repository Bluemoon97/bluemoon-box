/* Entitlement state is owner-bound. Neither a local flag nor a backup grants cloud access. */
(function (global) {
 'use strict';
 const DEVICE='cocartly-premium-device', LEASE='cocartly-premium-lease';
 const KEYS=COCARTLY_PREMIUM_PUBLIC_KEYS;
 let state=null, verified=null, generation=0, client=null, clientKey=null, pending=null;
 const store=()=>global.CocartlyOwnerStorage;
 const uid=()=>getCocartlyCloudUserId();
 const online=()=>navigator.onLine;
 const current=(token)=>store().isCurrent(token);
 function deadline(promise){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=global.setTimeout(()=>reject(Error('PREMIUM_TIMEOUT')),8000);})]).finally(()=>global.clearTimeout(timer));}
 function clear(){generation++;state=null;verified=null;client=null;clientKey=null;pending=null;}
 function snapshot(){return state?Object.freeze({...state}):null;}
 function device(){return store().isReady()?store().getItem(DEVICE):null;}
 function matches(){return !!state&&state.user_id===uid()&&store().getOwner()==='user:'+state.user_id;}
 function canCloud(){return matches()&&online()&&state.premium===true&&state.cloud_gate_enforced===true&&state.checkedAt<=Date.now()&&state.checkedAt+60000>Date.now()&&Date.parse(state.valid_until)>Date.now();}
 function allowed(feature){
  if(['products','purchase','shopping','history','comparison','calculator','settings','backup','restore','guest-transfer','view-premium-data'].includes(feature))return true;
  if(['cloud','family-share'].includes(feature))return canCloud();
  if(!['shopping-sets','outing-edit','outing-sets'].includes(feature))return false;
  if(online()&&!state?.error)return canCloud();
  return !!verified&&CocartlyPremiumCore.decideAccess({feature,userId:uid(),deviceId:device(),online:false,now:Date.now(),lease:verified}).allowed;
 }
 async function readLease(token){
  verified=null;
  try{const saved=JSON.parse(store().getItem(LEASE)||'null');if(!saved)return;
   const result=await CocartlyPremiumCore.verifyLease(saved.token,{keys:KEYS,userId:uid(),deviceId:device(),lastKnownServerTime:saved.serverTime});
   if(current(token))verified=result;
  }catch(_){/* Missing, stale, unverified or broken leases never grant access. */}
 }
 async function refresh(){
  if(pending)return pending;
  const token=store().snapshot(),g=generation,user=uid();
  if(!user||store().getOwner()!=='user:'+user){state=null;verified=null;return null;}
  const task=(async()=>{
   if(!online()){await readLease(token);return snapshot();}
   try{
    const {data,error}=await deadline(getCocartlySupabase().rpc('cocartly_premium_status',{p_device_token:device()}));
    if(error)throw error;
    if(!current(token)||g!==generation)return null;
    if(!data||data.user_id!==user||!['free-only','test-only','premium-enabled'].includes(data.release)||typeof data.premium!=='boolean'||!Number.isFinite(Date.parse(data.server_time)))throw Error('INVALID_PREMIUM_RESPONSE');
    state={...data,checkedAt:Date.now(),error:false};
    if(!data.premium){verified=null;store().removeItem(LEASE);}
    else {
     await readLease(token);
     if(data.release==='premium-enabled'&&data.cloud_gate_enforced===true&&Object.keys(KEYS).length){
      try{
       const result=await deadline(getCocartlySupabase().functions.invoke('premium-lease',{body:{device:device()}}));
       if(!result.error&&current(token)&&g===generation){
        const lease=await CocartlyPremiumCore.verifyLease(result.data?.token,{keys:KEYS,userId:user,deviceId:device(),lastKnownServerTime:result.data?.serverTime});
        if(lease&&current(token)&&g===generation){store().setItem(LEASE,JSON.stringify(result.data));verified=lease;}
       }
      }catch(_){/* A failed lease renewal cannot extend offline access. */}
     }
    }
    return snapshot();
   }catch(_){if(current(token)&&g===generation){state={user_id:user,premium:false,error:true,checkedAt:Date.now()};await readLease(token);}return snapshot();}
   finally{if(current(token)&&g===generation)global.dispatchEvent(new CustomEvent('cocartly-premium-status'));}
  })();pending=task;
  try{return await task;}finally{if(pending===task)pending=null;}
 }
 function dataClient(){
  if(!canCloud())throw Error('PREMIUM_CLOUD_UNAVAILABLE');
  const token=store().snapshot(),user=uid(),dev=device(),key=user+':'+dev;
  if(client&&key===clientKey)return client;
  if(!/^[0-9a-f]{64}$/.test(dev||''))throw Error('DEVICE_REQUIRED');
  client=global.supabase.createClient(COCARTLY_SUPABASE_URL,COCARTLY_SUPABASE_PUBLISHABLE_KEY,{
   accessToken:async()=>{if(!current(token)||uid()!==user||!canCloud())throw Error('OWNER_OR_ENTITLEMENT_CHANGED');return getCocartlyCloudSession()?.access_token||null;},
   global:{headers:{'x-cocartly-device-token':dev}}
  });clientKey=key;return client;
 }
 async function startTrial(){
  const token=store().snapshot();await refresh();if(!current(token))throw Error('OWNER_CHANGED');
  if(!state||!['test-only','premium-enabled'].includes(state.release)||state.error)throw Error('PREMIUM_NOT_RELEASED');
  const {error}=await getCocartlySupabase().rpc('cocartly_premium_start_trial');if(error)throw error;
  if(!current(token))throw Error('OWNER_CHANGED');await refresh();
 }
 async function activateDevice(){
  const token=store().snapshot();await refresh();if(!current(token)||!state?.eligible)throw Error('PREMIUM_REQUIRED');
  const previous=device(),next=previous||Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
  const {error}=await getCocartlySupabase().rpc('cocartly_premium_register_device',{p_new_token:next,p_old_token:previous});if(error)throw error;
  if(!current(token))throw Error('OWNER_CHANGED');store().setItem(DEVICE,next);client=null;clientKey=null;await refresh();
  if(canCloud())await restoreAndMergeCocartlyCloud();
 }
 async function guestTargetEmpty(){
  if(!online())throw Error('ONLINE_REQUIRED');const token=store().snapshot();
  const {data,error}=await getCocartlySupabase().rpc('cocartly_premium_guest_target_empty');
  if(error||!current(token)||data!==true)throw Error('GUEST_TARGET_NOT_EMPTY');return true;
 }
 function requireFeature(feature){if(allowed(feature))return true;global.CocartlyPremiumUI?.open();return false;}
 global.addEventListener('cocartly-auth-owner-changing',clear);
 global.addEventListener('offline',()=>{state=null;client=null;clientKey=null;if(store().isReady())readLease(store().snapshot()).then(()=>global.dispatchEvent(new CustomEvent('cocartly-premium-status')));});
 async function reconnect(){if(!store().isReady())return;await refresh();if(canCloud()){try{await restoreAndMergeCocartlyCloud();}catch(_){/* existing cloud safety UI handles failure */}}}
 global.addEventListener('online',reconnect);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconnect();});
 global.setInterval(()=>{if(!document.hidden&&store().isReady()&&uid())refresh();},30000);
 global.CocartlyPremium=Object.freeze({refresh,snapshot,canCloud,allowed,requireFeature,dataClient,startTrial,activateDevice,guestTargetEmpty});
})(window);
