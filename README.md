## 📘 TamilGeo Blog

**TamilGeo** is a modern, mobile-first blog platform built using:

* WordPress REST API (for blog content)
* Firebase (for realtime likes & comments)
* Tailwind CSS (for UI design)

> 🔥 The site loads blog posts from your [WordPress.com](https://wordpress.com/) blog and supports dynamic interaction using Firebase.

---

### 📸 Screenshots

| Home Page                                                             | Post Page                                                              |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![Homepage Screenshot](https://tamilgeo.wordpress.com/wp-content/uploads/2025/08/screenshot_20250806_121634633158948234342873.jpg) | ![Post Page Screenshot](https://tamilgeo.wordpress.com/wp-content/uploads/2025/08/screenshot_20250806_121648315025798513707344.jpg) |

---

### 🚀 Features

✅ WordPress API integration (Posts, Authors, Images)<br>
✅ Firebase-powered real-time **likes** & **comments**<br>
✅ Responsive video embeds<br>
✅ "Load More Posts" with pagination<br>
✅ Clean Tailwind UI<br>
✅ Copy-to-clipboard **Share** button<br>
✅ SEO-friendly code<br>
✅ Sync commenting & Likes (with Firebase Auth)

---

### 🛠️ Setup Instructions

#### 1. 🔗 Clone the Repo

```bash
git clone https://github.com/your-username/tamilgeo-blog.git
cd tamilgeo-blog
```

#### 2. 🌐 Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Go to **Realtime Database** → Create Database
4. Go to **Project Settings** → Add Web App
5. Copy your Firebase config and replace in `post.html`:

   ```js
   const firebaseConfig = {
     apiKey: "XXXX",
     authDomain: "XXXX",
     databaseURL: "XXXX",
     ...
   }
   ```

#### 3. ✍️ Customize WordPress Site Source

In `index.js` and `post.js`, replace:

```js
const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com";
```

With your WordPress site’s API endpoint:

```
https://public-api.wordpress.com/wp/v2/sites/YOURSITE.wordpress.com
```

---

### 🧾 Folder Structure

```
tamilgeo-blog/
├── index.html
├── post.html
├── js/
│   ├── index.js      # Fetch & render posts
│   └── post.js       # Fetch & display single post (with Firebase)
├── css/              # (optional custom styles)
└── README.md
```

---

### 🔥 Firebase Data Format

```json
{
  "likes": {
    "post_123": 4
  },
  "comments": {
    "post_123": {
      "comment_1": "Great post!",
      "comment_2": "Loved it!"
    }
  }
}
```

---

### 💡 Future Improvements

* 🔒 Authenticated commenting (with Firebase Auth)
* 📅 Scheduled posts display
* 🗂️ Categories / tags filtering
* 🌙 Dark mode toggle

---

### 👨‍💻 Author

Made with ❤️ by **TamilGeo**

* 🌐 [Website](https://tamilgeo.wordpress.com)
* 🐙 [GitHub](https://github.com/your-username)

---

### 📄 License

This project is licensed under the MIT License.

---
