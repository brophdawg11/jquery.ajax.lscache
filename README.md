jQuery.ajax.lscache
===================

A jQuery plugin for automatically caching, using, and expiring JSON AJAX responses using localStorage

[Unit Tests](https://rawgithub.com/brophdawg11/jquery.ajax.lscache/master/test/index.html)

#### Dependencies

 * [jQuery](http://www.jquery.com) - Tested in v2.1, but in theory should work with anything back to v1.6, as it simply needs Deferred, .promise(), $.ajax, and $.ajaxPrefilter.
 * [lscache](https://github.com/brophdawg11/lscache) - Right now this points to a forked version in which some functionality was added to the library.  If a pull request is eventually created/accepted, it can rely on the main library, which is located [here](https://github.com/pamelafox/lscache).  This library is awesome.  If you're not already using it, you should be.

At some point, I may consider merging this approach with [Paul Irish's plugin](https://github.com/paulirish/jquery-ajax-localstorage-cache) to remove the lscache dependency, while maintaining the additional functionality of this plugin.

##### Using Zepto?

Check out [zepto.ajax.lscache](https://github.com/brophdawg11/zepto.ajax.lscache)

#### Usage

Simply tack on the following options to $.ajax():

  * localCache: Boolean - Specify true to enable the plugin
  * cacheKey: String - What key to use in localStorage
  * cacheTTL: Number - Minutes before the cache should be considered expired
  * isCacheValid: Function - If you want to do some fancy cache invalidation, implement this and return a Boolean and we won't bother checking against cacheTTL.  However, cache invalidation is hard, so cacheTTL is recommended :)

Here's a quick sample call, but take a look at the [Unit Tests](https://rawgithub.com/brophdawg11/jquery.ajax.lscache/master/test/index.html) for a complete examples

    $.ajax({ url: endpoint,
             dataType: 'json',
             localCache: true,
             cacheKey: 'cache-me',
             cacheTTL: 1 })

#### Future Enhancements:

 - Allow passing in of a different caching mechanism adhering to a common API, to allow usage of sessionStorage, webSql, etc.

### tl;dr;

#### Initial use case

This idea came about for developing HTML5 mobile apps where bandwidth is limited and sometimes unavailable.  The goal was to cache responses for a period of time to avoid hitting the server repeatedly if the same screens were accessed repeatedly.  This was very easy to implement initially by simply wrapping the jQuery.ajax success/error callbacks and allowing lscache do all the cache expiration dirty work.  Turns out, if I had done my research, I would have found out that [Paul Irish had already done this, a bit before me](https://github.com/paulirish/jquery-ajax-localstorage-cache)

#### The problem

This approach (and Paul's) worked just fine, and initally, the thought was "OK, if you're cache is expired and you don't have an internet connection, tough luck.  You'll get a nice error message telling you to get back to civilization and online and everything will go back to normal."

But we can do better right?  Sure, if a cache value is expired, I should try to get fresh data.  But if that fails, is it so bad to show a listing of blog posts that happen to be, say 11 minutes old if my cache expiration is 10?  I think the user would be much happier reading stale content...then no content.

The problem was that both lscache and Paul's approach would delete the data as soon as it was determijed to be expired, before attempting the subsequent AJAX request.  If that happened to fail...uh oh...we no longer have access to any cached data...crap.

#### Ipso facto - jquery.ajax.lscache

That is the entire point of this tiny little plugin.  The approach of using the $.ajaxPrefilter hook is inspired by Paul's plugin, but this plugin does a few more things:

  * Allow's lsache to handle expiration
  * Allows expired values in the case of an AJAX failure
  * Patches into the standard jqXHR Promise interface

You tell it how long your data is valid for, it was cache for that long.  But then, if you happen to request the data after ecpiration, and the ajax request fails, we'll hand over your expired data to the jQuery AJAX success functions, and you won't realy even know what happened.  If you REALLY need to know if the data you got back in your success callbacks is expired, you can always check the status of the jqXHR object returned.  If you're in a success callback with a status of 404...you get the idea.

