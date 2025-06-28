# Our Story - Couples Todo App ❤️

A beautiful, modern todo app designed for couples to track their bucket list, share memories, and journal together. Features a dark theme with animated hearts, password protection, and media upload capabilities.

## ✨ Features

- **📝 Bucket List Management**: Add, edit, and track your shared goals
- **✅ Task Completion**: Mark tasks as done with photos/videos
- **🔄 Smart Reordering**: Rearrange your bucket list with ease
- **📸 Memory Gallery**: View all your completed tasks with media
- **💭 Daily Journal**: Answer daily questions together
- **🔒 Password Protection**: Keep your memories private
- **📱 Mobile Responsive**: Works perfectly on all devices
- **🎨 Beautiful UI**: Dark theme with animated hearts
- **☁️ Cloud Storage**: Reliable image/video uploads via Cloudinary

## 🚀 Live Demo

**App URL**: https://our-story-todo-app.onrender.com  
**Password**: Vish

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **Image Upload**: Cloudinary
- **Deployment**: Render

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (Neon recommended)
- Cloudinary account (free tier)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
```

## ☁️ Cloudinary Setup

1. **Create Account**: Sign up at [Cloudinary](https://cloudinary.com/)
2. **Get Cloud Name**: Find your cloud name in the dashboard
3. **Create Upload Preset**:
   - Go to Settings → Upload
   - Create a new upload preset
   - Set it to "Unsigned" for client-side uploads
   - Copy the preset name

4. **Update Configuration**: Update the constants in `index.html`:
   ```javascript
   const CLOUDINARY_CLOUD_NAME = "your_cloud_name";
   const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset";
   ```

## 🗄️ Database Setup

The app uses PostgreSQL with these tables:

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Journal Table
```sql
CREATE TABLE journal (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  author VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Installation & Deployment

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/our-story-todo-app.git
   cd our-story-todo-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env-file.txt .env
   # Edit .env with your database URL
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the app**: http://localhost:3000

### Production Deployment (Render)

1. **Connect Repository**: Link your GitHub repo to Render
2. **Configure Environment**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add your `DATABASE_URL`

3. **Deploy**: Render will automatically deploy your app

## 📱 Usage

1. **Access the app** and enter the password: `Vish`
2. **Add bucket list items** using the input field
3. **Upload media** by clicking on any active task
4. **Rearrange items** using the 🔄 button
5. **View memories** in the Memories section
6. **Journal together** in the Journal section

## 🔒 Security Features

- **Password Protection**: App requires password to access
- **Secure Uploads**: Cloudinary handles file security
- **Input Validation**: All inputs are sanitized
- **CORS Protection**: Configured for production use

## 🎨 Customization

### Changing the Password
Edit the `CORRECT_PASSWORD` constant in `index.html`:
```javascript
const CORRECT_PASSWORD = "YourNewPassword";
```

### Modifying the Theme
Update CSS variables in the `:root` selector:
```css
:root {
  --primary-red: #ff6b6b;
  --dark-bg: #0a0a0a;
  /* ... other variables */
}
```

### Adding New Features
The modular structure makes it easy to add new features:
- Add new API endpoints in `server.js`
- Create new UI sections in `index.html`
- Extend the database schema as needed

## 🐛 Troubleshooting

### Upload Issues
- Check Cloudinary configuration
- Verify upload preset is set to "Unsigned"
- Check file size limits (25MB for Cloudinary)

### Database Issues
- Verify PostgreSQL connection string
- Check database permissions
- Ensure tables are created properly

### Deployment Issues
- Check environment variables in Render
- Verify build and start commands
- Check server logs for errors

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the console logs for errors
3. Open an issue on GitHub

---

Made with ❤️ for couples everywhere 