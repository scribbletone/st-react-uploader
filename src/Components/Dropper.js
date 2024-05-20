import React, {useState} from 'react';
import PropTypes from 'prop-types';

export default function Dropper(props) {
  const {
    active:activeProps = true,
    className:classNameProps = '',
    style:styleProps = {}
  } = props;
  const [draggingOver, setDraggingOver] = useState(false);
  
  function setDraggingOverState(draggingOverNew){
    if (draggingOverNew != draggingOver) {
      setDraggingOver(draggingOverNew);
    }
  }
  function handleDragOver(e){
    if (activeProps) {
      if (e.dataTransfer.types.indexOf('Files') > -1) {
        e.stopPropagation();
        e.preventDefault();
        setDraggingOverState(true);
      } else {
        setDraggingOverState(false);
      }
    }
  }
  function handleDragLeave(e){
    if (activeProps) {
      e.stopPropagation();
      e.preventDefault();
      setDraggingOverState(false);
    }
  }
  function handleDrop(e){
    if (activeProps) {
      if (e.dataTransfer.types.indexOf('Files') > -1) {
        e.stopPropagation();
        e.preventDefault();
        props.onDrop && props.onDrop(e.dataTransfer.files)
        setDraggingOverState(false);
      }
    }
  }
  let draggingOverClass = (draggingOver ? props.draggingOverClass : '');
  return (
    <div 
      className={`${classNameProps} ${draggingOverClass}`}
      style={styleProps}
      onDragOver={(e)=>{handleDragOver(e)}}
      onDragLeave={(e)=>{handleDragLeave(e)}}
      onDrop={(e)=>{handleDrop(e)}}
    >
      {props.children}
    </div>
  );
}

Dropper.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  onDrop: PropTypes.func,
  style: PropTypes.object
}