/* Creates a hosted Checkout only after explicit user action. No card data enters Cocartly. */
(function(global){
 'use strict';let generation=0;
 const S=()=>CocartlyOwnerStorage;
 async function status(){const token=S().snapshot();if(!S().getOwner()?.startsWith('user:')||!navigator.onLine)return {enabled:false};
  const result=await getCocartlySupabase().rpc('cocartly_billing_purchase_status');if(!S().isCurrent(token))throw Error('OWNER_CHANGED');if(result.error)throw result.error;return result.data;
 }
 async function checkout({seats,requestId,consent}){
  const token=S().snapshot(),ready=await status();if(!ready?.enabled||!Number.isSafeInteger(seats)||seats<1||seats>ready.max_seats||consent!==true)throw Error('CHECKOUT_UNAVAILABLE');
  const result=await getCocartlySupabase().functions.invoke('cocartly-billing-checkout',{body:{seats,requestId,consent:true}});
  if(!S().isCurrent(token))throw Error('OWNER_CHANGED');if(result.error)throw result.error;
  const u=new URL(result.data?.url);if(u.origin!=='https://checkout.stripe.com'||u.username||u.password)throw Error('INVALID_CHECKOUT_URL');return u.href;
 }
 const COPY={
 ja:['Premiumの月額契約','契約人数','月額（税込）','有料の月額契約で自動更新になることを確認しました。支払情報はStripeの画面で入力します。','Stripeで支払い内容を確認','購入準備ができていません。ログイン・契約状態を確認してください。'],
 en:['Premium monthly subscription','People','Monthly total (tax included)','I understand this paid monthly subscription renews automatically. Payment details are entered on Stripe.','Review payment on Stripe','Checkout is unavailable. Check your account and subscription.'],
 ko:['Premium 월 구독','인원','월 합계(세금 포함)','유료 월 구독이 자동 갱신됨을 확인했습니다. 결제 정보는 Stripe에서 입력합니다.','Stripe에서 결제 확인','로그인·구독 상태를 확인하세요.'],
 'zh-CN':['Premium月度订阅','人数','每月总额（含税）','确认此付费月度订阅会自动续费，支付信息在Stripe输入。','前往Stripe确认支付','请检查登录与订阅状态。'],
 'zh-TW':['Premium月訂閱','人數','每月總額（含稅）','確認此付費月訂閱會自動續費，付款資訊在Stripe輸入。','前往Stripe確認付款','請檢查登入與訂閱狀態。'],
 fr:['Abonnement Premium mensuel','Personnes','Total mensuel (taxes comprises)','Je comprends que cet abonnement payant se renouvelle automatiquement. Les informations de paiement sont saisies sur Stripe.','Vérifier le paiement sur Stripe','Vérifiez votre compte et votre abonnement.']};
 const word=n=>(COPY[getCocartlyLanguage()]||COPY.ja)[n];
 async function mount(root){const mine=++generation,token=S().snapshot();let ready;try{ready=await status();}catch(_){return;}if(!ready?.enabled||!S().isCurrent(token)||mine!==generation||root.hidden)return;
  const card=document.createElement('article'),heading=document.createElement('h3');heading.textContent=word(0);card.appendChild(heading);
  const label=document.createElement('label');label.textContent=word(1);const quantity=document.createElement('input');quantity.type='number';quantity.inputMode='numeric';quantity.min='1';quantity.max=String(ready.max_seats);quantity.value='1';label.appendChild(quantity);card.appendChild(label);
  const total=document.createElement('p');card.appendChild(total);const price=()=>{const n=Number(quantity.value);total.textContent=word(2)+': '+(Number.isSafeInteger(n)&&n>=1&&n<=ready.max_seats?String(380+(n-1)*300)+' JPY':'—');};quantity.oninput=price;price();
  const consentLabel=document.createElement('label'),consent=document.createElement('input');consent.type='checkbox';consentLabel.appendChild(consent);const text=document.createElement('span');text.textContent=word(3);consentLabel.appendChild(text);card.appendChild(consentLabel);
  const button=document.createElement('button');button.type='button';button.textContent=word(4);button.disabled=true;consent.onchange=()=>button.disabled=!consent.checked;const requestId=crypto.randomUUID();
  button.onclick=async()=>{if(!consent.checked)return;button.disabled=true;quantity.disabled=true;consent.disabled=true;try{const url=await checkout({seats:Number(quantity.value),requestId,consent:true});if(S().isCurrent(token)&&mine===generation&&!root.hidden)global.location.assign(url);}catch(_){if(S().isCurrent(token))global.alert(word(5));}finally{if(S().isCurrent(token)){button.disabled=!consent.checked;quantity.disabled=false;consent.disabled=false;}}};
  quantity.oninput=()=>{price();consent.checked=false;button.disabled=true;};card.appendChild(button);root.appendChild(card);
 }
 global.addEventListener('cocartly-auth-owner-changing',()=>{generation++;});
 global.CocartlyBilling=Object.freeze({status,checkout,mount});
})(window);
