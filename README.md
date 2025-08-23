# 📑 AI-Powered PDF Workspace  

An interactive workspace for uploading, reading, and annotating PDFs with an integrated **AI assistant** and **rich text editor**. Built with **Next.js, Convex, Clerk, Tiptap, and Gemini AI**, this project allows users to manage notes, search PDFs intelligently, and export their work seamlessly.  

---

## ✨ Features  
- 📂 **PDF Upload & Viewer** – Upload and view multiple PDF files in an organized dashboard.  
- 📝 **Rich Text Editor (Tiptap)** – Create, edit, and highlight notes with formatting options (bold, italic, underline, lists, blockquotes, headings, alignment, etc.).  
- 🤖 **AI Assistant Integration** – Ask questions about your PDF content, and the AI generates context-aware answers in HTML format.  
- 💾 **Auto & Manual Save** – Notes are saved to **Convex DB** (auto + manual save options).  
- 📤 **Export Notes as PDF** – Download your notes directly from the editor.  
- 👤 **Authentication** – Secure sign-in/sign-up powered by **Clerk**.  
- ⚡ **File Limits & Premium Mode** – Free users can upload up to 5 files. Premium unlocks unlimited uploads.  
- 🎨 **Modern UI** – Clean design with toolbars, icons (Lucide React), and responsive layout.  

---

## 🛠️ Tech Stack  
- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React, TailwindCSS  
- **Editor:** [Tiptap](https://tiptap.dev/) (custom toolbar)  
- **Backend/Database:** [Convex](https://convex.dev/)  
- **Auth:** [Clerk](https://clerk.dev/)  
- **AI:** Google Gemini AI  
- **PDF Handling:** jsPDF, React-PDF  

---

## 🚀 How It Works  
1. **Sign up / log in** with Clerk.  
2. **Upload a PDF** (up to 5 for free users).  
3. Open the **workspace** → PDF viewer + note-taking editor side by side.  
4. **Highlight text or ask questions** → AI generates contextual answers.  
5. **Save notes** automatically or manually.  
6. **Export notes as PDF** when done.  

---

## 🏗️ Installation  

Clone the repo:  
```bash
git clone https://github.com/yourusername/ai-pdf-workspace.git
cd ai-pdf-workspace
