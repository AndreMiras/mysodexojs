const assert = require('assert');
const rewire = require('rewire');


describe('getFullEndpointUrl', () => {
  const testHelper = (endpoint, lang, expected) => {
    const index = rewire('./index.js');
    const getFullEndpointUrl = index.__get__('getFullEndpointUrl');
    expect(getFullEndpointUrl(endpoint, lang)).toBe(expected);
  };

  it('base case', () => {
    const endpoint = 'foo';
    const lang = 'es';
    const expected = 'https://sodexows.mo2o.com/es/foo';
    testHelper(endpoint, lang, expected);
  });

  it('removes leading slashes', () => {
    const endpoint = '//foo/bar/';
    const lang = 'en';
    const expected = 'https://sodexows.mo2o.com/en/foo/bar/';
    testHelper(endpoint, lang, expected);
  });
});

describe('handleCodeMsg', () => {
  it('passes silently if no error', () => {
    const index = rewire('./index.js');
    const handleCodeMsg = index.__get__('handleCodeMsg');
    const jsonResponse = {
      code: 100,
      msg: "OK"
    };
    const expected = undefined;
    expect(handleCodeMsg(jsonResponse)).toBe(expected);
  });

  it.each([
    [null, 'OK'],
    [101, 'OK'],
    [100, null],
    [100, 'Error'],
    [null, null]
  ])('raises on unmatching code (%s) or msg (%s)', (code, msg) => {
    const index = rewire('./index.js');
    const handleCodeMsg = index.__get__('handleCodeMsg');
    const jsonResponse = { code, msg };
    const expected = assert.AssertionError;
    expect(() => {
      handleCodeMsg(jsonResponse)
    }).toThrow(expected);
  });
});

describe('sessionPost', () => {
  it('base', (done) => {
    jest.resetModules();
    const endpoint = '/foo/bar';
    const jsonData = {};
    const expected = {};
    jest.doMock('request', () => {
      return {
        post: jest.fn((req, callback) => {
          const error = null;
          const response = {
            statusCode: 200,
          };
          const body = {
            code: 100,
            msg: 'OK',
            response: {}
          };
          callback(error, response, body)
        }),
      }
    });
    // const index = rewire('./index.js');
    // const sessionPost = index.__get__('sessionPost');
    const index = require('./index.js');
    const sessionPost = index.sessionPost;
    const cookieJar = {};
    const callback = (jsonResponse) => {
      expect(jsonResponse).toEqual(expected);
      done();
    };
    expect(sessionPost(cookieJar, endpoint, jsonData, callback)).toBe(undefined);
  });
});

describe('login', () => {
  it('base', (done) => {
    jest.resetModules();
    jest.unmock('request');
    const email = 'foo@bar.com';
    const password = 'password';
    const expectedCookieJar = {};
    const expectedAccountInfo = {foo: 'bar'};
    jest.doMock('request', () => {
      return {
        post: jest.fn((req, callback) => {
          const error = null;
          const response = {
            statusCode: 200,
          };
          const body = {
            code: 100,
            msg: 'OK',
            response: expectedAccountInfo
          };
          callback(error, response, body)
        }),
        jar: () => { return expectedCookieJar; }
      }
    });
    const index = require('./index.js');
    const login = index.login;
    const callback = (response) => {
      const { cookieJar, accountInfo } = response;
      expect(cookieJar).toEqual(expectedCookieJar);
      expect(accountInfo).toEqual(expectedAccountInfo);
      done();
    };
    expect(login(email, password, callback)).toBe(undefined);
  });
});

describe('getCards', () => {
  it('base', (done) => {
    jest.resetModules();
    jest.unmock('request');
    const cookieJar = {};
    const dni = '123456789';
    const expectedCardList = [{
      service: "Restaurante Pass",
      idCard: 219999,
      cardNumber: "1234567897901234",
      cardStatus: "ACTIVA",
      idCardStatus: "30",
      pan: "123456******1234",
      caducityDateCard: "",
      idProduct: 33,
      programFis: "",
      hasChip: 1,
      idCompany: 10183,
      arrFisToChange: [{
        key: "BLOCKED",
        value: "60"
      }],
      idFisToChange: "60",
      fisToChangeState: "BLOCKED"
    }];
    jest.doMock('request', () => {
      return {
        post: jest.fn((req, callback) => {
          const error = null;
          const response = {
            statusCode: 200,
          };
          const body = {
            code: 100,
            msg: 'OK',
            response: {
              listCard: expectedCardList
            }
          };
          callback(error, response, body)
        }),
      }
    });
    const index = require('./index.js');
    const getCards = index.getCards;
    const callback = (cardList) => {
      expect(cardList).toEqual(expectedCardList);
      done();
    };
    expect(getCards(cookieJar, dni, callback)).toBe(undefined);
  });
});

describe('getDetailCard', () => {
  it('base', (done) => {
    jest.resetModules();
    jest.unmock('request');
    const cookieJar = {};
    const cardNumber = '1234567897901234';
    const expectedCardDetail = {
      idCard: 123456,
      cardNumber: '1234567897901234',
      idCardPayProvider: 0,
      idBeneficiary: 0,
      idCardStatus: '30',
      employeeName: 'ANDRE MIRAS',
      printerName: 'ANDRE MIRAS',
      legalNumber: '123456789',
      cardBalance: 13.37,
      caducityDateCard: '2022-12-31',
      cardStatus: 'ACTIVA',
      idCompany: 10183,
      faceValue: 0,
      creationDate: '',
      idAddress: 0,
      addressReference: '',
      idCustomize: 0,
      perfil: '',
      description: '',
      itemType: 0,
      idProduct: 33,
      idContract: 20070,
      pan: '459340******4428',
      cardStatusDate: '2018-12-04',
      accountId: '',
      limitPassed: 0,
      idProfile: 0,
      maxValueOfConsum: 0,
      limiteConsumo: 0,
      programFis: 'SDSC',
      hasChip: 1,
      balanceFis: {
        saldoDisponible: 13.37,
        apuntesPendientes: 0
      },
      arrFisToChange: [
        {
          key: 'BLOCKED',
          value: '60'
        }
      ],
      idFisToChange: '60',
      blockedAmount: '',
      totalBalance: '',
      maxLoad: 0,
      maxUsesDay: 0,
      infoBalanceRestriction: '',
      dayRestriction: '',
      useOnHoliday: '',
    };
    jest.doMock('request', () => {
      return {
        post: jest.fn((req, callback) => {
          const error = null;
          const response = {
            statusCode: 200,
          };
          const body = {
            code: 100,
            msg: 'OK',
            response: {
              cardDetail: expectedCardDetail
            }
          };
          callback(error, response, body)
        }),
      }
    });
    const index = require('./index.js');
    const getDetailCard = index.getDetailCard;
    const callback = (cardList) => {
      expect(cardList).toEqual(expectedCardDetail);
      done();
    };
    expect(getDetailCard(cookieJar, cardNumber, callback)).toBe(undefined);
  });
});
