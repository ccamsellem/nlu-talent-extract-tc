/*******************************************************************************
 * Copyright (c) 2016 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *   http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *   Darren Cacy - Initial implementation
 *******************************************************************************/

var express = require('express');
var cfenv = require('cfenv');
var app = express();
//var S = require('string');

var formidable = require('formidable');
fs = require('fs');
var LineByLineReader = require('line-by-line');
var parse = require('csv-parse');
var transform = require('stream-transform');
//var Promise = require('promise');
//var parseString = require('xml2js').parseString;
//var bodyParser = require('body-parser');
var appEnv = cfenv.getAppEnv();

var count = 0;

app.get('/test', function(req,res){
	var counter = 0;
	var output = [];
	var parser = parse({delimiter: ','})
	var input = fs.createReadStream('/temp/csv/SurveyAnalyticsComments.csv');
	var transformer = transform(function(record, callback){
//		console.log('record is', record[3]);
//    output.push(record);
    if ( counter++ > 0 ){
//	  setTimeout(function(){
	    callback(null, updateRecord(record));
//	    callback(null, record.join(' ') + '\n');
//	  }, 500);
    }
	}, {parallel: 10});
	input.pipe(parser).pipe(transformer).pipe(process.stdout);
//	console.log('output is', output);
	res.end('done');
});

//app.post('/fileupload', function(req,res){
//  var form = new formidable.IncomingForm();
//  form.parse(req, function (err, fields, files) {
////  	console.log('err is', err);
//  	console.log('fields are', fields);
////  	console.log('files is', files);
//  	console.log('file name is', files.filetoupload.path);
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
////  	var LineByLineReader = require('line-by-line'),
////  	lr = new LineByLineReader(files.filetoupload.path);
////
////  	lr.on('error', function (err) {
////  		// 'err' contains error object
////  		console.log('error is', err);
////  	});
////
////  	lr.on('line', function (line) {
////  		// 'line' contains the current line without the trailing newline character.
////  		console.log('line is', line);
////  		parse(line, {delimiter: ','}, function(err, output){
////  		  output.should.eql([ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ]);
////  		});
////  	});
////
////  	lr.on('end', function () {
////  		// All lines are read, file is closed now.
////  		console.log('end of file');
////  	});
////});
////  	console.dir(files);
////  	parseFile(files.filetoupload.File.path);
//    res.write('File uploaded');
//    res.end();
//  });
//	
//});

function updateRecord(record) {
//	console.log('updateRecord:', record);
//	return record.join(' '+'\n');
	return 'test ' + count++ + record.length + '\n';
}
function parseFile(filename) {
	console.log('in parseFile with file', files.filetoupload.File.path);
}


app.use(express.static(__dirname + '/public'));

// app.listen(process.env.PORT || 3001);
app.listen(appEnv.port || 3001, '0.0.0.0', function() {
  console.log('server starting on ', appEnv.url);
});
