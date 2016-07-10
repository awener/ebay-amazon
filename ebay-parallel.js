var http = require('https');
http.globalAgent.maxSockets = 25;
var request = require('request');
var xml = require('xml2js').parseString;
var async = require('async');
var amazon = require('amazon-product-api');
var aws = require('./amazon-parallel.js');
var ebay = require('./ebay-config.js');

exports.fetchItems = function(username, date,sold, callback_main) {

    var page = 1;
    var amazon_data = [];
   	var totalPages = 0;
    var total_tasks = 0;
    var watchWorker = 0;
    var watchList = [];
    var watchComplete = false;
    var resultData = []
   
    var watcher = async.queue(function(task, callback) {
      watchWorker++;
  
      for(var i in task.watch) {
        watchList.push(task.watch[i]);
      } callback();
        
    });

  watcher.drain = function() {
      
   	if(watchWorker == totalPages) {
              
      async.map(watchList, function(item, callback) {
        request(item.url, function(err, resp, data) {
          if(data.match('vi-buybox-watchcount">')) {
            var count = data.split('vi-buybox-watchcount">')[1].split('</span>')[0];
            item.watchCount = count;
         	} callback();
         });
               
      }, function done() {
        watchComplete = true;
      });
    }
  }


  var q = async.queue(function(task, callback) {
    aws.amazon(task.ebay, function(data) {
      total_tasks++;
      for(var i in data) {
        amazon_data.push(data[i]);
      } callback();
    });

  });

  q.drain = function() {
          
    if(totalPages == total_tasks || totalPages == 1) {
          
      function finish_task() {
        async.map(amazon_data, function(item, callback) {
          for(var i in watchList) {
            if(item.itemID == watchList[i].itemID) {
              item.watchCount = watchList[i].watchCount;
            }
          } callback();
        }, function done() {
          return callback_main(null,amazon_data);
        });
      }

    if(watchComplete) finish_task();
    else {
      var timeOuter = setInterval(function() {
        if(watchComplete) {
          clearInterval(timeOuter);
          finish_task();
        }
      }, 100);
    }       
    }
  }
 
 

  

  var initialRequest = function() {
  	var options = ebay.config(page, date, username);
  	request(options, function(err, resp, response) {
  		var ebay_watchCount = [];
    	
    	xml(response, function(error, result) {
      	if(!result) {
      		initialRequest();
      		console.log('Initial request failed, retry..');
      		console.log(err);
      	}
      	else {
	     		async.eachSeries(result.GetSellerListResponse.ItemArray[0].Item, function(item, callback) {
  	        if(parseInt(item.SellingStatus[0].QuantitySold[0]) >= sold) {
    		      ebay_watchCount.push({
        		    itemID: item.ItemID[0],
            		url: item.ListingDetails[0].ViewItemURL[0],
            		watchCount: 0
          		});
                
          		resultData.push({
            		watchCount: 0,
            		amazon: [],
            		itemID: item.ItemID[0],
            		price: item.SellingStatus[0].CurrentPrice[0]._ + ' ' + item.SellingStatus[0].CurrentPrice[0]['$'].currencyID,
            		title: item.Title[0],
            		sold_count: item.SellingStatus[0].QuantitySold[0],
            		thumbnail: item.PictureDetails[0].PictureURL ? item.PictureDetails[0].PictureURL[0] : 'none'
          		});
        	} callback();
      	}, function done() {
        	q.push({ebay: resultData});
        	watcher.push({watch: ebay_watchCount});
        	totalPages = result.GetSellerListResponse.PaginationResult[0].TotalNumberOfPages[0];

        	if(totalPages > 1) runTasks(totalPages);
        	console.log('First query was success! ' + ' Total pages: ' + totalPages);
        });

      }
  	})
	})
}
 initialRequest();

	var runTasks = function(pages) {
		var iterate = [];

		for(var i = 2; i <= pages;i++) {
    	iterate.push(i);
    }

    async.map(iterate, function(url, callback) {

      
        var doRequest = function() {
        	var ebay_items = [];
      		var name_holder = [];
      		var ebay_storage = [];
      		var ebay_watchCount = [];
        
        	options = ebay.config(url, date, username);
        	request(options, function(err, resp, response) {
        		if(!response) {
        			console.log('Task request failed, retry..');
        			console.log(err);
        			return doRequest();
        		}
        		else
  	      	 	xml(response, function(error, result) {
                  
	          
	          if(result)  {
              async.eachSeries(result.GetSellerListResponse.ItemArray[0].Item, function(item, callback) {
                if(parseInt(item.SellingStatus[0].QuantitySold[0]) >= sold) {
                       
                  ebay_watchCount.push({
                    itemID: item.ItemID[0],
                    url: item.ListingDetails[0].ViewItemURL[0],
                    watchCount: 0
                  });

                  ebay_items.push({
                    watchCount: 0,
                    amazon: [],
                    itemID: item.ItemID[0],
                    price: item.SellingStatus[0].CurrentPrice[0]._ + ' ' + item.SellingStatus[0].CurrentPrice[0]['$'].currencyID,
                    title: item.Title[0],
                    sold_count: item.SellingStatus[0].QuantitySold[0],
                    thumbnail: item.PictureDetails[0].PictureURL ? item.PictureDetails[0].PictureURL[0] : 'none'
                  });
              	} callback();
            	}, function done() {
                    	 
                q.push({ebay: ebay_items});
               	watcher.push({watch: ebay_watchCount});
               	console.log('Task started with: ' + ebay_items.length + ' items.');
              })
            }
          });
        });

        }

        doRequest(); // start Tasks

        
      });
	}

}  
