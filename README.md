Here’s the updated **README.md** file for your project, explaining how to build and run the app, along with setting up the `.env` file for API tokens and providing a brief overview of the tool.

---

# **Research Helper Tool**

## **Overview**
The **Research Helper Tool** is a Chrome Extension designed to simplify research and make information more accessible. This tool uses Chrome's built-in **Summarization API** to generate concise summaries of research papers, articles, or websites, and the **Translation API** to translate those summaries into any language.

### **Key Features**
- **Summarize Content**: Automatically extract key insights from research papers, articles, or webpages.
- **Translate Summaries**: Translate summaries into your desired language, enabling global accessibility.
- **Privacy-Focused**: All processing is done locally in the browser, ensuring your data remains secure.

---

## **Installation**

Follow these steps to set up and run the Research Helper Tool:

### **1. Clone the Repository**
```bash
git clone https://github.com/sk-uom-in/Google-Chrome-Built-in-AI-Challenge.git
cd Google-Chrome-Built-in-AI-Challenge
```

### **2. Install Dependencies**
Ensure you have **Node.js** and **npm** installed on your system. Then, install the required dependencies:
```bash
npm install
```

### **3. Set Up API Tokens**
- Obtain API trial tokens for the **Summarization API** and **Translation API** from the Chrome Early Preview Program or relevant documentation.
- Create a `.env` file in the root directory of the project and add the following:
  ```env
  REACT_APP_SUMMARIZATION_API_TOKEN=your-summarization-api-token
  REACT_APP_TRANSLATION_API_TOKEN=your-translation-api-token
  ```
  Replace `your-summarization-api-token` and `your-translation-api-token` with your actual API tokens.

### **4. Build the Project**
Build the project using the following command:
```bash
npm run build
```

This will create a `build/` folder containing the production-ready Chrome Extension files.

### **5. Load the Extension in Chrome**
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** using the toggle in the top-right corner.
3. Click on **Load unpacked** and select the `build/` folder.

---

## **Usage**
1. Open any webpage, article, or research paper in Chrome.
2. Click on the Research Helper Tool extension icon.
3. Use the following features:
   - **Summarize**: Generate a concise summary of the content.
   - **Translate**: Translate the summary into your preferred language using the dropdown menu.

---

## **Commands**

| Command         | Description                                      |
|------------------|--------------------------------------------------|
| `npm install`    | Installs all dependencies required for the project. |
| `npm run build`  | Builds the production version of the app in the `build/` folder. |

---

## **Project Details**

### **Technologies Used**
- **Summarization API**: Extracts key information from research papers and articles.
- **Translation API**: Enables translation of summaries into multiple languages.

### **Key Files**
- **`src/components/TranslationTool.jsx`**: Main component for the tool's UI and functionality.
- **`.env`**: Stores API tokens securely for local development.

### **Repository**
[Research Helper Tool Repository](https://github.com/sk-uom-in/Google-Chrome-Built-in-AI-Challenge)
