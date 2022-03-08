const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/fruitsDB",{ useNewUrlParser: true,  useUnifiedTopology: true  } );

const fruitSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  review: String
})
const Fruit = mongoose.model("Fruit",fruitSchema);

const fruit = new Fruit({
  name: "Apple",
  rating: 7,
  review: "Nice as a Fruit"
});
fruit.save();
const findDocuments = function(db,callback){
  const collection = db.collection('fruits');
  colection.find({}).toArray(function(err, fruits) {
    assert.equal(err,null);
    console.log("Found the following Records");
    console.log(fruits);
    callback(fruits);
    })
};
