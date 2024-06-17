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
        var set = Array.from(new Set(pixels)).map(i => Jimp.intToRGBA(i)); // get unique colors
        var puzzle = Array(size*size).fill({ r:255, g:255, b:255, a:255 }); // get blank puzzle

        function get_tips(i = 0, rows = true){
            // get color tips for each row
            var tips = [];
            var j = 0;
            var order = 0;
            if(rows){
                // take first pixel color
                var color = pixels[i*size+j];
                // save on tips dict
                tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < size; j++){
                    // if next color is not the same, add new tip and change color
                    if(color != pixels[i*size+j]){
                        order++;
                        color = pixels[i*size+j];
                        tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                    }
                    // if next color is the same
                    else if(color!=4294967295) {
                        tips[order]["qtd"]++;
                    }
                }
            }
            else {
                // take first pixel color
                var color = pixels[j*size+i];
                // save on tips dict
                tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < size; j++){
                    // if next color is not the same, add new tip and change color
                    if(color != pixels[j*size+i]){
                        order++;
                        color = pixels[j*size+i];
                        tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                    }
                    // if next color is the same
                    else if(color!=4294967295) {
                        tips[order]["qtd"]++;
                    }
                }
            }
            //console.log(tips);
            return tips;
        }

        tips_row = Array.from({length: size}, (x, i) => i).map(i => get_tips(i, true));
        tips_col = Array.from({length: size}, (x, i) => i).map(i => get_tips(i, false));

        tips_row = tips_row.map((i) => {return i.filter((j) => {return j["qtd"]>0})});
        tips_col = tips_col.map((i) => {return i.filter((j) => {return j["qtd"]>0})});

        res.json({ 
            size: size,
            image: rgbas,
            colors: set,
            puzzle: puzzle,
            rows: tips_row,
            cols: tips_col,
            max_tips_row: Math.max(...tips_row.map((i) => {return i.length})),
            max_tips_col: Math.max(...tips_col.map((i) => {return i.length}))
        });
    });
}); 
  
app.listen(3000, () => { 
    console.log('Server listening on port 3000'); 
});
