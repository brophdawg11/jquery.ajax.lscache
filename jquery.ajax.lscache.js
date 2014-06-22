$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {

  var lscache = window.lscache;
  if (!lscache) { return; }

  // Cache it ?
  if (!options.localCache) { return; }

  // Default 10 minute expiration
  var minstl = options.cacheTTL || 10;

  // Build default key from URL if not specified
  var cacheKey = options.cacheKey ||
                 options.url.replace(/jQuery.*/, '') + options.type + (options.data || '');

  // User specified validation function overrides actual expiration status
  var isValid = typeof options.isCacheValid === 'function' ?
                  options.isCacheValid() :
                  !lscache.isExpired(cacheKey);

  // Look for a cached value, accepting an expired one
  var value = lscache.get(cacheKey, true, true);

  // Grab the user specified error function
  var realerror = (typeof options.error === 'function') ? options.error : null;

  // Do nothing on a normal failure, we handle that in tryCache
  options.error = function noop() { };

  // Create a new deferred that we can resolve/reject
  var dfd = new $.Deferred();

  // If the request fails, try to use a cached value
  function tryCache() {
    var args = Array.prototype.slice.call(arguments);

    // Do we have a valid cached value we can use?
    if (isValid && value != null) {

      // If the user provided their own options.success function, patch it
      // in since we're in the rejected path
      if (typeof options.success === 'function') {
        dfd.done(options.success);
      }

      dfd.resolveWith(jqXHR, [ value, 'success', jqXHR ]);

    } else {

      // If the user provided their own options.error function, we stored
      // a reference to it, so patch that into our new Deferred
      if (realerror) {
        dfd.fail(realerror);
      }

      dfd.rejectWith(jqXHR, args);
    }
  }

  // Cache the response from a successful AJAX response
  function cacheResult(data) {
    var args = Array.prototype.slice.call(arguments);
    lscache.set(cacheKey, data, minstl);
    dfd.resolveWith(jqXHR, args);
  }

  // Patch our handlers in
  jqXHR.fail(tryCache).done(cacheResult);

  if (isValid && value) {
    jqXHR.abort();
  } else {
    // We're launching the request.  On failure, we accept an expired value
    isValid = true;
  }

  return dfd.promise(jqXHR);
});
