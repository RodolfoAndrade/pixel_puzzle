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
  color = { a:0, r:0, g:0, b:0 };
  colors: any;
  puzzle: any;
  tips_row: any;
  tips_col: any;
  max_tips_row = 0;
  max_tips_col = 0;
  table_col: any;
  table_row: any;
  validRows: any;
  validCols: any;

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
        // create blank puzzle
        this.puzzle = Array(this.size*this.size).fill({ r:255, g:255, b:255, a:255 });
        this.tips_row = this.data.rows;
        this.tips_col = this.data.cols;
        this.max_tips_row = this.data.max_hints_row;
        this.max_tips_col = this.data.max_hints_col;
        console.log("image", this.data.image);
        console.log("colors", this.data.colors);
        console.log("puzzle", this.puzzle);
        console.log("tips_row", this.tips_row);
        console.log("tips_col", this.tips_col);
        console.log(this.tips_col.map((i:any) => {return i.length}));
        console.log(this.max_tips_row);
        console.log(this.max_tips_col);
        this.table_col = Array.from({length: this.max_tips_col}, (x, i) => {return [].constructor(this.size).fill(0)});
        for (let i = 0; i<this.max_tips_col;i++){
          for(let j = 0; j<this.size;j++){
            if(this.tips_col[j][i]!=undefined){
              this.table_col[this.max_tips_col-1-i][j]=this.tips_col[j][this.tips_col[j].length-1-i];
            }
          }
        }
        console.log("table_col", this.table_col);
        this.table_row = Array.from({length: this.size}, (x, i) => {return [].constructor(this.max_tips_row).fill(0)});
        for (let i = 0; i<this.size;i++){
          for(let j = 0; j<this.max_tips_row;j++){
            if(this.tips_row[i][this.tips_row[i].length-1-j]!=undefined){
              this.table_row[i][this.max_tips_row-1-j]=this.tips_row[i][this.tips_row[i].length-1-j];
            }
          }
        }
        console.log("table_row", this.table_row);
        this.validRows = [].constructor(this.size).fill('valid');
        this.validCols = [].constructor(this.size).fill('valid');
    });
  } 

  selectColor(rgba: any) {
    this.color = rgba;
  }

  compColors(color1: any, color2: any){
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
  }

  checkRow(row: number){
    var count = 0;
    for(let i = 0; i < this.size; i++){
      if(this.compColors(this.puzzle[row*this.size+i], this.data.image[row*this.size+i])){
        count++;
      }
    }
    return count == this.size;
  }

  checkCol(col: number){
    var count = 0;
    for(let i = 0; i < this.size; i++){
      if(this.compColors(this.puzzle[i*this.size+col], this.data.image[i*this.size+col])){
        count++;
      }
    }
    return count == this.size;
  }

  setColor(i: number, j: number) {
    console.log("checkRow", this.checkRow(i));
    console.log("checkCol", this.checkCol(j));
    console.log(this.validRows[i]);
    if(!this.checkRow(i)&&!this.checkCol(j)){
      this.puzzle[i*this.size+j] = this.color;
      console.log(this.puzzle, this.color);
      console.log(this.data.image);
      if(this.checkRow(i)) this.validRows[i] = 'invalid';
      if(this.checkCol(j)) this.validCols[j] = 'invalid';
    }
  }

  getColor(color: any): string {
    return 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a+')';
  }
}