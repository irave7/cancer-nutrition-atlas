function guideReference(ref) {
  if (ref.type==='source') return anchor(ref.url,ref.label,'button');
  const routes = {
    case:['case','data-id'], policy:['policy','data-id'], view:['view','data-view'], section:['guide-section','data-section']
  };
  const [operation,attribute] = routes[ref.type];
  return action(operation,safe(ref.label),attribute+'="'+attr(ref.id)+'"'+(ref.clause?' data-clause="'+attr(ref.clause)+'"':'')+
    (ref.region?' data-region="'+attr(ref.region)+'"':''));
}
function guideReferences(refs) {
  return refs?.length?'<div class="actions">'+refs.map(guideReference).join('')+'</div>':'';
}
function shareButton(view) {
  if (!['https:','http:'].includes(location.protocol)) return '';
  return action('share-section',symbol('link')+'复制本节链接','data-view="'+view+'"','button');
}
function guideThesis(title,text,buttons='') {
  return '<section class="pane guide-thesis"><div><h2>'+safe(title)+'</h2><p>'+safe(text)+'</p></div>'+(buttons?'<div class="actions">'+buttons+'</div>':'')+'</section>';
}
function homeRow(ref,title,summary,meta) {
  const target = 'data-id="'+attr(ref.id)+'"'+(ref.clause?' data-clause="'+attr(ref.clause)+'"':'');
  const content = '<span class="home-row-text"><strong>'+safe(title)+'</strong><span>'+safe(summary)+'</span>'+
    '<small>'+safe(meta)+'</small></span>'+symbol('right');
  return '<li>'+action(ref.type,content,target,'home-row')+'</li>';
}
function homeSummaryCard(title,icon,content,links) {
  return '<article class="pane executive-card"><h2>'+symbol(icon)+safe(title)+'</h2><h3>'+safe(content.headline)+'</h3>'+
    '<p>'+safe(content.detail)+'</p>'+links+'</article>';
}
function homeExecutive(content) {
  const overview = content.executive;
  const hospitals = overview.hospitals.map(entry=>{
    const hospital = guide.fujian.hospitals.find(item=>item.id===entry.id);
    const label = '<span><strong>'+safe(hospital.short)+'</strong><small>'+safe(entry.disease)+'</small></span>'+
      '<span class="executive-hospital-focus">'+safe(entry.focus)+'</span><span class="executive-hospital-basis">'+safe(entry.basis)+'</span>'+symbol('right');
    return '<li>'+action('fujian-hospital',label,'data-hospital="'+attr(hospital.id)+'"','executive-hospital')+'</li>';
  }).join('');
  return '<section class="executive-hero" aria-labelledby="executive-title"><div class="executive-lead">'+
    '<h1 id="executive-title">'+safe(content.title)+'</h1><p class="executive-takeaway">'+safe(overview.takeaway)+'</p>'+
    '<p class="executive-scope">'+safe(content.subtitle)+'</p><div class="actions executive-actions">'+
    action('view','查看福建试点','data-view="fujian"','button executive-primary')+
    action('benchmark-all','三院并排对照','','button executive-secondary')+'</div></div>'+
    '<div class="executive-pilot"><span>建议试点周期</span><strong>'+safe(overview.pilotDuration)+'</strong></div></section>'+
    '<section class="executive-cards" aria-label="政策、标杆与试点验收">'+
    homeSummaryCard('政策依据','doc',overview.policy,guideReferences(overview.policy.refs))+
    homeSummaryCard('国内标杆','star',overview.benchmark,guideReferences(overview.benchmark.refs))+
    homeSummaryCard('试点怎么验收','check',overview.acceptance,'<div class="actions">'+action('fujian-tab','查看验收指标','data-tab="metrics"')+'</div>')+'</section>'+
    '<section class="pane executive-hospitals" aria-labelledby="executive-hospitals-title"><h2 id="executive-hospitals-title">福建三院拟从哪里切入</h2>'+
    '<ul>'+hospitals+'</ul></section>';
}
function homePathway(content) {
  const active = content.stages.find(stage=>stage.id===state.homeStage) || content.stages[0];
  const nodes = content.stages.map(stage=>{
    const caption = '<span class="home-flow-icon">'+symbol(stage.icon)+'</span><span class="home-node-text"><strong>'+safe(stage.title)+'</strong><small>'+safe(stage.cue)+'</small></span>';
    return '<li>'+action('home-stage',caption,'id="home-stage-'+attr(stage.id)+'" data-stage="'+attr(stage.id)+
      '" aria-controls="home-stage-panel" aria-pressed="'+press(stage===active)+'"','home-flow-node')+'</li>';
  }).join('');
  const policyRows = active.policies.map(ref=>homeRow(ref,ref.label,ref.summary,ref.meta)).join('');
  const caseRows = active.cases.map(ref=>{
    const {home} = flagships.get(ref.id);
    return homeRow(ref,home.name,home.summary,home.evidence);
  }).join('');
  return '<section class="pane home-flow" aria-label="营养照护流程图"><ol class="home-flow-track">'+nodes+'</ol></section>'+
    '<section class="pane home-stage-panel" id="home-stage-panel" aria-labelledby="home-stage-title">'+
    '<header class="home-stage-header"><h2 id="home-stage-title">'+safe(active.title)+'</h2><p>'+safe(active.detail)+'</p></header>'+
    '<div class="home-stage-evidence"><div class="home-evidence home-policies"><h3>'+symbol('doc')+'对应政策</h3><ul>'+policyRows+'</ul></div>'+
    '<div class="home-evidence home-cases"><h3>'+symbol('star')+'国内标杆</h3><ul>'+caseRows+'</ul></div></div></section>'+
    '<nav class="actions home-library" aria-label="查看完整资料">'+
    action('view','查看政策库','data-view="policy"')+action('show-flagships','在地图查看标杆')+shareButton('guide')+'</nav>'+
    '<details class="home-palliative"><summary>'+safe(content.palliative.label)+'</summary><p>'+safe(content.palliative.summary)+'</p>'+
    guideReferences(content.palliative.refs)+'</details>';
}
function guidePage() {
  const content = guide.overview;
  return homeExecutive(content)+'<details class="pane executive-evidence" id="home-evidence"'+
    (state.homeEvidenceOpen?' open':'')+'><summary>按照护阶段查政策与案例</summary>'+
    '<div class="executive-pathway">'+homePathway(content)+'</div></details>';
}
function fujianActions(content) {
  return '<div class="guide-cards action-cards">'+content.actions.map(entry=>'<article class="pane guide-card">'+badge(entry.layer,'blue')+
    '<h3>'+safe(entry.title)+'</h3><dl><dt>公司交付</dt><dd>'+safe(entry.local)+'</dd><dt>从案例借鉴</dt><dd>'+safe(entry.transfer)+
    '</dd><dt>合作边界</dt><dd>'+safe(entry.limit)+'</dd></dl>'+guideReferences(entry.refs)+'</article>').join('')+'</div>';
}
function fujianPilot(content) {
  return '<ol class="pane guide-cycle">'+content.pilot.map(entry=>'<li>'+badge(entry.label,'blue')+'<h3>'+safe(entry.title)+'</h3><p>'+safe(entry.detail)+'</p></li>').join('')+'</ol>';
}
function fujianMetrics(content) {
  return '<div class="guide-cards action-cards">'+content.metrics.map(entry=>'<article class="pane guide-card"><h3>'+safe(entry.name)+'</h3><p class="metric-definition">'+
    safe(entry.definition)+'</p><p class="meta">'+safe(entry.note)+'</p></article>').join('')+'</div>';
}
function fujianCards(entries,layout='') {
  return '<div class="guide-cards '+layout+'">'+entries.map(entry=>
    '<article class="pane guide-card"><h3>'+safe(entry.title)+'</h3><p>'+safe(entry.detail)+'</p>'+guideReferences(entry.refs)+'</article>').join('')+'</div>';
}
function fujianHospitals(hospitals) {
  const active=hospitals.find(entry=>entry.id===state.fujianHospital) || hospitals[0];
  return '<section class="guide-block" id="guide-fujian-hospitals" aria-label="三院方案"><div class="guide-section-head">'+
    '<h2>三院方案</h2><div class="segmented fujian-segments" aria-label="选择医院">'+hospitals.map(entry=>
      action('fujian-hospital',safe(entry.short),'id="fujian-hospital-'+attr(entry.id)+'" data-hospital="'+attr(entry.id)+
      '" aria-controls="fujian-hospital-panel" aria-pressed="'+press(entry===active)+'"','')).join('')+'</div></div>'+
    '<article class="pane hospital-plan" id="fujian-hospital-panel" aria-labelledby="fujian-hospital-title">'+
    '<div class="hospital-heading"><h3 id="fujian-hospital-title">'+safe(active.name)+'</h3>'+badge(active.scenario,'blue')+
    guideReference({...active.case,region:'福建'})+'</div>'+
    '<section class="hospital-evidence" aria-label="已公开的措施与案例"><h4>已公开的措施与案例</h4><ul class="hospital-sources">'+
      active.evidence.map(entry=>'<li><p class="hospital-source-meta">'+safe(entry.date)+' · '+safe(entry.kind)+'</p><h5>'+safe(entry.title)+'</h5><p>'+
        safe(entry.detail)+'</p>'+guideReferences(entry.refs)+'</li>').join('')+'</ul></section>'+
    '<section class="hospital-proposal" aria-label="拟议的医助流程"><h4>拟议的医助接入与院内流程</h4><p>'+safe(active.entry)+'</p>'+
    '<ol class="hospital-steps">'+active.steps.map(step=>'<li><h5>'+safe(step.label)+'</h5>'+
      '<dl><dt>医助协助</dt><dd>'+safe(step.aid)+'</dd><dt>院方负责</dt><dd>'+safe(step.clinical)+'</dd></dl></li>').join('')+'</ol>'+
    '<p class="hospital-confirm"><strong>需与院方确认</strong> '+safe(active.confirm)+'</p>'+
    '<p class="hospital-check"><strong>首个验收点</strong> '+safe(active.check)+'</p></section>'+
    '<div class="hospital-references"><h4>对应条款与参考案例</h4>'+guideReferences(active.refs)+'</div></article></section>';
}
function fujianPage() {
  const content=guide.fujian;
  const tabs={
    actions:['服务交付',()=>fujianActions(content)],
    pilot:['90 天试点',()=>fujianPilot(content)],
    metrics:['验收指标',()=>fujianMetrics(content)],
    commercial:['合作与预算',()=>fujianCards(content.commercial,'action-cards')]
  };
  const [,renderTab]=tabs[state.fujianTab] || tabs.actions;
  return head(content.title,content.subtitle,[],'福建 · 院内医助协作')+guideThesis('从门诊和病房开始',content.thesis,
    action('guide-section','查看三院方案','data-section="fujian-hospitals"','button primary')+
    action('view','三院参考案例','data-view="benchmarks"')+
    action('compare-preset',symbol('compare')+'并排对比三院','data-set="'+attr(fujianCaseIds.join('|'))+'"')+
    action('fujian-map',symbol('map')+'查看福建案例')+shareButton('fujian'))+
    fujianHospitals(content.hospitals)+
    '<section class="guide-block" aria-label="合作分工"><div class="guide-section-head"><h2>谁负责什么</h2></div>'+
    fujianCards(content.roles)+'</section>'+
    '<section class="guide-block" id="guide-fujian-plan" aria-label="公司项目方案"><div class="guide-section-head"><h2>公司项目方案</h2><div class="segmented fujian-segments" aria-label="公司项目方案视图">'+Object.entries(tabs).map(([id,[label]])=>
      action('fujian-tab',safe(label),'id="fujian-tab-'+id+'" data-tab="'+id+'" aria-controls="fujian-content" aria-pressed="'+press(id===state.fujianTab)+'"','')).join('')+'</div></div>'+
    '<div id="fujian-content">'+renderTab()+'</div></section><p class="guide-footnote">'+safe(content.guardrail)+'</p>';
}
function benchmarkHospitalModules(active,comparison,fields) {
  return comparison.modules.map(module=>{
    const compareIds = [active.case.id,...module.references.map(ref=>ref.id)].join('|');
    return '<section class="pane benchmark-module" id="guide-benchmark-'+attr(module.id)+'" aria-label="'+attr(module.title)+'">'+
      '<div class="guide-section-head"><h3>'+safe(module.title)+'</h3>'+
      action('compare-preset',symbol('compare')+'并排对比本模块','data-set="'+attr(compareIds)+'"')+'</div>'+
      '<div class="benchmark-grid"><div class="benchmark-current">'+fields.map(([field,label])=>
        '<h4>'+safe(label)+'</h4><p>'+safe(module[field])+'</p>').join('')+'</div>'+
      '<div><h4>参考案例的做法与证据</h4><ul class="benchmark-references">'+module.references.map(ref=>{
        const record = cases.get(ref.id);
        return '<li><p class="meta">'+safe(words([regionOf(record),record.institution,evidenceTypes[record.evidenceType]]))+'</p>'+
          '<h5>'+safe(ref.label)+'</h5><p>'+safe(ref.detail)+'</p>'+
          guideReference({...ref,label:'查看案例与原文'})+'</li>';
      }).join('')+'</ul></div></div>'+
      '<div class="benchmark-policy"><h4>对应政策细则</h4>'+guideReferences(module.policy)+'</div></section>';
  }).join('');
}
function benchmarkJointModules(hospitals,content,fields) {
  return Object.entries(content.stages).map(([id,title],index)=>{
    const modules = hospitals.map(hospital=>content.hospitals[hospital.id].modules[index]);
    const row = (label,cell)=>'<tr><th scope="row">'+safe(label)+'</th>'+modules.map(module=>'<td>'+cell(module)+'</td>').join('')+'</tr>';
    return '<section class="pane benchmark-module" id="guide-benchmark-'+attr(id)+'" aria-label="'+attr(title)+'">'+
      '<h3>'+safe(title)+'</h3><div class="compare-scroll" tabindex="0" aria-label="'+attr(title)+'的三院对比表，可横向滚动">'+
      '<table class="compare-table benchmark-table"><thead><tr><th scope="col">对照维度</th>'+hospitals.map(hospital=>
        '<th scope="col">'+safe(hospital.short)+'</th>').join('')+'</tr></thead><tbody>'+
      fields.map(([field,label])=>row(label,module=>safe(module[field]))).join('')+
      row('参考案例',module=>guideReferences(module.references))+
      row('对应政策细则',module=>guideReferences(module.policy))+'</tbody></table></div></section>';
  }).join('');
}
function benchmarkPage() {
  const content = guide.benchmarks;
  const fields = [['baseline','本院公开基础'],['apply','拟接入的医助工作'],['measure','试点验收']];
  const hospitals = guide.fujian.hospitals;
  const active = hospitals.find(hospital=>hospital.id===state.fujianHospital) || hospitals[0];
  const comparison = content.hospitals[active.id];
  const all = state.benchmarkAll;
  const selector = '<div class="segmented fujian-segments" aria-label="选择对照医院">'+hospitals.map(hospital=>
    action('fujian-hospital',safe(hospital.short),'id="benchmark-hospital-'+attr(hospital.id)+'" data-hospital="'+attr(hospital.id)+
      '" data-view="benchmarks" aria-controls="benchmark-panel" aria-pressed="'+press(!all && hospital===active)+'"','')).join('')+
    action('benchmark-all','三院并排','id="benchmark-hospital-all" aria-controls="benchmark-panel" aria-pressed="'+press(all)+'"','')+'</div>';
  const moduleIndex = '<nav class="actions benchmark-index" aria-label="按诊疗阶段查看">'+Object.entries(content.stages).map(([id,title])=>
    action('guide-section',safe(title),'data-section="benchmark-'+attr(id)+'"')).join('')+'</nav>';
  const heading = all ? '<h3>三院分阶段对照</h3>' : '<h3>'+safe(active.name)+'</h3>'+badge(active.scenario,'blue');
  const casesLink = all ? action('compare-preset','打开三院证据对比表','data-set="'+attr(fujianCaseIds.join('|'))+'"') :
    guideReference({...active.case,region:'福建',label:'查看本院独立案例'});
  return head(content.title,content.subtitle,[],'福建 · 参考案例')+
    '<section class="guide-block" aria-label="医院与对照索引"><div class="guide-section-head"><h2>选择对照视图</h2>'+selector+'</div>'+
    '<div id="benchmark-panel" class="pane benchmark-overview"><div class="hospital-heading">'+heading+'</div>'+
    '<p>'+safe(all?content.jointIntro:comparison.intro)+'</p>'+moduleIndex+'<div class="actions benchmark-quick-links">'+casesLink+
    action('view','返回福建试点方案','data-view="fujian"')+shareButton('benchmarks/'+(all?'all':active.id))+'</div></div></section>'+
    (all?benchmarkJointModules(hospitals,content,fields):benchmarkHospitalModules(active,comparison,fields));
}
