/* v5 迁移：旧版缓存的 HTML 仍会引用本文件。只强制刷新一次（sessionStorage 防止无限刷新），换取新版页面。 */
(function(){try{if(sessionStorage.getItem('aidd-v5-reload'))return;sessionStorage.setItem('aidd-v5-reload','1')}catch(e){return}
fetch(location.href,{cache:'reload'}).catch(function(){}).then(function(){location.reload()})})();
