import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import Uploader from '../Utils/Uploader';
import Dropper from './Dropper';

export default function FileUploader(props) {
  const {
    allowedTypes = null,
    autoUpload = true,
    draggingOverClass = '',
    dragAndDrop = true,
    fileBtnClass = '',
    fileBtnStyle = {},
    fileBtnText = 'Select File',
    fileKey = '',
    itemsWrapperClass = '',
    multiple = false,
    wrapperClass = '',
    wrapperStyle = {},
    buildUid = false,
    buildShortUid = false,
    submitBtnClass = '',
    submitBtnStyle = {},
    submitBtnText = 'Upload',
    uploadingItemClass = ''
  } = props;
  
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(()=>{
    if (autoUpload && files.length > 0) {
      startUpload();
    }
  },[files]);

  function handleSelectClick(){
    fileInputRef.current.click();
  }
  function handleInputChange(e){
    addFiles(e.target.files)
  }
  function handleDrop(newFiles){
    addFiles(newFiles);
  }
  function addFiles(newFiles){
    let filesList = [];
    for(var i = 0; i < newFiles.length; i++) {
      filesList.push(newFiles[i])
    }
    filesList = (multiple ? files.concat(filesList) : [filesList[0]]);
    setFiles(filesList);

    // potential issue 5/20/24. Moved startUpload() to useEffect. This was previously in setState callback.
    
    props.onInputChange && props.onInputChange(filesList);
    props.onUploadStart && props.onUploadStart();
  }
  function clearInput() {
    fileInputRef.current.value = "";
    setFiles([]);
  }
  function isReady() {
    return files.length > 0;
  }
  function addToQueue(items){
    setUploadQueue(uploadQueue.concat(items));
  }
  function removeFromQueue(key) {
    let queue = uploadQueue.filter((item)=>{
      return item.key != key;
    });
    setUploadQueue(queue);
    if (queue.length == 0){
      props.onAllComplete && props.onAllComplete();
    }
  }
  function startUpload() {
    if (isReady()) {
      let uploader = new Uploader({
        files: files,
        allowedTypes: allowedTypes,
        awsCredentials: props.awsCredentials,
        fileKey: fileKey,
        buildUid: buildUid,
        onError: (k,f,u,r)=>{handleError(k,f,u,r)},
        onSuccess: (k,f,u,r)=>{handleSuccess(k,f,u,r)},
        onUploadStart: (items)=>{addToQueue(items)},
        buildShortUid: buildShortUid,
        url: props.bucketUrl
      });
      uploader.start();
      clearInput();
    } else {
      alert('no files to upload')      
    }
  }
  function handleSuccess(key,filename,url,request){
    props.onSuccess && props.onSuccess({
      filename: filename,
      url: `${props.bucketUrl}${key}${filename}`,
      key: key,
      fullKey: `${key}${filename}`
    }, request);
    removeFromQueue(key);
  }
  function handleError(key,filename,url,request){
    props.onError && props.onError({
      message: 'Could not complete upload',
      request: request
    });
    removeFromQueue(key);
  }
  function renderSelectedItems() {
    if (props.renderSelectedItems) {
      return props.renderSelectedItems(files);
    } else {
      return files.map((file)=>{
        return (
          <div key={"file" + file.name}>
            {file.name}
          </div>
        )
      })
    }
  }
  function renderUploadingItems() {
    if (props.renderUploadingItems) {
      return props.renderUploadingItems(uploadQueue)
    } else {
      return uploadQueue.map((item)=>{
        return (
          <div 
            className={uploadingItemClass} 
            key={item.key}>
            uploading {item.filename}
          </div>
        );
      })
    }
  }
  return (
    <Dropper 
      active={dragAndDrop}
      className={wrapperClass}
      draggingOverClass={draggingOverClass}
      style={wrapperStyle}
      onDrop={(f)=>handleDrop(f)} >
      <div className={props.inputWrapperClass}>
        <input
          ref={fileInputRef}
          type="file" 
          name={props.name}
          multiple={multiple}
          style={{display: 'none'}}
          onChange={(e,v)=>{handleInputChange(e,v)}}
        />
        <div 
          onClick={()=>{handleSelectClick()}}
          >
          {props.renderFileInput ? 
            props.renderFileInput()
          : 
            <a 
              className={fileBtnClass}
              style={fileBtnStyle} >
              {fileBtnText}
            </a>
          }
        </div>
        {autoUpload ? 
          null
        :
          <div>
            <a 
              className={submitBtnClass}
              onClick={()=>{startUpload()}}
              style={submitBtnStyle}
            >
              {submitBtnText}
            </a>
            {renderSelectedItems()}
          </div>
        }
        {props.hint ? 
          <div className={props.hintClass}>
            {props.hint}
          </div>
        : null}
      </div>
      <div className={itemsWrapperClass}>
        {renderUploadingItems()}
        {props.children}
      </div>
    </Dropper>
  );
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
  hint: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  inputWrapperClass: PropTypes.string,
  itemsWrapperClass: PropTypes.string,
  multiple: PropTypes.bool,
  onError: PropTypes.func,
  onSuccess: PropTypes.func,
  onUploadStart: PropTypes.func,
  onAllComplete: PropTypes.func,
  renderFileInput: PropTypes.func,
  renderSelectedItems: PropTypes.func,
  renderUploadingItems: PropTypes.func,
  wrapperClass: PropTypes.string,
  wrapperStyle: PropTypes.object,
  submitBtnClass: PropTypes.string,
  submitBtnStyle: PropTypes.object,
  submitBtnText: PropTypes.string,
  uploadingItemClass: PropTypes.string
};