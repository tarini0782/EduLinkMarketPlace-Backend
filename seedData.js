const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const Group = require('./models/Group');
const JoinRequest = require('./models/JoinRequest');
const Quiz = require('./models/Quiz');
const Result = require('./models/Result');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    // 1. Database Connection Link
    // You can replace this URI with your MongoDB Atlas Cloud link (e.g., 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/edulink')
    const mongoURI = 'mongodb+srv://dinujanethmal119_db_user:n8ZHGoWOtXU6e1wx@edulink-cluster.qb8qsmb.mongodb.net/?appName=EduLink-Cluster'; 

    await mongoose.connect(mongoURI);

    // Clear existing data
    await User.deleteMany();
    await Group.deleteMany();
    await JoinRequest.deleteMany();
    await Quiz.deleteMany();
    await Result.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('Cleared existing database records.');

    // 2. Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin12345',
        role: 'admin',
        campus: 'Malabe',
      },
      {
        name: 'Nethmi Perera',
        email: 'it22000000@my.sliit.lk',
        password: 'password123',
        role: 'student',
        campus: 'Malabe',
        degreeProgram: 'BSc (Hons) in IT - SE',
        skills: ['React', 'Node.js']
      },
      {
        name: 'Dulaj Fernando',
        email: 'it22000001@my.sliit.lk',
        password: 'password123',
        role: 'student',
        campus: 'Kandy',
        degreeProgram: 'BSc (Hons) in IT - CS',
        skills: ['Python', 'Machine Learning']
      }
    ]);

    // Get Created Students
    const student1 = users[1]._id;
    const student2 = users[2]._id;
    const adminId = users[0]._id;

    // 3. Create Groups
    const group = await Group.create({
      name: 'Team Quantum',
      subject: 'SE Project',
      leader: student1,
      members: [student1],
      capacity: 4,
      tags: ['React', 'MERN'],
      description: 'Looking for backend developers to join our final year SE project.'
    });

    // 4. Create Join Request
    await JoinRequest.create({
      user: student2,
      group: group._id,
      status: 'pending',
      message: 'I am highly skilled in APIs and databases. Let me join!'
    });

    // 5. Create Quiz
    const quiz = await Quiz.create({
      title: 'Midterm Quiz 1',
      module: 'SE',
      timeLimit: 30,
      createdBy: adminId,
      questions: [
        {
          questionText: 'Which lifecycle method is used for API calls in Class components?',
          options: ['componentDidMount', 'render', 'componentWillUpdate', 'constructor'],
          correctAnswer: 'componentDidMount',
          points: 10
        },
        {
          questionText: 'What hook is used to manage state functionally in React?',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correctAnswer: 'useState',
          points: 10
        }
      ]
    });

    // 6. Create Result
    await Result.create({
      quiz: quiz._id,
      student: student2,
      score: 10,
      total: 20,
      answers: [
        { questionId: quiz.questions[0]._id, selectedOption: 'componentDidMount', isCorrect: true },
        { questionId: quiz.questions[1]._id, selectedOption: 'useEffect', isCorrect: false }
      ]
    });

    // 7. Create Marketplace Product & Order
    const product = await Product.create({
      name: 'Cracking the Coding Interview',
      description: 'Barely used book, perfect for placement season.',
      price: 1500,
      category: 'Books',
      seller: student1,
      status: 'available'
    });

    await Order.create({
      product: product._id,
      buyer: student2,
      seller: student1,
      amount: 1500,
      status: 'pending'
    });

    console.log('✔ Successfully seeded the EduLink database!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Uncomment below to execute directly via node seedData.js
// seedData();

module.exports = seedData;
