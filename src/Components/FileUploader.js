import React from 'react';
import PropTypes from 'prop-types';
import Uploader from '../Utils/Uploader';
import Dropper from './Dropper';

export default class FileUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploadQueue: []
    }
  }
  handleSelectClick(){
    this.refs.fileInput.click();
  }
  handleInputChange(e){
    this.addFiles(e.target.files)
  }
  handleDrop(files){
    this.addFiles(files);
  }
  addFiles(newFiles){
    let files = [];
    for(var i = 0; i < newFiles.length; i++) {
      files.push(newFiles[i])
    }
    files = (this.props.multiple ? this.state.files.concat(files) : [files[0]]);
    this.setState({
      files: files
    }, ()=>{
      if (this.props.autoUpload) {
        this.startUpload();
      }
    });
    this.props.onInputChange && this.props.onInputChange(files);
  }
  clearInput() {
    this.refs.fileInput.value = "";
    this.setState({
      files:  []
    });
  }
  isReady() {
    return this.state.files.length > 0;
  }
  addToQueue(items){
    this.setState({
      uploadQueue: this.state.uploadQueue.concat(items)
    });
  }
  removeFromQueue(key) {
    let queue = this.state.uploadQueue.filter((item)=>{
      return item.key != key;
    });
    this.setState({
      uploadQueue: queue
    });
  }
  startUpload() {
    if (this.isReady()) {
      let uploader = new Uploader({
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
      });
      uploader.start();
      this.clearInput();
    } else {
      alert('no files to upload')      
    }
  }
  handleSuccess(key,filename){
    this.props.onSuccess && this.props.onSuccess({
      filename: filename,
      url: `${this.props.bucketUrl}${key}${filename}`,
      key: key,
      fullKey: `${key}${filename}`
    });
    this.removeFromQueue(key);
  }
  handleError(key,filename){
    this.props.onError && this.props.onError({
      message: 'Could not complete upload'
    });
    this.removeFromQueue(key);
  }
  renderSelectedItems() {
    if (this.props.renderSelectedItems) {
      return this.props.renderSelectedItems(this.state.files);
    } else {
      return this.state.files.map((file)=>{
        return (
          <div key={"file" + file.name}>
            {file.name}
          </div>
        )
      })
    }
  }
  renderUploadingItems() {
    if (this.props.renderUploadingItems) {
      return this.props.renderUploadingItems(this.state.uploadQueue)
    } else {
      return this.state.uploadQueue.map((item)=>{
        return (
          <div key={item.key}>
            uploading {item.filename}
          </div>
        );
      })
    }
  }
  render() {
    return (
      <Dropper 
        active={this.props.dragAndDrop}
        className={this.props.wrapperClass}
        draggingOverClass={this.props.draggingOverClass}
        style={this.props.wrapperStyle}
        onDrop={(f)=>this.handleDrop(f)} >
        <input
          ref='fileInput'
          type="file" 
          name={this.props.name}
          multiple={this.props.multiple}
          style={{display: 'none'}}
          onChange={(e,v)=>{this.handleInputChange(e,v)}}
        />
        <a 
          className={this.props.fileBtnClass}
          onClick={()=>{this.handleSelectClick()}}
          style={this.props.fileBtnStyle} >
          {this.props.fileBtnText}
        </a>
        {this.props.autoUpload ? 
          null
        :
          <div>
            <a 
              className={this.props.submitBtnClass}
              onClick={()=>{this.startUpload()}}
              style={this.props.submitBtnStyle}
            >
              {this.props.submitBtnText}
            </a>
            {this.renderSelectedItems()}
          </div>
        }
        <div className={this.props.itemsWrapperClass}>
          {this.renderUploadingItems()}
          {this.props.children}
        </div>
      </Dropper>
    );
  }
}

FileUploader.propTypes = {
  awsCredentials: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  bucketUrl: PropTypes.string.isRequired,
  allowedTypes: PropTypes.array,
  autoUpload: PropTypes.bool,
  awsSuccessActionRedirect: PropTypes.string,
  buildUid: PropTypes.bool,
  buildShortUid: PropTypes.bool,
  dragAndDrop: PropTypes.bool,
  draggingOverClass: PropTypes.string,
  fileBtnClass: PropTypes.string,
  fileBtnStyle: PropTypes.object,
  fileBtnText: PropTypes.string,
  fileKey: PropTypes.string,
  itemsWrapperClass: PropTypes.string,
  multiple: PropTypes.bool,
  onError: PropTypes.func,
  onSuccess: PropTypes.func,
  renderSelectedItems: PropTypes.func,
  renderUploadingItems: PropTypes.func,
  wrapperClass: PropTypes.string,
  wrapperStyle: PropTypes.object,
  submitBtnClass: PropTypes.string,
  submitBtnStyle: PropTypes.object,
  submitBtnText: PropTypes.string
};
FileUploader.defaultProps = {
  allowedTypes: null,
  autoUpload: true,
  draggingOverClass: '',
  dragAndDrop: true,
  fileBtnClass: '',
  fileBtnStyle: {},
  fileBtnText: 'Select File',
  fileKey: '',
  itemsWrapperClass: '',
  multiple: false,
  wrapperClass: '',
  wrapperStyle: {},
  buildUid: false,
  buildShortUid: false,
  submitBtnClass: '',
  submitBtnStyle: {},
  submitBtnText: 'Upload'
}