/**
 * Unwrap the first element that matches the given @expr@ from the targets and return them.
 */
$.fn.unwrap = function( expr ) {
  return this.each( function() {
     $(this).parents( expr ).eq( 0 ).after( this ).remove();
  });
};



function toggleDebuggingSection() {
	$('.debugging-section').slideToggle();
};

function hookDebuggingToggle() {
	$('#debugging-toggle img').click( toggleDebuggingSection );
};

function highlightTarget( anchor ) {
	console.debug( "Highlighting target '%s'.", anchor );

	$("a[name=" + anchor + "]").each( function() {
		if ( !$(this).parent().parent().hasClass('target-section') ) {
			console.debug( "Wrapping the target-section" );
			$('div.method-detail').unwrap( 'div.target-section' );
			$(this).parent().wrap( '<div class="target-section"></div>' );
		} else {
			console.debug( "Already wrapped." );
		}
	});
};

function highlightLocationTarget() {
	console.debug( "Location hash: %s", window.location.hash );
	if ( ! window.location.hash || window.location.hash.length == 0 ) return;
	
	var anchor = window.location.hash.substring(1);
	console.debug( "Found anchor: %s; matching %s", anchor, "a[name=" + anchor + "]" );

	highlightTarget( anchor );
};

function highlightClickTarget( event ) {
	console.debug( "Highlighting click target for event %o", event.target );
	try {
		var anchor = $(event.target).attr( 'href' ).substring(1);
		console.debug( "Found target anchor: %s", anchor );
		highlightTarget( anchor );
	} catch ( err ) {
		console.error( "Exception while highlighting: %o", err );
	};
};


function toggleReadmeAndIndex(local){
  document.location = local + "/index.html";
  if( $('#readme-section').is(":visible") == true ){
    $('#readme-section').hide();
    $('#index-section').show();
  } else {
    $('#index-section').hide();
    $('#readme-section').show();
  }
};

