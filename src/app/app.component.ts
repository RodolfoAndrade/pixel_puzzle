import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { ApiService } from './api.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'pixel_puzzle'; 
  size = 16;
  cols = Array.from({length: this.size}, (x, i) => i);
  rows = Array.from({length: this.size}, (x, i) => i);
  color = { a:0, r:0, g:0, b:0 };
  image: any;
  colors: any;
  puzzle: any;
  tips_row: any;
  tips_col: any;
  max_tips_row = 0;
  max_tips_col = 0;
  table_col: any;
  table_row: any;

  constructor(private apiService: ApiService) { }; 

  ngOnInit() { } 

  getImage() {
    this.image = this.apiService.getImage().subscribe(data => {
        this.image = data;
        this.colors = this.image.colors;
        this.puzzle = this.image.puzzle;
        this.tips_row = this.image.rows;
        this.tips_col = this.image.cols;
        this.max_tips_row = this.image.max_tips_row;
        this.max_tips_col = this.image.max_tips_col;
        console.log(this.image.image);
        console.log(this.image.colors);
        console.log(this.image.puzzle);
        console.log(this.tips_row);
        console.log(this.tips_col);
        console.log(this.tips_col.map((i:any) => {return i.length}));
        console.log(this.max_tips_row);
        console.log(this.max_tips_col);
        this.table_col = Array.from({length: this.max_tips_col}, (x, i) => {return [].constructor(16).fill(0)});
        for (let i = 0; i<this.max_tips_col;i++){
          for(let j = 0; j<16;j++){
            if(this.tips_col[j][i]!=undefined){
              this.table_col[this.max_tips_col-1-i][j]=this.tips_col[j][this.tips_col[j].length-1-i]["qtd"];
            }
          }
        }
        console.log(this.table_col);
        this.table_row = Array.from({length: 16}, (x, i) => {return [].constructor(this.max_tips_row).fill(0)});
        for (let i = 0; i<16;i++){
          for(let j = 0; j<this.max_tips_row;j++){
            if(this.tips_row[i][this.tips_row[i].length-1-j]!=undefined){
              this.table_row[i][this.max_tips_row-1-j]=this.tips_row[i][this.tips_row[i].length-1-j]["qtd"];
            }
          }
        }
        console.log(this.table_row);
    });
  } 

  selectColor(rgba: any) {
    this.color = rgba;
  }

  setColor(x: number, y: number) {
    this.puzzle[x*16+y] = this.color;
  }
}