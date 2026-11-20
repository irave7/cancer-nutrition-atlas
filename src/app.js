'use strict';

const data = JSON.parse(document.getElementById('data').textContent);
const guide = data.guide;
const cases = new Map(data.cases.map(record => [record.id, record]));
const policies = new Map(data.policies.map(policy => [policy.id, policy]));
const fujianCaseIds = guide.fujian.hospitals.map(hospital=>hospital.case.id);
const fujianComparisons = new Map([
  ['fujian', ['福建三院营养路径与证据', ...fujianCaseIds]],
  ['fujian-colorectal', ['结直肠癌围手术期营养', ...fujianCaseIds.filter(id=>cases.get(id).cancers.includes('结直肠癌')), 'henan-crc-surgery']],
  ['fujian-crc-followup', ['结直肠癌出院接续对照',fujianCaseIds[0],'ln-cmu1-crc-day-surgery-eras','world-italy-piemonte-crc-eras']],
  ['fujian-cervical-radiotherapy', ['宫颈癌放化疗营养对照',fujianCaseIds[2],'gx-guilin-cervical-nurse-nutrition','world-mexico-cervical-crt']]
]);
const flagships = new Map(guide.flagships.map(entry=>[entry.id,entry]));
const byScope = {
  china: data.cases.filter(record => record.province),
  world: data.cases.filter(record => record.country)
};
const stepLabels = {
  screening:'风险筛查', assessment:'营养评估', intervention:'营养干预',
  monitoring:'监测与复评', discharge:'出院衔接', followup:'随访与居家',
  rehabilitation:'康复营养', palliative:'安宁疗护', coordination:'协作与质控'
};
const policyStages = {screen:'筛查与评估',treat:'营养干预',monitor:'监测与复评',transition:'出院、随访与康复',palliative:'安宁疗护',system:'协作与质控'};
const categories = {
  ward:'专病病房', clinic:'专科与联合门诊', surgery:'围手术期', home:'居家与出院延续',
  network:'区域协作与转诊', palliative:'缓和与安宁', research:'实施研究'
};
const evidenceTypes = {program:'服务或项目公开材料',study:'原始研究',case:'病例报道',training:'培训或建设线索'};
const nav = {
  guide:['首页总览','guide'],
  fujian:['福建应用','pin'],
  benchmarks:['三院案例对照','compare'],
  china:['中国大陆案例','map'],
  policy:['中国政策库','doc'],
  world:['国际参照','globe'],
  compare:['案例对比','compare'],
  method:['范围与资料','info']
};
const icons = {
  cross:'<path d="M8 3.5v9M3.5 8h9"/><circle cx="8" cy="8" r="6.4"/>',
  guide:'<path d="M2 3h4.4L8 4.2 9.6 3H14v10H9.6L8 14.2 6.4 13H2zm6 1.2v10"/>',
  star:'<path d="m8 1.9 1.8 3.7 4.1.6-3 2.9.7 4.2L8 11.3l-3.6 2 .7-4.2-3-2.9 4.1-.6z"/>',
  sidebar:'<rect x="1.8" y="3" width="12.4" height="10" rx="1.6"/><path d="M6.2 3v10M3.1 5.2h1.6M3.1 7h1.6"/>',
  left:'<path d="m9.5 3.6-4.3 4.4 4.3 4.4"/>',
  right:'<path d="m6.5 3.6 4.3 4.4-4.3 4.4"/>',
  search:'<circle cx="6.8" cy="6.8" r="4.1"/><path d="m10 10 3.3 3.3"/>',
  expand:'<path d="M6 2.8H2.8V6m7.2-3.2h3.2V6m0 4v3.2H10m-4 0H2.8V10"/>',
  close:'<path d="m4 4 8 8m0-8-8 8"/>',
  map:'<path d="m2 4 4-2 4 2 4-2v10l-4 2-4-2-4 2zm4-2v10m4-8v10"/>',
  globe:'<circle cx="8" cy="8" r="6.1"/><ellipse cx="8" cy="8" rx="2.65" ry="6.1"/><path d="M2 8h12"/>',
  doc:'<path d="M4 2h6l2.4 2.4V14H4zm6 0v3h2.4M6 8h4.4M6 10.6h4.4"/>',
  list:'<path d="M5.2 4h8m-8 4h8m-8 4h8M2.6 4h.1m-.1 4h.1m-.1 4h.1"/>',
  check:'<path d="m3.5 8.1 3 3L12.6 5"/>',
  compare:'<path d="M2.5 4.8h11M8 2.3v11.2m-3 0h6M4.3 5l-2 4h4zm7.4 0-2 4h4z"/>',
  info:'<circle cx="8" cy="8" r="6.2"/><path d="M8 7.1v4.2m0-6.5h.01"/>',
  reset:'<path d="M4 4.2A5.6 5.6 0 1 1 3.2 11M4 2.1v3.5H.7"/>',
  plus:'<path d="M8 3v10M3 8h10"/>',
  minus:'<path d="M3 8h10"/>',
  bookmark:'<path d="M4 2.5h8v11l-4-2.8-4 2.8z"/>',
  external:'<path d="M9 2.5h4.5V7m0-4.5-6 6M7 3H3v10h10V9"/>',
  link:'<path d="m6 10 4-4m-5 2 2-2m2-1.5L10.5 3a2.1 2.1 0 0 1 3 3L12 7.5m-5 4L5.5 13a2.1 2.1 0 0 1-3-3L4 8.5"/>',
  pin:'<path d="M12.6 6.4C12.6 10 8 13.8 8 13.8S3.4 10 3.4 6.4a4.6 4.6 0 1 1 9.2 0Z"/><circle cx="8" cy="6.4" r="1.4"/>'
};
const byId = id => document.getElementById(id);
const safe = value => String(value ?? '').replace(/[&<>"']/g, value => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[value]));
const words = entries => entries.filter(Boolean).join(' · ');
const symbol = name => '<i data-icon="'+name+'" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false">'+(icons[name] || icons.info)+'</svg></i>';
const attr = safe;
const date = value => value ? String(value).replaceAll('-','.') : '';
const regionOf = record => record.province || record.country;
const isScope = view => view === 'china' || view === 'world';
const press = value => String(Boolean(value));
const validUrl = value => /^https?:\/\//i.test(value || '');
function anchor(url,label,css='') {
  return validUrl(url) ? '<a class="'+css+'" href="'+attr(url)+'" target="_blank" rel="noopener noreferrer">'+safe(label)+'</a>' : '';
}
function action(name,label,extras='',css='button') {
  return '<button type="button" data-action="'+name+'" class="'+css+'" '+extras+'>'+label+'</button>';
}
function badge(text,css='') {
  return text ? '<span class="inline-badge '+css+'">'+safe(text)+'</span>' : '';
}
function options(items,selected) {
  return items.map(([value,label])=>'<option value="'+attr(value)+'"'+(String(value) === String(selected) ? ' selected' : '')+'>'+safe(label)+'</option>').join('');
}
function field(label,id,items,selected) {
  return '<label class="filter"><span>'+safe(label)+'</span><select class="control" id="'+id+'" aria-label="'+attr(label)+'">'+options(items,selected)+'</select></label>';
}
function displayTitle(record) {
  return words([regionOf(record),record.institution]);
}
function announce(text) {
  byId('announcement').textContent = text;
}
function clearCriteria(context) {
  Object.assign(context,{region:'',category:'',step:'',evidence:'',cancer:'',query:'',featured:false});
}

const initialChina = byScope.china.find(record => record.province === '湖南' && record.category === 'ward') || byScope.china[0];
const initialWorld = byScope.world[0];
function readLink() {
  const [view,detail] = location.hash.slice(1).split('/');
  return [Object.hasOwn(nav,view) ? view : 'guide',detail];
}
const [initialView,linkedDetail] = readLink();
const linkedCase = byScope[initialView]?.find(record=>record.id===linkedDetail);
const initialCase = linkedCase || (initialView==='world'?initialWorld:initialChina);
const initialHospital = initialView==='benchmarks' && guide.fujian.hospitals.find(hospital=>hospital.id===linkedDetail);
const route = {view:initialView,caseId:initialCase?.id || '',caseTab:'overview',focusedStep:'',docId:'clinical-nutrition-2024',clauseId:'priority',panelDoc:'',panelClause:''};
const state = {
  route, undo:[], redo:[], showSidebar:true, presentation:false,
  compare:initialView==='compare' ? fujianComparisons.get(linkedDetail)?.slice(1) || [] : [], compareMissing:false,
  homeStage:guide.overview.stages[0].id, homeEvidenceOpen:false, homeMatchesOpen:new Set(),
  fujianTab:'actions',fujianHospital:initialHospital?.id || 'cancer',benchmarkAll:initialView==='benchmarks' && linkedDetail==='all',
  scopes: {
    china:{mode:'map',selected:initialChina?.id, zoom:1,x:0,y:0,moreFilters:false},
    world:{mode:'map',selected:initialWorld?.id, zoom:1,x:0,y:0,moreFilters:false}
  },
  policy:{query:'',region:'',stage:'',kind:''},
  searchIndex:0, searchResults:[]
};
Object.values(state.scopes).forEach(clearCriteria);
if (linkedCase) Object.assign(state.scopes[initialView],{region:regionOf(linkedCase),selected:linkedCase.id});
const numberOfCountries = new Set(byScope.world.map(record=>record.country)).size;
const numberOfClauses = data.policies.reduce((total,policy)=>total+policy.clauses.length,0);
const provinceNames = data.regions.map(region=>region.name);
const worldCountries = [...new Set(byScope.world.map(record=>record.country))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
const localRegions = [...new Set(data.policies.filter(policy=>policy.region !== '全国').map(policy=>policy.region))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
const allLinks = new Map();
for (const record of cases.values()) {
  for (const link of record.links) {
    const key = link.docId+'#'+link.clauseId;
    if (!allLinks.has(key)) allLinks.set(key,[]);
    allLinks.get(key).push(record);
  }
}
function recordRoute(patch) {
  const next = {...state.route,...patch};
  if (Object.keys(next).every(key => next[key] === state.route[key])) return false;
  state.undo.push({...state.route});
  state.redo = [];
  state.route = next;
  return true;
}
function renderAndFocus(id) {
  render();
  byId(id)?.focus({preventScroll:true});
}
function setView(view) {
  if (!nav[view] || state.route.view === view) return;
  const caseId = state.scopes[view]?.selected || state.route.caseId;
  recordRoute({view,caseId,caseTab:'overview',focusedStep:'',panelDoc:'',panelClause:''});
  render();
  window.scrollTo(0,0);
}
function openChina({region='',featured=false}={}) {
  const context = state.scopes.china;
  clearCriteria(context);
  Object.assign(context,{region,featured,mode:'map',zoom:1,x:0,y:0});
  const selected = byScope.china.find(record=>caseMatches(record,context));
  context.selected = selected?.id || '';
  recordRoute({view:'china',caseId:context.selected,caseTab:'overview',focusedStep:'',panelDoc:'',panelClause:''});
  render();
  window.scrollTo(0,0);
}
function historyMove(direction) {
  const from = direction === 'back' ? state.undo : state.redo;
  const to = direction === 'back' ? state.redo : state.undo;
  if (!from.length) return;
  to.push({...state.route});
  state.route = from.pop();
  const record = cases.get(state.route.caseId);
  if (record && isScope(state.route.view)) {
    const context = state.scopes[state.route.view];
    context.selected = record.id;
    if (!caseMatches(record,context)) clearCriteria(context);
  }
  if (state.route.view === 'policy' && !policyMatches(policies.get(state.route.docId))) {
    state.policy = {query:'',region:'',stage:'',kind:''};
  }
  render();
}
function revealCase(id,{scroll=false,tab='overview',region=''}={}) {
  const record = cases.get(id);
  if (!record) return;
  const view = record.province ? 'china' : 'world';
  const changingView = state.route.view !== view;
  const context = state.scopes[view];
  if (region || !caseMatches(record,context)) clearCriteria(context);
  if (region) context.region=region;
  context.selected = id;
  recordRoute({view,caseId:id,caseTab:tab,focusedStep:'',panelDoc:'',panelClause:''});
  renderAndFocus('case-title');
  if (changingView) window.scrollTo(0,0);
  if (scroll) maybeScroll('case-inspector');
}
function showPolicy(id,clauseId='',inspector=false) {
  const policy = policies.get(id);
  if (!policy) return;
  const clause = policy.clauses.find(item=>item.id===clauseId);
  if (inspector && isScope(state.route.view)) {
    recordRoute({panelDoc:id,panelClause:clause?.id || policy.clauses[0]?.id});
    renderAndFocus('inline-policy-title');
    maybeScroll('case-inspector');
    return;
  }
  if (!policyMatches(policy)) state.policy = {query:'',region:'',stage:'',kind:''};
  const changingView = state.route.view !== 'policy';
  recordRoute({view:'policy',docId:id,clauseId:clause?.id || '',panelDoc:'',panelClause:''});
  renderAndFocus('policy-title');
  if (changingView) window.scrollTo(0,0);
}
function maybeScroll(id) {
  if (matchMedia('(max-width:650px)').matches) byId(id)?.scrollIntoView({block:'start'});
}
function renderNav() {
  const groups = [['开始查看',['guide','fujian','benchmarks']],['图谱',['china','policy','world']],['工作台',['compare','method']]];
  byId('nav').innerHTML = groups.map(([title,items])=>'<section class="nav-group"><h2>'+title+'</h2>'+items.map(key=>{
    const [name,icon] = nav[key];
    const count = {china:byScope.china.length,policy:data.policies.length,world:byScope.world.length,compare:state.compare.length}[key];
    return '<button type="button" class="nav-item" id="navigation-'+key+'" data-action="view" data-view="'+key+'" aria-current="'+(state.route.view === key ? 'page' : 'false')+'">'+symbol(icon)+'<span>'+name+'</span>'+(count !== undefined ? '<small>'+count+'</small>' : '')+'</button>';
  }).join('')+'</section>').join('');
  byId('compact-nav').innerHTML = options(Object.entries(nav).map(([key,[name]])=>[key,name]),state.route.view);
  byId('crumb').textContent = nav[state.route.view][0];
  const sidebarButton = document.querySelector('[data-action="sidebar"]');
  sidebarButton.setAttribute('aria-expanded',press(state.showSidebar && !state.presentation));
  document.querySelector('[data-action="present"]').setAttribute('aria-pressed',press(state.presentation));
  document.querySelector('[data-action="back"]').disabled = !state.undo.length;
  document.querySelector('[data-action="forward"]').disabled = !state.redo.length;
  byId('app').classList.toggle('sidebar-hidden',!state.showSidebar);
  byId('app').classList.toggle('presenting',state.presentation);
  const {view,caseId} = state.route;
  let hash = '#'+view;
  if (view==='china' && fujianCaseIds.includes(caseId)) hash += '/'+caseId;
  if (view==='benchmarks') hash += '/'+(state.benchmarkAll?'all':state.fujianHospital);
  if (view==='compare') {
    const preset = [...fujianComparisons].find(([, [, ...ids]])=>ids.join('|')===state.compare.join('|'));
    if (preset) hash += '/'+preset[0];
  }
  if (location.hash !== hash) {
    history.replaceState(null,'',hash);
  }
}
function head(title,description,statistics=[],kicker='') {
  const stats = statistics.length ? '<div class="stats" aria-label="收录数量">'+statistics.map(([value,label])=>'<div class="stat"><strong>'+safe(value)+'</strong><span>'+safe(label)+'</span></div>').join('')+'</div>' : '';
  return '<div class="screen-head"><div>'+(kicker ? '<div class="screen-kicker">'+safe(kicker)+'</div>' : '')+'<h1>'+safe(title)+'</h1><p>'+safe(description)+'</p></div>'+stats+'</div>';
}
function textMatches(text, query) {
  const tokens = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = text.toLowerCase();
  return tokens.every(token=>haystack.includes(token));
}
function caseIndex(record) {
  return [record.title,record.institution,record.city,regionOf(record),record.scope,record.summary,record.category,categories[record.category],record.sourceTitle,record.sourceType, ...record.cancers,...record.steps.map(step=>stepLabels[step]),...record.process.map(item=>item.detail)].join(' ');
}
const caseSearchFields = new Map([...cases.values()].map(record=>[record.id,caseIndex(record)]));
function caseMatches(record,context,{ignoreRegion=false}={}) {
  return (ignoreRegion || !context.region || regionOf(record) === context.region)
    && (!context.category || record.category === context.category)
    && (!context.step || record.steps.includes(context.step))
    && (!context.evidence || record.evidenceType === context.evidence)
    && (!context.featured || flagships.has(record.id))
    && (!context.cancer || record.cancers.some(name => (data.cancerGroups[context.cancer] || [context.cancer]).includes(name)))
    && textMatches(caseSearchFields.get(record.id),context.query);
}
function policyIndex(policy) {
  return [policy.title,policy.number,policy.region,policy.issuer,policy.type,policy.status,policy.summary,...policy.clauses.flatMap(clause=>[clause.title,clause.locator,clause.summary,clause.find])].join(' ');
}
function policyMatches(policy) {
  if (!policy) return false;
  const filter = state.policy;
  const regionMatch = !filter.region || filter.region === policy.region || (filter.region === '各地' && policy.region !== '全国');
  return regionMatch && (!filter.stage || policy.clauses.some(clause=>clause.stages.includes(filter.stage)))
    && (!filter.kind || policy.type === filter.kind)
    && textMatches(policyIndex(policy),filter.query);
}
function openCasesForRegion(region) {
  const context = state.scopes[state.route.view];
  context.region = context.region === region ? '' : region;
  const entries = byScope[state.route.view].filter(record=>caseMatches(record,context));
  const previous = entries.find(record=>record.id === state.route.caseId);
  const active = previous || entries[0];
  context.selected = active?.id;
  recordRoute({caseId:active?.id || '',caseTab:'overview',focusedStep:'',panelDoc:'',panelClause:''});
  render();
  announce(context.region ? context.region+'，'+entries.length+' 个案例' : '全部地区，'+entries.length+' 个案例');
  if (context.region) maybeScroll(entries.length===1?'case-inspector':'case-results');
}
function syncFilterResults() {
  const context = state.scopes[state.route.view];
  const entries = byScope[state.route.view].filter(record=>caseMatches(record,context));
  if (!entries.some(record=>record.id === state.route.caseId)) {
    state.route.caseId = entries[0]?.id || '';
    state.route.caseTab = 'overview';
    state.route.panelDoc = '';
    state.route.panelClause = '';
    state.route.focusedStep = '';
  }
  context.selected = state.route.caseId;
}
function caseControls(scope,context) {
  const names = scope === 'china' ? provinceNames : worldCountries;
  const cancers = new Set(byScope[scope].flatMap(record=>record.cancers));
  for (const [group,members] of Object.entries(data.cancerGroups)) {
    if (members.some(name=>cancers.has(name))) cancers.add(group);
  }
  const cancerNames = [...cancers].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  const extraCount = Number(Boolean(context.cancer))+Number(Boolean(context.evidence));
  return '<section class="filter-bar" aria-label="案例视图与筛选">'+
    '<div class="segmented" aria-label="案例呈现方式">'+
      action('mode',symbol('map')+'地图','data-mode="map" aria-pressed="'+press(context.mode==='map')+'"','')+
      action('mode',symbol('list')+'列表','data-mode="list" aria-pressed="'+press(context.mode==='list')+'"','')+'</div>'+
    field(scope==='china'?'地区':'国家','case-region',[['',scope==='china'?'全部地区':'全部国家'],...names.map(name=>[name,name])],context.region)+
    field('案例类型','case-category',[['','全部类型'],...Object.entries(categories)],context.category)+
    field('照护环节','case-step',[['','全部环节'],...Object.entries(stepLabels)],context.step)+
    (scope==='china'?action('flagship-filter',symbol('star')+'标志性案例','id="case-flagship" aria-pressed="'+press(context.featured)+'"','button flagship-filter'):'')+
    '<label class="filter case-text-filter">'+symbol('search')+'<input id="case-query" class="text-input" type="search" aria-label="筛选当前案例" value="'+attr(context.query)+'" placeholder="筛选当前案例" size="14"></label>'+
    action('case-more',symbol('list')+'更多筛选'+(extraCount?' · '+extraCount:''),'id="case-more" aria-controls="extra-filters" aria-expanded="'+press(context.moreFilters)+'"','button')+
    '<div class="filter reset">'+action('clear-case','重置筛选','','subtle-button')+'</div>'+
    '<div id="extra-filters" class="extra-filters"'+(context.moreFilters?'':' hidden')+'>'+
      field('癌种','case-cancer',[['','全部癌种'],...cancerNames.map(name=>[name,name])],context.cancer)+
      field('证据类型','case-evidence',[['','全部证据'],...Object.entries(evidenceTypes)],context.evidence)+
    '</div></section>';
}
function globalWorldPins(all,counts,context) {
  const groups = new Map();
  for (const record of all) {
    if (!groups.has(record.country) && record.coordinates?.length === 2) groups.set(record.country,record);
  }
  const europe = [...groups].filter(([,record])=>record.coordinates[0] > -12 && record.coordinates[0] < 33 && record.coordinates[1] > 35);
  const cluster = context.zoom < 1.6 && europe.length > 2;
  const points = [...groups].filter(([key])=>!cluster || !europe.some(([name])=>name===key)).map(([name,record])=>{
    const [lon,lat] = record.coordinates;
    const offsets = {CA:[-1.6,-1.6],US:[.6,.6],GB:[-1.5,0],UK:[-1.5,0],FR:[-.55,1],NL:[1,-.75],IT:[.85,.85]};
    const [x,y] = offsets[record.countryCode] || [0,0];
    return mapPin(name,record.countryCode,(lon+180)/3.6+x,(90-lat)/1.8+y,counts.get(name)||0,context.region===name,true);
  });
  if (cluster) {
    const count = europe.reduce((sum,[name])=>sum+(counts.get(name)||0),0);
    const contains = europe.some(([name])=>name===context.region);
    points.push('<button title="欧洲 · 查看各国标记" type="button" class="map-pin world-pin'+(contains?' focus-near':'')+'" style="--x:53%;--y:22%" data-action="zoom-europe" aria-label="欧洲，'+count+' 个案例，展开各国标记"><span aria-hidden="true">欧</span><span class="pin-count" aria-hidden="true">'+count+'</span></button>');
  }
  return points.join('');
}
function mapPin(name,label,x,y,count,selected,world,featured=false) {
  const kind = world ? ' world-pin' : '';
  return '<button type="button" class="map-pin'+kind+(count?'':' zero')+'" style="--x:'+x+'%;--y:'+y+'%" '+
    'id="case-pin-'+attr(name)+'" data-action="map-region" data-region="'+attr(name)+'" aria-pressed="'+press(selected)+'" aria-label="'+attr(name+'，'+count+' 个匹配案例'+(featured?'，含标志性案例':''))+'" title="'+attr(name+' · '+count+' 个匹配案例'+(featured?' · 含标志性案例':''))+'">'+
    '<span aria-hidden="true">'+safe(label)+'</span><span class="pin-count" aria-hidden="true">'+count+'</span>'+
    (featured?'<span class="pin-flag" aria-hidden="true">★</span>':'')+'</button>';
}
function mapPanel(scope,all,context,results,selected) {
  const counts = new Map();
  const leadingRegions = new Set();
  all.filter(record=>caseMatches(record,context,{ignoreRegion:true})).forEach(record=>{
    const name = regionOf(record);
    counts.set(name,(counts.get(name)||0)+1);
    if (flagships.has(record.id)) leadingRegions.add(name);
  });
  const mapSelected = context.region || (selected && regionOf(selected));
  const background = scope==='china'
    ? '<img width="1080" height="695" src="'+data.chinaMap+'" alt="中国标准地图，含标注的省域案例数量" draggable="false">'
    : '<svg viewBox="0 0 960 480" class="world-svg" role="img" aria-label="世界陆地轮廓，案例按国家标注"><path class="graticule" d="M0 80H960M0 160H960M0 240H960M0 320H960M0 400H960M160 0V480M320 0V480M480 0V480M640 0V480M800 0V480"/><path d="'+data.worldPath+'"/></svg>';
  const pins = scope==='china'
    ? data.regions.map(region=>mapPin(region.name,region.pin,...region.at,counts.get(region.name)||0,mapSelected===region.name,false,leadingRegions.has(region.name))).join('')
    : globalWorldPins(all,counts,{...context,region:mapSelected});
  return '<section class="pane map-pane" aria-label="'+(scope==='china'?'中国大陆案例地图':'国际参照案例地图')+'">'+
    '<div class="map-top"><div><h2>'+(context.region ? safe(context.region)+' · 案例地图' : (scope==='china'?'中国大陆案例地图':'国际参照案例地图'))+'</h2><small>点选标记筛选 · 放大后可拖动</small></div>'+
    '<div class="map-tools" aria-label="地图缩放">'+action('zoom-out',symbol('minus'),'id="map-zoom-out" aria-label="缩小地图" title="缩小地图"'+(context.zoom<=1?' disabled':''),'icon-button')+
    '<span class="map-zoom">'+Math.round(context.zoom*100)+'%</span>'+action('zoom-in',symbol('plus'),'id="map-zoom-in" aria-label="放大地图" title="放大地图"'+(context.zoom>=3?' disabled':''),'icon-button')+
    action('zoom-reset',symbol('reset'),'id="map-zoom-reset" aria-label="复位地图" title="复位地图"'+(context.zoom===1?' disabled':''),'icon-button')+'</div></div>'+
    '<div id="map-viewport" class="map-viewport'+(context.zoom>1?' is-zoomed':'')+'" tabindex="0" aria-label="地图画布。放大后可用方向键平移。">'+
    '<div class="map-'+(scope==='china'?'cn':'world')+'" id="map-layer">'+background+pins+'</div></div>'+
    '<p class="map-caption"><span>标记数字表示当前筛选下该地区的案例数'+(scope==='china'?' · <span class="legend-star" aria-hidden="true">★</span> 标志性案例':'')+'</span>'+
    (scope==='china'?anchor(data.mapSources.china,'底图 GS(2016)1600') : anchor(data.mapSources.world,'陆地底图 Natural Earth'))+'</p></section>'+
    '<section id="case-results" class="pane case-collection map-collection" aria-label="地图对应案例">'+caseCollection(results,context.region ? context.region+'案例' : '当前匹配案例',selected?.id,true)+'</section>';
}
function resultButton(record,selected) {
  const metadata = words([regionOf(record),record.institution,categories[record.category]]);
  return '<li>'+action('case',symbol('pin')+'<span class="row-text"><strong>'+safe(record.title)+'</strong><small>'+safe(metadata)+'</small></span>'+
    (flagships.has(record.id)?badge('★ 标志性','amber'):''),
    'id="case-row-'+attr(record.id)+'" data-id="'+attr(record.id)+'" aria-current="'+press(record.id===selected)+'"','result-row')+'</li>';
}
function caseCollection(results,title,selected,forMap=false) {
  if (!results.length) return '<h2>'+safe(title)+' · 0</h2><p class="result-empty">当前组合没有匹配案例。可切换地区或减少筛选条件。</p>';
  const selectedRecord = cases.get(selected);
  const main = forMap && results.length > 8 ? [...results].sort((a,b)=>{
    const priority = record => record.id===selected ? 2 : selectedRecord && regionOf(record)===regionOf(selectedRecord) ? 1 : 0;
    return priority(b)-priority(a);
  }).slice(0,8) : results;
  return '<h2>'+safe(title)+' · '+results.length+'</h2>'+
    '<ul class="case-list">'+main.map(record=>resultButton(record,selected)).join('')+'</ul>'+
    (main.length < results.length ? '<div class="actions">'+action('mode','在列表中查看全部 '+results.length+' 个','data-mode="list"')+'</div>' : '');
}
function metricsMarkup(record) {
  if (!record.metrics.length) return '';
  return '<div class="metrics-grid">'+record.metrics.map(item=>'<div class="evidence-metric"><b>'+safe(item.value)+'</b><span>'+safe(item.label)+'</span>'+(item.context?'<small>'+safe(item.context)+'</small>':'')+'</div>').join('')+'</div>';
}
function caseTitle(record) {
  const comparing = state.compare.includes(record.id);
  return '<header class="inspector-top"><div class="inspector-titlebar"><div class="badges">'+
    badge(regionOf(record),record.country?'purple':'blue')+badge(categories[record.category])+badge(evidenceTypes[record.evidenceType],record.evidenceType==='study'?'mint':'')+
    (flagships.has(record.id)?badge('★ 标志性案例','amber'):'')+
    '</div>'+action('toggle-compare',symbol('bookmark'),'data-id="'+attr(record.id)+'" aria-pressed="'+press(comparing)+'" aria-label="'+(comparing?'移出对比':'加入对比')+'" title="'+(comparing?'移出对比':'加入对比')+'"','icon-button')+
    '</div><h2 id="case-title" tabindex="-1">'+safe(record.title)+'</h2><p class="meta">'+safe(words([record.institution,record.city,date(record.date)]))+'</p></header>';
}
function caseInspector(record) {
  if (!record) return '<aside id="case-inspector" class="pane inspector" aria-label="案例检查器"><p class="result-empty" id="case-title" tabindex="-1">选中地图或列表中的一个案例，查看服务环节、证据和对应条款。</p></aside>';
  if (state.route.panelDoc) return inlinePolicy(record);
  const sections = {overview:'概览',pathway:'服务路径',links:record.country?'对照条款':'对应条款',sources:'来源与证据'};
  const tab = state.route.caseTab;
  return '<aside id="case-inspector" class="pane inspector" aria-label="案例检查器">'+caseTitle(record)+
    '<nav class="inspector-nav" aria-label="案例详情">'+Object.entries(sections).map(([key,label])=>
      action('case-tab',safe(label),'id="case-tab-'+key+'" data-tab="'+key+'" aria-pressed="'+press(tab===key)+'"','')).join('')+'</nav>'+
    '<div class="inspector-content">'+
    (tab==='overview' ? overview(record) : tab==='pathway' ? pathway(record) : tab==='links' ? caseLinks(record) : sourceEvidence(record))+'</div></aside>';
}
function overview(record) {
  const distinction=flagships.get(record.id);
  const hospital=guide.fujian.hospitals.find(entry=>entry.case.id===record.id);
  return '<p class="summary">'+safe(record.summary)+'</p>'+
    (record.scope?'<p class="meta"><strong>服务对象</strong> '+safe(record.scope)+'</p>':'')+
    (record.cancers.length ? '<div class="badges" aria-label="案例涉及癌种">'+record.cancers.map(name=>badge(name)).join('')+'</div>' : '')+
    (distinction?'<div class="featured-explanation"><strong>'+safe(distinction.lens)+'</strong><p>'+safe(distinction.why)+'</p><small>'+safe(distinction.bounds)+'</small></div>':'')+
    '<h3>公开记录的环节</h3><div class="path-strip">'+record.steps.map(step=>
      action('case-tab',safe(stepLabels[step]),'data-tab="pathway" data-step="'+step+'"','')).join('')+'</div>'+
    (record.metrics.length ? '<h3>公开指标与节点</h3>'+metricsMarkup(record) : '')+
    '<div class="actions">'+action('case-tab','查看 '+record.links.length+' 条政策'+(record.country?'对照':'关联'),'data-tab="links"','button primary')+
    anchor(record.url,'打开原始材料','button')+action('toggle-compare',state.compare.includes(record.id)?'移出对比':'加入对比','data-id="'+attr(record.id)+'"')+
    (hospital?action('fujian-hospital','查看拟议医助方案','data-hospital="'+attr(hospital.id)+'"')+
      action('fujian-hospital','查看本院参考案例','data-hospital="'+attr(hospital.id)+'" data-view="benchmarks"'):'')+'</div>';
}
function pathway(record) {
  const documented = record.steps.map(step=>badge(stepLabels[step],'blue')).join('');
  const details = record.process.map(item=>'<li class="'+(state.route.focusedStep===item.stage?'marked':'')+'"><strong>'+safe(stepLabels[item.stage])+'</strong>'+safe(item.detail)+'</li>').join('');
  const missing = Object.entries(stepLabels).filter(([key])=>!record.steps.includes(key)).map(([,label])=>label);
  return '<h3>服务路径证据</h3>'+
    (details ? '<ol class="timeline">'+details+'</ol>' : '<p>'+safe(record.summary)+'</p>')+
    '<h3>记录覆盖</h3><div class="badges">'+documented+'</div>'+
    (missing.length ? '<p class="meta" style="margin-top:7px">原材料未交代 '+safe(missing.join('、'))+'。</p>':'')+
    (record.evidence?'<div class="effect-note">'+safe(record.evidence)+'</div>':'');
}
function caseLinks(record) {
  const intro = record.country
    ? '以下中国条款用于跨国对照。海外实践的服务边界与执行依据见该机构原材料。'
    : '以下条款可用于理解公开实践及核对拟议路径。政策效力和适用范围见原件。';
  const links = record.links.map(link=>{
    const policy = policies.get(link.docId);
    const clause = policy.clauses.find(item=>item.id===link.clauseId);
    return action('inline-policy','<b>'+safe(words([clause.locator,clause.title]))+'</b><small>'+safe(policy.title)+'</small><small>'+safe(link.reason)+'</small>',
      'data-id="'+attr(link.docId)+'" data-clause="'+attr(link.clauseId)+'"','policy-route');
  }).join('');
  return '<h3>'+(record.country?'对照中国条款':'案例与条款')+'</h3><p class="meta">'+intro+'</p><div class="policy-routes">'+links+'</div>';
}
function sourceEvidence(record) {
  const more = record.sources.map(source=>'<li>'+anchor(source.url,source.title)+'</li>').join('');
  return '<h3>主要来源</h3><p>'+anchor(record.url,record.sourceTitle || record.institution+'公开资料')+
    '</p><p class="meta">'+safe(words([record.sourceType || evidenceTypes[record.evidenceType],date(record.date) || '原页面未标发布日期']))+'</p>'+
    (more ? '<h3>其他资料</h3><ul class="source-list">'+more+'</ul>' : '')+
    (record.metrics.length ? '<h3>公开指标与统计口径</h3>'+metricsMarkup(record) : '')+
    (record.evidence ? '<h3>证据边界</h3><div class="effect-note">'+safe(record.evidence)+'</div>' : '');
}
function sourceTarget(policy,clause) {
  if (!clause) return policy.fullTextUrl;
  const url = clause.url || policy.fullTextUrl;
  const base = url.split('#')[0];
  if (clause.page) return base+'#page='+encodeURIComponent(clause.page);
  if (clause.find && !/\.(?:docx?|pdf)(?:[?#]|$)/i.test(base) && !base.includes('/onlineRead/')) {
    return base+'#:~:text='+encodeURIComponent(clause.find).replace(/-/g,'%2D');
  }
  return url;
}
function clauseCard(policy,clause,inline=false) {
  if (!clause) return '';
  const related = (allLinks.get(policy.id+'#'+clause.id)||[]).filter(record=>record.id !== (inline ? state.route.caseId : ''));
  const location = clause.page ? 'PDF 第 '+clause.page+' 页' : clause.find || clause.locator;
  const groups = [['大陆对应案例',related.filter(record=>record.province)],['国际对照案例',related.filter(record=>record.country)]];
  const relatedMarkup = groups.filter(([,records])=>records.length).map(([label,records])=>{
    const limit = inline?4:8;
    const buttons = items => items.map(record=>action('case',safe(words([regionOf(record),record.institution])),'data-id="'+attr(record.id)+'"')).join('');
    return '<h3>'+label+' · '+records.length+'</h3><div class="related-list">'+buttons(records.slice(0,limit))+'</div>'+
     (records.length>limit?'<details style="margin-top:7px"><summary class="meta">展开其余 '+(records.length-limit)+' 个</summary><div class="related-list">'+buttons(records.slice(limit))+'</div></details>':'');
  }).join('');
  return '<article class="clause-detail"><h4>'+safe(words([clause.locator,clause.title]))+'</h4><p>'+safe(clause.summary)+'</p>'+
    '<div class="badges">'+clause.stages.map(key=>badge(policyStages[key])).join('')+'</div>'+
    '<div class="clause-locator"><strong>定位</strong> '+safe(location)+'</div>'+
    '<div class="actions">'+anchor(sourceTarget(policy,clause),'定位官方原件','button primary')+
      (clause.page ? action('source','页内预览','data-id="'+attr(policy.id)+'" data-clause="'+attr(clause.id)+'"') : '')+
      (clause.find && !clause.page ? action('copy','复制查找词','data-text="'+attr(clause.find)+'"') : '')+'</div>'+
    relatedMarkup+'</article>';
}
function inlinePolicy(record) {
  const policy = policies.get(state.route.panelDoc);
  const clause = policy.clauses.find(item=>item.id===state.route.panelClause);
  const mapping = record.links.find(item=>item.docId===policy.id && item.clauseId===clause?.id);
  return '<aside id="case-inspector" class="pane inspector" aria-label="关联政策检查器">'+
    '<header class="inspector-top">'+action('return-case',symbol('left')+'返回案例及关联','', 'inspector-back')+
    '<div class="badges">'+badge(policy.region,'blue')+badge(policy.type)+'</div>'+
    '<h2 id="inline-policy-title" tabindex="-1">'+safe(policy.title)+'</h2><p class="meta">'+safe(words([policy.number,policy.status]))+'</p></header>'+
    '<div class="inspector-content">'+
    (mapping?'<p class="meta"><strong>'+(record.country?'对照理由':'关联理由')+'</strong> '+safe(mapping.reason)+'</p>':'')+
    clauseCard(policy,clause,true)+
    '<div class="actions">'+action('policy',symbol('doc')+'查看整份政策与条款','data-id="'+attr(policy.id)+'" data-clause="'+attr(clause?.id)+'"')+
    anchor(policy.fullTextUrl,'打开官方全文','button')+'</div></div></aside>';
}
function casesPage(scope) {
  const context = state.scopes[scope];
  const all = byScope[scope];
  const results = all.filter(record=>caseMatches(record,context));
  const selected = results.find(record=>record.id===state.route.caseId);
  const regionCount = new Set(all.map(regionOf)).size;
  const statistics = scope==='china'
    ? [[regionCount+'/31','省级地区'],[all.length,'大陆案例'],[data.policies.length,'中国政策文件']]
    : [[regionCount,'国家或地区'],[all.length,'公开实践'],[all.filter(record=>record.evidenceType==='study').length,'原始研究']];
  const title = scope==='china'?'癌症患者营养全周期管理':'癌症营养的国际参照';
  const subtitle = scope==='china'?'按地区、癌种或照护环节查找实践，点开对应的中国政策细则。':'从不同卫生体系的实际案例中查找可对照的服务流程与证据。';
  return head(title,subtitle,statistics,scope==='china'?'中国大陆':'国际案例')+
    caseControls(scope,context)+
    '<div class="atlas-grid"><div>'+
    (context.mode==='map' ? mapPanel(scope,all,context,results,selected) :
      '<section class="pane result-list" aria-label="案例结果">'+caseCollection(results,context.region ? context.region+'案例' : '匹配案例',selected?.id)+'</section>')+
    '</div>'+caseInspector(selected)+'</div>';
}
function policyPage() {
  const filter = state.policy;
  const results = data.policies.filter(policyMatches);
  const selected = results.find(policy=>policy.id===state.route.docId) || results[0];
  const kinds = [...new Set(data.policies.map(policy=>policy.type))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  const national = data.policies.filter(policy=>policy.region==='全国').length;
  const readingGuide = [
    ['住院筛评','clinical-department-2022','screen24'],['癌症营养支持','national-cancer-plan','support'],
    ['连续营养服务','clinical-nutrition-2024','continuity'],['临床营养质控','quality-2026','assessment'],
    ['特医食品使用','fsmp-use-2026','dietfirst'],['进食与安宁疗护','palliative-2025','feeding']
  ];
  const controls = '<section class="filter-bar" aria-label="政策筛选"><label class="filter"><span>检索政策</span>'+
    '<input class="text-input" type="search" id="policy-query" aria-label="搜索政策" placeholder="文件名、文号、条款或关键词" size="23" value="'+attr(filter.query)+'"></label>'+
    field('发文地区','policy-region',[['','全部地区'],['全国','国家层面'],['各地','全部地方'],...localRegions.map(region=>[region,region])],filter.region)+
    field('照护环节','policy-stage',[['','全部环节'],...Object.entries(policyStages)],filter.stage)+
    field('文件类型','policy-kind',[['','全部文件类型'],...kinds.map(kind=>[kind,kind])],filter.kind)+
    action('clear-policy','重置筛选','','subtle-button')+'</section>';
  const rows = results.map(policy=>'<li>'+action('policy',symbol('doc')+'<span class="row-text"><strong>'+safe(policy.title)+'</strong><small>'+
    safe(words([policy.region,policy.type,policy.number || date(policy.date)]))+'</small></span>',
    'id="policy-row-'+attr(policy.id)+'" data-id="'+attr(policy.id)+'" aria-current="'+press(selected?.id===policy.id)+'"','result-row')+'</li>').join('');
  return head('中国政策与技术文件','从政策原文追溯照护要求，或从条款查看相关落地案例。',[[national,'国家层面'],[data.policies.length-national,'地方文件'],[numberOfClauses,'条款定位']])+
    '<nav class="policy-guide" aria-label="国家文件导读"><strong>国家文件导读</strong>'+readingGuide.map(([label,id,clause])=>
      action('policy',safe(label),'data-id="'+id+'" data-clause="'+clause+'"','button')).join('')+'</nav>'+
    controls+'<div class="policy-grid"><section class="pane policy-catalog" aria-label="政策目录"><h2>匹配文件 · '+results.length+'</h2>'+
      '<ul class="case-list policy-list">'+rows+'</ul></section>'+(selected ? fullPolicy(selected) :
      '<section class="pane policy-body"><p class="result-empty">未找到匹配文件。可减少关键词或筛选条件。</p></section>')+'</div>';
}
function fullPolicy(policy) {
  if (state.route.docId !== policy.id) {
    state.route.docId = policy.id;
    state.route.clauseId = '';
  }
  const match = policy.clauses.find(clause=>clause.id===state.route.clauseId);
  const clause = match || policy.clauses.find(item=>allLinks.has(policy.id+'#'+item.id)) || policy.clauses[0];
  const attachments = policy.attachments.map(source=>anchor(source.url,source.title,'button')).join('');
  return '<section class="pane policy-body" aria-label="政策原文与条款">'+
    '<div class="badges">'+badge(policy.region,'blue')+badge(policy.type)+badge(policy.status,'mint')+'</div>'+
    '<h2 id="policy-title" tabindex="-1">'+safe(policy.title)+'</h2><p class="meta">'+safe(words([policy.issuer,date(policy.date),policy.number]))+'</p>'+
    '<p>'+safe(policy.summary)+'</p>'+(policy.notes?'<p class="meta">'+safe(policy.notes)+'</p>':'')+
    '<div class="actions">'+anchor(policy.fullTextUrl,'打开官方全文','button primary')+action('source','在页面内预览','data-id="'+attr(policy.id)+'"')+
    (policy.url!==policy.fullTextUrl?anchor(policy.url,'发布页','button'):'')+attachments+'</div>'+
    '<h3>条款与案例</h3><div class="policy-anchors"><div class="policy-routes">'+policy.clauses.map(item=>{
      const count = (allLinks.get(policy.id+'#'+item.id)||[]).length;
      return action('policy-clause','<b>'+safe(words([item.locator,item.title]))+'</b>'+
      '<small>'+count+' 个关联案例</small>','id="policy-anchor-'+attr(item.id)+'" data-id="'+attr(policy.id)+'" data-clause="'+attr(item.id)+'" aria-current="'+press(clause===item)+'"','policy-route');
    }).join('')+'</div>'+clauseCard(policy,clause)+'</div></section>';
}
function comparePage() {
  const records = state.compare.map(id=>cases.get(id)).filter(Boolean);
  const presets = [
    ...fujianComparisons.values(),
    ['胃癌术后数字营养随访','gd-gastrectomy-mhealth','world-seoul'],
    ['儿童肿瘤营养筛评','hn-zzu-pediatric-aml','world-kkh','world-south-africa'],
    ['安宁疗护从医院到社区','hb-palliative-shared','js-suzhou-palliative-network','world-avl']
  ].filter(([, ...ids])=>ids.every(id=>cases.has(id)));
  if (!records.length) return head('案例对比','可并排查看中国大陆与国际案例的服务对象、流程和证据边界。')+
    '<section class="pane compare-panel"><h2>对比列表为空</h2><p class="meta">在案例详情点“加入对比”，最多可选择 3 个案例。</p>'+
    (presets.length?'<h2 class="compare-examples">按主题开始对比</h2><div class="actions">'+presets.map(([label,...ids])=>
     action('compare-preset',safe(label),'data-set="'+ids.join('|')+'"')).join('')+'</div>':'')+
    '<div class="actions">'+action('view','浏览中国大陆案例','data-view="china"','button primary')+
    action('view','浏览国际参照','data-view="world"')+'</div></section>';
  const detailedSteps = Object.entries(stepLabels).filter(([key])=>records.some(record=>record.steps.includes(key)));
  const visibleSteps = state.compareMissing ? Object.entries(stepLabels) : detailedSteps;
  const missingToggle = detailedSteps.length<Object.keys(stepLabels).length ?
    '<label class="compare-toggle"><input id="compare-missing" type="checkbox" '+(state.compareMissing?'checked':'')+'> 显示各案例均未披露的环节</label>' : '';
  const row = (label,renderCell)=>'<tr><th scope="row">'+safe(label)+'</th>'+records.map(record=>'<td>'+renderCell(record)+'</td>').join('')+'</tr>';
  return head('案例对比','并排阅读原材料中的服务环节和指标。用同一环节对照做法时，可结合服务边界理解差异。',[[records.length+'/3','已选案例']])+
    '<section class="pane compare-panel"><div class="compare-tray">'+records.map(record=>'<div class="compare-token">'+safe(words([regionOf(record),record.institution]))+
    action('toggle-compare',symbol('close'),'data-id="'+attr(record.id)+'" aria-label="'+attr('移出 '+record.institution)+'"','icon-button')+'</div>').join('')+'</div>'+missingToggle+
    '<div class="compare-scroll" tabindex="0" aria-label="可横向滚动的案例对比表"><table class="compare-table"><thead><tr><th scope="col">对照维度</th>'+
    records.map(record=>'<th scope="col">'+action('case',safe(record.title),'data-id="'+attr(record.id)+'"','')+'</th>').join('')+'</tr></thead><tbody>'+
    row('机构与范围',record=>safe(displayTitle(record))+'<br>'+safe(record.scope))+
    row('案例类型',record=>safe(words([categories[record.category],evidenceTypes[record.evidenceType]])))+
    visibleSteps.map(([key,label])=>row(label,record=>{
      const evidence = record.process.filter(item=>item.stage===key).map(item=>item.detail).join(' ');
      if (evidence) return safe(evidence);
      return record.steps.includes(key)?'公开材料记录该环节':'<span class="stage-missing">材料未交代</span>';
    })).join('')+
    row('指标与节点',record=>record.metrics.length ? record.metrics.map(item=>safe(words([item.label,item.value,item.context]))).join('<br>') : '<span class="stage-missing">材料未交代</span>')+
    row('证据边界',record=>safe(record.evidence))+
    row('对应条款',record=>record.links.length?action('case','查看 '+record.links.length+' 条','data-id="'+attr(record.id)+'" data-tab="links"'):'<span class="stage-missing">暂无关联</span>')+
    row('来源',record=>anchor(record.url,'打开原始材料'))+'</tbody></table></div></section>';
}
function methodPage() {
  const sections = [
    ['政策覆盖','图谱以中国大陆在施行期内的公开政策、技术文件和相关行业标准为主体。地方收录以已核得完整公开原文为限。页面标注文件层级、状态和适用范围。'],
    ['病例与项目','案例按可核验的人群、临床情境和服务环节遴选。案例类型描述主要场景，证据类型区分服务介绍、原始研究、病例报道和建设线索。标志性案例按公开证据的实施深度、评价方法和迁移价值选读。来源日期为资料公开日期或研究发表日期。项目的持续运行、患者覆盖和疗效需查机构最新披露。'],
    ['国外材料与中国条款','国际案例按国家和机构标注。关联用于帮助读者比较流程、转诊或质控设计，适用规则以所在地及机构的原件为准。'],
    ['可比指标','时间窗、覆盖人数、筛查率、研究样本与临床终点分别注明。研究结果按原始设计和样本解释，病例或单中心自报指标适用范围限于来源所述。'],
    ['全文与条款定位','每份政策均提供对应的官方公开文本、原始附件或政府转载入口。可以用 PDF 页码、章节或查找词定位。来源网站限制内嵌时，可使用新标签。'],
    ['离线使用','图谱包含底图、目录、案例和条款索引，适合离线演示。官方全文及原始材料页面需联网。资料核验截点为 2026 年 11 月 20 日。']
  ];
  return head('收录范围与资料','阅读案例、条款和国际参照时可核对以下口径。')+
    '<article class="pane method-panel"><h2>证据说明</h2>'+
    sections.map(([title,body])=>'<h3>'+title+'</h3><p>'+body+'</p>').join('')+
    '<h3>地图与界面参考</h3><ul class="source-list"><li>'+anchor(data.mapSources.china,'中国标准地图 · 自然资源部监制 · GS(2016)1600')+
    '</li><li>'+anchor(data.mapSources.world,'世界陆地轮廓 · Natural Earth 1:110m Land')+
    '</li><li>'+anchor('https://developer.apple.com/design/human-interface-guidelines/designing-for-macos','Apple Human Interface Guidelines · macOS')+
    ' · '+anchor('https://developer.apple.com/design/human-interface-guidelines/split-views','分栏与检查器')+
    ' · '+anchor('https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass','Liquid Glass')+'</li></ul></article>';
}
function keepEditing() {
  const focus = document.activeElement;
  if (!focus?.id || !/^(case-|policy-|map-|compact-nav|navigation-|compare-|fujian-tab-)/.test(focus.id)) return;
  return {id:focus.id,start:focus.selectionStart,end:focus.selectionEnd};
}
function render() {
  const cursor = keepEditing();
  const catalogScroll = document.querySelector('.policy-list')?.scrollTop;
  const view = state.route.view;
  renderNav();
  const routes={guide:guidePage,fujian:fujianPage,benchmarks:benchmarkPage,policy:policyPage,compare:comparePage,method:methodPage};
  const page = isScope(view) ? casesPage(view) : routes[view]();
  byId('screen').innerHTML = '<div class="screen-inner">'+page+
    '<footer class="attribution">癌症患者营养全周期管理 · 公开资料核验至 '+safe(date(guide.updateDate))+'</footer></div>';
  if (isScope(view)) applyMapTransform(state.scopes[view]);
  if (catalogScroll && view==='policy') document.querySelector('.policy-list').scrollTop = catalogScroll;
  if (cursor) {
    const next = byId(cursor.id);
    next?.focus({preventScroll:true});
    if (cursor.start !== null && cursor.start !== undefined) next?.setSelectionRange?.(cursor.start,cursor.end);
  }
}
let mapDrag = null;
function applyMapTransform(context) {
  const view = byId('map-viewport');
  const layer = byId('map-layer');
  if (!layer || !view) return;
  const maxX = view.clientWidth*(context.zoom-1)/2;
  const maxY = view.clientHeight*(context.zoom-1)/2;
  context.x = Math.max(-maxX, Math.min(maxX,context.x));
  context.y = Math.max(-maxY, Math.min(maxY,context.y));
  layer.style.transform = 'translate('+context.x+'px,'+context.y+'px) scale('+context.zoom+')';
  layer.style.setProperty('--inverse-scale',String(1/context.zoom));
}
function centerRegion(context,region) {
  const viewport = byId('map-viewport');
  if (!viewport || !region || context.zoom === 1) return;
  const place = state.route.view === 'china' ? data.regions.find(item=>item.name===region)?.at :
    byScope.world.find(record=>record.country===region)?.coordinates?.map((value,index)=>index ? (90-value)/1.8 : (value+180)/3.6);
  if (!place) return;
  context.x = (.5-place[0]/100)*viewport.clientWidth*context.zoom;
  context.y = (.5-place[1]/100)*viewport.clientHeight*context.zoom;
}
function setZoom(context,eventName) {
  const before = context.zoom;
  if (eventName==='zoom-reset') { context.zoom=1; context.x=0; context.y=0; }
  if (eventName==='zoom-in') context.zoom=Math.min(3,context.zoom+.35);
  if (eventName==='zoom-out') context.zoom=Math.max(1,context.zoom-.35);
  if (eventName==='zoom-in' && before===1) centerRegion(context,context.region || regionOf(cases.get(state.route.caseId) || {}));
  if (before>1 && ['zoom-in','zoom-out'].includes(eventName)) {
    context.x *= context.zoom/before;
    context.y *= context.zoom/before;
  }
  if (eventName==='zoom-europe') {
    context.zoom=2.35;
    const view = byId('map-viewport');
    context.x = view ? -view.clientWidth*.07 : 0;
    context.y = view ? view.clientHeight*.56 : 0;
  }
  render();
}
function toggleCompare(id) {
  if (!cases.has(id)) return;
  if (state.compare.includes(id)) {
    state.compare = state.compare.filter(item=>item!==id);
    announce('已移出对比');
  } else if (state.compare.length<3) {
    state.compare = [...state.compare,id];
    announce('已加入案例对比');
  } else {
    announce('对比最多可选择三个案例');
    const location = document.querySelector('.inspector-content');
    if (location && !location.querySelector('.compare-limit')) {
      location.insertAdjacentHTML('beforeend','<div class="effect-note compare-limit" role="status">已选满 3 个案例，可在对比台移出后继续添加。</div>');
    }
    return;
  }
  render();
}
function searchItems(query) {
  if (!query.trim()) {
    const popular = data.policies.slice(0,3).map(policy=>({type:'policy',id:policy.id,title:policy.title,meta:words([policy.region,policy.type])}));
    return [...(initialChina?[initialChina]:[]),...byScope.china.slice(0,2)].map(record=>({type:'case',id:record.id,title:record.title,meta:displayTitle(record)})).concat(popular);
  }
  const records = [...cases.values()].filter(record=>textMatches(caseSearchFields.get(record.id),query)).map(record=>({type:'case',id:record.id,title:record.title,meta:displayTitle(record),score:textMatches(record.title+' '+record.institution,query)?7:2}));
  const docs = data.policies.filter(policy=>textMatches(policyIndex(policy),query)).map(policy=>({type:'policy',id:policy.id,title:policy.title,meta:words([policy.region,policy.type,policy.number]),score:textMatches(policy.title+' '+policy.number,query)?9:1}));
  const clauses = data.policies.flatMap(policy=>policy.clauses.filter(clause=>textMatches([clause.title,clause.locator,clause.summary,clause.find].join(' '),query))
    .map(clause=>({type:'clause',id:policy.id,clause:clause.id,title:words([clause.locator,clause.title]),meta:policy.title,score:textMatches(clause.title+' '+clause.locator,query)?8:3})));
  return [...records,...docs,...clauses].sort((a,b)=>b.score-a.score).slice(0,28);
}
function searchRender() {
  const input = byId('global-query');
  const results = searchItems(input.value);
  state.searchResults = results;
  state.searchIndex = Math.max(0,Math.min(state.searchIndex,results.length-1));
  byId('search-results').innerHTML = results.length ? results.map((item,index)=>action('search-hit',
    symbol(item.type==='case'?'pin':item.type==='clause'?'link':'doc')+'<span class="row-text"><strong>'+safe(item.title)+'</strong><small>'+safe(item.meta)+'</small></span>'+
    badge(item.type==='case'?'案例':item.type==='clause'?'条款':'文件','blue'),
    'data-index="'+index+'" aria-current="'+press(index===state.searchIndex)+'"','result-row')).join('') :
    '<p class="result-empty">未找到匹配材料。可试试省份名、机构名或更短的关键词。</p>';
}
function openSearch() {
  const dialog = byId('search-dialog');
  if (dialog.open) return;
  state.searchIndex = 0;
  byId('global-query').value='';
  searchRender();
  dialog.showModal();
  byId('global-query').focus();
}
function pickSearch(index) {
  const result = state.searchResults[index];
  if (!result) return;
  byId('search-dialog').close();
  if (result.type === 'case') revealCase(result.id,{scroll:true});
  else showPolicy(result.id,result.clause);
}
let sourceOpener;
function openSource(id,clauseId,opener) {
  const policy = policies.get(id);
  if (!policy) return;
  const clause = clauseId ? policy.clauses.find(item=>item.id===clauseId) : null;
  sourceOpener = opener;
  const target = clause ? sourceTarget(policy,clause) : policy.previewUrl;
  byId('source-title').textContent = words([policy.title,clause?.locator]);
  byId('source-link').href = clause ? target : policy.fullTextUrl;
  byId('source-frame').src = target;
  byId('source-dialog').showModal();
}
byId('source-dialog').addEventListener('close',()=>{
  byId('source-frame').removeAttribute('src');
  sourceOpener?.focus({preventScroll:true});
});
byId('search-dialog').querySelector('form').addEventListener('submit',event=>{
  if (event.submitter?.value==='close') return;
  event.preventDefault();
  pickSearch(state.searchIndex);
});
byId('global-query').addEventListener('input',()=>{
  state.searchIndex = 0;
  searchRender();
});
byId('global-query').addEventListener('keydown',event=>{
  if (event.key==='Enter') {event.preventDefault(); pickSearch(state.searchIndex); return;}
  if (!['ArrowUp','ArrowDown'].includes(event.key) || !state.searchResults.length) return;
  event.preventDefault();
  state.searchIndex = (state.searchIndex+(event.key==='ArrowDown'?1:-1)+state.searchResults.length)%state.searchResults.length;
  searchRender();
  byId('search-results').querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
});

document.addEventListener('toggle',event=>{
  if (event.target.id==='home-evidence') state.homeEvidenceOpen=event.target.open;
  const match = event.target.dataset?.homeMatch;
  if (match) {
    if (event.target.open) state.homeMatchesOpen.add(match);
    else state.homeMatchesOpen.delete(match);
  }
},true);
document.addEventListener('click',async event=>{
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const options = control.dataset;
  const context = state.scopes[state.route.view];
  switch (options.action) {
    case 'view': setView(options.view); break;
    case 'home-stage':
      if (state.route.view==='guide' && guide.overview.stages.some(stage=>stage.id===options.stage)) {
        state.homeStage=options.stage;
        renderAndFocus('home-stage-'+options.stage);
      }
      break;
    case 'guide-section': byId('guide-'+options.section)?.scrollIntoView({block:'start'}); break;
    case 'fujian-map': openChina({region:'福建'}); break;
    case 'show-flagships': openChina({featured:true}); break;
    case 'flagship-filter': context.featured=!context.featured; syncFilterResults(); renderAndFocus('case-flagship'); break;
    case 'fujian-tab':
      state.fujianTab=options.tab;
      if (state.route.view==='fujian') renderAndFocus('fujian-tab-'+options.tab);
      else {
        setView('fujian');
        byId('guide-fujian-plan')?.scrollIntoView({block:'start'});
      }
      break;
    case 'benchmark-all':
      state.benchmarkAll=true;
      if (state.route.view==='benchmarks') renderAndFocus('benchmark-hospital-all');
      else setView('benchmarks');
      break;
    case 'fujian-hospital':
      if (guide.fujian.hospitals.some(hospital=>hospital.id===options.hospital)) {
        const view = options.view==='benchmarks' ? 'benchmarks' : 'fujian';
        const buttonId = (view==='benchmarks'?'benchmark-hospital-':'fujian-hospital-')+options.hospital;
        state.fujianHospital=options.hospital;
        if (view==='benchmarks') state.benchmarkAll=false;
        if (state.route.view===view) renderAndFocus(buttonId);
        else {
          setView(view);
          if (view==='fujian') byId('guide-fujian-hospitals')?.scrollIntoView({block:'start'});
          byId(buttonId)?.focus({preventScroll:true});
        }
      }
      break;
    case 'share-section': {
      const url = new URL('#'+options.view,location.href);
      try { await navigator.clipboard.writeText(url.href); control.textContent='已复制链接'; }
      catch { window.prompt('复制本节链接',url.href); }
      break;
    }
    case 'sidebar': state.showSidebar=!state.showSidebar; renderNav(); if (context) applyMapTransform(context); break;
    case 'present': state.presentation=!state.presentation; renderNav(); if (context) applyMapTransform(context); break;
    case 'back': case 'forward': historyMove(options.action); break;
    case 'search': openSearch(); break;
    case 'search-hit': pickSearch(Number(options.index)); break;
    case 'mode': context.mode=options.mode; render(); break;
    case 'case-more': context.moreFilters=!context.moreFilters; renderAndFocus('case-more'); break;
    case 'clear-case': clearCriteria(context); syncFilterResults(); render(); break;
    case 'clear-policy': state.policy={query:'',region:'',stage:'',kind:''}; render(); break;
    case 'map-region': openCasesForRegion(options.region); break;
    case 'zoom-in': case 'zoom-out': case 'zoom-reset': case 'zoom-europe': setZoom(context,options.action); break;
    case 'case': revealCase(options.id,{scroll:true,tab:options.tab,region:options.region}); break;
    case 'case-tab':
      state.route.caseTab=options.tab;
      state.route.focusedStep=options.step||'';
      renderAndFocus('case-tab-'+options.tab);
      if (options.step) document.querySelector('.timeline .marked')?.scrollIntoView({block:'nearest'});
      break;
    case 'return-case': recordRoute({panelDoc:'',panelClause:'',caseTab:'links'}); renderAndFocus('case-title'); break;
    case 'inline-policy': showPolicy(options.id,options.clause,true); break;
    case 'policy': showPolicy(options.id,options.clause); break;
    case 'policy-clause': recordRoute({docId:options.id,clauseId:options.clause}); render(); break;
    case 'toggle-compare': toggleCompare(options.id); break;
    case 'compare-preset':
      state.compare=options.set.split('|').filter(id=>cases.has(id)).slice(0,3);
      if (state.route.view==='compare') render();
      else setView('compare');
      break;
    case 'source': openSource(options.id,options.clause,control); break;
    case 'close-source': byId('source-dialog').close(); break;
    case 'copy':
      try { await navigator.clipboard.writeText(options.text); control.textContent='已复制'; }
      catch { control.textContent='可选中上方查找词'; }
      break;
  }
});
document.addEventListener('input',event=>{
  if (event.target.id==='case-query' && isScope(state.route.view)) {
    state.scopes[state.route.view].query = event.target.value;
    syncFilterResults();
    render();
  }
  if (event.target.id==='policy-query') {
    state.policy.query=event.target.value;
    document.querySelector('.policy-list').scrollTop=0;
    render();
  }
});
document.addEventListener('change',event=>{
  const control = event.target;
  if (control.id==='compact-nav') {setView(control.value);return;}
  if (control.id==='compare-missing') {state.compareMissing=control.checked;render();return;}
  const [prefix,key]=control.id.split('-');
  if (prefix==='case' && ['region','category','step','evidence','cancer'].includes(key) && isScope(state.route.view)) {
    const context = state.scopes[state.route.view];
    context[key]=control.value;
    if (key==='region') centerRegion(context,control.value);
    syncFilterResults();
    render();
  }
  if (prefix==='policy' && ['region','stage','kind'].includes(key)) {
    state.policy[key]=control.value;
    render();
  }
});
byId('screen').addEventListener('pointerdown',event=>{
  const surface = event.target.closest('#map-viewport');
  const context = state.scopes[state.route.view];
  if (!surface || !context || context.zoom<=1 || event.button!==0 || event.target.closest('button')) return;
  surface.setPointerCapture(event.pointerId);
  mapDrag = {surface,context,startX:event.clientX,startY:event.clientY,x:context.x,y:context.y};
  surface.classList.add('dragging');
});
byId('screen').addEventListener('pointermove',event=>{
  if (!mapDrag) return;
  const {context,startX,startY,x,y}=mapDrag;
  context.x=x+event.clientX-startX;
  context.y=y+event.clientY-startY;
  applyMapTransform(context);
});
for (const name of ['lostpointercapture','pointerup','pointercancel']) {
  byId('screen').addEventListener(name,()=>{
    mapDrag?.surface.classList.remove('dragging');
    mapDrag = null;
  });
}
document.addEventListener('keydown',event=>{
  if ((event.metaKey||event.ctrlKey) && event.key.toLowerCase()==='k' && !byId('source-dialog').open) {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.target.id!=='map-viewport' || !isScope(state.route.view)) return;
  const context = state.scopes[state.route.view];
  if (event.key==='+' || event.key==='=') {event.preventDefault();setZoom(context,'zoom-in');return;}
  if (event.key==='-') {event.preventDefault();setZoom(context,'zoom-out');return;}
  if (event.key==='Home') {event.preventDefault();setZoom(context,'zoom-reset');return;}
  if (context.zoom<=1) return;
  const delta = {ArrowUp:[0,35],ArrowDown:[0,-35],ArrowLeft:[35,0],ArrowRight:[-35,0]}[event.key];
  if (!delta) return;
  event.preventDefault();
  context.x += delta[0];
  context.y += delta[1];
  applyMapTransform(context);
});
window.addEventListener('resize',()=>{
  if (isScope(state.route.view)) applyMapTransform(state.scopes[state.route.view]);
});
window.addEventListener('hashchange',()=>{
  const [view,detail] = readLink();
  if (view==='benchmarks') {
    state.benchmarkAll=detail==='all';
    const hospital = guide.fujian.hospitals.find(entry=>entry.id===detail);
    if (hospital) state.fujianHospital=hospital.id;
    if (state.route.view===view) render();
    else setView(view);
    return;
  }
  const record = byScope[view]?.find(entry=>entry.id===detail);
  if (record) {
    revealCase(record.id,{region:regionOf(record)});
    return;
  }
  const preset = view==='compare' && fujianComparisons.get(detail);
  if (preset) {
    state.compare=preset.slice(1);
    if (state.route.view===view) render();
    else setView(view);
    return;
  }
  setView(view);
});
for (const element of document.querySelectorAll('i[data-icon]')) {
  element.outerHTML=symbol(element.dataset.icon);
}
render();
