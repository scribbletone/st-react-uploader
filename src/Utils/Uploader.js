import Guid from 'guid';

export default class Uploader {
  constructor(opts) {
    // see bottom of file for example opts
    this.opts = opts;
    this.queue = [];
  }
  start() {
    this.opts.files.map((file)=> {
      if (this.isAllowedType(file)) {
        let formData = this.buildForm();
        let filename = file.name.replace(/[^a-z0-9_\-\.]/gi, '_');
        let key = this.generateKey();
        formData = this.addFileToForm(formData, key, file, filename);
        this.queueForm(formData, key, filename);
      }
    });
    this.submitForms();
  }
  buildForm() {
    let formData = new FormData();
    formData.append('Content-Type', 'multipart/form-data');
    formData.append('AWSAccessKeyId', this.opts.awsCredentials.access_key_id);
    formData.append('acl', this.opts.awsCredentials.acl);
    formData.append('policy', this.opts.awsCredentials.policy);
    formData.append('signature', this.opts.awsCredentials.signature);
    return formData;
  }
  isAllowedType(file) {
    if (!this.opts.allowedTypes || (this.opts.allowedTypes.indexOf(file.type) > -1)){
      return true;
    } else {
      alert('File: ' + file.name + '\nSorry, that file type is not allowed');
      return false;
    }
  }
  generateKey() {
    return `${this.opts.fileKey}${this.buildUid()}`;
  }
  buildUid(){
    if (this.opts.buildUid) {
      return `${new Date().getTime()}-${Guid.create()}/`;
    } else if (this.opts.buildShortUid) {
      return `${new Date().getTime()}/`;
    } else {
      return '';
    }
  }
  addFileToForm(formData, key, file, filename) {
    formData.append('key', key + "${filename}");
    formData.append("filename", filename);
    formData.append("file", file, filename);
    return formData;
  }
  queueForm(formData, key, filename) {
    let request = new XMLHttpRequest();
    request = this.addRequestListeners(request, key, filename);
    request.open("POST", this.opts.url, true);
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
    this.queue.push({request, formData, key,filename})
  }
  addRequestListeners(request, key, filename){
    let url = `${this.opts.url}${key}${filename}`;
    request.addEventListener("load", (e)=>{
      if (request.status >= 200 && request.status < 300) {
        this.opts.onSuccess(key, filename, url);  
      } else {
        this.opts.onError(key, filename, url);
      }
    });
    request.addEventListener("error", (e)=>{
      this.opts.onError(key, filename, url);
    });
    return request;
  }
  submitForms(){
    this.opts.onUploadStart(this.queue);
    this.queue.forEach((form)=>{
      form.request.send(form.formData);
    });
    this.queue = [];
  }
}


/*
example opts passed in 
{
  files: this.state.files,
  allowedTypes: this.props.allowedTypes,
  awsCredentials: this.props.awsCredentials,
  fileKey: this.props.fileKey,
  buildUid: this.props.buildUid,
  onError: (k,f)=>{this.handleError(k,f)},
  onSuccess: (k,f)=>{this.handleSuccess(k,f)},
  onUploadStart: (items)=>{this.addToQueue(items)},
  buildShortUid: this.props.buildShortUid,
  url: this.props.bucketUrl
}
*/