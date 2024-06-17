import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './api.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'pixel_puzzle'; 
  data: any;
  size: any;
  cols: any;
  rows: any;
  colors: any;
  color: any;
  puzzle: any;
  image: any;
  hints_rows: any;
  hints_cols: any;
  max_hints_rows = 0;
  max_hints_cols = 0;
  header_cols: any;
  header_rows: any;
  valid_rows: any;
  valid_cols: any;
  error = "";

  constructor(private apiService: ApiService) { }; 

  ngOnInit() { } 

  getImage() {
    this.apiService.getImage().subscribe(data => {
        this.data = data;
        this.size = this.data.size;
        // cols and rows for drawing the game table
        this.cols = Array.from({length: this.size}, (x, i) => i);
        this.rows = Array.from({length: this.size}, (x, i) => i);
        // colors of the image
        this.colors = this.data.colors;
        this.color = { a:0, r:0, g:0, b:0 };
        // get puzzle answer
        this.image = this.data.image;
        // create blank puzzle
        this.puzzle = Array(this.size*this.size).fill({ r:255, g:255, b:255, a:255 });
        // hints of colors and its quantities
        this.hints_rows = this.data.hints_rows;
        this.hints_cols = this.data.hints_cols;
        // max color hints for header table
        this.max_hints_rows = this.data.max_hints_rows;
        this.max_hints_cols = this.data.max_hints_cols;

        console.log("image", this.image);
        console.log("colors", this.colors);
        console.log("puzzle", this.puzzle);
        console.log("hints_rows", this.hints_rows);
        console.log("hints_cols", this.hints_cols);
        console.log("max_hints_rows", this.max_hints_rows);
        console.log("max_hints_cols", this.max_hints_cols);

        // header_cols display the hints_cols on html
        this.header_cols = Array.from({length: this.max_hints_cols}, (x, i) => {return [].constructor(this.size).fill(0)});
        for (let i = 0; i<this.max_hints_cols;i++){
          for(let j = 0; j<this.size;j++){
            if(this.hints_cols[j][i]!=undefined){
              this.header_cols[this.max_hints_cols-1-i][j]=this.hints_cols[j][this.hints_cols[j].length-1-i];
            }
          }
        }
        console.log("header_cols", this.header_cols);

        // header_cols display the hints_cols on html
        this.header_rows = Array.from({length: this.size}, (x, i) => {return [].constructor(this.max_hints_rows).fill(0)});
        for (let i = 0; i<this.size;i++){
          for(let j = 0; j<this.max_hints_rows;j++){
            if(this.hints_rows[i][this.hints_rows[i].length-1-j]!=undefined){
              this.header_rows[i][this.max_hints_rows-1-j]=this.hints_rows[i][this.hints_rows[i].length-1-j];
            }
          }
        }
        console.log("header_rows", this.header_rows);

        // variable to manager valid rows and cols on html
        this.valid_rows = [].constructor(this.size).fill('valid');
        this.valid_cols = [].constructor(this.size).fill('valid');
    }, error => {
      console.log(error);
      this.error = "There seems to be a problem with the server! Make sure it is listening on port 3000.";
    });
  } 

  selectColor(rgba: any) {
    this.color = rgba;
  }

  compColors(color1: any, color2: any){
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
  }

  checkRow(row: number){
    // check if puzzle and image has the same pixels color on row
    var count = 0;
    for(let i = 0; i < this.size; i++){
      if(this.compColors(this.puzzle[row*this.size+i], this.image[row*this.size+i])){
        count++;
      }
    }
    return count == this.size;
  }

  checkCol(col: number){
    // check if puzzle and image has the same pixels color on col
    var count = 0;
    for(let i = 0; i < this.size; i++){
      if(this.compColors(this.puzzle[i*this.size+col], this.image[i*this.size+col])){
        count++;
      }
    }
    return count == this.size;
  }

  setColor(i: number, j: number) {
    // if row and col are not filled correctly
    if(!this.checkRow(i)&&!this.checkCol(j)){
      this.puzzle[i*this.size+j] = this.color;
      if(this.checkRow(i)) this.valid_rows[i] = 'invalid';
      if(this.checkCol(j)) this.valid_cols[j] = 'invalid';
    }
  }

  getColor(color: any): string {
    return 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a+')';
  }
}