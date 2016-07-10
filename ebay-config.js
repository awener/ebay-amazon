var ut = require('utf8');
var moment = require('moment');
exports.config = function(page,start,username) {

var start = moment().subtract(start,'days').format();
var end = moment().format();
var data = '<?xml version="1.0" encoding="utf-8"?>';
    data += '<GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">';
    data += '<RequesterCredentials>';
    data += '<eBayAuthToken>token</eBayAuthToken>';
    data += '</RequesterCredentials>';
    data += '<GranularityLevel>Coarse</GranularityLevel>';
    data += '<StartTimeFrom>'+start+'</StartTimeFrom>';
    data += '<StartTimeTo>'+end+'</StartTimeTo>'
    data += '<UserID>'+username+'</UserID>'
    data += '<Pagination>';
    data += '<EntriesPerPage>200</EntriesPerPage>';
    data += '<PageNumber>'+page+'</PageNumber>';
    data += '</Pagination>';
    data += '</GetSellerListRequest>';

var options = {
      url: 'https://api.ebay.com/ws/api.dll',
      method: 'POST',
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
        'X-EBAY-API-DEV-NAME': 'name',
        'X-EBAY-API-APP-NAME': 'name',
        'X-EBAY-API-CERT-NAME': 'name',
        'X-EBAY-API-CALL-NAME': 'GetSellerList',
        'X-EBAY-API-SITEID': '0',
       	'Content-Type': 'text/xml;charset=utf8',
        'gzip': true

      },
      body: ut.encode(data)
    }
		return options;  
}