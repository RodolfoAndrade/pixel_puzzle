const express = require('express'); 
const Jimp = require("jimp");
const fs = require('fs'); 
const app = express(); 
  
// handling CORS 
app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin",  
               "http://localhost:4200"); 
    res.header("Access-Control-Allow-Headers",  
               "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 


  
// resize image
app.get('/api/image', (req, res) => { 
    // get files list in images folder
    var list = fs.readdirSync("./src/assets/images");
    console.log(list);
    Jimp.read("./src/assets/images/"+list[Math.floor(Math.random() * list.length)], (err, image) => {
        if (err) throw err;
        var size = 8;
        var is = Array.from({length: size*size}, (x, i) => i); // array of size*size
        var indexes = is.map(i => [Math.floor(i/size), i%size]); // indexes [0,0], [0,1], ...
        var pixels = indexes.map(i => image.getPixelColor(i[1], i[0])); // list of pixels
        var rgbas = pixels.map(i => Jimp.intToRGBA(i)); // int to rgba
        var colors = Array.from(new Set(pixels)).map(i => Jimp.intToRGBA(i)); // get unique colors

        function get_hints(i = 0, rows = true){
            // get color hints for each row or col
            var hints = [];
            var order = 0; // index for hints list
            var j = 0; // begining of col or row
            if(rows){
                // take first pixel color
                var color = pixels[i*size+j];
                // save dict on hints list. If color is white, qtd is 0
                hints[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < size; j++){
                    // if next color is not the same, add new hint and change color
                    if(color != pixels[i*size+j]){
                        order++;
                        color = pixels[i*size+j];
                        hints[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                    }
                    // if next color is the same and not white
                    else if(color!=4294967295) {
                        hints[order]["qtd"]++;
                    }
                }
            }
            else {
                // take first pixel color
                var color = pixels[j*size+i];
                // save dict on hints list. If color is white, qtd is 0
                hints[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < size; j++){
                    // if next color is not the same, add new hint and change color
                    if(color != pixels[j*size+i]){
                        order++;
                        color = pixels[j*size+i];
                        hints[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                    }
                    // if next color is the same and not white
                    else if(color!=4294967295) {
                        hints[order]["qtd"]++;
                    }
                }
            }
            //console.log(hints);
            return hints;
        }

        hints_row = Array.from({length: size}, (x, i) => i).map(i => get_hints(i, true));
        hints_col = Array.from({length: size}, (x, i) => i).map(i => get_hints(i, false));

        hints_row = hints_row.map((i) => {return i.filter((j) => {return j["qtd"]>0})});
        hints_col = hints_col.map((i) => {return i.filter((j) => {return j["qtd"]>0})});

        res.json({ 
            size: size,
            image: rgbas,
            colors: colors,
            rows: hints_row,
            cols: hints_col,
            max_hints_row: Math.max(...hints_row.map((i) => {return i.length})),
            max_hints_col: Math.max(...hints_col.map((i) => {return i.length}))
        });
    });
}); 
  
app.listen(3000, () => { 
    console.log('Server listening on port 3000'); 
});
