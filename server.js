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
    Jimp.read("./src/assets/images/"+list[2], (err, image) => {
        if (err) throw err;
        var is = Array.from({length: 16*16}, (x, i) => i); // array of 16*16
        var indexes = is.map(i => [Math.floor(i/16), i%16]); // indexes [0,0], [0,1], ...
        var pixels = indexes.map(i => image.getPixelColor(i[1], i[0])); // list of pixels
        var rgbas = pixels.map(i => Jimp.intToRGBA(i)); // int to rgba
        var set = Array.from(new Set(pixels)).map(i => Jimp.intToRGBA(i)); // get unique colors
        var puzzle = Array(16*16).fill(0); // get blank puzzle

        function get_tips(i = 0, rows = true){
            // get color tips for each row
            var tips = [];
            var j = 0;
            var order = 0;
            if(rows){
                // take first pixel color
                var color = pixels[i*16+j];
                // save on tips dict
                tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < 16; j++){
                    // if next color is not the same, add new tip and change color
                    if(color != pixels[i*16+j]){
                        order++;
                        color = pixels[i*16+j];
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
                var color = pixels[j*16+i];
                // save on tips dict
                tips[order] = {"color": Jimp.intToRGBA(color), "qtd": color==4294967295 ? 0 : 1};
                for(j = 1; j < 16; j++){
                    // if next color is not the same, add new tip and change color
                    if(color != pixels[j*16+i]){
                        order++;
                        color = pixels[j*16+i];
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

        tips_row = Array.from({length: 16}, (x, i) => i).map(i => get_tips(i, true));
        tips_col = Array.from({length: 16}, (x, i) => i).map(i => get_tips(i, false));

        res.json({ 
            image: rgbas,
            colors: set,
            puzzle: puzzle,
            rows: tips_row.map((i) => {return i.filter((j) => {return j["qtd"]>0})}),
            cols: tips_col.map((i) => {return i.filter((j) => {return j["qtd"]>0})}),
            max_tips_row: Math.max(...tips_row.map((i) => {return i.length})),
            max_tips_col: Math.max(...tips_col.map((i) => {return i.length}))
        });
    });
}); 
  
app.listen(3000, () => { 
    console.log('Server listening on port 3000'); 
});
