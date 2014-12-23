self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{};var Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{encode:function(e){return e instanceof a?new a(e.type,t.util.encode(e.content),e.alias):"Array"===t.util.type(e)?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var a=t.util.type(e);switch(a){case"Object":var n={};for(var s in e)e.hasOwnProperty(s)&&(n[s]=t.util.clone(e[s]));return n;case"Array":return e.slice()}return e}},languages:{extend:function(e,a){var n=t.util.clone(t.languages[e]);for(var s in a)n[s]=a[s];return n},insertBefore:function(e,a,n,s){s=s||t.languages;var i=s[e];if(2==arguments.length){n=arguments[1];for(var l in n)n.hasOwnProperty(l)&&(i[l]=n[l]);return i}var r={};for(var o in i)if(i.hasOwnProperty(o)){if(o==a)for(var l in n)n.hasOwnProperty(l)&&(r[l]=n[l]);r[o]=i[o]}return t.languages.DFS(t.languages,function(t,a){a===s[e]&&t!=e&&(this[t]=r)}),s[e]=r},DFS:function(e,a,n){for(var s in e)e.hasOwnProperty(s)&&(a.call(e,s,e[s],n||s),"Object"===t.util.type(e[s])?t.languages.DFS(e[s],a):"Array"===t.util.type(e[s])&&t.languages.DFS(e[s],a,s))}},highlightAll:function(e,a){for(var n,s=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),i=0;n=s[i++];)t.highlightElement(n,e===!0,a)},highlightElement:function(n,s,i){for(var l,r,o=n;o&&!e.test(o.className);)o=o.parentNode;if(o&&(l=(o.className.match(e)||[,""])[1],r=t.languages[l]),r){n.className=n.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=n.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var g=n.textContent;if(g){var c={element:n,language:l,grammar:r,code:g};if(t.hooks.run("before-highlight",c),s&&self.Worker){var u=new Worker(t.filename);u.onmessage=function(e){c.highlightedCode=a.stringify(JSON.parse(e.data),l),t.hooks.run("before-insert",c),c.element.innerHTML=c.highlightedCode,i&&i.call(c.element),t.hooks.run("after-highlight",c)},u.postMessage(JSON.stringify({language:c.language,code:c.code}))}else c.highlightedCode=t.highlight(c.code,c.grammar,c.language),t.hooks.run("before-insert",c),c.element.innerHTML=c.highlightedCode,i&&i.call(n),t.hooks.run("after-highlight",c)}}},highlight:function(e,n,s){var i=t.tokenize(e,n);return a.stringify(t.util.encode(i),s)},tokenize:function(e,a){var n=t.Token,s=[e],i=a.rest;if(i){for(var l in i)a[l]=i[l];delete a.rest}e:for(var l in a)if(a.hasOwnProperty(l)&&a[l]){var r=a[l];r="Array"===t.util.type(r)?r:[r];for(var o=0;o<r.length;++o){var g=r[o],c=g.inside,u=!!g.lookbehind,p=0,d=g.alias;g=g.pattern||g;for(var f=0;f<s.length;f++){var m=s[f];if(s.length>e.length)break e;if(!(m instanceof n)){g.lastIndex=0;var h=g.exec(m);if(h){u&&(p=h[1].length);var y=h.index-1+p,h=h[0].slice(p),k=h.length,v=y+k,b=m.slice(0,y+1),w=m.slice(v+1),x=[f,1];b&&x.push(b);var P=new n(l,c?t.tokenize(h,c):h,d);x.push(P),w&&x.push(w),Array.prototype.splice.apply(s,x)}}}}}return s},hooks:{all:{},add:function(e,a){var n=t.hooks.all;n[e]=n[e]||[],n[e].push(a)},run:function(e,a){var n=t.hooks.all[e];if(n&&n.length)for(var s,i=0;s=n[i++];)s(a)}}},a=t.Token=function(e,t,a){this.type=e,this.content=t,this.alias=a};if(a.stringify=function(e,n,s){if("string"==typeof e)return e;if("[object Array]"==Object.prototype.toString.call(e))return e.map(function(t){return a.stringify(t,n,e)}).join("");var i={type:e.type,content:a.stringify(e.content,n,s),tag:"span",classes:["token",e.type],attributes:{},language:n,parent:s};if("comment"==i.type&&(i.attributes.spellcheck="true"),e.alias){var l="Array"===t.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(i.classes,l)}t.hooks.run("wrap",i);var r="";for(var o in i.attributes)r+=o+'="'+(i.attributes[o]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+r+">"+i.content+"</"+i.tag+">"},!self.document)return self.addEventListener?(self.addEventListener("message",function(e){var a=JSON.parse(e.data),n=a.language,s=a.code;self.postMessage(JSON.stringify(t.util.encode(t.tokenize(s,t.languages[n])))),self.close()},!1),self.Prism):self.Prism;var n=document.getElementsByTagName("script");return n=n[n.length-1],n&&(t.filename=n.src,document.addEventListener&&!n.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)),self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),Prism.languages.markup={comment:/<!--[\w\W]*?-->/g,prolog:/<\?.+?\?>/,doctype:/<!DOCTYPE.+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^<\/?[\w:-]+/i,inside:{punctuation:/^<\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/\&#?[\da-z]{1,8};/gi},Prism.hooks.add("wrap",function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))}),Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/gi,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,punctuation:/[\{\};:]/g,"function":/[-a-z0-9]+(?=\()/gi},Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/<style[\w\W]*?>[\w\W]*?<\/style>/gi,inside:{tag:{pattern:/<style[\w\W]*?>|<\/style>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css},alias:"language-css"}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').+?\1/gi,inside:{"attr-name":{pattern:/^\s*style/gi,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/gi,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag)),Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//g,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*?(\r?\n|$)/g,lookbehind:!0}],string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/gi,inside:{punctuation:/\(/}},number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g},Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|-?Infinity)\b/g,"function":/(?!\d)[a-z0-9_$]+(?=\()/gi}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/<script[\w\W]*?>[\w\W]*?<\/script>/gi,inside:{tag:{pattern:/<script[\w\W]*?>|<\/script>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript},alias:"language-javascript"}}),function(){if(self.Prism&&self.document&&document.querySelector){var e={js:"javascript",html:"markup",svg:"markup",xml:"markup",py:"python",rb:"ruby"};Array.prototype.slice.call(document.querySelectorAll("pre[data-src]")).forEach(function(t){var a=t.getAttribute("data-src"),n=(a.match(/\.(\w+)$/)||[,""])[1],s=e[n]||n,i=document.createElement("code");i.className="language-"+s,t.textContent="",i.textContent="Loading…",t.appendChild(i);var l=new XMLHttpRequest;l.open("GET",a,!0),l.onreadystatechange=function(){4==l.readyState&&(l.status<400&&l.responseText?(i.textContent=l.responseText,Prism.highlightElement(i)):i.textContent=l.status>=400?"✖ Error "+l.status+" while fetching file: "+l.statusText:"✖ Error: File does not exist or is empty")},l.send(null)})}}();var Yapl=function(e){"use strict";var t;return{settings:{body:$(".js-sg-body"),navToggle:$(".js-sg-nav-toggle"),blockToggles:$(".js-sg-block__expand-toggle"),blockToggleAll:$(".js-sg-toggle-all"),allOpen:!1},init:function(){t=$.extend({},this.settings,e),t.blockToggles&&t.blockToggles.length&&this.bindUIActions()},bindUIActions:function(){t.navToggle.on("click",Yapl.toggleNav),t.blockToggles.on("click",Yapl.toggleBlock),t.blockToggleAll.on("click",Yapl.toggleAllBlocks)},toggleNav:function(){t.body.toggleClass("is-showing-nav")},toggleBlock:function(){var e=$(this),t=e.closest(".js-sg-block"),a=t.find(".js-sg-block__more");t.toggleClass("module-is-collapsed module-is-expanded"),a.toggleClass("is-collapsed is-expanded")},toggleAllBlocks:function(){t.blockToggles.each(t.allOpen?Yapl.collapseBlock:Yapl.expandBlock),t.blockToggleAll.toggleClass("sg-blocks-collapsed sg-blocks-expanded"),t.allOpen=!t.allOpen},expandBlock:function(){var e=$(this),t=e.closest(".js-sg-block"),a=t.find(".js-sg-block__more");t.addClass("module-is-expanded").removeClass("module-is-collapsed"),a.addClass("is-expanded").removeClass("is-collapsed")},collapseBlock:function(){var e=$(this),t=e.closest(".js-sg-block"),a=t.find(".js-sg-block__more");t.addClass("module-is-collapsed").removeClass("module-is-expanded"),a.addClass("is-collapsed").removeClass("is-expanded")}}}();Yapl.init();