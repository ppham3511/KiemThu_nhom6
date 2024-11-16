// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://PhuongPham:Phuong23062004*@phuongpham.hktz4.mongodb.net/?retryWrites=true&w=majority&appName=PhuongPham').then(() => console.log("MongoDB connected"))
	.catch((error) => console.log(error));
// ???? b troll a


// User Schema
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	}
});

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = bcrypt.hash(this.password, 10);
	}
	next();
});

const User = mongoose.model('User', userSchema);

app.get("/test", async (req, res, next) => {
	async function checkUser() {
		const user =0;
		const hashPassword = await bcrypt.hash('anhanh', 12);
		if (!user.length) {
			await User.create({
				email: 'test@example.com',
				password: hashPassword,
			})
		}
	}
	checkUser();
	res.send("Hello")
})
// Login route
app.post('/api/login', async (req, res) => {
	try {
		// Em lay email va password tu request cua nguoi dung
		const { email, password } = req.body;

		// Input validation
		// Kiem tra xem email va password co ton tai khong co rong hay hoac co duoc truyen vao hay ko neu ma khong
		// thi em se tra ve cho nguoi dung la Mayy phai cung cap email va password
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password'
			});
		}
		// test regex email valid
		const emailRegex = /\S+@\S+\.\S+/;
		// Em se test email xem no co dung dinh dang cua email khong . Neu khong em trar vef ```Please provide a valid email address```
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Please provide a valid email address'
			});
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			});
		}
		// Tai day em check password cua nguoi dung co dung co do dai lon hon 6 hay khong neu khong em se tra ve cho nguoi dung la Password must be at least 6 characters
		if (password.length < 6) {
			return res.status(401).json({
				success: false,
				message: 'Password must be at least 6 characters'
			});
		}
		// Khi tat ca cac dieu thoa man co nghia chuogn trinh van tiep tuc
		// em se check password cua nguoi dung co dung hay khong

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		// Neu password khong dung thi em se tra ve cho nguoi dung la Invalid email or password
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			});
		}
		// Khi password dung thi em se tao 1 token cho nguoi dung
		// Generate JWT token
		const token = jwt.sign(
			{ userId: user._id },
			'private_token', // Replace with environment variable in production
			{ expiresIn: '1h' }
		);
		// khi tao xong em se tra ve cho nguoi dung la token va user
		res.status(200).json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email
			}
		});

	} catch (error) {
		// Ham nay no se tra ve loi khi tat ca cac ham nhu jwt.sign , User.findOne({ email }) xay ra loi thi
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});