const express = require("express")
const bodyParser = require("body-parser")
const GeoPoint = require("geopoint")
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
let lat1 = 28.366953;
let long1 = 77.325288;
let lat2 = 0 ;
let long2 = 0;
app.get("/",function(req,res){
    
    res.sendFile(__dirname+"/index.html")
})

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

app.post("/",function(req,res){
    lat2 = req.body.lat;
    long2 = req.body.long;
    console.log(lat2 + " " + long2)
    var distance1 = distance(lat1,long1,lat2,long2,"K");
    console.log(distance1)
})
app.listen(8001,function(req,res){
    console.log("Listening at Port 8001")
})

