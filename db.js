const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected');
    const urlSchema = new mongoose.Schema({
        id: Number,
        url: String
    });
    exports.UrlEntry = mongoose.model('urlShortList', urlSchema);
});