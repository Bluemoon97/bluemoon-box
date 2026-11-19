/* Family API never imports a family member's personal product/history master. */
(function(global){
 'use strict';
 const KEY='cocartly-family-cache',S=()=>CocartlyOwnerStorage;
 const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
 function device(){return S().getItem('cocartly-premium-device');}
 async function call(name,args={}){
  const token=S().snapshot();if(!S().getOwner()?.startsWith('user:')||!navigator.onLine)throw Error('SIGN_IN_ONLINE_REQUIRED');
  let timer;try{const result=await Promise.race([getCocartlySupabase().rpc(name,args),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('FAMILY_TIMEOUT')),8000);})]);
   if(!S().isCurrent(token))throw Error('OWNER_CHANGED');if(result.error)throw result.error;return result.data;
  }finally{clearTimeout(timer);}
 }
 function cached(){try{const cache=JSON.parse(S().getItem(KEY)||'null');return CocartlyPremiumCore.validateFamilyCache(cache,S().getOwner());}catch(_){return null;}}
 async function refresh(){const token=S().snapshot(),family=await call('cocartly_family_snapshot',{p_device_token:device()}),value={version:1,owner:S().getOwner(),savedAt:new Date().toISOString(),family};
  CocartlyPremiumCore.validateFamilyCache(value,S().getOwner());S().applyBatch({[KEY]:JSON.stringify(value)},token);return value;
 }
 async function receive(alias){const token=code();await call('cocartly_family_receive_code',{p_code:token,p_alias:alias});return token;}
 async function invite(receiveCode){const token=code();await call('cocartly_family_invite',{p_device_token:device(),p_receive_code:receiveCode,p_invite_code:token});return token;}
 async function accept(inviteCode,alias){await call('cocartly_family_accept',{p_invite_code:inviteCode,p_alias:alias});await CocartlyPremium.refresh();}
 async function preview(inviteCode){return call('cocartly_family_preview_invite',{p_invite_code:inviteCode});}
 async function setAlias(alias){return call('cocartly_family_set_alias',{p_alias:alias});}
 async function share(id,body){CocartlyPremiumCore.validateSharedBody(body);return call('cocartly_family_share',{p_device_token:device(),p_item_id:id,p_body:body});}
 async function update(item,patch){return call('cocartly_family_update',{p_device_token:device(),p_item_id:item.id,p_expected_version:item.version,p_patch:patch});}
 async function leave(){await call('cocartly_family_leave');await CocartlyPremium.refresh();}
 async function remove(member){await call('cocartly_family_remove',{p_device_token:device(),p_member:member});}
 async function revoke(inviteCode){await call('cocartly_family_revoke',{p_device_token:device(),p_invite_code:inviteCode});}
 global.CocartlyFamily=Object.freeze({cached,refresh,receive,invite,preview,setAlias,accept,share,update,leave,remove,revoke});
})(window);
