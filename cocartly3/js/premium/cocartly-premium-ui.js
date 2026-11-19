/* Portrait UI, product identity uses IDs; textContent only for private data. */
(function(global){
 'use strict';
 const LANG={
 ja:['プランと端末','買い物セット','お出かけセット','← 設定へ戻る','Free：端末内保存・手動バックアップ／復元','Premiumは公開準備中です。無料体験は開始されません。','契約を確認できません。端末内データは保持しています。','別の端末が有効、または端末の登録が必要です。','7日間の無料体験を開始','この端末を有効にする','カード登録なし・自動課金なしで開始することを確認しました。','再確認','新しく作る','名前','保存','削除','編集','購入予定へ追加','戻る','数量','追加','既存の予定を維持','確認した内容を適用','現在の商品・プランが変わりました。もう一度確認してください。','未登録／削除済み商品','登録商品を選んでください。店舗が異なる同名商品は別の商品です。','現在のセットを複製','使用する','お出かけから保存','現在のデータは残ります。削除しますか？','処理を完了できませんでした。再ログイン・通信・契約状態を確認してください。','セット・お出かけの既存データはFreeでも閲覧・バックアップできます。これらの編集・新規作成にはPremiumが必要です。','旅行の準備','通院の準備','仕事の準備','運動の準備','財布','スマートフォン','鍵','飲み物','服薬情報','タオル'],
 en:['Plan and device','Shopping sets','Outing sets','← Back to settings','Free: local data and manual backup / restore','Premium is not public yet. No trial starts.','Could not verify your plan. Local data is kept.','Another device is active, or this device needs activation.','Start a 7-day free trial','Activate this device','I confirm: no card required and no automatic charge.','Refresh','Create new','Name','Save','Delete','Edit','Add to shopping plan','Back','Quantity','Add','Keep existing plans','Apply reviewed changes','Products or plan changed. Review again.','Missing / deleted product','Choose registered products. Same names at different stores are separate products.','Duplicate this set','Use','Save from outing','Your current records remain. Delete this set?','Could not complete. Check sign-in, connection and plan.','Free keeps viewing and backups of sets and outings. Editing and creating these require Premium.','Travel preparation','Clinic preparation','Work preparation','Exercise preparation','Wallet','Phone','Keys','Drink','Medication information','Towel'],
 ko:['요금제·기기','쇼핑 세트','외출 세트','← 설정으로','Free: 기기 저장·수동 백업/복원','Premium 공개 준비 중입니다. 체험은 시작되지 않습니다.','요금제 확인 실패. 기기 데이터는 유지됩니다.','다른 기기가 활성화되었거나 기기 등록이 필요합니다.','7일 무료 체험 시작','이 기기 활성화','카드 등록과 자동 결제가 없음을 확인했습니다.','다시 확인','새로 만들기','이름','저장','삭제','편집','쇼핑 예정에 추가','뒤로','수량','추가','기존 예정 유지','확인한 변경 적용','상품·요금제가 바뀌었습니다. 다시 확인하세요.','없거나 삭제된 상품','등록 상품을 선택하세요. 다른 매장의 동명 상품은 별개입니다.','세트 복제','사용','외출에서 저장','현재 기록은 유지됩니다. 세트를 삭제할까요?','로그인·연결·요금제를 확인하세요.','세트·외출은 Free에서 보기·백업 가능. 이 기능의 편집·생성은 Premium입니다.','여행 준비','진료 준비','업무 준비','운동 준비','지갑','휴대전화','열쇠','음료','복약 정보','수건'],
 'zh-CN':['套餐与设备','购物套组','出行套组','← 返回设置','Free：本机保存与手动备份/恢复','Premium尚未公开，不会开始试用。','无法验证套餐。本机数据已保留。','其他设备有效，或需激活此设备。','开始7天免费试用','激活此设备','确认无需银行卡且不会自动扣费。','重新检查','新建','名称','保存','删除','编辑','加入购物计划','返回','数量','新增','保留现有计划','应用已确认更改','商品或套餐已改变，请重新确认。','缺少或已删除商品','选择已登记商品。不同店的同名商品分别处理。','复制套组','使用','从出行保存','现有记录保留。删除套组？','请检查登录、网络及套餐。','Free可查看和备份套组及出行。编辑与新建这些数据需要Premium。','旅行准备','就医准备','工作准备','运动准备','钱包','手机','钥匙','饮料','用药信息','毛巾'],
 'zh-TW':['方案與裝置','購物套組','出遊套組','← 返回設定','Free：本機儲存與手動備份/還原','Premium尚未公開，不會開始試用。','無法驗證方案。本機資料已保留。','其他裝置有效，或需啟用此裝置。','開始7天免費試用','啟用此裝置','確認無需信用卡且不會自動扣款。','重新確認','新增','名稱','儲存','刪除','編輯','加入購物計畫','返回','數量','新增','保留現有計畫','套用已確認變更','商品或方案已變更，請重新確認。','缺少或已刪除商品','選擇已登記商品。不同店的同名商品分別處理。','複製套組','使用','從出遊儲存','現有紀錄保留。刪除套組？','請檢查登入、網路及方案。','Free可檢視與備份套組及出遊。編輯與新增這些資料需要Premium。','旅行準備','就醫準備','工作準備','運動準備','錢包','手機','鑰匙','飲料','用藥資訊','毛巾'],
 fr:['Offre et appareil','Listes types','Modèles de sortie','← Réglages','Free : données locales et sauvegarde / restauration manuelle','Premium n’est pas encore ouvert. Aucun essai ne démarre.','Offre non vérifiée. Données locales conservées.','Un autre appareil est actif, ou cet appareil doit être activé.','Démarrer un essai gratuit de 7 jours','Activer cet appareil','Je confirme : sans carte et sans prélèvement automatique.','Actualiser','Créer','Nom','Enregistrer','Supprimer','Modifier','Ajouter aux achats prévus','Retour','Quantité','Ajouter','Conserver les achats existants','Appliquer les changements vérifiés','Produits ou offre modifiés. Vérifiez à nouveau.','Produit absent / supprimé','Choisissez des produits enregistrés. Les produits de même nom dans des magasins différents restent distincts.','Dupliquer','Utiliser','Enregistrer une sortie','Les éléments actuels restent. Supprimer ce modèle ?','Vérifiez connexion, compte et offre.','Free permet consultation et sauvegarde des listes types et sorties. Leur création et modification nécessitent Premium.','Préparer un voyage','Préparer une consultation','Préparer le travail','Préparer le sport','Portefeuille','Téléphone','Clés','Boisson','Informations sur les médicaments','Serviette']
 };
 const EXTRA={
  ja:['持ち物','家にある物','購入する物','登録商品との関連付け','関連付けなし','お出かけの種類','繰り返し','日付を指定','日付','項目を削除','持ち物を追加','区分'],
  en:['Item','Already at home','To purchase','Linked product','No linked product','Outing type','Repeating','Choose a date','Date','Remove item','Add an item','Item type'],
  ko:['준비물','집에 있는 물건','구매할 물건','연결 상품','연결 없음','외출 유형','반복','날짜 지정','날짜','항목 삭제','준비물 추가','물품 구분'],
  'zh-CN':['物品','家中已有','需要购买','关联商品','不关联商品','出行类型','重复使用','指定日期','日期','删除物品','添加物品','物品类型'],
  'zh-TW':['物品','家中已有','需要購買','關聯商品','不關聯商品','出遊類型','重複使用','指定日期','日期','刪除物品','新增物品','物品類型'],
  fr:['Objet','Déjà à la maison','À acheter','Produit associé','Aucun produit associé','Type de sortie','Répétée','Choisir une date','Date','Retirer cet objet','Ajouter un objet','Catégorie']
 };
 const word=n=>{const language=typeof getCocartlyLanguage==='function'?getCocartlyLanguage():'ja';return n<42?(LANG[language]||LANG.ja)[n]:(EXTRA[language]||EXTRA.ja)[n-42];};
 const S=()=>CocartlyOwnerStorage,now=()=>new Date().toISOString(),id=()=>crypto.randomUUID();
 const read=k=>JSON.parse(S().getItem(k)||'[]'), key=kind=>kind==='shopping'?'cocartlyShoppingSets':'cocartlyOutingSets';
 const REFRESH_COPY={
  ja:['プランを確認しています…','プランを確認しました。','プランを確認できませんでした。端末内データは保持しています。','ゲストはFreeで利用できます。'],
  en:['Checking your plan…','Your plan has been checked.','Could not check your plan. Local data is kept.','Guests can use Free.'],
  ko:['요금제를 확인하고 있습니다…','요금제를 확인했습니다.','요금제 확인 실패. 기기 데이터는 유지됩니다.','게스트는 Free를 이용할 수 있습니다.'],
  'zh-CN':['正在确认套餐…','已确认套餐。','无法确认套餐。本机数据已保留。','访客可以使用Free。'],
  'zh-TW':['正在確認方案…','已確認方案。','無法確認方案。本機資料已保留。','訪客可以使用Free。'],
  fr:['Vérification de l’offre…','Offre vérifiée.','Offre non vérifiée. Données locales conservées.','Les invités peuvent utiliser Free.']
 };
 const refreshWord=n=>(REFRESH_COPY[getCocartlyLanguage()]||REFRESH_COPY.ja)[n];
 const DISCOVERY={
  ja:{menu:'Free／Premiumと使える機能',discover:'Premiumでできること',tools:'Premiumの機能を開く',intro:'いつもの買い物と、お出かけの準備をもっと手軽に。',free:'Freeでできること',freeBody:'商品登録・購入予定・履歴と価格比較・手動バックアップ／復元は無料で使えます。',guest:'ゲストで利用中 · Free',account:'ログインして利用中 · Free',paid:'この端末でPremiumを利用できます',unknown:'プランを確認できません。端末内データは保持しています。',features:'Premiumで便利になること',examples:'使い方の例を見る',sample:'使い方の例です。商品や履歴を保存・変更する操作は行いません。',where:'使う場所',saved:'保存済みの内容を閲覧',manage:'プラン・利用端末の確認',family:'家族プラン',trial:'無料体験は本人1人の機能が対象です。家族共有は有料の家族プランで利用できます。',device:'同期・復元の進め方',
   cards:[
    ['買い物セット','よく買う商品をまとめて、購入予定を作る手間を減らします。','購入予定 → 買い物セット','牛乳・卵などを「いつもの買い物」に保存。','セットを選び、今回の数量を確認。','追加内容を確認して購入予定へ入れます。既存の予定は残ります。'],
    ['お出かけチェック・準備セット','旅行・通院・仕事の持ち物を、毎回ゼロから書かずに準備できます。','ホーム → お出かけチェック → お出かけセット','財布・鍵・飲み物などを準備セットに保存。','繰り返し用、または日付指定のお出かけを作成。','持ち物を確認して「準備済み」へ変更します。'],
    ['家族共有・担当者','誰が何を買うかを分け、家族の買い物状況を確認できます。','設定 → Free／Premiumと使える機能 → 家族共有','契約者を含め最大6人。各人が別のアカウントを使います。','共有する商品と、価格・購入先・メモなどの共有範囲を確認して同意。','担当者と購入状態を変更します。個人の商品・履歴全体は共有しません。'],
    ['本人のクラウド同期・復元','端末の紛失・故障や機種変更に備え、本人のデータをクラウドに保存します。','本人でログイン → プラン・利用端末の確認','新しいスマートフォンで本人のアカウントにログイン。','利用する端末を確認します。有効端末は1人1台です。','契約と通信状態を確認して本人のデータを復元します。']
   ]},
  en:{menu:'Free / Premium and features',discover:'What Premium offers',tools:'Open Premium features',intro:'Make everyday shopping and outing preparation easier.',free:'Included with Free',freeBody:'Products, shopping plans, history and price comparison, plus manual backup / restore remain free.',guest:'Guest · Free',account:'Signed in · Free',paid:'Premium is available on this device',unknown:'Could not verify your plan. Local data is kept.',features:'Make more of Premium',examples:'See how it works',sample:'These are examples only. They do not save or change products or history.',where:'Where to find it',saved:'View saved data',manage:'Plan and active device',family:'Family plan',trial:'The trial covers personal features for one person. Family sharing requires a paid family plan.',device:'Sync and restore steps',
   cards:[['Shopping sets','Group regular purchases to build shopping plans with less typing.','Shopping plan → Shopping sets','Save milk and eggs in a weekly set.','Choose the set and check quantities for this trip.','Review the additions and add them to your plan. Existing plans are kept.'],['Outing checklists and sets','Reuse packing lists for travel, appointments and work.','Home → Outing checklist → Outing sets','Save your wallet, keys and drink in a preparation set.','Create a repeating outing or choose a date.','Check each item and mark it ready.'],['Family sharing and assignees','See who is buying what and keep track of shared shopping.','Settings → Free / Premium and features → Family sharing','Up to six people including the payer, each with a separate account.','Review and consent to the products and optional price, store and note you share.','Set assignees and purchase status. Personal product and history masters are not shared.'],['Personal cloud sync and restore','Keep your own data in the cloud for device changes, loss or damage.','Sign in as yourself → Plan and active device','Sign in to your own account on the new phone.','Check the active device. One active device per person.','Verify your plan and connection, then restore your own data.']]},
  ko:{menu:'Free / Premium과 기능',discover:'Premium으로 할 수 있는 일',tools:'Premium 기능 열기',intro:'평소 쇼핑과 외출 준비를 더 간편하게.',free:'Free 기본 기능',freeBody:'상품 등록·쇼핑 예정·기록과 가격 비교·수동 백업/복원은 무료입니다.',guest:'게스트 · Free',account:'로그인 상태 · Free',paid:'이 기기에서 Premium 이용 가능',unknown:'요금제를 확인할 수 없습니다. 기기 데이터는 유지됩니다.',features:'Premium의 편리한 기능',examples:'사용 예 보기',sample:'사용 예입니다. 상품이나 기록을 저장·변경하지 않습니다.',where:'기능 위치',saved:'저장된 내용 보기',manage:'요금제·활성 기기 확인',family:'가족 요금제',trial:'무료 체험은 본인 1명의 개인 기능입니다. 가족 공유는 유료 가족 요금제에서 이용합니다.',device:'동기화·복원 방법',
   cards:[['쇼핑 세트','자주 사는 상품을 묶어 쇼핑 예정 입력을 줄입니다.','쇼핑 예정 → 쇼핑 세트','우유·달걀 등을 정기 쇼핑 세트로 저장.','세트를 고르고 이번 수량을 확인.','추가 내용을 확인해 쇼핑 예정에 넣습니다. 기존 예정은 유지됩니다.'],['외출 체크·준비 세트','여행·진료·업무 준비물을 매번 새로 쓰지 않아도 됩니다.','홈 → 외출 체크 → 외출 세트','지갑·열쇠·음료를 준비 세트로 저장.','반복 외출 또는 날짜 지정 외출을 생성.','준비물을 확인해 준비 완료로 변경합니다.'],['가족 공유·담당자','누가 무엇을 살지 정하고 가족 쇼핑 상황을 확인합니다.','설정 → Free / Premium과 기능 → 가족 공유','결제자를 포함해 최대 6명, 각자 별도 계정을 사용합니다.','상품과 가격·매장·메모의 공유 범위를 확인하고 동의.','담당자와 구매 상태를 변경합니다. 개인 상품·기록 전체는 공유하지 않습니다.'],['개인 클라우드 동기화·복원','분실·고장·기기 변경에 대비해 본인 데이터를 클라우드에 보관합니다.','본인 로그인 → 요금제·활성 기기 확인','새 휴대전화에서 본인 계정으로 로그인.','활성 기기는 1인 1대입니다.','요금제와 연결을 확인하고 본인 데이터를 복원합니다.']]},
  'zh-CN':{menu:'Free / Premium与功能',discover:'了解Premium功能',tools:'打开Premium功能',intro:'让日常购物和出行准备更轻松。',free:'Free基本功能',freeBody:'商品登记、购物计划、历史与价格比较、手动备份/恢复均可免费使用。',guest:'访客 · Free',account:'已登录 · Free',paid:'此设备可使用Premium',unknown:'无法确认套餐。本机数据已保留。',features:'Premium带来的便利',examples:'查看使用示例',sample:'以下仅为使用示例，不会保存或更改商品与历史。',where:'功能位置',saved:'查看已保存内容',manage:'确认套餐与有效设备',family:'家庭套餐',trial:'免费试用仅适用于本人一人的个人功能。家人共享需付费家庭套餐。',device:'同步与恢复步骤',
   cards:[['购物套组','把常购商品组成套组，减少购物计划的重复输入。','购物计划 → 购物套组','把牛奶、鸡蛋存为日常购物套组。','选择套组，确认本次数量。','确认后加入购物计划，原有计划保持不变。'],['出行检查与准备套组','重复使用旅行、就医或工作的物品清单。','主页 → 出行检查 → 出行套组','把钱包、钥匙、饮料存为准备套组。','创建重复使用或指定日期的出行。','确认物品并标记为准备完成。'],['家人共享与负责人','分配谁购买什么，确认家人的购物进度。','设置 → Free / Premium与功能 → 家人共享','含付款人在内最多6人，每人使用独立账户。','确认商品及价格、店名、备注等共享范围并同意。','更改负责人和购买状态，不会共享全部个人商品与历史。'],['个人云同步与恢复','将本人数据保存在云端，为设备更换、遗失或损坏做准备。','本人登录 → 确认套餐与有效设备','在新手机登录本人账户。','确认有效设备，每人限一台。','确认套餐及网络后恢复本人的数据。']]},
  'zh-TW':{menu:'Free / Premium與功能',discover:'了解Premium功能',tools:'開啟Premium功能',intro:'讓日常購物與出遊準備更輕鬆。',free:'Free基本功能',freeBody:'商品登記、購物計畫、紀錄與價格比較、手動備份/還原均可免費使用。',guest:'訪客 · Free',account:'已登入 · Free',paid:'此裝置可使用Premium',unknown:'無法確認方案。本機資料已保留。',features:'Premium帶來的便利',examples:'查看使用範例',sample:'以下僅為使用範例，不會儲存或更改商品與紀錄。',where:'功能位置',saved:'檢視已儲存內容',manage:'確認方案與有效裝置',family:'家庭方案',trial:'免費試用僅適用於本人一人的個人功能。家人共享需付費家庭方案。',device:'同步與還原步驟',
   cards:[['購物套組','將常購商品組成套組，減少購物計畫的重複輸入。','購物計畫 → 購物套組','將牛奶、雞蛋存為日常購物套組。','選擇套組，確認本次數量。','確認後加入購物計畫，原有計畫保持不變。'],['出遊檢查與準備套組','重複使用旅行、就醫或工作的物品清單。','首頁 → 出遊檢查 → 出遊套組','將錢包、鑰匙、飲料存為準備套組。','建立重複使用或指定日期的出遊。','確認物品並標記為準備完成。'],['家人共享與負責人','分配誰購買什麼，確認家人的購物進度。','設定 → Free / Premium與功能 → 家人共享','含付款人在內最多6人，每人使用獨立帳戶。','確認商品及價格、店名、備註等共享範圍並同意。','更改負責人和購買狀態，不會共享全部個人商品與紀錄。'],['個人雲端同步與還原','將本人資料保存在雲端，為裝置更換、遺失或損壞做準備。','本人登入 → 確認方案與有效裝置','在新手機登入本人帳戶。','確認有效裝置，每人限一台。','確認方案及網路後還原本人的資料。']]},
  fr:{menu:'Free / Premium et fonctionnalités',discover:'Découvrir Premium',tools:'Ouvrir les fonctions Premium',intro:'Simplifiez vos courses et la préparation de vos sorties.',free:'Inclus avec Free',freeBody:'Produits, achats prévus, historique, comparaison de prix et sauvegarde / restauration manuelle restent gratuits.',guest:'Invité · Free',account:'Connecté · Free',paid:'Premium est disponible sur cet appareil',unknown:'Offre non vérifiée. Données locales conservées.',features:'Les avantages de Premium',examples:'Voir un exemple',sample:'Ces exemples ne sauvegardent ni ne modifient vos produits ou votre historique.',where:'Où trouver la fonction',saved:'Consulter les données enregistrées',manage:'Offre et appareil actif',family:'Offre familiale',trial:'L’essai concerne les fonctions personnelles d’une seule personne. Le partage nécessite une offre familiale payante.',device:'Synchronisation et restauration',
   cards:[['Listes types','Regroupez vos achats habituels pour réduire la saisie des courses.','Achats prévus → Listes types','Enregistrez le lait et les œufs dans une liste habituelle.','Choisissez la liste et vérifiez les quantités.','Vérifiez les ajouts avant de les appliquer. Les achats existants restent.'],['Listes de sortie et modèles','Réutilisez vos préparatifs de voyage, de consultation ou de travail.','Accueil → Sorties → Modèles de sortie','Enregistrez portefeuille, clés et boisson dans un modèle.','Créez une sortie répétée ou choisissez une date.','Vérifiez les objets et marquez-les prêts.'],['Partage familial et responsables','Répartissez les achats et suivez leur état avec votre famille.','Réglages → Free / Premium et fonctionnalités → Partage familial','Six personnes maximum, payeur inclus, avec un compte distinct par personne.','Vérifiez et acceptez les produits, prix, magasins et notes à partager.','Attribuez les achats et changez leur état. Vos produits et historiques personnels ne sont pas partagés en totalité.'],['Synchronisation et restauration personnelles','Conservez vos données dans le cloud en cas de changement, perte ou panne du téléphone.','Connexion personnelle → Offre et appareil actif','Connectez-vous à votre propre compte sur le nouveau téléphone.','Vérifiez l’appareil actif : un par personne.','Vérifiez offre et connexion, puis restaurez vos propres données.']]}
 };
 const guideCopy=()=>DISCOVERY[getCocartlyLanguage()]||DISCOVERY.ja;
 const SHOPPING_HELP={
  ja:{name:'セット名',placeholder:'例：コーヒーの買い置き',title:'買い物セットの使い方',back:'← 機能一覧へ戻る',open:'買い物セットを開く',select:'買う商品にチェックを付け、その商品の数量を入力してください。同名でも購入先が異なる商品は別に選びます。',steps:['「新しく作る」を押し、セット名に「コーヒーの買い置き」などと入力します。商品をまとめるための名前です。','商品をチェックします。例では、購入先１と購入先２に同じ名前のコーヒーが登録されています。購入先ごとに別の商品として、片方だけでも両方でも選べます。一覧には自分で登録した商品が並びます。','選んだ商品の数量を入力します。例：購入先１の商品を1個、購入先２の商品を2個。選んでいない商品の数量は入力しません。','「保存」でセットを作ります。この時点では購入予定への追加や、購入履歴の記録は行いません。','保存したセットの「購入予定へ追加」→「再確認」で内容を確認し、確認チェック→「確認した内容を適用」で追加します。既存の購入予定はそのまま残します。']},
  en:{name:'Set name',placeholder:'Example: coffee restock',title:'How to use shopping sets',back:'← Back to features',open:'Open shopping sets',select:'Check the products you want, then enter their quantities. Products with the same name at different stores are separate choices.',steps:['Choose Create new and enter a set name, such as Coffee restock. This names the group, not a product.','Check the products. In this example, two coffees have the same name but different stores. Choose one or both as separate products. Your registered products appear in the list.','Enter a quantity for each selected product, for example one from store 1 and two from store 2. Unselected quantities are disabled.','Save the set. Saving does not add shopping plans or record a purchase yet.','Choose Add to shopping plan, review the additions, tick the confirmation and apply. Existing shopping plans are kept.']},
  ko:{name:'세트 이름',placeholder:'예: 커피 재구매',title:'쇼핑 세트 사용법',back:'← 기능 목록으로',open:'쇼핑 세트 열기',select:'살 상품을 체크하고 수량을 입력하세요. 이름이 같아도 매장이 다르면 별개 상품입니다.',steps:['새로 만들기를 누르고 커피 재구매 같은 세트 이름을 입력합니다. 상품을 묶는 이름입니다.','상품을 체크합니다. 예에서는 같은 이름의 커피가 서로 다른 매장에 등록되어 있습니다. 별개 상품으로 하나 또는 둘 다 선택합니다. 목록에는 본인의 등록 상품이 나옵니다.','선택 상품의 수량을 입력합니다. 예: 매장1 상품 1개, 매장2 상품 2개. 미선택 상품의 수량은 입력하지 않습니다.','저장하면 세트가 생성됩니다. 아직 쇼핑 예정 추가나 구매 기록 저장은 하지 않습니다.','쇼핑 예정에 추가, 내용 확인, 동의 체크, 적용 순으로 진행합니다. 기존 쇼핑 예정은 유지됩니다.']},
  'zh-CN':{name:'套组名称',placeholder:'例：咖啡补货',title:'购物套组使用方法',back:'← 返回功能列表',open:'打开购物套组',select:'勾选要购买的商品，再输入数量。同名但购买店不同的商品需要分别选择。',steps:['点击新建，输入咖啡补货等套组名称。它是这一组商品的名称。','勾选商品。示例中的两款咖啡同名但来自不同店铺，可分别选择一个或两个。列表显示您自己登记的商品。','输入所选商品数量，例如店1商品1个、店2商品2个。未选商品不输入数量。','点击保存以创建套组。此时不会加入购物计划，也不会记录购买历史。','点击加入购物计划，确认内容，勾选确认后应用。原有购物计划保持不变。']},
  'zh-TW':{name:'套組名稱',placeholder:'例：咖啡補貨',title:'購物套組使用方法',back:'← 返回功能列表',open:'開啟購物套組',select:'勾選要購買的商品，再輸入數量。同名但購買店不同的商品需要分別選擇。',steps:['點選新增，輸入咖啡補貨等套組名稱。它是這一組商品的名稱。','勾選商品。範例中的兩款咖啡同名但來自不同店鋪，可分別選擇一個或兩個。清單顯示您自己登記的商品。','輸入所選商品數量，例如店1商品1個、店2商品2個。未選商品不輸入數量。','點選儲存以建立套組。此時不會加入購物計畫，也不會記錄購買紀錄。','點選加入購物計畫，確認內容，勾選確認後套用。原有購物計畫保持不變。']},
  fr:{name:'Nom de la liste type',placeholder:'Exemple : réserve de café',title:'Utiliser les listes types',back:'← Retour aux fonctions',open:'Ouvrir les listes types',select:'Cochez les produits à acheter, puis indiquez les quantités. Un même nom dans deux magasins correspond à deux produits distincts.',steps:['Choisissez Créer et donnez un nom au groupe, par exemple Réserve de café. Ce n’est pas le nom d’un produit.','Cochez les produits. Dans cet exemple, les deux cafés portent le même nom mais viennent de magasins différents. Choisissez-en un ou les deux comme produits distincts. La liste affiche vos produits enregistrés.','Indiquez les quantités choisies, par exemple un au magasin 1 et deux au magasin 2. Les quantités non sélectionnées sont désactivées.','Enregistrez la liste type. Cela n’ajoute pas encore d’achat prévu et ne crée pas d’historique d’achat.','Ajoutez aux achats prévus, vérifiez le résultat, cochez la confirmation puis appliquez. Les achats existants sont conservés.']}
 };
 const shoppingHelp=()=>SHOPPING_HELP[getCocartlyLanguage()]||SHOPPING_HELP.ja;
 const DEVICE_HELP={
  ja:{title:'この端末の状態',ready:'この端末は有効です。',readyBody:'普段はそのまま商品登録や買い物を続けてください。オンラインでの変更は自動同期の対象になります。毎回ここで操作する必要はありません。',activate:'この端末の登録が必要です。',activateBody:'本人のスマートフォンとして使う場合は「この端末を有効にする」を押してください。有効にできる端末は1人1台です。',unknown:'契約・通信・利用端末の状態を確認できません。オンラインで「再確認」してください。端末内データは保持しています。',free:'クラウド同期・復元はPremiumの機能です。Freeでは端末内保存と手動バックアップ／復元を使えます。',guest:'現在はゲストです。本人のクラウドデータを使うには、データを保存した本人のアカウントでログインする必要があります。',pending:'Premiumは公開準備中です。この段階ではクラウドの利用開始操作はできません。',newPhone:'機種変更・別のスマートフォンで使う場合',meaning:'「端末が有効」という表示は、同期・復元が完了したことを示すものではありません。',steps:['新しいスマートフォンで、以前と同じ本人のアカウントにログインします。新しい別アカウントは作りません。','端末登録を求められた場合は「この端末を有効にする」を選びます。同じ本人の有効端末は1台です。','ログイン・端末の有効化後に行われる復元処理の画面案内に従い、商品・履歴・購入先が自分のものか確認して使い始めます。']},
  en:{title:'This device',ready:'This device is active.',readyBody:'Continue registering products and shopping as usual. Online changes are included in automatic sync. You do not need to operate this screen each time.',activate:'This device needs activation.',activateBody:'To use this phone as your own active device, choose Activate this device. One active device is allowed per person.',unknown:'Could not verify the plan, connection or device. Go online and refresh. Local data is kept.',free:'Cloud sync and restore require Premium. Free includes local storage and manual backup / restore.',guest:'You are a guest. To use your cloud data, sign in to the same account that saved it.',pending:'Premium is not public yet. Cloud activation is not available at this stage.',newPhone:'Changing phones or using another phone',meaning:'An active device does not mean that sync or restore has completed.',steps:['Sign in to the same personal account on the new phone. Do not create a different account.','If activation is requested, choose Activate this device. One device can be active for the same person.','Follow the restore messages after sign-in or activation. Check that the products, history and stores belong to you before continuing.']},
  ko:{title:'이 기기의 상태',ready:'이 기기가 활성화되어 있습니다.',readyBody:'평소처럼 상품 등록과 쇼핑을 계속하세요. 온라인 변경은 자동 동기화 대상입니다. 매번 이 화면에서 조작할 필요는 없습니다.',activate:'기기 등록이 필요합니다.',activateBody:'본인의 활성 기기로 사용하려면 이 기기 활성화를 누르세요. 활성 기기는 1인 1대입니다.',unknown:'요금제·연결·기기를 확인할 수 없습니다. 온라인에서 다시 확인하세요. 기기 데이터는 유지됩니다.',free:'클라우드 동기화·복원은 Premium입니다. Free는 기기 저장과 수동 백업/복원을 이용합니다.',guest:'현재 게스트입니다. 클라우드 데이터를 저장했던 본인 계정으로 로그인해야 합니다.',pending:'Premium 공개 준비 중입니다. 현재 클라우드 활성화는 할 수 없습니다.',newPhone:'휴대전화 변경·다른 휴대전화에서 이용',meaning:'기기 활성화 표시는 동기화·복원이 끝났다는 의미가 아닙니다.',steps:['새 휴대전화에서 이전과 같은 본인 계정으로 로그인합니다. 다른 계정을 새로 만들지 않습니다.','기기 등록을 요청하면 이 기기 활성화를 선택합니다. 본인의 활성 기기는 1대입니다.','로그인·활성화 후 복원 안내를 따르고 상품·기록·매장이 본인 데이터인지 확인합니다.']},
  'zh-CN':{title:'此设备状态',ready:'此设备已生效。',readyBody:'可照常登记商品和购物。在线更改属于自动同步范围，无需每次操作此画面。',activate:'需要登记此设备。',activateBody:'如需将此手机作为本人的有效设备，请点击激活此设备。每人限一台有效设备。',unknown:'无法确认套餐、网络或设备。请联网重新检查。本机数据已保留。',free:'云同步与恢复需要Premium。Free可使用本机保存与手动备份/恢复。',guest:'当前为访客。要使用本人云端数据，需登录原来保存数据的本人账户。',pending:'Premium尚未公开，此阶段无法开始云端使用。',newPhone:'更换手机或使用另一台手机',meaning:'设备有效不代表同步或恢复已完成。',steps:['在新手机登录原来的本人账户，不要创建另一个账户。','如提示登记设备，选择激活此设备。同一人限一台有效设备。','按登录或激活后的恢复提示操作，确认商品、历史和店铺属于本人后开始使用。']},
  'zh-TW':{title:'此裝置狀態',ready:'此裝置已生效。',readyBody:'可照常登記商品和購物。線上變更屬於自動同步範圍，無需每次操作此畫面。',activate:'需要登記此裝置。',activateBody:'如需將此手機作為本人的有效裝置，請點選啟用此裝置。每人限一台有效裝置。',unknown:'無法確認方案、網路或裝置。請連線重新確認。本機資料已保留。',free:'雲端同步與還原需要Premium。Free可使用本機儲存與手動備份/還原。',guest:'目前為訪客。要使用本人雲端資料，需登入原來儲存資料的本人帳戶。',pending:'Premium尚未公開，此階段無法開始雲端使用。',newPhone:'更換手機或使用另一台手機',meaning:'裝置有效不代表同步或還原已完成。',steps:['在新手機登入原來的本人帳戶，不要建立另一個帳戶。','如提示登記裝置，選擇啟用此裝置。同一人限一台有效裝置。','依登入或啟用後的還原提示操作，確認商品、紀錄和店鋪屬於本人後開始使用。']},
  fr:{title:'État de cet appareil',ready:'Cet appareil est actif.',readyBody:'Continuez à enregistrer des produits et à faire vos courses. Les modifications en ligne sont concernées par la synchronisation automatique. Aucune action répétée ici n’est nécessaire.',activate:'Cet appareil doit être activé.',activateBody:'Pour utiliser ce téléphone comme appareil personnel actif, choisissez Activer cet appareil. Un appareil actif par personne.',unknown:'Offre, connexion ou appareil non vérifié. Connectez-vous au réseau et actualisez. Données locales conservées.',free:'La synchronisation et la restauration cloud nécessitent Premium. Free permet le stockage local et la sauvegarde / restauration manuelle.',guest:'Vous êtes invité. Connectez-vous au compte personnel qui a enregistré vos données dans le cloud.',pending:'Premium n’est pas encore ouvert. L’activation cloud n’est pas disponible à ce stade.',newPhone:'Changer de téléphone ou utiliser un autre téléphone',meaning:'Un appareil actif ne signifie pas que la synchronisation ou la restauration est terminée.',steps:['Sur le nouveau téléphone, connectez-vous au même compte personnel, sans créer un autre compte.','Si une activation est demandée, choisissez Activer cet appareil. Un seul appareil actif pour la même personne.','Suivez les indications de restauration après la connexion ou l’activation, puis vérifiez vos produits, achats et magasins avant de continuer.']}
 };
 function renderDeviceGuide(panel){
  panel.replaceChildren();const d=DEVICE_HELP[getCocartlyLanguage()]||DEVICE_HELP.ja,p=CocartlyPremium.snapshot();let state='unknown';
  if(S().getOwner()==='guest')state='guest';else if(p&&!p.error&&p.release==='free-only')state='pending';else if(p&&!p.error&&p.eligible&&!p.device_ok)state='activate';else if(CocartlyPremium.canCloud())state='ready';else if(p&&!p.error&&!p.eligible)state='free';
  panel.setAttribute('data-device-guide-state',state);node('h3',d.title,panel);const current=node('p',d[state],panel);current.setAttribute('role','status');
  if(state==='ready'){node('p',d.readyBody,panel);node('p',d.meaning,panel);}
  if(state==='activate'){node('p',d.activateBody,panel);button(panel,word(9),()=>action(async token=>{await CocartlyPremium.activateDevice();if(S().isCurrent(token))open('device');}));}
  node('h3',d.newPhone,panel);const steps=node('ol',undefined,panel);for(const step of d.steps)node('li',step,steps);
 }
 function currentPlanLabel(){const g=guideCopy(),p=CocartlyPremium.snapshot();return S().getOwner()==='guest'?g.guest:featureAllowed('outing')?g.paid:!p||p.error?g.unknown:p.eligible&&!p.device_ok?'Premium · '+word(7):p.eligible?g.unknown:g.account;}
 const FEATURE_KEYS=['shopping','outing','family','cloud'];
 function premiumBadge(parent,label='Premium'){const value=node('span',label,parent);value.className='cocartly-premium-badge';return value;}
 function featureAllowed(key){return CocartlyPremium.allowed({shopping:'shopping-sets',outing:'outing-edit',family:'family-share',cloud:'cloud'}[key]);}
 function openFeature(key){if(key==='shopping')list('shopping');else if(key==='outing')global.openCheck();else if(key==='family')global.CocartlyFamilyUI.open();else open('device');}
 function hasSaved(key){try{return key==='shopping'?read('cocartlyShoppingSets').some(s=>s.active!==false):key==='outing'?read('outings').some(s=>s.active!==false):key==='family'?!!global.CocartlyFamily?.cached():false;}catch(_){return false;}}
 function featureExample(key){
  const g=guideCopy(),index=FEATURE_KEYS.indexOf(key);if(index<0)return;const feature=g.cards[index],help=shoppingHelp(),root=screen('premiumScreen',key==='shopping'?help.title:feature[0],open,key==='shopping'?help.back:word(18));premiumBadge(root,key==='family'?'Premium · '+g.family:'Premium');node('p',g.sample,root);node('p',feature[1],root);node('p',g.where+': '+feature[2],root);const steps=node('ol',undefined,root);for(const step of key==='shopping'?help.steps:feature.slice(3))node('li',step,steps);
  if(featureAllowed(key))button(root,key==='cloud'?g.device:key==='shopping'?help.open:feature[0],()=>featureAllowed(key)?openFeature(key):open());
 }
 function featureCards(root){const g=guideCopy();node('h3',g.features,root);for(let i=0;i<FEATURE_KEYS.length;i++){
  const key=FEATURE_KEYS[i],feature=g.cards[i],card=node('article',undefined,root);card.className='cocartly-feature-card';card.setAttribute('data-premium-feature',key);premiumBadge(card,key==='family'?'Premium · '+g.family:'Premium');node('h3',feature[0],card);node('p',feature[1],card);const where=node('p',g.where+': '+feature[2],card);where.className='cocartly-feature-location';const example=button(card,g.examples,()=>featureExample(key));example.setAttribute('aria-label',feature[0]+' · '+g.examples);
  if(featureAllowed(key))button(card,key==='cloud'?g.device:key==='shopping'?shoppingHelp().open:feature[0],()=>featureAllowed(key)?openFeature(key):featureExample(key));
  else if(hasSaved(key))button(card,g.saved,()=>openFeature(key));
  if(key==='outing'&&featureAllowed(key))button(card,word(2),()=>list('outing'));
 }}
 let busy=false,operation=null,view=0;
 function node(tag,text,parent){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(parent)parent.appendChild(n);return n;}
 function button(parent,text,fn){const b=node('button',text,parent),owner=S().snapshot();b.type='button';b.onclick=(...args)=>{if(S().isCurrent(owner))return fn(...args);};return b;}
 function screen(which,title,back,backText=word(18)){view++;hideAllScreens();const root=document.getElementById(which);root.replaceChildren();root.hidden=false;button(root,backText,back);node('h2',title,root);global.scrollTo({top:0,behavior:'auto'});return root;}
 function message(error){global.alert(word(30));}
 async function action(fn){if(busy)return;busy=true;const mine={};operation=mine;const token=S().snapshot();try{await fn(token);}catch(e){if(S().isCurrent(token))message(e);}finally{if(operation===mine){operation=null;busy=false;}}}
 function open(feedback=null){
  const g=guideCopy(),root=screen('premiumScreen',g.menu,openSettings),p=CocartlyPremium.snapshot(),v=view;
  node('p',g.intro,root);const current=node('p',currentPlanLabel(),root);current.id='cocartlyPlanCurrent';current.className='cocartly-plan-current';current.setAttribute('role','status');if(p?.release==='free-only')node('p',word(5),root);
  const free=node('article',undefined,root);free.className='cocartly-free-summary';node('h3',g.free,free);node('p',g.freeBody,free);
  featureCards(root);node('p',word(31),root);
  const controls=node('details',undefined,root);controls.className='cocartly-plan-controls';controls.open=['device','success','failed','guest'].includes(feedback);node('summary',g.manage,controls);
  const status=node('p',p?.error?word(6):p?.release==='free-only'?word(5):p?.eligible&&!p?.device_ok?word(7):S().getOwner()==='guest'?g.guest:featureAllowed('outing')?g.paid:!p?g.unknown:g.account,controls);status.setAttribute('role','status');
  const deviceGuide=node('div',undefined,controls);deviceGuide.id='cocartlyDeviceGuide';renderDeviceGuide(deviceGuide);
  const notice=node('p',['success','failed','guest'].includes(feedback)?refreshWord({success:1,failed:2,guest:3}[feedback]):'',controls);notice.id='cocartlyPlanRefreshStatus';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.hidden=!['success','failed','guest'].includes(feedback);
  const reload=button(controls,word(11),()=>action(async token=>{
   reload.disabled=true;notice.hidden=false;notice.textContent=refreshWord(0);
   try{const result=await CocartlyPremium.refresh();if(S().isCurrent(token)&&view===v&&!root.hidden)open(S().getOwner()==='guest'?'guest':navigator.onLine&&result&&!result.error?'success':'failed');}
   catch(_){if(S().isCurrent(token)&&view===v&&!root.hidden){notice.textContent=refreshWord(2);reload.disabled=false;}}
  }));
  if(p&&!p.error&&(p.release==='premium-enabled'||(p.release==='test-only'&&p.cloud_gate_enforced===true))){
   node('p',g.trial,controls);
   if(!p.eligible){const label=node('label',undefined,controls),check=node('input',undefined,label);check.type='checkbox';node('span',word(10),label);const trial=button(controls,word(8),()=>action(async token=>{if(!check.checked)return;await CocartlyPremium.startTrial();if(S().isCurrent(token))open();}));trial.disabled=true;check.onchange=()=>trial.disabled=!check.checked;}
  }
  global.CocartlyBillingManagement?.mount(controls);
  if(feedback==='device')controls.scrollIntoView?.({block:'start',behavior:'auto'});
 }
 function write(kind,rows,expected,token){if(!CocartlyPremium.allowed(kind==='shopping'?'shopping-sets':'outing-sets'))throw Error('PREMIUM_REQUIRED');if(!S().isCurrent(token)||S().getItem(key(kind))!==expected)throw Error('DATA_CHANGED');S().applyBatch({[key(kind)]:JSON.stringify(rows)},token);notifyCocartlyDataChanged(kind==='shopping'?'shoppingSets':'outingSets');}
 function remove(kind,set){if(!CocartlyPremium.requireFeature(kind==='shopping'?'shopping-sets':'outing-sets')||!global.confirm(word(29)))return;action(()=>{const token=S().snapshot(),raw=S().getItem(key(kind)),rows=read(key(kind)),index=rows.findIndex(r=>r.id===set.id);if(index<0)throw Error('DATA_CHANGED');rows[index]={...rows[index],active:false,updatedAt:now()};write(kind,rows,raw,token);list(kind);});}
 function list(kind){
  const root=screen('premiumSetsScreen',word(kind==='shopping'?1:2),open);premiumBadge(root);node('p',word(31),root);
  const editable=CocartlyPremium.allowed(kind==='shopping'?'shopping-sets':'outing-sets');
  button(root,word(12),()=>kind==='shopping'?editShopping():editOuting()).disabled=!editable;
  for(const set of read(key(kind)).filter(s=>s.active!==false)){
   const card=node('article',undefined,root);node('h3',set.name,card);node('p',String(set.items?.length||0),card);for(const item of set.items||[]){const product=kind==='shopping'?read('shoppingSupportProducts').find(p=>String(p.id)===item.productId):null;node('p',(product?.name||item.name||word(24))+' × '+(item.quantity||1),card);}
   button(card,word(kind==='shopping'?17:27),()=>kind==='shopping'?previewShopping(set):useOuting(set)).disabled=!editable;
   button(card,word(16),()=>kind==='shopping'?editShopping(set):editOuting(set)).disabled=!editable;
   button(card,word(26),()=>duplicate(kind,set)).disabled=!editable;button(card,word(15),()=>remove(kind,set)).disabled=!editable;
  }
  if(kind==='outing'){
   for(let n=0;n<4;n++)button(root,word(32+n),()=>useOuting({name:word(32+n),items:[36,37,38,n===1?40:n===3?41:39].map(i=>({name:word(i),quantity:1,itemType:'home'}))})).disabled=!editable;
   for(const outing of read('outings').filter(o=>o.active!==false))button(root,word(28)+': '+outing.name,()=>saveOutingSet(outing)).disabled=!editable;
  }
 }
 function duplicate(kind,set){if(!CocartlyPremium.requireFeature(kind==='shopping'?'shopping-sets':'outing-sets'))return;action(()=>{const token=S().snapshot(),raw=S().getItem(key(kind)),rows=read(key(kind)),copy=structuredClone(set);copy.id=id();copy.createdAt=copy.updatedAt=now();copy.items=copy.items.map(item=>({...item,id:id()}));(kind==='shopping'?CocartlyPremiumCore.validateSet:CocartlyPremiumCore.validateOutingSet)(copy);rows.push(copy);write(kind,rows,raw,token);list(kind);});}
 function shoppingProductText(product,stores){const store=stores.find(s=>String(s.id)===String(product?.storeId));return (product?.name||word(24))+' / '+(store?.name||'—')+' / '+(store?.country||'—');}
 function shoppingChoice(root,text,quantity,checked,unavailable=false){
  const line=node('div',undefined,root);line.className='cocartly-set-item';const selection=node('label',undefined,line);selection.className='cocartly-set-choice';const check=node('input',undefined,selection);check.type='checkbox';check.checked=checked;check.disabled=unavailable;node('span',text,selection);
  const count=node('label',undefined,line);count.className='cocartly-set-quantity';node('span',word(19),count);const number=node('input',undefined,count);number.type='number';number.inputMode='numeric';number.min='1';number.max='9999';number.step='1';number.value=String(quantity);number.setAttribute('aria-label',word(19)+': '+text);number.disabled=!checked||unavailable;check.onchange=()=>number.disabled=!check.checked||unavailable;
  return {check,quantity:number};
 }
 function editShopping(set=null){
  if(!CocartlyPremium.requireFeature('shopping-sets'))return;
  const root=screen('premiumSetsScreen',word(1),()=>list('shopping')),token=S().snapshot(),raw=S().getItem(key('shopping')),productsRaw=S().getItem('shoppingSupportProducts'),storesRaw=S().getItem('shoppingSupportStores'),help=shoppingHelp();
  const label=node('label',help.name,root),name=node('input',undefined,label);name.type='text';name.maxLength=120;name.value=set?.name||'';name.placeholder=help.placeholder;
  node('p',help.select,root);const rows=[],products=read('shoppingSupportProducts'),stores=read('shoppingSupportStores');
  const ids=new Set([...products.filter(p=>p.active!==false).map(p=>String(p.id)),...(set?.items||[]).map(i=>i.productId)]);
  for(const pid of ids){const product=products.find(p=>String(p.id)===pid),item=set?.items.find(i=>i.productId===pid),choice=shoppingChoice(root,shoppingProductText(product,stores),item?.quantity||1,!!item);rows.push({...choice,pid,item});}
  button(root,word(14),()=>action(()=>{
   if(S().getItem('shoppingSupportProducts')!==productsRaw||S().getItem('shoppingSupportStores')!==storesRaw)throw Error('PRODUCTS_OR_STORES_CHANGED');
   const value={id:set?.id||id(),name:name.value.trim(),active:true,createdAt:set?.createdAt||now(),updatedAt:now(),items:rows.filter(r=>r.check.checked).map(r=>({id:r.item?.id||id(),productId:r.pid,quantity:Number(r.quantity.value)}))};
   CocartlyPremiumCore.validateSet(value);const all=read(key('shopping')),index=all.findIndex(s=>s.id===value.id);if(index<0)all.push(value);else all[index]=value;write('shopping',all,raw,token);list('shopping');
  }));
 }
 function previewShopping(set){
  if(!CocartlyPremium.requireFeature('shopping-sets'))return;
  const root=screen('premiumSetsScreen',set.name,()=>list('shopping')),token=S().snapshot(),setsRaw=S().getItem(key('shopping')),productRaw=S().getItem('shoppingSupportProducts'),storesRaw=S().getItem('shoppingSupportStores'),expectedRaw=S().getItem('cocartlyShoppingItems');
  const choices=[],stores=read('shoppingSupportStores');node('p',shoppingHelp().select,root);
  for(const item of set.items){
   const product=read('shoppingSupportProducts').find(p=>String(p.id)===item.productId),available=!!product&&product.active!==false,choice=shoppingChoice(root,shoppingProductText(product,stores),item.quantity,available,!available);choices.push({item,...choice});
  }
  const output=node('div',undefined,root);
  button(root,word(11),()=>{
   output.replaceChildren();let plan;
   try{plan=CocartlyPremiumCore.prepareShoppingAdditions({set,selected:choices.filter(r=>r.check.checked).map(r=>({itemId:r.item.id,quantity:Number(r.quantity.value)})),products:read('shoppingSupportProducts'),shoppingItems:read('cocartlyShoppingItems'),requestId:id(),makeId:id,now:now()});}
   catch(_){node('p',word(24),output);return;}
   node('p',word(20)+': '+plan.added.length+' / '+word(21)+': '+plan.skipped.length,output);for(const p of plan.added)node('p',shoppingProductText(read('shoppingSupportProducts').find(product=>String(product.id)===p.productId),stores)+' × '+p.quantity,output);
   const label=node('label',undefined,output),check=node('input',undefined,label);check.type='checkbox';node('span',word(22),label);
   const apply=button(output,word(22),()=>action(()=>{
    if(!check.checked||S().getItem(key('shopping'))!==setsRaw||S().getItem('shoppingSupportProducts')!==productRaw||S().getItem('shoppingSupportStores')!==storesRaw)throw Error('DATA_CHANGED');
    CocartlyPremiumCore.commitPreparedShopping({storage:S(),ownerToken:token,access:{allowed:CocartlyPremium.allowed('shopping-sets')},expectedRaw,plan});
    shoppingItems=read('cocartlyShoppingItems');notifyCocartlyDataChanged('shoppingItems');openShopping();
   }));apply.disabled=true;check.onchange=()=>apply.disabled=!check.checked||!plan.changed;
  });
 }
 function saveOutingSet(outing){if(!CocartlyPremium.requireFeature('outing-sets'))return;action(()=>{
  const token=S().snapshot(),raw=S().getItem(key('outing')),rows=read(key('outing')),value={id:id(),name:outing.name,active:true,createdAt:now(),updatedAt:now(),items:outing.items.map(i=>({id:id(),name:i.name,productId:i.productId||null,quantity:i.quantity||1,itemType:i.itemType==='purchase'?'purchase':'home'}))};CocartlyPremiumCore.validateOutingSet(value);rows.push(value);write('outing',rows,raw,token);list('outing');
 });}
 function editOuting(set=null){
  if(!CocartlyPremium.requireFeature('outing-sets'))return;
  const root=screen('premiumSetsScreen',word(2),()=>list('outing')),token=S().snapshot(),raw=S().getItem(key('outing')),productsRaw=S().getItem('shoppingSupportProducts');
  const label=node('label',word(13),root),name=node('input',undefined,label);name.type='text';name.maxLength=120;name.value=set?.name||'';
  const lines=node('div',undefined,root),draft=(set?.items||[]).map(item=>structuredClone(item)),products=read('shoppingSupportProducts'),stores=read('shoppingSupportStores');
  function render(){lines.replaceChildren();for(const item of draft){
   const card=node('article',undefined,lines),title=node('label',word(42),card),input=node('input',undefined,title);input.type='text';input.maxLength=200;input.value=item.name;input.oninput=()=>item.name=input.value;
   const count=node('label',word(19),card),quantity=node('input',undefined,count);quantity.type='number';quantity.inputMode='numeric';quantity.min='1';quantity.max='9999';quantity.value=String(item.quantity??1);quantity.oninput=()=>item.quantity=Number(quantity.value);
   const typeLabel=node('label',word(53),card),type=node('select',undefined,typeLabel);for(const [value,index]of [['home',43],['purchase',44]])node('option',word(index),type).value=value;type.value=item.itemType==='purchase'?'purchase':'home';type.onchange=()=>item.itemType=type.value;
   const linkLabel=node('label',word(45),card),link=node('select',undefined,linkLabel);node('option',word(46),link).value='';for(const p of products.filter(p=>p.active!==false)){const store=stores.find(s=>String(s.id)===String(p.storeId));node('option',p.name+' / '+(store?.name||'—'),link).value=String(p.id);}
   if(item.productId&&!products.some(p=>String(p.id)===item.productId&&p.active!==false))node('option',word(24),link).value=item.productId;
   link.value=item.productId||'';link.onchange=()=>{item.productId=link.value||null;const product=products.find(p=>String(p.id)===item.productId);if(product&&!item.name.trim()){item.name=product.name;input.value=item.name;}};
   button(card,word(51),()=>{draft.splice(draft.indexOf(item),1);render();});
  }}
  render();button(root,word(52),()=>{draft.push({id:id(),name:'',quantity:1,itemType:'home',productId:null});render();});
  button(root,word(14),()=>action(()=>{
   if(S().getItem('shoppingSupportProducts')!==productsRaw)throw Error('PRODUCTS_CHANGED');
   const value={...(set||{}),id:set?.id||id(),name:name.value.trim(),active:true,createdAt:set?.createdAt||now(),updatedAt:now(),items:draft.map(item=>({...item,name:item.name.trim()}))};
   CocartlyPremiumCore.validateOutingSet(value);const all=read(key('outing')),index=all.findIndex(s=>s.id===value.id);if(index<0)all.push(value);else all[index]=value;write('outing',all,raw,token);list('outing');
  }));
 }
 function useOuting(template){if(!CocartlyPremium.requireFeature('outing-sets'))return;
  const root=screen('premiumSetsScreen',template.name,()=>list('outing')),token=S().snapshot(),raw=S().getItem('outings'),templateRaw=S().getItem(key('outing')),productsRaw=S().getItem('shoppingSupportProducts');
  const label=node('label',word(13),root),name=node('input',undefined,label);name.type='text';name.maxLength=120;name.value=template.name;for(const item of template.items)node('p',item.name+' × '+(item.quantity||1),root);
  const typeLabel=node('label',word(47),root),type=node('select',undefined,typeLabel);for(const [value,index]of [['routine',48],['scheduled',49]])node('option',word(index),type).value=value;
  const dateLabel=node('label',word(50),root),date=node('input',undefined,dateLabel);date.type='date';dateLabel.hidden=true;type.onchange=()=>dateLabel.hidden=type.value!=='scheduled';
  button(root,word(27),()=>action(()=>{
   if(!CocartlyPremium.allowed('outing-sets')||!S().isCurrent(token)||S().getItem('outings')!==raw||S().getItem(key('outing'))!==templateRaw||S().getItem('shoppingSupportProducts')!==productsRaw)throw Error('DATA_CHANGED');
   const result=CocartlyPremiumCore.createOutingFromTemplate({template,name:name.value,type:type.value,date:date.value,products:read('shoppingSupportProducts'),makeId:id,now:now()});const next=[...read('outings'),result];S().applyBatch({outings:JSON.stringify(next)},token);outings=next;notifyCocartlyDataChanged('outings');openCheck();
  }));
 }
 const SAVED_OUTINGS={ja:'保存済みのお出かけを閲覧',en:'View saved outings',ko:'저장된 외출 보기','zh-CN':'查看已保存的出行','zh-TW':'檢視已儲存的出遊',fr:'Consulter les sorties enregistrées'};
 function syncHome(){const entry=document.getElementById('btnCheck');if(entry)entry.hidden=!CocartlyPremium.allowed('outing-edit');const guide=document.getElementById('cocartlyPremiumGuideButton');if(guide){const g=guideCopy(),owner=S().snapshot();guide.textContent=featureAllowed('outing')?g.tools:g.discover;guide.disabled=!S().isReady();guide.onclick=()=>{if(S().isCurrent(owner))open();};}}
 function hasSavedOutings(){
  if(!S().isReady())return false;
  try{return read('outings').some(outing=>outing.active!==false);}
  catch(_){return false;}
 }
 function mount(){
  const settings=document.getElementById('settingsScreen');if(settings&&!document.getElementById('cocartlyPlanButton')){const b=button(settings,guideCopy().menu,open);b.id='cocartlyPlanButton';}const b=document.getElementById('cocartlyPlanButton');if(b)b.textContent=guideCopy().menu;
  if(settings&&!document.getElementById('cocartlySavedOutingsButton')){
   const saved=button(settings,'',()=>{
    if(!CocartlyPremium.allowed('outing-edit')&&hasSavedOutings())global.openCheck();
   });
   saved.id='cocartlySavedOutingsButton';
   saved.className='settings-menu-button';
  }
  const saved=document.getElementById('cocartlySavedOutingsButton');
  if(saved){
   saved.textContent=SAVED_OUTINGS[getCocartlyLanguage()]||SAVED_OUTINGS.ja;
   saved.hidden=!hasSavedOutings()||CocartlyPremium.allowed('outing-edit');
  }
  syncHome();
 }
 const oldLabels=global.updateSettingsScreenLanguage;if(typeof oldLabels==='function')global.updateSettingsScreenLanguage=function(...args){const result=oldLabels.apply(this,args);mount();return result;};
 const oldHomeLabels=global.updateHomeScreenLanguage;if(typeof oldHomeLabels==='function')global.updateHomeScreenLanguage=function(...args){const result=oldHomeLabels.apply(this,args);syncHome();return result;};
 for(const [fn,kind]of [['openShopping','shopping'],['openCheck','outing']]){const old=global[fn];if(typeof old!=='function')continue;global[fn]=function(...args){const result=old.apply(this,args),target=document.getElementById(kind==='shopping'?'shoppingScreen':'checkScreen'),bid='cocartly-'+kind+'-sets';if(target){document.getElementById(bid)?.remove();const b=button(target,word(kind==='shopping'?1:2),()=>list(kind));b.id=bid;premiumBadge(b);const header=target.querySelector('.screen-header');if(header)header.after(b);if(kind==='outing'){const heading=target.querySelector('.screen-title-row h2');if(heading)premiumBadge(heading);}}return result;};}
 // Mutation entry points only. loadOutings/saveOutings also normalize existing data and must remain readable in Free.
 for(const name of ['openCreateOuting','addOutingDraftItem','deleteOutingDraftItem','saveCurrentOuting','reusePastOuting','deletePastOuting','addProductToCurrentOuting','addItemToCurrentOuting','addPurchaseItemToCurrentOuting','changeOutingItemStatus','deleteOutingItem','addOutingItemToShopping','completeCurrentOuting','startOutingItemProductLink']){
  const old=global[name];if(typeof old==='function')global[name]=function(...args){if(!CocartlyPremium.requireFeature('outing-edit'))return;return old.apply(this,args);};
 }
 const complete=global.completeOutingItemsFromShopping;if(typeof complete==='function')global.completeOutingItemsFromShopping=function(...args){if(!CocartlyPremium.allowed('outing-edit'))return;return complete.apply(this,args);};
 global.addEventListener('cocartly-premium-status',()=>{
  syncHome();mount();
  const current=document.getElementById('cocartlyPlanCurrent');if(current)current.textContent=currentPlanLabel();
  const deviceGuide=document.getElementById('cocartlyDeviceGuide');if(deviceGuide)renderDeviceGuide(deviceGuide);
  const p=CocartlyPremium.snapshot(),app=document.getElementById('app');document.getElementById('cocartlyPlanNotice')?.remove();
  if(app&&(p?.error||p?.eligible&&!p?.device_ok)){const notice=node('p',word(p.error?6:7),app);notice.id='cocartlyPlanNotice';notice.setAttribute('role','status');}
 });
 global.addEventListener('cocartly-auth-owner-changing',()=>{view++;busy=false;operation=null;document.getElementById('cocartlyPlanNotice')?.remove();document.getElementById('cocartlySavedOutingsButton')?.remove();const entry=document.getElementById('btnCheck');if(entry)entry.hidden=true;});
 document.addEventListener('DOMContentLoaded',syncHome);syncHome();
 global.CocartlyPremiumUI=Object.freeze({open,list,mount});
})(window);
