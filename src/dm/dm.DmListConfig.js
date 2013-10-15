/* =============================================================================
 * List configurations
 * 
 * Default for templates and translations
 * ========================================================================== */
// -- web UI templates ---------------------------------------------------------
FM.DmList.addConfiguration('getTemplate', {  
    url: "[:fm_templates_path]",
    method: 'GET',
    cache: 'true',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: {},
    auth: null,        
    responseFormat: 'TEXT',
    validResponseCodes: '200',
    listType: 'single'
},'GLOBAL');

// -- web UI templates ---------------------------------------------------------
FM.DmList.addConfiguration('getTranslations', {  
    url: FM.getAttr(window,"FM_TRANSLATIONS_URL",""),
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: {},
    auth: null,        
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection'
},'GLOBAL');
