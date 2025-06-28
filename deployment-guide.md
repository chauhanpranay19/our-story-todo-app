# 🚀 Deployment Guide: Our Story App with Neon PostgreSQL

## 🎯 **What We've Built**

Your app now uses:
- **Frontend**: Beautiful HTML/CSS/JS interface
- **Backend**: Express.js API server
- **Database**: Neon PostgreSQL (your connection string)
- **Image Storage**: ImgBB (for photo uploads)

## 📁 **Project Structure**

```
todo/
├── index.html          # Frontend app
├── backend/
│   ├── server.js       # Express.js API server
│   └── package.json    # Node.js dependencies
├── netlify.toml        # Netlify configuration
└── README.md           # Documentation
```

## 🚀 **Deployment Options**

### **Option 1: Deploy to Railway (Recommended)**

Railway is perfect for Node.js apps with PostgreSQL:

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Connect your GitHub repository**
5. **Add environment variable:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_LRoBpjJvz01h@ep-tiny-thunder-aech14yn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Deploy automatically**

### **Option 2: Deploy to Render**

1. **Go to [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect your repository**
4. **Set build command:** `cd backend && npm install`
5. **Set start command:** `cd backend && npm start`
6. **Add environment variable:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_LRoBpjJvz01h@ep-tiny-thunder-aech14yn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### **Option 3: Deploy to Heroku**

1. **Install Heroku CLI**
2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```
3. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
4. **Set environment variable:**
   ```bash
   heroku config:set DATABASE_URL="postgresql://neondb_owner:npg_LRoBpjJvz01h@ep-tiny-thunder-aech14yn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
5. **Deploy:**
   ```bash
   git push heroku main
   ```

## 🔧 **Local Development**

To test locally:

1. **Install dependencies:**
   ```bash
   cd todo/backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🌐 **Production Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Create a GitHub repository**
2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

### **Step 2: Deploy Backend**

Choose one of the deployment options above (Railway recommended).

### **Step 3: Update Frontend API URL**

Once deployed, update the API URL in `index.html`:

```javascript
const API_BASE_URL = 'https://your-app-name.railway.app/api';
```

### **Step 4: Deploy Frontend to Netlify**

1. **Go to [netlify.com](https://netlify.com)**
2. **Drag and drop your `todo` folder**
3. **Your app will be live!**

## 🔍 **Testing Your Deployment**

After deployment, test:

- ✅ **Add tasks** - Should save to PostgreSQL
- ✅ **Complete tasks with photos** - Should upload to ImgBB
- ✅ **Journal entries** - Should save for both partners
- ✅ **Photo gallery** - Should show uploaded images
- ✅ **Data persistence** - Should work across sessions

## 🛠️ **Troubleshooting**

### **Database Connection Issues**
- Check your Neon connection string
- Ensure the database is active
- Verify network access

### **API Errors**
- Check server logs
- Verify environment variables
- Test API endpoints directly

### **Image Upload Issues**
- Verify ImgBB API key
- Check file size limits
- Test image upload separately

## 🎉 **Success!**

Your app now has:
- **Professional PostgreSQL database**
- **Scalable backend API**
- **Beautiful frontend interface**
- **Image upload functionality**
- **Real-time data persistence**

---

**Your couples todo app is now production-ready! ❤️** 