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
    '<h3>'+safe(entry.title)+'</h3><dl><dt>福建可先做</dt><dd>'+safe(entry.local)+'</dd><dt>从案例借鉴</dt><dd>'+safe(entry.transfer)+
    '</dd><dt>落地前核对</dt><dd>'+safe(entry.limit)+'</dd></dl>'+guideReferences(entry.refs)+'</article>').join('')+'</div>'+
    '<article class="pane guide-card cost-note"><h3>'+safe(content.cost.title)+'</h3><p>'+safe(content.cost.detail)+'</p>'+guideReferences(content.cost.refs)+'</article>';
}
function fujianPilot(content) {
  return '<ol class="pane guide-cycle">'+content.pilot.map(entry=>'<li>'+badge(entry.label,'blue')+'<h3>'+safe(entry.title)+'</h3><p>'+safe(entry.detail)+'</p></li>').join('')+'</ol>';
}
function fujianMetrics(content) {
  return '<div class="guide-cards action-cards">'+content.metrics.map(entry=>'<article class="pane guide-card"><h3>'+safe(entry.name)+'</h3><p class="metric-definition">'+
    safe(entry.definition)+'</p><p class="meta">'+safe(entry.note)+'</p></article>').join('')+'</div>';
}
function fujianPage() {
  const content=guide.fujian;
  const tabs={actions:'优先措施',pilot:'90 天试点',metrics:'看哪些指标'};
  const body=state.fujianTab==='pilot'?fujianPilot(content):state.fujianTab==='metrics'?fujianMetrics(content):fujianActions(content);
  return head(content.title,content.subtitle,[],'地方应用')+guideThesis('建议的起点',content.thesis,
    action('fujian-map',symbol('map')+'查看福建案例','','button primary')+shareButton('fujian'))+
    '<section class="guide-block" aria-label="福建已有基础"><div class="guide-section-head"><h2>福建已有基础</h2></div><div class="guide-cards">'+
    content.foundation.map(entry=>'<article class="pane guide-card"><h3>'+safe(entry.title)+'</h3><p>'+safe(entry.detail)+'</p>'+guideReferences(entry.refs)+'</article>').join('')+'</div></section>'+
    '<section class="guide-block" aria-label="福建落地方案"><div class="guide-section-head"><h2>福建落地方案</h2><div class="segmented" aria-label="落地方案视图">'+Object.entries(tabs).map(([id,label])=>
      action('fujian-tab',safe(label),'id="fujian-tab-'+id+'" data-tab="'+id+'" aria-controls="fujian-content" aria-pressed="'+press(id===state.fujianTab)+'"','')).join('')+'</div></div>'+
    '<div id="fujian-content">'+body+'</div></section><p class="guide-footnote">'+safe(content.guardrail)+'</p>';
}
