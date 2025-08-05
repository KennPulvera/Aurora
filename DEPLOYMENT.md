# 🚀 Deployment Guide - AVA Business Management System

This guide will help you deploy the AVA Business Management System to **Render** (backend) and **Netlify** (frontend).

## 📋 Prerequisites

- MongoDB Atlas account and cluster
- Render account
- Netlify account
- GitHub repository with your code

## 🗄️ Step 1: MongoDB Atlas Setup

1. **Create MongoDB Cluster** (if not already done):
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster or use existing
   - Set up database user with read/write permissions

2. **Get Connection String**:
   ```
   mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/ava-business?retryWrites=true&w=majority&appName=Cluster0
   ```

3. **Whitelist IP Addresses**:
   - Go to Network Access
   - Add `0.0.0.0/0` for all IPs (or specific Render IPs)

## 🖥️ Step 2: Deploy Backend to Render

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `ava-business-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (for testing) or Starter ($7/month)

3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/ava-business?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=10000
   FRONTEND_URL=https://your-netlify-app.netlify.app
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your Render URL: `https://your-app-name.onrender.com`

## 🌐 Step 3: Deploy Frontend to Netlify

1. **Update API URLs**:
   - Update `netlify.toml` with your actual Render URL
   - Update `client/public/_redirects` with your Render URL

2. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository

3. **Configure Build**:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
   - **Node version**: `18`

4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-render-app.onrender.com
   REACT_APP_NAME=AVA Business Management
   NODE_VERSION=18
   ```

5. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment to complete
   - Note your Netlify URL: `https://your-app-name.netlify.app`

## 🔄 Step 4: Update Cross-References

1. **Update Backend CORS**:
   - Go to Render dashboard
   - Update `FRONTEND_URL` environment variable with your actual Netlify URL

2. **Update Frontend API URL**:
   - Go to Netlify dashboard
   - Update `REACT_APP_API_URL` with your actual Render URL

3. **Redeploy Both**:
   - Trigger redeploy on both services

## ✅ Step 5: Test Deployment

1. **Test API**:
   - Visit: `https://your-render-app.onrender.com/api/health`
   - Should return status: "OK"

2. **Test Frontend**:
   - Visit: `https://your-app-name.netlify.app`
   - Try logging in with Super Admin:
     - Email: `admin@ava-system.com`
     - Password: `admin123`

3. **Test Full Flow**:
   - Register a new business
   - Add employees
   - Test employee clock-in

## 🔧 Troubleshooting

### Common Issues:

**CORS Errors**:
- Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly
- Check that Netlify redirects are working

**Database Connection**:
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check MongoDB URI is correct in Render environment variables

**Build Failures**:
- Check Node version compatibility (use Node 18)
- Ensure all dependencies are in `package.json`

**File Upload Issues**:
- Note: File uploads won't persist on Render free tier
- Consider using AWS S3 or Cloudinary for production

## 🚀 Production Optimizations

1. **Render**:
   - Upgrade to Starter plan for persistent storage
   - Set up custom domain
   - Enable auto-deploy from GitHub

2. **Netlify**:
   - Set up custom domain
   - Enable form submissions if needed
   - Set up redirects for SEO

3. **Database**:
   - Set up MongoDB Atlas backups
   - Monitor performance
   - Consider upgrading cluster for production load

4. **Security**:
   - Use strong JWT secrets
   - Set up rate limiting
   - Enable HTTPS everywhere
   - Regular security updates

## 📊 Monitoring

- **Render**: Built-in logs and metrics
- **Netlify**: Built-in analytics and forms
- **MongoDB Atlas**: Performance monitoring
- Consider adding: Sentry for error tracking, Google Analytics for usage

## 💰 Cost Estimates

**Free Tier**:
- Render: Free (with limitations)
- Netlify: Free (100GB bandwidth)
- MongoDB Atlas: Free (512MB storage)

**Production Ready**:
- Render Starter: $7/month
- Netlify Pro: $19/month (if needed)
- MongoDB Atlas: $9/month (M2 cluster)
- **Total: ~$16-35/month**

---

🎉 **Your AVA Business Management System is now deployed and ready to serve customers worldwide!**