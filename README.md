# ebay-amazon
Pull ebay items and find similar items to compare prices


1.) Calls ebay API - fetch all seller items ( time range, 0-120 days)
2.) Calls amazon product search API - compares titles
3.) If match push to array, if not push search url
4.) Show results
