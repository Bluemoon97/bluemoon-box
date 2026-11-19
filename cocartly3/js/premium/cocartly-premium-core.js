/* Generated from tested domain modules. */
(function(global){'use strict';const factories={
"./premium-rules.cjs":function(module,exports,require){
'use strict';
// Domain rules. Server inputs must come from verified auth, billing and database
// state. A caller supplying an object is NOT proof of entitlement.
const HOUR=3600000, DAY=24*HOUR;
const FREE_FEATURES=new Set(['products','purchase','shopping','history','comparison','calculator','settings','backup','restore','guest-transfer','view-premium-data']);
const LOCAL_PREMIUM=new Set(['shopping-sets','outing-edit','outing-sets']);
const ONLINE_PREMIUM=new Set(['cloud','family-share']);
function error(code){const e=new Error(code);e.code=code;throw e;}
function integer(value,min,max){if(!Number.isSafeInteger(value)||value<min||value>max)error('INVALID_INTEGER');return value;}
function instant(value){const n=typeof value==='number'?value:Date.parse(value);if(!Number.isFinite(n)||n<0)error('INVALID_TIME');return n;}
function id(value){if(typeof value!=='string'||value.length<1||value.length>160||['__proto__','constructor','prototype'].includes(value))error('INVALID_ID');return value;}
function quoteJPY(seats){integer(seats,1,6);return {currency:'JPY',seats,monthlyAmount:seats===1?380:680+(seats-2)*300,taxInclusive:true};}
function seatChange({currentSeats,targetSeats,paidThrough,now,paymentConfirmed=false}){
 quoteJPY(currentSeats);quoteJPY(targetSeats);const end=instant(paidThrough),at=instant(now);if(end<=at)error('PAID_PERIOD_ENDED');
 if(currentSeats===targetSeats)return {kind:'unchanged',effectiveAt:at,charge:'none',usableSeats:currentSeats};
 if(targetSeats<currentSeats)return {kind:'decrease',effectiveAt:end,charge:'next-renewal',usableSeats:currentSeats,nextSeats:targetSeats};
 return {kind:'increase',effectiveAt:paymentConfirmed?at:null,charge:'stripe-confirmed-proration',usableSeats:paymentConfirmed?targetSeats:currentSeats,requiresPreview:true,requiresSuccessfulPayment:!paymentConfirmed,nextMonthlyAmount:quoteJPY(targetSeats).monthlyAmount};
}
function startTrial({userId,now,previousTrialStartedAt,accountCanStart}){id(userId);if(!accountCanStart)error('TRIAL_UNAVAILABLE');if(previousTrialStartedAt!==null&&previousTrialStartedAt!==undefined)error('TRIAL_ALREADY_USED');const at=instant(now);return {userId,startsAt:at,endsAt:at+7*DAY,automaticCharge:false};}
function decideAccess({feature,userId,deviceId,online,now,lease}){
 if(FREE_FEATURES.has(feature))return {allowed:true,reason:'FREE_FEATURE'};
 if(!LOCAL_PREMIUM.has(feature)&&!ONLINE_PREMIUM.has(feature))return {allowed:false,reason:'UNKNOWN_FEATURE'};
 if(!userId||!deviceId)return {allowed:false,reason:'SIGN_IN_REQUIRED'};
 // lease is an already signature-verified payload supplied by verifyLease.
 if(!lease||lease.sub!==userId||lease.device!==deviceId)return {allowed:false,reason:'OWNER_OR_DEVICE_MISMATCH'};
 if(lease.aud!=='cocartly-premium'||lease.version!==1||lease.premium!==true||lease.release!=='premium-enabled')return {allowed:false,reason:'PREMIUM_UNAVAILABLE'};
 let at;try{at=instant(now);}catch(_){return {allowed:false,reason:'INVALID_TIME'};}
 const issued=lease.iat*1000,end=Math.min(lease.exp*1000,lease.paidThrough*1000,issued+DAY);
 if(!Number.isFinite(issued)||!Number.isFinite(end)||issued>at||end<=at)return {allowed:false,reason:'LEASE_EXPIRED'};
 if(ONLINE_PREMIUM.has(feature)&&!online)return {allowed:false,reason:'ONLINE_REQUIRED'};
 return {allowed:true,reason:online?'VALID_LEASE_SERVER_CHECK_STILL_REQUIRED':'OFFLINE_GRACE',validUntil:end};
}
module.exports=Object.freeze({DAY,HOUR,quoteJPY,seatChange,startTrial,decideAccess,integer,instant,id,error});

},
"./verify-lease.cjs":function(module,exports,require){
'use strict';
// Verifies ES256 compact JWS. No private signing key is shipped to browsers.
// Local denial does not revoke access on another device: APIs must check the
// authoritative current entitlement/device on every protected request.
function decode(part){if(typeof part!=='string'||!/^[A-Za-z0-9_-]+$/.test(part))throw Error('BAD_ENCODING');const s=part.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(s),x=>x.charCodeAt(0));}
function json(part){return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decode(part)));}
async function verifyLease(token,{keys,userId,deviceId,now=Date.now(),lastKnownServerTime=null,crypto=globalThis.crypto}){
 try{
  if(typeof token!=='string'||token.length>12000||!crypto?.subtle)return null;
  const parts=token.split('.');if(parts.length!==3)return null;
  const h=json(parts[0]),p=json(parts[1]);
  if(h.alg!=='ES256'||h.typ!=='JWT'||typeof h.kid!=='string'||h.kid.length>100||h.crit!==undefined||h.jku!==undefined||h.jwk!==undefined||h.x5u!==undefined)return null;
  if(!keys||!Object.prototype.hasOwnProperty.call(keys,h.kid))return null;
  const jwk=keys[h.kid];if(!jwk||jwk.kty!=='EC'||jwk.crv!=='P-256'||jwk.d!==undefined)return null;
  if(p.iss!=='cocartly-entitlements'||p.aud!=='cocartly-premium'||p.version!==1||p.sub!==userId||p.device!==deviceId||p.premium!==true||p.release!=='premium-enabled')return null;
  if(!['iat','nbf','exp','paidThrough'].every(k=>Number.isSafeInteger(p[k])&&p[k]>0))return null;
  if(!Number.isFinite(now)||now<0)return null;
  const sec=Math.floor(now/1000);
  if(p.iat>sec||p.nbf>sec||p.nbf<p.iat||p.exp<=sec||p.paidThrough<=sec||p.exp<=p.iat||p.exp-p.iat>86400||p.exp>p.paidThrough)return null;
  // Rollback detectable relative to a trusted/recent clock anchor fails closed.
  if(lastKnownServerTime!==null&&(!Number.isFinite(lastKnownServerTime)||now<lastKnownServerTime))return null;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const sig=decode(parts[2]);if(sig.length!==64)return null;
  const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,sig,new TextEncoder().encode(parts[0]+'.'+parts[1]));
  if(!ok)return null;
  return Object.freeze({iss:p.iss,aud:p.aud,version:p.version,sub:p.sub,device:p.device,premium:true,release:p.release,iat:p.iat,nbf:p.nbf,exp:p.exp,paidThrough:p.paidThrough});
 }catch(_){return null;}
}
module.exports={verifyLease};

},
"./shopping-sets.cjs":function(module,exports,require){
'use strict';
const {error,id,integer}=require('./premium-rules.cjs');
const clone=x=>structuredClone(x);
function plain(x){if(!x||typeof x!=='object'||Array.isArray(x))error('INVALID_RECORD');return x;}
function validateSet(set){plain(set);id(set.id);if(typeof set.name!=='string'||!set.name.trim()||set.name.length>120)error('INVALID_NAME');if(!Array.isArray(set.items)||set.items.length>100)error('INVALID_ITEMS');const seen=new Set(),itemIds=new Set();for(const row of set.items){plain(row);id(row.id);if(itemIds.has(row.id))error('DUPLICATE_ITEM_ID');itemIds.add(row.id);id(row.productId);integer(row.quantity,1,9999);if(seen.has(row.productId))error('DUPLICATE_PRODUCT_ID');seen.add(row.productId);}return set;}
function prepareShoppingAdditions({set,selected,products,shoppingItems,requestId,previousRequests=[],makeId,now}){
 validateSet(set);id(requestId);if(previousRequests.includes(requestId))return {changed:false,reason:'ALREADY_APPLIED',items:clone(shoppingItems),added:[],skipped:[]};
 if(set.active===false)error('SET_DELETED');if(!Array.isArray(selected)||!Array.isArray(products)||!Array.isArray(shoppingItems))error('INVALID_INPUT');
 const source=new Map(set.items.map(row=>[row.id,row])),seen=new Set(),added=[],skipped=[],next=clone(shoppingItems),ids=new Set(next.map(x=>String(x.id)));
 if(!Number.isFinite(Date.parse(now)))error('INVALID_TIME');
 for(const choice of selected){plain(choice);id(choice.itemId);if(seen.has(choice.itemId))error('DUPLICATE_SELECTION');seen.add(choice.itemId);const row=source.get(choice.itemId);if(!row)error('UNKNOWN_SET_ITEM');integer(choice.quantity,1,9999);
  const product=products.find(p=>String(p.id)===row.productId);
  if(!product||product.active===false)error('PRODUCT_UNAVAILABLE');
  // Never reactivate completed/held/deleted planned entries or change quantities.
  if(next.some(x=>String(x.productId)===row.productId)){skipped.push({itemId:row.id,productId:row.productId,reason:'EXISTING_PLAN_KEPT'});continue;}
  const newId=id(makeId());if(ids.has(newId))error('ID_COLLISION');ids.add(newId);
  const entry={id:newId,productId:row.productId,productName:product.name,quantity:choice.quantity,status:'pending',holdStartedAt:null,createdAt:now,updatedAt:now};next.push(entry);added.push(clone(entry));
 }
 return {changed:added.length>0,items:next,added,skipped,requestId};
}
function commitPreparedShopping({storage,ownerToken,access,expectedRaw,plan}){
 if(!access?.allowed)error('PREMIUM_REQUIRED');if(!storage.isCurrent(ownerToken))error('OWNER_CHANGED');
 if(storage.getItem('cocartlyShoppingItems')!==expectedRaw)error('DATA_CHANGED');
 if(!plan.changed)return false;
 // Existing OwnerStorage journal provides all-or-rollback local persistence.
 storage.applyBatch({cocartlyShoppingItems:JSON.stringify(plan.items)},ownerToken);return true;
}
function validateOutingSet(set){
 plain(set);id(set.id);if(typeof set.name!=='string'||!set.name.trim()||set.name.length>120)error('INVALID_NAME');
 if(!Array.isArray(set.items)||set.items.length>100)error('INVALID_ITEMS');
 const seen=new Set();for(const item of set.items){plain(item);id(item.id);if(seen.has(item.id))error('DUPLICATE_ITEM_ID');seen.add(item.id);
  if(typeof item.name!=='string'||!item.name.trim()||item.name.length>200)error('INVALID_NAME');integer(item.quantity??1,1,9999);
  if(!['home','purchase'].includes(item.itemType))error('INVALID_ITEM_TYPE');if(item.productId!==undefined&&item.productId!==null)id(item.productId);
 }return set;
}
function createOutingFromTemplate({template,name,type='routine',date=null,products=[],makeId,now}){
 plain(template);if(typeof name!=='string'||!name.trim()||name.length>120)error('INVALID_NAME');if(!['routine','scheduled'].includes(type))error('INVALID_OUTING_TYPE');
 if(type==='scheduled'&&(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))error('INVALID_DATE');
 if(!Array.isArray(template.items)||template.items.length>100||!Number.isFinite(Date.parse(now)))error('INVALID_TEMPLATE');
 const used=new Set(),nextId=()=>{const value=id(makeId());if(used.has(value))error('ID_COLLISION');used.add(value);return value;};
 const result={id:nextId(),name:name.trim(),type,date:type==='scheduled'?date:null,status:type==='scheduled'?'upcoming':'routine',items:[],createdAt:now,updatedAt:now};
 for(const item of template.items){plain(item);if(typeof item.name!=='string'||!item.name.trim())error('INVALID_NAME');integer(item.quantity??1,1,9999);const productId=item.productId??null;if(productId!==null&&!products.some(p=>String(p.id)===productId&&p.active!==false))error('PRODUCT_UNAVAILABLE');
  result.items.push({id:nextId(),name:item.name,quantity:item.quantity??1,itemType:item.itemType==='purchase'?'purchase':'home',productId,status:'pending',createdAt:now,updatedAt:now});
 }return result;
}
module.exports={validateSet,validateOutingSet,prepareShoppingAdditions,commitPreparedShopping,createOutingFromTemplate};

},
"./family-client.cjs":function(module,exports,require){
'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),plain=o=>o&&typeof o==='object'&&!Array.isArray(o);
function invalid(){throw Error('INVALID_FAMILY_DATA');}
function body(value){
 if(!plain(value)||Object.keys(value).some(k=>!['name','quantity','janCode','volume','unit','price','currency','storeName','note'].includes(k)))invalid();
 if(typeof value.name!=='string'||!value.name.trim()||value.name.length>200||!Number.isSafeInteger(value.quantity)||value.quantity<1||value.quantity>9999)invalid();
 for(const [key,max]of [['janCode',100],['unit',30],['storeName',200],['note',2000]])if(own(value,key)&&(typeof value[key]!=='string'||value[key].length>max))invalid();
 if(own(value,'volume')&&(!['string','number'].includes(typeof value.volume)||String(value.volume).length>80||typeof value.volume==='number'&&!Number.isFinite(value.volume)))invalid();
 if(own(value,'price')&&(!Number.isFinite(value.price)||value.price<0||value.price>1e9||!['JPY','USD','CAD','AUD','KRW','CNY','TWD'].includes(value.currency)))invalid();
 if(own(value,'currency')&&!own(value,'price'))invalid();return value;
}
function makeShareBody({product,quantity,include={},currency,storeName,note=''}){
 if(!product||product.active===false)invalid();const result={name:product.name,quantity};
 for(const key of ['janCode','volume','unit'])if(product[key]!==undefined&&product[key]!==null&&product[key]!=='')result[key]=product[key];
 if(include.price===true){if(product.price===null||product.price===''||product.price===undefined)invalid();result.price=Number(product.price);result.currency=currency;}
 if(include.store===true)result.storeName=storeName;
 if(include.note===true)result.note=note;
 return body(result);
}
const uuid=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
function validateFamilyCache(cache,owner){
 if(!plain(cache)||cache.version!==1||cache.owner!==owner||!Number.isFinite(Date.parse(cache.savedAt))||!plain(cache.family))invalid();
 const f=cache.family;if(Object.keys(cache).some(k=>!['version','owner','savedAt','family'].includes(k))||Object.keys(f).some(k=>!['payer_id','actor_id','server_time','seats','paid_until','members','items'].includes(k)))invalid();if(!uuid(f.actor_id)||owner!=='user:'+f.actor_id||!uuid(f.payer_id)||!Number.isFinite(Date.parse(f.server_time))||!Number.isFinite(Date.parse(f.paid_until))||!Number.isSafeInteger(f.seats)||f.seats<1||f.seats>1000||!Array.isArray(f.members)||f.members.length>1000||!Array.isArray(f.items)||f.items.length>500)invalid();
 for(const member of f.members)if(!plain(member)||Object.keys(member).some(k=>!['user_id','alias','seat_no'].includes(k))||!uuid(member.user_id)||typeof member.alias!=='string'||member.alias.length>40||!Number.isSafeInteger(member.seat_no)||member.seat_no<1)invalid();
 const seen=new Set();for(const item of f.items){if(!plain(item)||Object.keys(item).some(k=>!['id','payer_id','creator_id','assignee_id','body','status','version','active','created_at','updated_at'].includes(k))||!Number.isFinite(Date.parse(item.created_at))||!Number.isFinite(Date.parse(item.updated_at))||!uuid(item.id)||seen.has(item.id)||item.payer_id!==f.payer_id||item.creator_id!==null&&!uuid(item.creator_id)||item.assignee_id!==null&&!uuid(item.assignee_id)||!Number.isSafeInteger(item.version)||item.version<1||!['pending','purchased','hold'].includes(item.status)||typeof item.active!=='boolean')invalid();seen.add(item.id);body(item.body);}
 return cache;
}
module.exports={makeShareBody,validateFamilyCache,validateSharedBody:body};

}
};const cache={};function require(id){if(cache[id])return cache[id].exports;if(!factories[id])throw Error('UNKNOWN_MODULE');const m={exports:{}};cache[id]=m;factories[id](m,m.exports,require);return m.exports;}global.CocartlyPremiumCore=Object.freeze(Object.assign({},...Object.keys(factories).map(require)));})(window);
