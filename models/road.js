var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RoadSchema   = new Schema({
    location: {
        type: { type: String },
        coordinates: []
       },
    roadtype : String,
    positiveVotes :{ type: Number, default: 0 },
    negetiveVotes : { type: Number, default: 0 },
    positiveVoteTimeStamp : {
        type : Date
    },
    negetiveVoteTimeStamp : {
        type : Date
    }
});

RoadSchema.index({ location: "2dsphere" });


module.exports = mongoose.model('Road', RoadSchema);