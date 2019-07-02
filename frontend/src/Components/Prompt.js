import React, {Component} from 'react';
import ReactTags from 'react-tag-autocomplete';
import {availableTags, availableTypes} from '../common';
import InfoIcon from "./InfoIcon";

export default class Prompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: this.props.type.map(typeSlug => availableTypes.find(availableType => availableType.value === typeSlug)),
      text: this.props.text,
      tags: this.props.tags
    };
    this.props.onChange(this.state.type.map(type => type.value), this.state.text, this.state.tags);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.type.length !== this.state.type.length || prevState.text !== this.state.text || prevState.tags.length !== this.state.tags.length) {
      this.props.onChange(this.state.type.map(type => type.value), this.state.text, this.state.tags);
    }
  }

  onTextChange(e) {
    let value = e.target.value;
    this.setState({text: value});
  }

  onDeleteType(i) {
    const types = this.state.type.slice(0);
    types.splice(i, 1);
    this.setState({type: types});
  }

  onAddType(type) {
    let toAdd = [type];
    this.addBaseType(toAdd, 'plot', type.value);
    this.addBaseType(toAdd, 'chart', type.value);
    const types = [].concat(this.state.type, toAdd);
    this.setState({type: types});
  }

  addBaseType(types, baseType, currentType) {
    if (currentType !== baseType && currentType.includes(baseType) && !this.state.type.find(t => t.value === baseType)) {
      types.push(availableTypes.find(availableType => availableType.value === baseType));
    }
  }

  onValidateType(type) {
    return !this.state.type.find(t => t.value === type.value);
  }

  filter({name}, query) {
    return name.toLowerCase().includes(query.toLowerCase());
  }

  onDeleteTag(i) {
    const tags = this.state.tags.slice(0);
    tags.splice(i, 1);
    this.setState({tags: tags});
  }

  onAddTag(tag) {
    const tags = [].concat(this.state.tags, tag);
    this.setState({tags: tags});
  }

  onValidateTag(tag) {
    return !this.state.tags.find(t => t.value === tag.value);
  }


  render() {
    return <div className='prompt-content'>
      Type:<InfoIcon
        title='Available types:'
        items={availableTypes.map(t => t.name)}
        id='types'
      />
      <ReactTags
        minQueryLength={1}
        placeholderText={'Add new type'}
        tags={this.state.type}
        suggestions={availableTypes}
        onValidate={this.onValidateType.bind(this)}
        onDelete={this.onDeleteType.bind(this)}
        onAddition={this.onAddType.bind(this)}
        maxSuggestionsLength={100}
        suggestionsFilter={this.filter.bind(this)}
      />
      Tags:<InfoIcon
        title='Available tags:'
        items={availableTags.map(t => t.name)}
        id='tags'
      />
      <ReactTags
        minQueryLength={1}
        placeholderText={'Add new tag'}
        tags={this.state.tags}
        suggestions={availableTags}
        onValidate={this.onValidateTag.bind(this)}
        onDelete={this.onDeleteTag.bind(this)}
        onAddition={this.onAddTag.bind(this)}
        maxSuggestionsLength={100}
        suggestionsFilter={this.filter.bind(this)}
      />
    </div>;
  }
}

