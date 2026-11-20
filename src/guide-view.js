function guideReference(ref) {
  if (ref.type==='source') return anchor(ref.url,ref.label,'button');
  const routes = {
    case:['case','data-id'], policy:['policy','data-id'], view:['view','data-view'], section:['guide-section','data-section']
  };
  const [operation,attribute] = routes[ref.type];
  return action(operation,safe(ref.label),attribute+'="'+attr(ref.id)+'"'+(ref.clause?' data-clause="'+attr(ref.clause)+'"':''));
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
function flagshipSection() {
  return '<section id="guide-flagships" class="guide-block" aria-label="中国大陆标志性案例"><div class="guide-section-head"><div><h2>中国大陆标志性案例</h2><p>'+safe(guide.flagshipIntro)+'</p></div>'+
    action('show-flagships',symbol('star')+'在地图查看','', 'button primary')+'</div><div class="guide-cards featured-cards">'+
    guide.flagships.map(entry=>{
      const record=cases.get(entry.id);
      return '<article class="pane guide-card">'+badge('★ '+entry.lens,'amber')+'<h3>'+safe(record.institution)+'</h3><p>'+safe(entry.why)+'</p>'+
       '<p class="meta">'+safe(entry.bounds)+'</p>'+guideReferences([{type:'case',id:entry.id,label:'查看案例与证据'}])+'</article>';
    }).join('')+'</div></section>';
}
function guidePage() {
  const content=guide.overview;
  return head(content.title,content.subtitle,[[byScope.china.length,'大陆案例'],[data.policies.length,'中国政策文件'],[flagships.size,'标志性案例']])+
    guideThesis('我对全周期营养管理的理解',content.thesis,
      action('guide-section','全周期路径','data-section="cycle"','button primary')+
      action('guide-section','全国标志性案例','data-section="flagships"')+
      action('view','福建试点建议','data-view="fujian"')+shareButton('guide'))+
    '<section class="guide-block" aria-label="阅读索引"><div class="guide-section-head"><h2>阅读索引</h2></div><div class="guide-cards">'+content.routes.map(entry=>
      '<article class="pane guide-card"><h3>'+safe(entry.title)+'</h3><p>'+safe(entry.detail)+'</p>'+guideReferences([entry.target])+'</article>').join('')+'</div></section>'+
    '<section id="guide-cycle" class="guide-block" aria-label="全周期照护路径"><div class="guide-section-head"><h2>全周期照护路径</h2></div><ol class="pane guide-cycle">'+
    content.cycle.map(entry=>'<li><h3>'+safe(entry.label)+'</h3><p>'+safe(entry.summary)+'</p>'+guideReferences(entry.refs)+'</li>').join('')+'</ol></section>'+
    flagshipSection()+'<p class="guide-footnote">'+safe(content.use)+'</p>';
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
    '<div class="hospital-heading"><h3 id="fujian-hospital-title">'+safe(active.name)+'</h3>'+badge(active.scenario,'blue')+'</div>'+
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
    action('fujian-map',symbol('map')+'查看福建案例')+shareButton('fujian'))+
    fujianHospitals(content.hospitals)+
    '<section class="guide-block" aria-label="合作分工"><div class="guide-section-head"><h2>谁负责什么</h2></div>'+
    fujianCards(content.roles)+'</section>'+
    '<section class="guide-block" id="guide-fujian-plan" aria-label="公司项目方案"><div class="guide-section-head"><h2>公司项目方案</h2><div class="segmented fujian-segments" aria-label="公司项目方案视图">'+Object.entries(tabs).map(([id,[label]])=>
      action('fujian-tab',safe(label),'id="fujian-tab-'+id+'" data-tab="'+id+'" aria-controls="fujian-content" aria-pressed="'+press(id===state.fujianTab)+'"','')).join('')+'</div></div>'+
    '<div id="fujian-content">'+renderTab()+'</div></section><p class="guide-footnote">'+safe(content.guardrail)+'</p>';
}
