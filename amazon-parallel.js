var http = require('https');
http.globalAgent.maxSockets = 10000;
var request = require('request');
var amazon = require('amazon-product-api');
var async = require('async');
var client = amazon.createClient({
  awsId: "",
  awsSecret: "",
  awsTag: ""
});
// kukeitt
// dumdah
exports.amazon = function(ebay, callback) {

  var holder = [];
  var page = 1;
  var amazon_reduce_keywords = function(title, init_length) {
    var keywords = title.split(' ');
    var total = init_length.split(' ').length;
  
      keywords.pop();
      if(keywords.length >= 3) {
        return keywords.join(' ');
      } else return false;
  }
  
  var amazon_keyword = function(title) {
    var keywords = title.split(' ');
    var result = []

    keywords.forEach(function(item) {
      if(result.indexOf(item) < 0 && !item.match(/new/i)) result.push(item);
    })
    return result.join(' ');

  }

  async.mapLimit(ebay,5, function(item, cb) {
    var ebay_title = amazon_keyword(item.title);
    var initial_keyword = ebay_title;
    var query = function() {

      client.itemSearch({
        ItemPage: page,
        Keywords: initial_keyword,
        Condition: 'New',
        ResponseGroup: 'Images,Offers,ItemAttributes'
      }, function(err, response, resp) {
	      if(err) {
	      
        initial_keyword = amazon_reduce_keywords(initial_keyword, ebay_title);
        if(err.Error) console.log(err.Error);
        if(initial_keyword) query();

        else  {
          // found nothing, even when keywords length is 1
          item.amazon.push({
            searchUrl: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords='+item.title
          });
            return cb();
        }
      } else {
          var cnt = 0;
          for(var i in response) {
            var content = response[i];
            if(content.Offers && content.Offers[0] && content.Offers[0].Offer && parseInt(content.Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime[0]) == 1 && cnt != 1) {

              item.amazon.push({
                asin: content.ASIN[0],
                title: content.ItemAttributes[0].Title[0],
                thumbnail: content.SmallImage ? content.SmallImage[0].URL[0] : 'None',
                price: content.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0]
              });

            }

          } return cb();

        }


    });

  }

  query();

  }, function done() {
    return callback(ebay);
  })
}
