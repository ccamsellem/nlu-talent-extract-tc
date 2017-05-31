var express = require('express');
var cfenv = require('cfenv');
var app = express();
//var S = require('string');

var formidable = require('formidable');
fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
var Promise = require('promise');
var fastcsv = require('fast-csv');
//var csv = require('csv');

require('dotenv').config({silent: true, path: 'local.env'});
console.log('Natural Language user name is', process.env.NATURAL_LANGUAGE_UNDERSTANDING_USERNAME);

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
  version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
});
//var parseString = require('xml2js').parseString;
//var bodyParser = require('body-parser');
var appEnv = cfenv.getAppEnv();

var count = 0;

app.get('/test2', (req, res) => {
	var filename = '/temp/csv/05-SurveyAnalyticsComments.csv';
	var stream = fs.createReadStream(filename);

	var comments = [];
	fastcsv
	 .fromStream(stream, {quote: '"'})
	 .on("data", function(data){
	     comments.push(data);
	 })
	 .on("end", function(){
		 var output = '';
	  	for ( var j = 0; j < comments.length; j++) {
	  		for (var k = 0; k < comments[j].length; k++) {
	  			output += '"' + comments[j][k] + '",';
	  		}
	  		output += '\n';
	  	}
	    res.setHeader('Content-disposition', 'attachment; filename=testing123.csv');
	  	res.set('Content-Type', 'text/csv'); res.status(200).send(output); 

	 });
});

app.get('/test', function(req,res){
	var filename = '/temp/csv/05-SurveyAnalyticsComments.csv';
	processFile(filename)
	.then(function(output) {
	 	res.set('Content-Type', 'text/csv'); res.status(200).send(output); 		
	})
	.catch(function(err){
		console.log('err', err);
		res.status(500).send('error! ' + err);
	});
});

function processFile(filename, whichColumn) {
	
	return new Promise( (resolve, reject) => {
		console.log('in processFile with file name', filename);
		var stream = fs.createReadStream(filename);
		var comments = [];
		fastcsv
		 .fromStream(stream, {quote: '"'}) // by not using headers, we'll get an array
		 .on("data", function(data){
			 	comments.push(data);
		 })
		 .on("end", () => {
			 	console.log('read this many records: ', comments.length);
	   		var promises = [];
		   	for ( var i = 1; i < comments.length; i++) { // skip the first because it is a header
		   		promises.push(updateRecord(comments[i], whichColumn));
		   	}
		 	  Promise.all(promises).then(function(allData) { // all the results are here, in order
		 	  	console.log('===============\nall data is here');
		 	  	console.log('processed this many records', allData.length);
		 	  	// update the header and add it to the array
		 	  	var header = comments[0]; // dummy
		   	  header.splice(4, 0, 'Watson Sentiment');
			   	header.splice(5, 0, 'Watson Sentiment Score');
			   	header.splice(6, 0, 'Joy');
			   	header.splice(7, 0, 'Sadness');
			   	header.splice(8, 0, 'Fear');
			   	header.splice(9, 0, 'Disgust');
			   	header.splice(10, 0, 'Anger');
		 	  	allData.splice(0,0, header); 
		 	  	
		 	  	// convert the array to a string
		 	  	var output = '';
		 	  	for ( var j = 0; j < allData.length; j++) {
		 	  		for (var k = 0; k < allData[j].length; k++) {
		 	  			output += '"' + allData[j][k] + '",';
		 	  		}
		 	  		output += '\n';
		 	  	}
		 	  	
		 	  	resolve(output); // we're done! send the string back
		 	  })
		 	  .catch(function(err) {
		 	  	console.log('some kind of error in promise', err);
		 	  	reject(err);
		 	  });
		 });
	});
}
app.post('/fileupload', (req,res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
  	if (err) {
  		res.status(500).end('error in upload:', err);
  	} else {
////  	console.log('err is', err);
  	console.log('fields are', fields);
  	var whichColumn = '';
  	switch ( fields.column) {
  	case 'A':
  		whichColumn = 0;
  		break;
  	case 'B':
  		whichColumn = 1;
  		break;
  	case 'C':
  		whichColumn = 2;
  		break;
  	case 'D':
  		whichColumn = 3;
  		break;
  	case 'E':
  		whichColumn = 4;
  		break;
  	}
  	console.log('whichColumn:', whichColumn);
//  	console.log('files is', files);
  	console.log('file name is', files.filetoupload.path);
  	processFile(files.filetoupload.path, whichColumn)
  	.then(function(output) {
	    res.setHeader('Content-disposition', 'attachment; filename=WatsonResults.csv');
  	 	res.set('Content-Type', 'text/csv'); res.status(200).send(output); 		
  	})
  	.catch(function(err){
  		console.log('err', err);
  		res.status(500).send('error! ' + err);
  	});
  	}
  });
//  	var output = [];
//  	var parser = parse({delimiter: ','});
//  	var input = fs.createReadStream(files.filetoupload.path);
//  	var transformer = transform(function(record, callback){
//  	  setTimeout(function(){
//  	    callback(null, updateRecord(record));
////  	    callback(null, record.join(' ' + '\n'));
//  	  }, 500);
//  	}, {parallel: 10});
//  	input.pipe(parser).pipe(transformer).pipe(process.stdout);
});

function updateRecord(record, whichColumn) {
//	console.log('updateRecord:', record);
//	return record.join(' '+'\n');
	return new Promise((resolve, reject) => {
//		console.log('in promise with comment', record.Comment);
	var payload = {
	  "text": record[whichColumn],
	  "features": {
	    "sentiment": {},
	    "emotion": {},
	  	"entities": {
	      "limit": 3
	    },
	    "keywords": {
	    	"limit": 3
	    }
	  }
	};
	nlu.analyze(payload, (err, results) => {
    if (err) {
      console.log('error in analysis!', err);
      reject(err);
    } else {
      console.log('success calling analysis');
      record.splice(4, 0, results.sentiment.document.label);
      record.splice(5, 0, results.sentiment.document.score);
	    record.splice(6, 0, results.emotion.document.emotion.joy);
	    record.splice(7, 0, results.emotion.document.emotion.sadness);
	    record.splice(8, 0, results.emotion.document.emotion.fear);
	    record.splice(9, 0, results.emotion.document.emotion.disgust);
	    record.splice(10, 0, results.emotion.document.emotion.anger);
//      console.dir(results.emotion.document.emotion);
//      record.WatsonSentiment = results.sentiment.document.label;
//      record.WatsonSentimentScore = results.sentiment.document.score;
//      record.Joy = results.emotion.document.emotion.joy;
//      record.Sadness = results.emotion.document.emotion.sadness;
//      record.Fear = results.emotion.document.emotion.fear;
//      record.Disgust = results.emotion.document.emotiondisgust;
//      record.Anger = results.emotion.document.emotion.anger;
      resolve(record);
    }
  });
//	return  
	});

}
function parseFile(filename) {
	console.log('in parseFile with file', files.filetoupload.File.path);
}


app.use(express.static(__dirname + '/public'));

// app.listen(process.env.PORT || 3001);
app.listen(appEnv.port || 3001, '0.0.0.0', function() {
  console.log('server starting on ', appEnv.url);
});
