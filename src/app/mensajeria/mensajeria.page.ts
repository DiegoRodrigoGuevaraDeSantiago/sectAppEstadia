import { Component, OnInit, ɵConsole } from '@angular/core';
import { MenuController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-mensajeria',
  templateUrl: './mensajeria.page.html',
  styleUrls: ['./mensajeria.page.scss'],
})
export class MensajeriaPage implements OnInit {

  newfile='';
  changeFile=false;
  imagen: any;
  newPDF:any = undefined;

  userID: string;
  userEmail: string;
  message: string;
  chats: any =[] = [];
  tmpFile: any = undefined;
  encriptKey: string = "#@!@^%$-*/*";
  name='';
  fileMessage=false;
  sinMensajes=false;
  error=false;
  fileID = Math.floor(Math.random() * 500);

  constructor(private menu: MenuController, public router: Router, private authSvc: AuthService,
    private navCtrl: NavController,
    private chatServ: ChatService, public loadingCtrl: LoadingController, private toast: ToastController) { }

  ngOnInit() {
    this.presentLoadingDefault()
    console.log('Hola');
    this.authSvc.afAuth.onAuthStateChanged((user)=>{
      if(user){
        console.log(user);
        this.userID = user.uid;
        this.userEmail = user.email;
        console.log( this.userID, this.userEmail)
        this.getMessages();
      }
    })
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
  mensajeria(){
    this.menu.close();
    this.router.navigateByUrl("/mensajeria");
  }
  cotizaciones(){
    this.menu.close();
    this.router.navigateByUrl("/cotizaciones");
  }
  informacionCliente(){
    this.menu.close();
    this.router.navigateByUrl("/infoclientes");
  }
  async cerrarSesion(){
    this.menu.close();
    try{
      await this.authSvc.logout();
      this.router.navigate(['/login']);
    } catch(error){
      console.log(error);
    }
    this.authSvc.logout();
  }

  async getMessages(){
    await this.chatServ.getMessage().on('value',(mesageSnap)=>{
      console.log(mesageSnap.val());
      if(mesageSnap.val()==null){
        this.sinMensajes=true;
      }
      this.chats = [];
      mesageSnap.forEach((messageData)=>{
        console.log('messageData', messageData.val());
        
          this.chats.push({
            email: messageData.val().email,
            message: crypto.AES.decrypt(messageData.val().message, this.encriptKey).toString(crypto.enc.Utf8),
            name: messageData.val().name,
            fileMessage: messageData.val().fileMessage,
            uid: messageData.val().uid,
          });
        console.log(this.chats)
      });
      console.log('Hola');
      //(document.getElementById('loading') as HTMLButtonElement).style.display ='none';
    });
  }

  async sendMessage(){
    if(this.message==''){
      return console.log('No hay nada');
    }
    let messageToSend = {};
    
      messageToSend = {
        uid: this.userID,
        email: this.userEmail,
        message: crypto.AES.encrypt(this.message, this.encriptKey).toString(),
        name: this.name,
        fileMessage: this.fileMessage,
      };
      this.name='';
      this.fileMessage=false;
    
    try{
      await this.chatServ.sendMessage(messageToSend);
      this.message = '';
    } catch (e) {
      this.message = '';
      console.log('error',e);
    }
  }

  async newImageUpload(event: any){
    if(event.target.files && event.target.files[0]){
      this.changeFile=true;
      this.newfile = event.target.files[0];
      console.log(this.newfile)
      const reader = new FileReader();
      reader.onload = ((image)=>{
        this.imagen = image;
        console.log(event.target.files[0].type);
        if(event.target.files[0].type=='image/png' ||event.target.files[0].type=='image/jpeg'){
          //this.tmpFile = this.imagen.currentTarget.result as string;
          this.error=false;
          console.log('Es una imagen');
          this.fileMessage=true;
          this.presentLoadingDefaultImageOrPDF('imagen');
          this.subir(event.target.files[0].name);
        }else if(event.target.files[0].type=='application/pdf'){
          console.log('ES PDF');
          this.error=false;
          this.newPDF = this.imagen.currentTarget.result as string;
          this.name= event.target.files[0].name;
          this.presentLoadingDefaultImageOrPDF('pdf');
          this.subir(event.target.files[0].name);
        }else{
          console.log('Archivo no valido');
          this.error=true;
          this.presentToastError('El formato no es valido. Unicamente PDF o PNG/JPG', '¡Ha ocurrido un error!');
          return;
        }
          console.log(this.imagen.currentTarget.result);
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async subir(name){
    const imageNewProduct = await this.chatServ.uploadImage(this.newfile, 'imagesMessage/',name);
    console.log(imageNewProduct)
    this.message = imageNewProduct;
    this.sendMessage();
  }

  irPDF(pdf){
    console.log(pdf);
    window.open(pdf, '_blank');
  }

    async presentLoadingDefault(){
    let loading = await this.loadingCtrl.create({
    spinner: 'circular',
    });
  
    loading.present();
  
    const waiting = setInterval(() => {
      if(this.chats.length!==0 || this.sinMensajes==true){
        clearInterval(waiting);
        loading.dismiss();
        this.sinMensajes=false;
      }
    }, 1000);
  }
  async presentLoadingDefaultImageOrPDF(option){
    let loading = await this.loadingCtrl.create({
    spinner: 'circular',
    message: 'Subiendo '+ option +'...'
    })
  
    loading.present();
  
    const waiting = setInterval(() => {
      if(this.message=='' &&this.name=='' &&
      this.fileMessage==false){
        clearInterval(waiting);
        loading.dismiss();
      }
    }, 1000);
  }
  
  async presentToastError(mensaje, titulo) {
    const toast = await this.toast.create({
      header: titulo,
      message: mensaje,
      position: 'bottom',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }

}
