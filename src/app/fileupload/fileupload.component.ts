import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent {
  selectedFile: File | null = null;
  fileContent: string | null = null;
  displayContent: boolean = false;
  showAdditional: boolean = false;
  queryFormGroup!: FormGroup;
  messages: any[] = [];
  result: any;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.fileContent = null; // Réinitialiser le contenu lorsqu'un nouveau fichier est sélectionné
    this.displayContent = false;

  }

  readFileContent() {
    if (!this.selectedFile) {
      return;
    }
   
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.fileContent = event.target.result;
      this.displayContent = true;
    };
    reader.readAsText(this.selectedFile);
  }
  generateResponse() {
    if (!this.fileContent) {
      return;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      console.log('No file selected.');
      return;
    }
    const uploadData = new FormData();
    uploadData.append('file', this.selectedFile);
    this.selectedFile = null;  
    }
    constructor(private fb: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit() {
    this.queryFormGroup = this.fb.group({
      query: this.fb.control("")
    });

    this.sendInitialMessage();
  }

  sendInitialMessage() {
    let url = "https://api.openai.com/v1/chat/completions";
    let httpHeaders = new HttpHeaders().set("Authorization", "Bearer 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");
    
    // Sending the initial message
    this.messages.push({
      role: "system",
      content: "si je te donne une réponse qui n'est pas du code en visual basic, réponds moi en 'Veuillez inserer du code' Si je te donne du code en Visual basic convertit le en C# et envoie seulement"
    });

    let payload = {
      model: "gpt-3.5-turbo",
      messages: this.messages
    };

    this.httpClient.post(url, payload, { headers: httpHeaders })
      .subscribe({
        next: (resp) => {
          this.result = resp;
          this.result.choices.forEach((choice: any) => {
            this.messages.push({
              role: "assistant",
              content: choice.message.content
            });
          });
        },
        error: (err) => {
          // Handle errors here
          console.error(err);
        }
      });
  }

  copyToClipboard(content: string) {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  handleAskGPT() {
    let url = "https://api.openai.com/v1/chat/completions";
    let httpHeaders = new HttpHeaders().set("Authorization", "Bearer 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");
    this.messages.push({
      role: "user",
      content: this.queryFormGroup.value.query
    });
    let payload = {
      model: "gpt-3.5-turbo",
      messages: this.messages
    };
    this.httpClient.post(url, payload, { headers: httpHeaders })
      .subscribe({
        next: (resp) => {
          this.result = resp;
          this.result.choices.forEach((choice: any) => {
            this.messages.push({
              role: "assistant",
              content: choice.message.content
            });
          });
        },
        error: (err) => {
          // Handle errors here
          console.error(err);
        }
      });
  }
  downloadAsCsFile(content: string) {
    const fileName = 'file.cs';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Créer un lien pour télécharger le fichier
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
 
}
