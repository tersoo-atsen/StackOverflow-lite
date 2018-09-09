import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server';

chai.use(chaiHttp);

const should = chai.should();

describe('USERS CONTROLLER', () => {
  describe('POST /auth/signup', () => {
    it('Should register a new user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/signup')
        .send({
          firstname: 'test',
          lastname: 'test',
          email: 'm_doe@example.com',
          password: process.env.TEST_USER_PASS,
          confirm_password: process.env.TEST_USER_PASS
        })
        .end((error, response) => {
          should.not.exist(error);
          response.redirects.length.should.eql(0);
          response.status.should.eql(201);
          response.type.should.eql('application/json');
          response.body.should.include.keys('status', 'message', 'data');
          response.body.status.should.eql('Success');
          done();
        });
    });

    it('Should not register duplicate user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/signup')
        .send({
          firstname: 'test',
          lastname: 'test',
          email: 'm_doe@example.com',
          password: process.env.TEST_USER_PASS,
          confirm_password: process.env.TEST_USER_PASS
        })
        .end((error, response) => {
          response.status.should.eql(409);
          response.type.should.eql('application/json');
          response.body.should.include.keys('status', 'message');
          response.body.status.should.eql('Failure');
          done();
        });
    });

    it('Should respond with validation errors if firstname, '
    + 'lastname, email or password fields are empty', (done) => {
      chai.request(server)
        .post('/api/v1/auth/signup')
        .send()
        .end((error, response) => {
          response.status.should.equal(400);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Validation failed');
          response.body.data[0].msg.should.eql('First Name is required');
          response.body.data[1].msg.should.eql('You have not entered a string');
          response.body.data[2].msg.should.eql('Last Name is required');
          response.body.data[3].msg.should.eql('You have not entered a string');
          response.body.data[4].msg.should.eql('Email is required');
          response.body.data[5].msg.should
            .eql('You must provide an email address');
          response.body.data[6].msg.should.eql('Password is required');
          response.body.data[7].msg.should
            .eql('Password must be at least 5 chars long');
          response.body.data[8].msg.should
            .eql('Password must contain a number');
          done();
        });
    });

    it('Should verify password', (done) => {
      chai.request(server)
        .post('/api/v1/auth/signup')
        .send({
          firstname: 'test',
          lastname: 'test',
          email: 'm_doe1@example.com',
          password: process.env.TEST_USER_PASS,
          confirm_password: `${process.env.TEST_USER_PASS}ss`
        })
        .end((error, response) => {
          response.status.should.eql(400);
          response.type.should.eql('application/json');
          response.body.should.include.keys('status', 'message');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Passwords do not match');
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('Should login a user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'm_doe@example.com',
          password: process.env.TEST_USER_PASS
        })
        .end((error, response) => {
          should.not.exist(error);
          response.redirects.length.should.eql(0);
          response.status.should.eql(200);
          response.type.should.eql('application/json');
          response.body.should.include.keys('status', 'message', 'data');
          response.body.status.should.eql('Success');
          should.exist(response.body.data.token);
          done();
        });
    });

    it('Should respond with validation errors if '
    + 'email or password fields are empty', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: ''
        })
        .end((error, response) => {
          response.status.should.eql(400);
          done();
        });
    });

    it('Should not login if password is incorrect', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'm_doe@example.com',
          password: `${process.env.TEST_USER_PASS}ss`
        })
        .end((error, response) => {
          response.status.should.eql(401);
          response.type.should.eql('application/json');
          response.body.status.should.eql('Failure');
          done();
        });
    });

    it('Should respond with a error if password is not provided', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'michael@example.com',
          password: ''
        })
        .end((error, response) => {
          response.status.should.eql(400);
          response.type.should.eql('application/json');
          response.body.status.should.eql('Failure');
          done();
        });
    });

    it('Should not login an unregistered user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'michael@example.com',
          password: process.env.TEST_USER_PASS
        })
        .end((error, response) => {
          response.status.should.eql(404);
          response.type.should.eql('application/json');
          response.body.status.should.eql('Failure');
          done();
        });
    });
  });
});
