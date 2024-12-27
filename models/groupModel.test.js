const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Group } = require('./groupModel');
const { schemas } = require('./groupModel');

let mongoServer;

describe('Group Model', () => {
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

  it('should save a valid group', async () => {
    const validGroup = new Group({
        _id: "64dfc28c16f1e2d5c8e2b6a7",
        title: "Group 1",
        coachId: "coach1",
        payment: [{
            _id: "pay1",
            dailyPayment: 500,
            monthlyPayment: 10000
          }],
        schedule: [
            { day: "Monday", time: "10:00" },
            { day: "Wednesday", time: "15:30" },
          ],
        participants: [{
            _id: "p1",
            name: "John Doe",
            telegramId: 123456789
          },
          {
            _id: "p2",
            name: "Jane Doe",
            telegramId: 123456790
          },
          {
            _id: "p3",
            name: "Justin Doe",
            telegramId: 123456791
          }
        ],
      });

    const savedGroup = await validGroup.save();
    expect(savedGroup._id.equals("64dfc28c16f1e2d5c8e2b6a7")).toBe(true);
    expect(savedGroup.coachId).toBe('coach1'); // Default value
    expect(savedGroup.participants).toHaveLength(3);
    expect(savedGroup.createdAt).toBeDefined();
    expect(savedGroup.updatedAt).toBeDefined();
  });
  
  it('should throw validation error for missing required fields', async () => {
    // Create a group instance missing required fields
    const invalidGroup = new Group({
      title: "newGroupTitle",
      coachId: "Kostya",
      // Intentionally leave out 'schedule' and 'participants' fields
    });
  
    // Save the group and expect it to throw validation errors
    try {
      await invalidGroup.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors['schedule']).toBeDefined();
      expect(error.errors['participants']).toBeDefined();
    }
  });  });
  

describe('Joi Validation for Group', () => {
  const validGroup = {
//    _id: "1",
    title: "Group 1",
    coachId: "coach1",
    payment: [{
        _id: "pay1",
        dailyPayment: 500,
        monthlyPayment: 10000
      }],
    schedule: [
        { day: "Monday", time: "10:00" },
        { day: "Wednesday", time: "15:30" },
      ],
    participants: [{
        _id: "p1",
        name: "John Doe",
        telegramId: 123456789
      },
      {
        _id: "p2",
        name: "Jane Doe",
        telegramId: 123456790
      },
      {
        _id: "p3",
        name: "Justin Doe",
        telegramId: 123456791
      }
    ],
  };

  it('should validate a valid group object', () => {
    const { error, value } = schemas.addGroupSchema.validate(validGroup);
    expect(error).toBeUndefined();
    expect(value).toEqual(validGroup);
  });

  it('should throw error if required fields are missing', () => {
    const invalidGroup = {
        coachId: "2024-12-31T10:00:00.000Z", 
    };

    const { error } = schemas.addGroupSchema.validate(invalidGroup);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch("\"title\" is required");
  });

  it('should throw error if add fields which not allowed', () => {
    const invalidGroup = {
        title:'111',
      date: "2024-12-31T10:00:00.000Z", 
    };

    const { error } = schemas.addGroupSchema.validate(invalidGroup);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch("\"date\" is not allowed");
  });

  it('should throw error if date is not in ISO format', () => {
    const invalidGroup = {
      ...validGroup,
      payment: "12/31/2024", // Invalid payment format
    };

    const { error } = schemas.addGroupSchema.validate(invalidGroup);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch( "\"payment\" must be an array");
  });

  it('should set default values for missing optional fields', () => {
    const groupWithoutDefaults = {
      title: "newGroupTitle",
    };

    const { error, value } = schemas.addGroupSchema.validate(groupWithoutDefaults);
    expect(error).toBeUndefined();
    expect(value.coachId).toBe("Kostya");
    expect(value.payment).toEqual([]);
    expect(value.payment).toEqual([]);
    expect(value.participants).toEqual([]);
  });
});
