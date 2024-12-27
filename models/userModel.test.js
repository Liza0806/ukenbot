const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('./userModel');
const { schemas } = require('./userModel');

let mongoServer;

describe('User Model', () => {
  beforeAll(async () => {
    // ждем иногда долго, не убирай
    jest.setTimeout(20000); 
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Подключаем Mongoose к in-memory MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Отключаем Mongoose и остановливаем сервер
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should save a valid user', async () => {
    const validUser = new User({
        name: "userName 1",
        password: "111",
        phone: "+3801111111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        visits: [],
      });

    const savedUser = await validUser.save();
   // expect(savedUser._id.equals("64dfc28c16f1e2d5c8e2b6a7")).toBe(true);
    expect(savedUser.name).toBe("userName 1"); 
    expect(savedUser.password).toBe("111");
    expect(savedUser.discount).toBe(0);
    expect(savedUser.telegramId).toBe(111);
    expect(savedUser.visits).toEqual([]);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });
  
  it('should throw validation error for missing required fields', async () => {
    // Create a user instance missing required fields
    const invalidUser = new User({
      name: "newUserTitle",
      // Intentionally leave out 'password' and 'telegramId' fields
    });

    try {
      await invalidUser.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors['password']).toBeDefined(); // Check for password field error
      expect(error.errors['telegramId']).toBeDefined(); // Check for telegramId field error
    }
  });  });
  

describe('Joi Validation for User', () => {
  const validUser = {
    name: "userName 1",
    password: "111222",
    phone: "+3801111111",
    discount: 0,
    isAdmin: false,
    groups: [],
    balance: 11,
    telegramId: 111,
    visits: [],
  };

  it('should validate a valid group object', () => {
    const { error, value } = schemas.registerSchema.validate(validUser);
    expect(error).toBeUndefined();
    expect(value).toEqual(validUser);
  });

  it('should throw error if required fields are missing', () => {
    const invalidUser = {
        name: "newUserTitle",
        // Intentionally leave out 'password' and 'telegramId' fields
    };

    const { error } = schemas.registerSchema.validate(invalidUser);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch("\"password\" is required");
  });

  it('should throw error if add fields which not allowed', () => {
    const invalidUser = {
        name: "newUserTitle",
        password: '111333',
        phone: "+3801111111",
        telegramId: 111,
        date: '11/11/24' // not allowed
    };

    const { error } = schemas.registerSchema.validate(invalidUser);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch("\"date\" is not allowed");
  });

  it('should throw error if date is not in ISO format', () => {
    const invalidUser = {
      ...validUser,
      telegramId: "12/31/2024", // Invalid payment format
    };

    const { error } = schemas.registerSchema.validate(invalidUser);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch( "\"telegramId\" must be a number");
  });

  it('should set default values for missing optional fields', () => {
    const userWithoutDefaults = {
        name: "newUserTitle",
        password: '111333',
        phone: "+3801111111",
        telegramId: 111,
    };

    const { error, value } = schemas.registerSchema.validate(userWithoutDefaults);
    expect(error).toBeUndefined();
    expect(value.balance).toBe(0);
    expect(value.groups).toEqual([]);
    expect(value.visits).toEqual([]);
    expect(value.isAdmin).toEqual(false);
    expect(value.discount).toEqual(0);
  });
});
