import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server';

chai.use(chaiHttp);

chai.should();

let userToken;
describe('QUESTIONS CONTROLLER', () => {
  before((done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send({
        lastname: 'James',
        firstname: 'Crocker',
        email: 'james.croaker@example.com',
        username: 'james_croaker',
        password: process.env.TEST_USER_PASS,
        confirm_password: process.env.TEST_USER_PASS,
      })
      .end((error, response) => {
        if (error) throw error;
        userToken = response.body.data.token;
        done();
      });
  });
  describe('GET /api/v1/questions', () => {
    it('Should get all questions', (done) => {
      chai.request(server)
        .get('/api/v1/questions')
        .end((error, response) => {
          response.status.should.equal(200);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Success');
          response.body.message.should.eql('Data retreival successful');
          response.body.data.should.include.keys('questions');
          done();
        });
    });
  });

  describe('GET /api/v1/questions/:questionId', () => {
    it('Should get a question by id',
      (done) => {
        chai.request(server)
          .get('/api/v1/questions/1')
          .end((error, response) => {
            response.status.should.equal(200);
            response.type.should.equal('application/json');
            response.body.status.should.eql('Success');
            response.body.message.should.eql('Request was successful');
            done();
          });
      });

    it('Should respond with not found if question does not exist', (done) => {
      chai.request(server)
        .get('/api/v1/questions/15')
        .end((error, response) => {
          response.status.should.equal(404);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Question not found');
          done();
        });
    });

    it('Should catch invalid parameter in get single question URL', (done) => {
      chai.request(server)
        .get('/api/v1/questions/w')
        .end((error, response) => {
          response.status.should.equal(400);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Validation failed');
          response.body.data[0].msg.should.eql('Invalid url parameter');
          done();
        });
    });
  });

  describe('POST /api/v1/questions', () => {
    it('Should post a new question', (done) => {
      chai.request(server)
        .post('/api/v1/questions')
        .set('x-access-token', userToken)
        .send({
          title: 'Qui aggredior inveniant desumptas',
          body: 'Ipsius cupere vulgus tes hos.',
        })
        .end((error, response) => {
          response.status.should.equal(201);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Success');
          response.body.message.should.eql('Question created successfully');
          done();
        });
    });

    it('Should not post with invalid token', (done) => {
      chai.request(server)
        .post('/api/v1/questions')
        .set('x-access-token', `${userToken}rrr`)
        .send({
          title: 'Qui aggredior inveniant desumptas',
          body: 'Ipsius cupere vulgus tes hos.',
        })
        .end((error, response) => {
          response.status.should.equal(403);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Failed to authenticate token');
          done();
        });
    });

    it('Should not post with empty content field', (done) => {
      chai.request(server)
        .post('/api/v1/questions')
        .set('x-access-token', userToken)
        .send()
        .end((error, response) => {
          response.type.should.equal('application/json');
          response.status.should.equal(400);
          response.body.message.should.eql('Validation failed');
          response.body.data[0].msg.should.eql('Title cannot be empty');
          response.body.data[1].msg.should.eql('Question body cannot be empty');
          done();
        });
    });
  });

  describe('DELETE /api/v1/questions/:questionId', () => {
    it('Should respond with a success message', (done) => {
      chai.request(server)
        .delete('/api/v1/questions/1')
        .end((error, response) => {
          response.status.should.equal(200);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Success');
          response.body.message.should.eql('Question deleted successfully');
          response.body.should.include.keys('status', 'message');
          done();
        });
    });

    it('Should respond with a not found message', (done) => {
      chai.request(server)
        .delete('/api/v1/questions/50')
        .end((error, response) => {
          response.status.should.equal(404);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Question not found');
          done();
        });
    });
    it('Should respond with validation error', (done) => {
      chai.request(server)
        .delete('/api/v1/questions/r')
        .end((error, response) => {
          response.status.should.equal(400);
          response.type.should.equal('application/json');
          response.body.status.should.eql('Failure');
          response.body.message.should.eql('Validation failed');
          response.body.data[0].msg.should.eql('Invalid url parameter');
          done();
        });
    });
  });
});
