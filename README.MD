# AI Image Scraper Web Application

## Description

This web application enables users to upload images for analysis using Artificial Intelligence (AI) via the Google Vision API. Its primary goal is to extract relevant labels, descriptions, and metadata from images to enhance categorization and searchability.

The app supports uploading images through both a standard file dialog and drag & drop. It features visual progress indicators, a detailed results table, and options to download the processed data as CSV.

## Features

- Multiple image uploads with MIME type filtering.
- Google Vision API integration for advanced label detection and web entity recognition.
- Real-time progress display and detailed results for each image.
- Downloadable CSV reports of analyzed data.
- User-friendly and robust interface to minimize errors.
- File size restrictions to maintain performance.
- Enhanced drag & drop event management for smooth operation.

## Technologies Used

- **HTML5** for structure and interface elements.
- **CSS3** for styling and responsive design.
- **JavaScript (ES6+)** for application logic, event handling, and API interactions.
- **Google Cloud Vision API** for intelligent visual content analysis.

## Installation and Usage

1. Clone this repository:

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


2. Open `index.html` in a modern browser supporting ES6 and Fetch API.

3. Obtain a valid Google Cloud Vision API key from Google Cloud Console.

4. Enter your API key in the input field at the top-right corner of the app.

5. Upload images using the browse button or by dragging files to the designated drop zone.

6. Click "Process" to analyze the images.

7. View results in the table and download them as CSV if desired.

## File Structure

/style.css - Application styles and interface design
/index.html - HTML markup for the user interface
/app.js - JavaScript logic for events, API calls, and processing
/comparacion_apis_image_tagging.csv - Supporting data for API comparison


## How It Works

- Images uploaded by the user are stored in memory.
- On clicking "Process," images are converted to base64 and sent to Google Vision API.
- The API responds with labels and descriptions filtered for relevance.
- Results are displayed dynamically in a detailed table.
- Users can export the processed data as a CSV file or clear the current session.

## Limitations and Considerations

- Maximum image size enforced at 5MB to ensure performance.
- An active internet connection is required to access the Google Vision API.
- API key must have Vision API enabled and available quota.
- If the API key is invalid or quota is exceeded, the app provides clear, visual error feedback.
- Analysis quality depends on the effectiveness of the Google Vision API.

## Future Enhancements

- Configurable analysis sensitivity and detection levels.
- Support for large volume batch processing with upload queuing.
- Integration with other AI or image recognition APIs for enriched outputs.
- User authentication and cloud storage for multi-user support.
- Improved customization and accessibility options.

## Contribution

Contributions are welcome! Feel free to fork this repo, improve it, and submit pull requests with your enhancements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Thank you for exploring and contributing to intelligent image processing technologies!
