/* Owner-bound backup recovery and guest signup handoff. No personal mappings. */
(function (global) {
    'use strict';
    const DOMAINS={products:'shoppingSupportProducts',makers:'shoppingSupport_makers',categories:'shoppingSupport_categories',stores:'shoppingSupportStores',priceHistory:'shoppingSupportPriceHistory',shoppingItems:'cocartlyShoppingItems',storeChecks:'cocartlyStoreChecks',outings:'outings'};
    const SETTINGS=['cocartly-language','cocartly-base-country','cocartly-setup-completed'];
    const STATE='cocartly-recovery-state',OFFER='cocartly-guest-offer';
    const COPY={
      ja:{title:'バックアップ復元・ゲスト引継ぎ',guide:'バックアップを選び、変更予定を確認して適用します。読み込みだけでは保存しません。',choose:'バックアップを選択',offer:'新規登録前のゲストデータを確認',mode:'復元方法',merge:'不足している記録だけ追加',overwrite:'同じIDの記録もバックアップの値へ戻す',consent:'表示した追加・更新を確認しました。現在の本人データを変更します。',apply:'確認した内容を適用',back:'設定へ戻る',ready:'内容を確認してください。ゲストの元データと対象外の記録は残します。',done:'端末に反映し、クラウド同期が完了しました。',pending:'端末への反映は完了しました。クラウド同期は未完了で、再試行の対象です。',local:'ゲストの端末内に復元しました。',error:'適用を停止しました。対象データ・所有者・通信状態を確認してください。',wrong:'別ユーザーのバックアップは復元できません。',changed:'対象データが変わったか、同じIDの内容が異なります。再確認してください。',deleted:'削除済み記録の自動復活を防ぐため停止しました。',online:'オンラインでクラウド復元完了後に実行してください。',invalid:'このバックアップは対応形式ではないか、破損しています。',empty:'ゲスト引継ぎ先には、商品・履歴などが未登録のアカウントを使用してください。',saved:'ゲストデータは残っています。登録後、設定の復元・引継ぎから内容を確認できます。',failedOffer:'引継ぎ候補を保存できませんでした。元のゲストデータは残っています。ゲストでバックアップして新規アカウントへ読み込めます。',none:'このアカウントへの引継ぎ候補はありません。',adds:'追加',updates:'更新',same:'変更なし',guest:'ゲストからこのアカウントへコピー',before:'適用前の控えを、この端末の本人用領域に保存します。',already:'追加・更新する記録はありません。'},
      en:{title:'Restore backup / guest transfer',guide:'Choose a backup and review changes. Loading alone saves nothing.',choose:'Choose backup',offer:'Review guest data from signup',mode:'Restore mode',merge:'Add missing records only',overwrite:'Also restore matching IDs from backup',consent:'I reviewed the additions and updates to my current data.',apply:'Apply reviewed changes',back:'Back to settings',ready:'Review changes. Original guest data and unrelated records are kept.',done:'Saved locally and cloud sync completed.',pending:'Saved locally. Cloud sync is pending and can retry.',local:'Restored to this guest device.',error:'Stopped. Check data, account and connection.',wrong:'A different user’s backup cannot be restored.',changed:'Data changed or matching IDs differ. Review again.',deleted:'Stopped to prevent restoring cloud-deleted records.',online:'Go online and complete cloud restore first.',invalid:'Unsupported or damaged backup.',empty:'Transfer guest data to an account without products or purchase records.',saved:'Guest data is kept. After signup, review it in restore settings.',failedOffer:'Could not save the offer. Guest data is kept; export a guest backup and import it in the new account.',none:'No guest transfer offer for this account.',adds:'Add',updates:'Update',same:'Unchanged',guest:'Copy guest data to this account',before:'A pre-change copy is saved locally for this owner.',already:'No records need adding or updating.'},
      ko:{title:'백업 복원·게스트 이전',guide:'백업을 선택하고 변경 내용을 확인하세요. 불러오기만으로 저장하지 않습니다.',choose:'백업 선택',offer:'가입 전 게스트 데이터 확인',mode:'복원 방법',merge:'없는 기록만 추가',overwrite:'같은 ID도 백업 값으로 복원',consent:'추가·변경 내용을 확인했습니다. 내 데이터를 변경합니다.',apply:'확인한 변경 적용',back:'설정으로',ready:'게스트 원본과 대상 외 기록은 유지합니다.',done:'기기에 저장하고 클라우드 동기화를 완료했습니다.',pending:'기기에 저장했습니다. 클라우드 동기화는 재시도 대상입니다.',local:'게스트 기기에 복원했습니다.',error:'중단했습니다. 계정·데이터·연결을 확인하세요.',wrong:'다른 사용자 백업은 복원할 수 없습니다.',changed:'데이터가 바뀌었거나 같은 ID 내용이 다릅니다.',deleted:'삭제된 기록의 자동 복원을 막기 위해 중단했습니다.',online:'온라인에서 클라우드 복원을 완료하세요.',invalid:'지원하지 않거나 손상된 백업입니다.',empty:'상품·구매 기록이 없는 계정으로 이전하세요.',saved:'게스트 원본은 유지됩니다. 가입 후 복원 설정에서 확인하세요.',failedOffer:'후보 저장 실패. 게스트 백업을 내보내 새 계정에서 불러올 수 있습니다.',none:'이 계정의 이전 후보가 없습니다.',adds:'추가',updates:'변경',same:'유지',guest:'게스트 데이터를 이 계정으로 복사',before:'변경 전 사본을 이 소유자의 기기에 저장합니다.',already:'추가·변경할 기록이 없습니다.'},
      'zh-CN':{title:'备份恢复·访客迁移',guide:'选择备份并确认更改。仅加载不会保存。',choose:'选择备份',offer:'查看注册前访客数据',mode:'恢复方式',merge:'仅添加缺少记录',overwrite:'同ID也恢复为备份值',consent:'已确认新增和更新，将修改我的数据。',apply:'应用已确认更改',back:'返回设置',ready:'保留访客原数据和其他记录。',done:'已保存并完成云端同步。',pending:'已保存本机，云端同步等待重试。',local:'已恢复到访客本机。',error:'已停止，请检查账号、数据和网络。',wrong:'不能恢复其他用户的备份。',changed:'数据已变化或同ID内容不同。',deleted:'为防止自动恢复已删除记录，操作已停止。',online:'请联网并完成云端恢复。',invalid:'备份不支持或已损坏。',empty:'请迁移到没有商品和购买记录的账号。',saved:'访客原数据保留，注册后可在恢复设置确认。',failedOffer:'候选保存失败，可导出访客备份再导入新账号。',none:'此账号没有迁移候选。',adds:'新增',updates:'更新',same:'不变',guest:'将访客数据复制到此账号',before:'更改前副本仅保存在此用户本机。',already:'没有需要新增或更新的记录。'},
      'zh-TW':{title:'備份還原·訪客移轉',guide:'選擇備份並確認變更。僅載入不會儲存。',choose:'選擇備份',offer:'查看註冊前訪客資料',mode:'還原方式',merge:'僅新增缺少紀錄',overwrite:'同ID也還原為備份值',consent:'已確認新增和更新，將修改我的資料。',apply:'套用已確認變更',back:'返回設定',ready:'保留訪客原資料和其他紀錄。',done:'已儲存並完成雲端同步。',pending:'已儲存本機，雲端同步等待重試。',local:'已還原到訪客本機。',error:'已停止，請檢查帳號、資料和網路。',wrong:'不能還原其他使用者的備份。',changed:'資料已變更或同ID內容不同。',deleted:'為避免自動還原已刪紀錄，操作已停止。',online:'請連線並完成雲端還原。',invalid:'備份不支援或已損壞。',empty:'請移轉到沒有商品和購買紀錄的帳號。',saved:'訪客原資料保留，註冊後可於還原設定確認。',failedOffer:'候選儲存失敗，可匯出訪客備份再匯入新帳號。',none:'此帳號沒有移轉候選。',adds:'新增',updates:'更新',same:'不變',guest:'將訪客資料複製到此帳號',before:'變更前副本僅儲存於此使用者本機。',already:'沒有需要新增或更新的紀錄。'},
      fr:{title:'Restaurer / transférer les données invité',guide:'Choisissez une sauvegarde et vérifiez. Le chargement seul ne modifie rien.',choose:'Choisir une sauvegarde',offer:'Données invité avant inscription',mode:'Mode',merge:'Ajouter seulement les éléments absents',overwrite:'Restaurer aussi les mêmes identifiants',consent:'Je confirme les ajouts et modifications de mes données.',apply:'Appliquer les changements vérifiés',back:'Retour aux réglages',ready:'Les données invité originales et les autres éléments sont conservés.',done:'Enregistré et synchronisé.',pending:'Enregistré sur cet appareil. Synchronisation à réessayer.',local:'Restauré pour cet invité.',error:'Arrêt. Vérifiez le compte, les données et la connexion.',wrong:'Impossible de restaurer la sauvegarde d’un autre utilisateur.',changed:'Les données ont changé ou les identifiants diffèrent.',deleted:'Arrêt pour éviter de rétablir des éléments supprimés.',online:'Connectez-vous et terminez la restauration cloud.',invalid:'Sauvegarde non prise en charge ou endommagée.',empty:'Utilisez un compte sans produits ni achats pour le transfert invité.',saved:'Les données invité sont conservées. Vérifiez-les après inscription dans les réglages.',failedOffer:'Offre non enregistrée. Exportez les données invité puis importez-les dans le nouveau compte.',none:'Aucun transfert proposé pour ce compte.',adds:'Ajouts',updates:'Modifications',same:'Inchangés',guest:'Copier les données invité vers ce compte',before:'Une copie avant modification est conservée localement pour ce propriétaire.',already:'Aucun élément à ajouter ou modifier.'}
    };
    const DOMAIN_LABELS={ja:['商品','メーカー','ジャンル','購入先','購入履歴','購入予定','店頭確認','お出かけ'],en:['Products','Makers','Categories','Stores','Purchase history','Shopping plans','Store checks','Outings'],ko:['상품','제조사','분류','구매처','구매 내역','구매 예정','매장 확인','외출'],'zh-CN':['商品','厂商','分类','购买地点','购买记录','购买计划','店内确认','出行'],'zh-TW':['商品','廠商','分類','購買地點','購買紀錄','購買計畫','店內確認','出遊'],fr:['Produits','Fabricants','Catégories','Magasins','Achats','Achats prévus','Vérifications','Sorties']};
    const el=id=>document.getElementById(id),clone=v=>JSON.parse(JSON.stringify(v));
    const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
    const equal=(a,b)=>stable(a)===stable(b);
    const contentEqual=(a,b)=>{const x=clone(a),y=clone(b);delete x.updatedAt;delete y.updatedAt;return equal(x,y);};
    const seal=p=>({backup:p.backup,mode:p.mode,transfer:p.transfer,values:p.values,operations:p.operations,settings:p.settings,counts:p.counts});
    const lang=()=>typeof getCocartlyLanguage==='function'?getCocartlyLanguage():'ja';
    const text=k=>(COPY[lang()]||COPY.ja)[k];
    function fail(k){const e=new Error(text(k));e.recoveryKey=k;throw e;}
    async function hash(v){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)))),b=>b.toString(16).padStart(2,'0')).join('');}
    const array=key=>{const v=JSON.parse(CocartlyOwnerStorage.getItem(key)||'[]');if(!Array.isArray(v))fail('invalid');return v;};
    function ready(){if(!CocartlyOwnerStorage.isReady()||CocartlyOwnerStorage.isWriteBlocked())fail('online');if(CocartlyOwnerStorage.getOwner()!=='guest'&&(!navigator.onLine||!cocartlyCloudInitialMergeCompleted||!canUseCocartlyPrivateCloud()))fail('online');if(typeof cocartlyUiStoreConflict!=='undefined'&&cocartlyUiStoreConflict)fail('changed');}
    function current(token){if(!CocartlyOwnerStorage.isCurrent(token))fail('wrong');}
    function validate(b){
      if(!b||b.appName!=='Cocartly'||b.backupVersion!==2||typeof b.owner!=='string'||!(/^(guest|user:[a-zA-Z0-9-]+)$/.test(b.owner))||!b.data||typeof b.data!=='object')fail('invalid');
      const stack=[b];let nodes=0;
      while(stack.length){const value=stack.pop();if(!value||typeof value!=='object')continue;if(++nodes>500000)fail('invalid');for(const key of Object.keys(value)){if(['__proto__','constructor','prototype'].includes(key))fail('invalid');if(value[key]&&typeof value[key]==='object')stack.push(value[key]);}}
      for(const d of Object.keys(DOMAINS)){const rows=b.data[d];if(!Array.isArray(rows)||rows.length>50000)fail('invalid');const ids=new Set();for(const r of rows){if(!r||typeof r!=='object'||Array.isArray(r)||!['string','number'].includes(typeof r.id)||!String(r.id)||ids.has(String(r.id))||['__proto__','constructor','prototype'].includes(String(r.id)))fail('invalid');ids.add(String(r.id));
        if(r.active!==undefined&&typeof r.active!=='boolean')fail('invalid');
        for(const field of ['productId','storeId','makerId','categoryId','shoppingItemId'])if(r[field]!==undefined&&r[field]!==null&&!['string','number'].includes(typeof r[field]))fail('invalid');
        for(const field of ['createdAt','updatedAt','purchasedAt','checkedAt'])if(r[field]!==undefined&&(typeof r[field]!=='string'||!Number.isFinite(Date.parse(r[field]))))fail('invalid');
      }}
      for(const p of b.data.products)if(typeof p.name!=='string')fail('invalid');
      for(const s of b.data.stores)if(typeof s.name!=='string'||!['JP','US','CA','AU','KR','CN','TW','OTHER'].includes(s.country||'JP'))fail('invalid');
      for(const h of b.data.priceHistory)if(!Number.isFinite(Number(h.price))||Number(h.price)<0||!h.productId||!h.storeId||(h.quantity!==undefined&&(!Number.isFinite(Number(h.quantity))||Number(h.quantity)<=0))||(h.currency!==undefined&&!['JPY','USD','CAD','AUD','KRW','CNY','TWD'].includes(h.currency)))fail('invalid');
      for(const o of b.data.outings){if(!Array.isArray(o.items))fail('invalid');const ids=new Set();for(const item of o.items){if(!item||!['string','number'].includes(typeof item.id)||!String(item.id)||ids.has(String(item.id)))fail('invalid');ids.add(String(item.id));}}
      if(b.localStorage&&typeof b.localStorage!=='object')fail('invalid');
      for(const k of SETTINGS){const v=b.localStorage?.[k];if(v!==undefined&&typeof v!=='string')fail('invalid');if(k==='cocartly-language'&&v!==undefined&&!['ja','en','ko','zh-CN','zh-TW','fr'].includes(v))fail('invalid');if(k==='cocartly-base-country'&&v!==undefined&&!['JP','US','CA','AU','KR','CN','TW','OTHER'].includes(v))fail('invalid');if(k==='cocartly-setup-completed'&&v!==undefined&&!['true','false'].includes(v))fail('invalid');}
    }
    function snapshot(){const data=Object.fromEntries(Object.entries(DOMAINS).map(([d,k])=>[d,array(k)]));const localStorage={};for(const k of SETTINGS){const v=CocartlyOwnerStorage.getItem(k);if(v!==null)localStorage[k]=v;}return {appName:'Cocartly',backupVersion:2,owner:CocartlyOwnerStorage.getOwner(),exportedAt:new Date().toISOString(),data,localStorage};}
    function captureGuestSignup(){if(!CocartlyOwnerStorage.isReady()||CocartlyOwnerStorage.getOwner()!=='guest')return null;return {token:CocartlyOwnerStorage.snapshot(),backup:snapshot()};}
    function finishGuestSignup(captured,result){
      if(!captured||!result?.user?.id)return false;
      const target='user:'+result.user.id,owner=CocartlyOwnerStorage.getOwner();
      if(!/^user:[a-zA-Z0-9-]+$/.test(target)||!(CocartlyOwnerStorage.isCurrent(captured.token)||owner===target))return false;
      const key='cocartly:v1:'+target+':'+OFFER;
      try{if(global.localStorage.getItem(key)===null)global.localStorage.setItem(key,JSON.stringify({targetOwner:target,backup:captured.backup}));return true;}catch(e){global.alert(text('failedOffer'));return false;}
    }
    function local(){return Object.fromEntries([...Object.values(DOMAINS),...SETTINGS].map(k=>[k,CocartlyOwnerStorage.getItem(k)]));}
    function emptyPersonal(lists){return ['products','makers','priceHistory','shoppingItems','storeChecks','outings'].every(d=>lists[d].length===0)&&lists.stores.every(s=>s.isDefault===true);}
    function rewrite(data,maps){
      const ref=(d,v)=>v===null||v===undefined?v:(maps[d].get(String(v))||v);
      for(const[d,rows]of Object.entries(data))for(const r of rows){r.id=ref(d,r.id);
        if(d==='products'){for(const[k,domain]of Object.entries({storeId:'stores',makerId:'makers',categoryId:'categories'}))if(r[k])r[k]=ref(domain,r[k]);}
        if(['priceHistory','shoppingItems','storeChecks'].includes(d)&&r.productId)r.productId=ref('products',r.productId);
        if(['priceHistory','storeChecks'].includes(d)&&r.storeId)r.storeId=ref('stores',r.storeId);
        if(d==='storeChecks'&&r.shoppingItemId)r.shoppingItemId=ref('shoppingItems',r.shoppingItemId);
        if(d==='shoppingItems'&&Array.isArray(r.outingLinks))for(const link of r.outingLinks)link.outingId=ref('outings',link.outingId);
        if(d==='outings')for(const item of r.items){if(item.productId)item.productId=ref('products',item.productId);if(item.shoppingItemId)item.shoppingItemId=ref('shoppingItems',item.shoppingItemId);}
      }
    }
    async function preview(input,mode='merge'){
      ready();if(!['merge','overwrite'].includes(mode))fail('invalid');const backup=clone(input);validate(backup);const token=CocartlyOwnerStorage.snapshot(),owner=CocartlyOwnerStorage.getOwner();
      if(backup.owner!==owner&&backup.owner!=='guest')fail('wrong');const transfer=backup.owner==='guest'&&owner!=='guest';
      CocartlyOwnerStorage.validateLocalData();
      const values=local(),lists=Object.fromEntries(Object.entries(DOMAINS).map(([d,k])=>[d,JSON.parse(values[k]||'[]')]));
      if(transfer&&!emptyPersonal(lists))fail('empty');
      const data=Object.fromEntries(Object.keys(DOMAINS).map(d=>[d,clone(backup.data[d])])),maps=Object.fromEntries(Object.keys(DOMAINS).map(d=>[d,new Map()]));
      if(transfer){for(const d of Object.keys(DOMAINS))for(const r of data[d])if(lists[d].some(x=>String(x.id)===String(r.id)))maps[d].set(String(r.id),'IM-'+crypto.randomUUID());rewrite(data,maps);}
      const operations=[],counts={adds:0,updates:0,same:0},meta=typeof loadCocartlyCloudMeta==='function'?loadCocartlyCloudMeta():{records:{}};
      for(const[d,key]of Object.entries(DOMAINS))for(const incoming of data[d]){
        const existing=lists[d].find(r=>String(r.id)===String(incoming.id));
        if(existing&&contentEqual(existing,incoming)){counts.same++;continue;}
        if(!existing&&meta.records?.[d]&&Object.prototype.hasOwnProperty.call(meta.records[d],String(incoming.id)))fail('deleted');
        if(existing){if(mode!=='overwrite'||transfer)fail('changed');if(existing.active===false&&incoming.active!==false)fail('deleted');if(d==='stores'&&(!existing.createdAt||!incoming.createdAt||Date.parse(existing.createdAt)!==Date.parse(incoming.createdAt)))fail('changed');}
        counts[existing?'updates':'adds']++;operations.push({domain:d,key,incoming,current:existing?clone(existing):null});
      }
      const settings={};for(const k of SETTINGS){const v=backup.localStorage?.[k];if(v!==undefined&&(transfer||mode==='overwrite'||values[k]===null)&&v!==values[k])settings[k]=v;}
      const prepared={backup,token,mode,transfer,values,operations,settings,counts};
      prepared.fingerprint=await hash(seal(prepared));current(token);
      return prepared;
    }
    async function preflight(p){
      if(CocartlyOwnerStorage.getOwner()==='guest')return;
      for(const d of Object.keys(DOMAINS)){
        const rows=await fetchCocartlyCloudDomain(d);current(p.token);
        if(p.transfer&&['products','makers','priceHistory','shoppingItems','storeChecks','outings'].includes(d)&&rows.length)fail('empty');
        for(const op of p.operations.filter(o=>o.domain===d)){const row=rows.find(r=>String(r.record_id)===String(op.incoming.id));if(!row)continue;if(row.is_deleted===true)fail('deleted');if(!op.current||!equal(row.data,op.current))fail('changed');}
        if(d==='stores')assertCocartlyStoreIdentityPairs('stores',array(DOMAINS.stores),rows);
      }
      const rows=await fetchCocartlyCloudSettings();current(p.token);
      for(const row of rows){const key=COCARTLY_CLOUD_SETTINGS[row.setting_key]?.storageKey;if(key&&key in p.settings&&row.value!==p.values[key])fail('changed');}
    }
    async function apply(prepared){
      const p=clone(prepared);
      const execute=async()=>{
        ready();current(p.token);if(!equal(local(),p.values))fail('changed');if(await hash(seal(p))!==p.fingerprint)fail('changed');current(p.token);
        await preflight(p);current(p.token);if(!equal(local(),p.values)||await hash(seal(p))!==p.fingerprint)fail('changed');current(p.token);if(!equal(local(),p.values))fail('changed');
        if(!p.operations.length&&!Object.keys(p.settings).length)return {changed:false};
        const values={},dirty=new Set(),now=Date.now();
        for(const[d,key]of Object.entries(DOMAINS)){const ops=p.operations.filter(o=>o.domain===d);if(!ops.length)continue;const rows=array(key);for(const op of ops){const r=clone(op.incoming);r.updatedAt=new Date(Math.max(now,(Date.parse(op.current?.updatedAt)||0)+1)).toISOString();const i=rows.findIndex(x=>String(x.id)===String(r.id));if(i<0)rows.push(r);else rows[i]=r;}values[key]=JSON.stringify(rows);dirty.add(d);}
        Object.assign(values,p.settings);
        values[STATE]=JSON.stringify({version:1,appliedAt:new Date().toISOString(),sourceOwner:p.backup.owner,before:p.values,counts:p.counts});
        if(p.transfer)values[OFFER]='null';
        CocartlyOwnerStorage.applyBatch(values,p.token);
        for(const d of dirty)notifyCocartlyDataChanged(d);
        for(const [setting,config]of Object.entries(COCARTLY_CLOUD_SETTINGS))if(config.storageKey in p.settings)notifyCocartlySettingChanged(setting);
        return {changed:true};
      };
      const result=CocartlyOwnerStorage.getOwner()==='guest'?await execute():await enqueueCocartlyCloud(execute);if(!result)fail('online');return result;
    }
    let selected=null,source=null,busy=false;
    function clear(){selected=null;source=null;el('recoveryPreview')?.replaceChildren();if(el('recoveryConsent'))el('recoveryConsent').checked=false;if(el('recoveryApply'))el('recoveryApply').disabled=true;if(el('recoveryStatus'))el('recoveryStatus').textContent='';}
    function refreshLabels(){const title=document.querySelector('#btnRestoreData strong'),guide=document.querySelector('#btnRestoreData small');if(title)title.textContent=text('title');if(guide)guide.textContent=text('guide');for(const[id,key]of Object.entries({recoveryTitle:'title',recoveryGuide:'guide',recoveryFileButton:'choose',recoveryOfferButton:'offer',recoveryModeLabel:'mode',recoveryMergeOption:'merge',recoveryOverwriteOption:'overwrite',recoveryConsentLabel:'consent',recoveryApply:'apply',recoveryBack:'back'}))if(el(id))el(id).textContent=text(key);}
    function open(){clear();if(el('recoveryMode'))el('recoveryMode').value='merge';refreshLabels();hideAllScreens();if(el('recoveryScreen'))el('recoveryScreen').hidden=false;global.scrollTo(0,0);}
    function line(root,value){const p=document.createElement('p');p.textContent=value;root.appendChild(p);}
    function render(p){
      const root=el('recoveryPreview');root.replaceChildren();line(root,text('before'));if(p.transfer)line(root,text('guest'));
      line(root,text('adds')+': '+p.counts.adds+' / '+text('updates')+': '+p.counts.updates+' / '+text('same')+': '+p.counts.same);
      const names=DOMAIN_LABELS[lang()]||DOMAIN_LABELS.ja;
      const lookup=(d,id)=>p.operations.find(o=>o.domain===d&&String(o.incoming.id)===String(id))?.incoming||array(DOMAINS[d]).find(r=>String(r.id)===String(id));
      for(const [index,d]of Object.keys(DOMAINS).entries()){
        const ops=p.operations.filter(o=>o.domain===d);if(!ops.length)continue;
        const group=document.createElement('details'),head=document.createElement('summary');head.textContent=names[index]+' ('+ops.length+')';group.appendChild(head);
        for(const o of ops){const old=o.current,r=o.incoming;
          line(group,(old?.name&&old.name!==r.name?old.name+' → ':'')+(r.name||lookup('products',r.productId)?.name||String(r.id))+' / '+text(old?'updates':'adds'));
          if(r.price!==undefined)line(group,(old?.price??'—')+' → '+r.price+(r.currency?' '+r.currency:''));
          if(r.storeId)line(group,(old?JSON.parse(p.values[DOMAINS.stores]||'[]').find(s=>String(s.id)===String(old.storeId))?.name||'—':'—')+' → '+(lookup('stores',r.storeId)?.name||String(r.storeId)));
          if(r.country)line(group,(old?.country||'—')+' → '+r.country);
          if(r.purchasedAt||r.checkedAt)line(group,r.purchasedAt||r.checkedAt);
          if(r.active===false)line(group,({'ja':'削除済み（維持）','en':'Deleted (preserved)','ko':'삭제됨(유지)','zh-CN':'已删除（保留）','zh-TW':'已刪除（保留）','fr':'Supprimé (conservé)'})[lang()]||'Deleted (preserved)');
        }root.appendChild(group);
      }
      for(const [key,value]of Object.entries(p.settings)){const titles={'cocartly-language':t('settings.language'),'cocartly-base-country':t('settings.baseCountry'),'cocartly-setup-completed':t('settings.title')};line(root,titles[key]+': '+(p.values[key]||'—')+' → '+value);}
      el('recoveryStatus').textContent=p.operations.length||Object.keys(p.settings).length?text('ready'):text('already');el('recoveryConsent').checked=false;el('recoveryApply').disabled=true;
    }
    async function choose(file){clear();if(!file||busy)return;const token=CocartlyOwnerStorage.snapshot();try{if(file.size>30*1024*1024)fail('invalid');const value=JSON.parse(await file.text());current(token);source=value;selected=await preview(value,el('recoveryMode').value);current(token);render(selected);}catch(e){if(CocartlyOwnerStorage.isCurrent(token))el('recoveryStatus').textContent=e.recoveryKey?e.message:text('invalid');}}
    async function chooseOffer(){clear();const token=CocartlyOwnerStorage.snapshot();if(el('recoveryMode'))el('recoveryMode').value='merge';try{ready();const offer=JSON.parse(CocartlyOwnerStorage.getItem(OFFER)||'null');if(!offer||offer.targetOwner!==CocartlyOwnerStorage.getOwner())fail('none');source=offer.backup;selected=await preview(source,'merge');current(token);render(selected);}catch(e){if(!CocartlyOwnerStorage.isCurrent(token))return;el('recoveryStatus').textContent=e.recoveryKey?e.message:text('invalid');}}
    async function changeMode(){if(!source)return;const value=source;await choose({size:JSON.stringify(value).length,text:async()=>JSON.stringify(value)});}
    function consent(){if(el('recoveryApply'))el('recoveryApply').disabled=!selected||!el('recoveryConsent').checked||busy||(!selected.operations.length&&!Object.keys(selected.settings).length);}
    async function applySelected(){if(!selected||busy||!el('recoveryConsent').checked)return;const p=selected;busy=true;el('recoveryApply').disabled=true;try{setCocartlySafetyState('busy');await apply(p);clear();current(p.token);hydrateCocartlyOwnerView();if(CocartlyOwnerStorage.getOwner()==='guest')global.alert(text('local'));else{try{await syncCocartlyCloud();current(p.token);global.alert(text(cocartlyCloudDirtyDomains.size||cocartlyCloudDirtySettings.size||!navigator.onLine?'pending':'done'));}catch(e){if(CocartlyOwnerStorage.isCurrent(p.token))global.alert(text('pending'));}}}catch(e){if(CocartlyOwnerStorage.isCurrent(p.token)){setCocartlySafetyState('ready');el('recoveryStatus').textContent=e.recoveryKey?e.message:text('error');}}finally{busy=false;consent();}}
    global.addEventListener('cocartly-auth-owner-changing',clear);
    const old=global.updateSettingsScreenLanguage;if(typeof old==='function')global.updateSettingsScreenLanguage=function(...args){const result=old.apply(this,args);refreshLabels();return result;};
    global.CocartlyDataRecovery=Object.freeze({open,choose,chooseOffer,changeMode,consent,applySelected,preview,apply,snapshot,captureGuestSignup,finishGuestSignup,refreshLabels,text});
})(window);
