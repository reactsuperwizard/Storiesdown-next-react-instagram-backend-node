import { Component } from 'react';
import MainLayout from '../components/main-layout';
import Header from '../components/header';
import Head from 'next/head';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

class RemoveContent extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      values: {
        email: '',
        username: '',
        message: '',
      },
      isSubmitting: false,
      isError: true,
      responseMsg: '',
    };
  }

  async handleSubmit(e) {
    e.preventDefault();
    const captcha = grecaptcha.getResponse();
    this.setState({ isSubmitting: true });
    if (captcha.length > 0) {
      const response = await axios.post('/api/remove-content', {
        ...this.state.values,
        captcha,
      });
      if (response.data.success) {
        this.setState({ isError: false });
        this.setState({ responseMsg: response.data.message });
      }
    }
    this.setState({ isSubmitting: false });
    return false;
  }

  handleInputChange(e) {
    this.setState({
      values: { ...this.state.values, [e.target.name]: e.target.value.trim() },
    });
  }
  render() {
    return (
      <MainLayout>
        <Head>
          <title>Remove Content - StoriesDown</title>
          {/* <script
            src='https://www.google.com/recaptcha/api.js'
            async
            defer
          ></script> */}
        </Head>
        <div className='hero'>
          <Header />
        </div>

        <div className='white-bg'>
          <div className='container'>
            <div className='row'>
              <div className='col-12 py-5'>
                <div className='form-wrapper mx-auto'>
                  <form
                    className='remove-content-form'
                    onSubmit={this.handleSubmit}
                  >
                    <div className='header'>Remove your profile</div>
                    <div className='body'>
                      <div className='notice my-2'>
                        We apologize for our content making you unhappy :({' '}
                        <br />
                        Please send us your instagram username.
                      </div>
                      <input
                        type='email'
                        name='email'
                        placeholder='E-mail'
                        value={this.state.values.email}
                        onChange={this.handleInputChange}
                        className='w-100 my-2 p-2'
                        required
                      />
                      <input
                        type='text'
                        name='username'
                        placeholder='Username'
                        value={this.state.values.username}
                        onChange={this.handleInputChange}
                        className='w-100 my-2 p-2'
                        required
                      />
                      <textarea
                        placeholder='Message'
                        name='message'
                        value={this.state.values.message}
                        onChange={this.handleInputChange}
                        className='w-100 my-2 p-2'
                        required
                      ></textarea>
                      {this.state.isError ? (
                        <div>
                          <div className='text-center'>
                            <ReCAPTCHA
                              style={{ display: 'inline-block' }}
                              sitekey='6LesHdcZAAAAAB30S5V5GflsgJ_dYQ1TGbti9dnY'
                            ></ReCAPTCHA>
                          </div>

                          <div className='text-right'>
                            <button
                              disabled={
                                this.state.isSubmitting ||
                                this.state.values.email == '' ||
                                this.state.values.username == '' ||
                                this.state.values.message == ''
                              }
                              type='submit'
                              className='mt-3 px-3 py-1'
                            >
                              SEND
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#a52a2a' }}>
                          {this.state.responseMsg}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default RemoveContent;
