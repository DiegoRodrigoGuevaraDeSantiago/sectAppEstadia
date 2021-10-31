import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mensajeria',
  templateUrl: './mensajeria.page.html',
  styleUrls: ['./mensajeria.page.scss'],
})
export class MensajeriaPage implements OnInit {

  constructor(private menu: MenuController, public router: Router) { }

  ngOnInit() {
  }

  openFirst() {
    this.menu.enable(true, 'first2');
    this.menu.open('first2');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }
  hola(){
    
    console.log('hola');
    this.router.navigateByUrl("/inicio");
  }

}
