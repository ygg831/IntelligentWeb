const mongoose = require('mongoose');
const storeData = require('../models/storeData');

exports.init = function (){
    // uncomment if you need to drop the database
    // Character.remove({}, function(err) {
        //    console.log('collection removed')
        // });

    // const dob=new Date(1908, 12, 1).getFullYear();
    // var character = new Character({
    //     first_name: 'Mickey',
    //     family_name: 'Mouse',
    //     dob: dob
    // });
    // console.log('dob: '+character.dob);

    // character.save(function (err, results) {
    //     console.log(results._id);
    // });
}