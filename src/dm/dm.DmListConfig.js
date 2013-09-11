/* =============================================================================
 * List configurations
 * ========================================================================== */
// -- web UI templates ---------------------------------------------------------
FM.DmList.addConfiguration('getTemplate', {  
    url: FM.getAttr(window,"FM_RESOURCES_PATH","") + '/resources/templates',
    method: 'GET',
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
