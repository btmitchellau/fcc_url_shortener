const setupDB = () => {
	mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', () => {
		console.log('connected');
	});

	const urlSchema = new mongoose.Schema({
		id: Number,
		url: String
	});

	let UrlEntry = mongoose.model('urlShortList', urlSchema);
	return UrlEntry
};

const urlEntry = setupDB();
exports.urlEntry = urlEntry;