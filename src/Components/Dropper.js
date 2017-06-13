import React from 'react';
import PropTypes from 'prop-types';

export default class Dropper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draggingOver: false
    }
  }
  setDraggingOverState(draggingOver) {
    if (draggingOver != this.state.draggingOver) {
      this.setState({
        draggingOver: draggingOver
      });
    }
  }
  handleDragOver(e){
    if (this.props.active) {
      if (e.dataTransfer.types.indexOf('Files') > -1) {
        e.stopPropagation();
        e.preventDefault();
        this.setDraggingOverState(true);
      } else {
        this.setDraggingOverState(false);
      }
    }
  }
  handleDragLeave(e){
    if (this.props.active) {
      e.stopPropagation();
      e.preventDefault();
      this.setDraggingOverState(false);
    }
  }
  handleDrop(e){
    if (this.props.active) {
      if (e.dataTransfer.types.indexOf('Files') > -1) {
        e.stopPropagation();
        e.preventDefault();
        this.props.onDrop && this.props.onDrop(e.dataTransfer.files)
        this.setDraggingOverState(false);
      }
    }
  }
  render() {
    let draggingOverClass = (this.state.draggingOver ? this.props.draggingOverClass : '');
    return (
      <div 
        className={`${this.props.className} ${draggingOverClass}`}
        style={this.props.style}
        onDragOver={(e)=>{this.handleDragOver(e)}}
        onDragLeave={(e)=>{this.handleDragLeave(e)}}
        onDrop={(e)=>{this.handleDrop(e)}}
      >
        {this.props.children}
        {this.state.draggingOver ? 'over' : ''}
      </div>
    );
  }
}
Dropper.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  onDrop: PropTypes.func,
  style: PropTypes.object
}
Dropper.defaultProps = {
  active: true,
  className: '',
  style: {}
}