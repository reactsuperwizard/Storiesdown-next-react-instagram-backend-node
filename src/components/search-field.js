import { Component, Fragment } from 'react';
import Router from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import jsCookie from 'js-cookie';

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      error: props.error ? props.error : false,
    };

    this.saveUser = this.saveUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  search() {
    if (this.state.value.trim() != '') {
      this.setState({ isSearching: true });
      document.location = '/users/' + this.state.value;
    }
  }

  alert() {
    if (this.state.error == 1) {
      return (
        <div className='mb-1' style={{ color: '#bf0202' }}>
          User not found!
        </div>
      );
    } else if (this.state.error == 2) {
      return (
        <div className='mb-1' style={{ color: '#bf0202' }}>
          Server is overloaded, please try again!
        </div>
      );
    }
  }

  saveUser(user, userPosts) {
    localStorage.setItem(
      user.info.username,
      JSON.stringify({ ...user, ...userPosts })
    );

    if (user.info.username in localStorage == false) {
      localStorage.clear();
      localStorage.setItem(
        user.info.username,
        JSON.stringify({ ...user, ...userPosts })
      );
    }

    if (user.info.username in localStorage) {
      jsCookie.set(user.info.username, true, {
        expires: 1 / 24 / 6,
      });
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleKeyUp(event) {
    if (event.keyCode === 13) {
      this.search();
    }
  }

  handleButtonClick() {
    this.search();
  }

  render() {
    if (this.state.isSearching === true) {
      return (
        <div className='sk-chase'>
          <div className='sk-chase-dot'></div>
          <div className='sk-chase-dot'></div>
          <div className='sk-chase-dot'></div>
          <div className='sk-chase-dot'></div>
          <div className='sk-chase-dot'></div>
          <div className='sk-chase-dot'></div>
        </div>
      );
    }

    return (
      <Fragment>
        {this.alert()}
        <div className='search-field'>
          <input
            type='text'
            placeholder='Enter instagram username'
            value={this.state.value}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
          />
          <button onClick={this.handleButtonClick}>Search</button>
        </div>
      </Fragment>
    );
  }
}

export default SearchField;
