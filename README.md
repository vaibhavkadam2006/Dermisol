# Dermisol AI - Privacy-First Clinical Skin Analysis Tool

Dermisol AI is a local, privacy-first clinical skin analysis tool designed to perform dermatological scans directly in the browser. By utilizing client-side machine learning, the application ensures that sensitive biometric and medical data never leave the user's device.

## 🏗️ Architecture

The application follows a modular design to ensure scalability and a clear separation of concerns between the user interface and the analysis logic.

- **Frontend Layer**: Built with Next.js using the App Router for a responsive, fast user experience.
- **Analysis Engine**: A dedicated library that handles the extraction of face mesh data and coordinates between different neural network models.
- **Privacy Model**: All computations (lesion detection and landmarking) are performed on the client side using TensorFlow.js and ONNX Runtime Web.
- **Feedback Loop**: The system provides real-time visual feedback via a canvas overlay, displaying detected bounding boxes and face landmarks directly over the uploaded image.

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **UI/Styling**: React 19, Tailwind CSS 4
- **Machine Learning**:
  - MediaPipe: For face landmarker and mesh detection
  - TensorFlow.js: For model execution and client-side processing
  - ONNX Runtime Web: For high-performance model inference
  - YOLO: Used for lesion detection and bounding box generation
- **Language**: TypeScript

## ✨ Features

- **User Authentication**: Secure access to personalized reports.
- **Real-time Analysis**: Instant processing of uploaded skin images using neural networks.
- **Face Mapping**: Successful registration of a face map to pinpoint affected zones.
- **Severity Scoring**: Automatic categorization of skin condition (Clear, Mild, Moderate, or Severe) based on lesion counts.
- **Privacy-First**: No data is sent to a server; all analysis happens locally.

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vaibhavkadam2006/Dermisol.git
   cd Dermisol
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. View the application:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Running a Scan

1. Click on "Upload Face Photo" to select an image.
2. Select "Run Scan" to initiate the AI analysis.
3. View the Diagnostics Report for lesion count, severity, and face map registration status.

## 📚 Learn More

For more information about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [MediaPipe](https://mediapipe.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.