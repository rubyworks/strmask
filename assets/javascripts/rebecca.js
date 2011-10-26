// Rebecca's Javascript

Rebecca = {

  version: '1',

  // Developer mode.
  debug: true,

  //
  current_menu: null,

  //
  doc_url: null,

  //
  documentation: {
    'all'    :   new Array(),
    'methods':   new Array(),
    'modules':   new Array(),
    'scripts':   new Array(),
    'documents': new Array()
  },

  //
  documentation_by_key: {},

  //
  documentation_by_id: {},

  //
  metadata: {},

  //
  bootup: function() {
    var urlVars = Rebecca.getUrlVars();
    var doc_url = urlVars['doc'] || 'doc.json';
    var doc_id  = urlVars['id']

    $.getJSON(doc_url, function(data) {

      // the url is good
      Rebecca.doc_url = doc_url;

      // set up documentation
      $.each(data, function(key, doc) {
        doc.key = key;

        if (doc.path != undefined) {
          doc.id = Rebecca.id('api-' + doc['!'] + '-' + doc.path);
        } else {
          doc.id = 'metadata'
        }

        Rebecca.documentation_by_key[doc.key] = doc;
        Rebecca.documentation_by_id[doc.id]   = doc;

        Rebecca.documentation['all'].push(doc);

        switch(doc['!']) {
        case 'method':
          Rebecca.documentation['methods'].push(doc);
          break;
        case 'class':
          Rebecca.documentation['modules'].push(doc);
          break;
        case 'module':
          Rebecca.documentation['modules'].push(doc);
          break;
        case 'document':
          Rebecca.documentation['documents'].push(doc);
          break;
        case 'script':
          Rebecca.documentation['scripts'].push(doc);
          break;
        };
      });

      Rebecca.metadata = data['(metadata)'];

      Rebecca.documentation['all']     = Rebecca.documentation['all'].sort(Rebecca.compareNames);
      Rebecca.documentation['methods'] = Rebecca.documentation['methods'].sort(Rebecca.compareNames);

      $("#template-title").tmpl(Rebecca.metadata).appendTo("#title");
      $('#template-nav').tmpl({}).appendTo('#nav');

      // Routing
      $.history.init(function(hash){
        if (hash == "alpha-index") {
          $('#content').empty().append($('#template-index').tmpl({}));
        } else if(hash == "") {
          Rebecca.show(Rebecca.readme().id);
        } else {
          var x      = hash.split('/',2);
          var id     = x[0];
          var anchor = x[1];
          Rebecca.show(id,anchor); // restore the state from hash
        }
      });

/*
      hookHighlightSyntax();
      hookSourceViews();
      hookDebuggingToggle();
      hookQuickSearch();
      highlightLocationTarget();
*/

      $('ul.link-list a').bind("click", highlightClickTarget);

    });
  },

  // Determine primary "readme" document. This function first attempts
  // to find the document specified by the metadata.readme property.
  // If this document does not exist it will search for a document with
  // a name matching /^README/.
  readme: function() {
    var readme = Rebecca.metadata['readme'];
    if (readme == undefined) {
      for(i in Rebecca.documentation['documents']) {
        d = Rebecca.documentation['documents'][i];
        if (d.name.match(/^README/i)) {
          readme = d; break;
        }
      }
    };
    return(readme);
  },

  // This function constructs a valid Rebecca URI.
  href: function(id,anchor) {
    if (anchor != undefined) {
      return('#' + id + '/' + anchor);
    } else {
      return('#' + id);
    };
  },

  //
  method_href: function(method) {
    var ns = Rebecca.documentation_by_key[method.namespace];
    return(Rebecca.href(ns.id, method.id));
  },

  //
  id: function(key) {
    // key = encodeURIComponent(key);  DID NOT WORK
    key = key.replace(/\</g,  "-l-");
    key = key.replace(/\>/g,  "-g-");
    key = key.replace(/\=/g,  "-e-");
    key = key.replace(/\?/g,  "-q-");
    key = key.replace(/\!/g,  "-x-");
    key = key.replace(/\~/g,  "-t-");
    key = key.replace(/\[/g,  "-b-");
    key = key.replace(/\]/g,  "-k-");
    key = key.replace(/\#/g,  "-h-");
    key = key.replace(/\./g,  "-d-");
    key = key.replace(/\:\:/g,"-C-");
    key = key.replace(/\:/g,  "-c-");
    key = key.replace(/[/]/g, "-s-");
    key = key.replace(/\W+/g, "-");  // TOO GENERAL?
    key = key.replace(/\W+/g, "-");  // For GOOD MEASURE
    return(key);
  },

  //
  compareNames: function(a, b){
    if (a.name < b.name) {return -1}
    if (a.name > b.name) {return 1}
    return 0;
  },

  //
  getUrlVars: function() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },

  //
  show: function(id,anchor) {
    var doc = Rebecca.documentation_by_id[id];

    console.debug(id);
    console.debug(doc);

    if (doc != null) {
      var type = doc['!'];
      if(type == 'class'){ type = 'module' };
      $('#content').empty().append($('#template-' + type).tmpl(doc));
      $('#search-section').hide();
      $('#content').find('pre code').each(function(i, e){hljs.highlightBlock(e, '  ')});
      if(anchor != undefined) {
        $('html, body').animate({ scrollTop: $('#'+anchor).offset().top }, 500);
        $('.method-description,.method-heading').click(Rebecca.showSource);
        $('.highlighted').removeClass('highlighted');
        $('#'+anchor).addClass('highlighted');
      }
    } else {
      $('#content').empty().append('<b>Not Found</b>');
    };
  },

  //
  divy_methods: function(methods) {
    var s = 'instance';
    var v = 'public';
    var list = {
      'class':    {'public': new Array(), 'protected': new Array(), 'private': new Array()},
      'instance': {'public': new Array(), 'protected': new Array(), 'private': new Array()}
    }
    $.each(methods, function(i, x) {
      var doc = Rebecca.documentation_by_key[x];
      if (doc.declarations.contains('class')) {
        s = 'class'
      } else {
        s = 'instance'
      }
      if (doc.declarations.contains('private')) {
        v = 'private';
      } else if (doc.declarations.contains('protected')) {
        v = 'protected';
      } else {
        v = 'public';
      }
      list[s][v].push(doc);
    });
    return(list);
  },

  // Used to convert RDoc document to HTML.
  // TODO: support other formats besides RDoc Simple Markup ?
  markup: function(text,format) {
    convertor = new Rundown.converter();
    return(convertor.makeHtml(text));
  },

  //
  
  // Show and hide navigation dropdown menus.
  menuToggle: function(menuId,navClass) {
    if (navClass == null) { navClass='.nav' };
    if(  $(menuId).is(":visible") == true ){
      $(menuId).hide();
    }
    else{
      // $(navClass).hide();
      $(menuId).show();
    }
  },

  //function menuOn(menuId){
  //  if (navClass == null) { navClass='.nav' };
  //  $(menuId).show();
  //};

  //
  menuOn: function(menuId,navClass){
    if (navClass == null) { navClass='.nav-section' };
    $(navClass).hide();
    $(menuId).show();
    $('#search-section').show();
  },

  //
  menuOff: function(menuId,navClass){
    if (navClass == null) { navClass='.nav' };
    if(  $(menuId).is(":visible") == true ){
      $(navClass).hide();
    }
  },

  showSource: function(e) {
	  var target = e.target;
	  var codeSections = $(target).
		  parents('.method-detail').
		  find('.method-source-code');

	  $(target).
		  parents('.method-detail').
		  find('.method-source-code').
		  slideToggle('fast', function(){
        $(this).find('pre').each(function(i, e){hljs.highlightBlock(e, '  ')});
    });
  },

}

/*
String.prototype.escapeHTML = function () {
  return(                                                                 
    this.replace(/\&/g,'&amp;').                                
         replace(/\>/g,'&gt;').
         replace(/\</g,'&lt;').
         replace(/\"/g,'&quot;')
  );                                          
};
*/

//
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

