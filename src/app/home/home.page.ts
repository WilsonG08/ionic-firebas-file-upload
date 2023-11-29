import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { every, finalize, tap } from 'rxjs/operators';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'

export interface imgFile {
  name: String;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //objeto de tipo tarea para subir archivo
  fileUploadTask: AngularFireUploadTask
  //barra de progreso
  percentageVal: Observable<any>;
  trackSnapshot: Observable<any>;
  //Url para subir el archivo
  UploadedImageURL: Observable<any>;
  //Archico par sabir de ripo imagen
  files: Observable<imgFile[]>;
  //Especiificaciones de la imagen
  imgName: string;
  imgSize: number;
  //estado del progreso
  isFileUploading: boolean;
  isFileUploaded: boolean;

  //arregki de ekenebtis oara kas imagenes
  private filesCallection: AngularFirestoreCollection<imgFile>
  constructor(private afs: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    this.isFileUploading = false,
      this.isFileUploaded = false;

    this.filesCallection = afs.collection<imgFile>('imagesColection');
    this.files = this.filesCallection.valueChanges();
  }

  uploadImage(event: FileList) {
    const file: any = event.item(0);
    //validacion de la imagen
    if (file.type.split('/')[0] !== 'image') {
      console.log("no se acepta este tipo de archivos");
      return;
    }
    this.isFileUploading = true;
    this.isFileUploaded = false;

    this.imgName = file.name;

    //Ruta en la nube 
    const fileStoragePath = 'fileStorage/${new Date().getTime()}_${file.name}';

    //Imagen
    const imageRef = this.afStorage.ref(fileStoragePath);
    //tarea para subir el archivo
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
    //mostrar el progreso de subida
    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.trackSnapshot.pipe(
      finalize(() => {
        this.UploadedImageURL = imageRef.getDownloadURL();
        this.UploadedImageURL.subscribe(
          (resq) => {
            this.storeFilesFirebase({
              name: file.name,
              filepath: resq,
              size: this.imgSize
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          }
        )
      }),
      tap((snap: any) => {
        this.imgSize = snap.totalBytes;
      })
    )
  }

  storeFilesFirebase(image: imgFile) {
    const fileId = this.afs.createId();
    this.filesCallection
      .doc(fileId)
      .set(image)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err)
      })

  }

}
