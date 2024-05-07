// 4. START THE SERVER
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env);
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true ,
    useUnifiedTopology: true 
}).then(() => console.log('DB connection successfull!'));



// const testTour = new Tour({
//     name: 'The Park Camper',
//     price: 997
// })
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR:', err);
// });


const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);

})

