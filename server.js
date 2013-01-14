var execSync = require('execSync');
var fs = require('fs');

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(8080);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/jquery-1.8.3.min.js', function(req, res) {
    res.sendfile(__dirname + '/jquery-1.8.3.min.js');
});

app.get('/flot/jquery.flot.js', function(req, res) {
    res.sendfile(__dirname + '/flot/jquery.flot.js');
});

io.sockets.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    var sumDownload = [];
    socket.emit('message', { data: sumDownload});
    socket.on('requestMore', function() {
        var rawData = execSync.stdout('pmacct -s');
        var entries = rawData.split('\n');
        var previousEntries = '';
        var previousDownload = [];
        var previousUpload = [];
        var currentDownload = [];
        var currentUpload = [];
        var sumUpload = [];
        fs.readFile('pmacct_output', 'utf-8', function(err, data) {
            if (err) throw err;
            previousEntries = data;

            var current_data = "";
            // read previous data
            previousEntries = new String(previousEntries).split('\n');

            for (var i = 0; i < previousEntries.length; i++) {
                var rowData = previousEntries[i].split(' ');
                var src = rowData[0];
                var dest = rowData[1];
                var packet = new Number(rowData[2]);
                var bytes = new Number(rowData[3]);
                // try...catch for some undefined dest
                try {
                    if (dest.indexOf("192") == 0) {
                        push(previousDownload, dest, bytes);
                    }
                } catch (err) {}
            }

            // read current data
            for (var i = 1; i < entries.length - 3; i++) {
                current_data += entries[i].replace(/\s+/g, ' ') + '\n';
            }
            for (var i = 1; i < entries.length - 3; i++) {
                var rowData = entries[i].replace(/\s+/g, ' ').split(' ');
                var src = rowData[0];
                var dest = rowData[1];
                var packet = new Number(rowData[2]);
                var bytes = new Number(rowData[3]);
                /*
                if (src.indexOf("192") == 0) {
                    push(currentUpload, dest, bytes);
                }
                */
                if (dest.indexOf("192") == 0) {
                    push(currentDownload, dest, bytes);
                }
            }

            // console.log(currentUpload);
            
            // compare previous and current data
            var maxLength = previousDownload.length;
            if (currentDownload.length > maxLength) {
                maxLength = currentDownload.length;
            }
            for (var i = 0; i < currentDownload.length; i++) {
                var currentKey = currentDownload[i].key;
                for (var j = 0; j < previousDownload.length; j++) {
                    if (compareString(currentKey, previousDownload[j].key)) {
                        // ANSWER
                        var margin = currentDownload[i].value - previousDownload[j].value;
                        
                        push(sumDownload, currentDownload[i].key, margin);
                    }
                }
                // console.log(currentDownload[key].value - previousDownload[key].value); 
            }
            // console.log(previousDownload);
            // console.log(currentDownload);
            
            // descending order sort
            sumDownload = sumDownload.slice(0).sort(function (a, b) {
                return b.value - a.value;
            });

            var keys = [];
            for (var i = 0, len = sumDownload.length; i < len; ++i) {
                keys[i] = sumDownload[i].key;
            }
            // get only top ten of downloader
            sumDownload = sumDownload.slice(0, 10);
            console.log(sumDownload);

            fs.writeFile('pmacct_output', current_data, function(err) {
                if (err) throw err;
            });
        });
        socket.emit('message', { data: sumDownload} );
    });

    socket.on('my other event', function(data) {
        console.log(data);
    });
});

function compareString(str1, str2) {
    if (str1.length != str2.length) {
        return false;
    }
    for (var i = 0; i < str1.length; i++) {
        if (str1[i] != str2[i]) {
            return false;
        }
    }
    return true;
}

function IsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function push(dict, k, v) {
    for (var i = 0; i < dict.length; i++) {
        if (compareString(k, dict[i].key)) {
            dict[i].value += v;
            return false;
        }
    }
    dict.push({
        key: k,
        value: 0 + v
    });
    return true;
}

function exists(dict, k, v) {
    for (var i = 0; i < dict.length; i++) {
        if (compareString(k, dict[i].key)) {
            return true;
        }
    }
    return false;
}
