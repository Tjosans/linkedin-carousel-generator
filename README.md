# LinkedIn Carousel Generator

An AI-powered web application that helps LinkedIn creators generate professional, engaging carousel posts in seconds.

## Features

- **Manual Creation Mode**: Full control over every aspect of your carousel
- **AI-Powered Mode**: Describe your topic and let AI generate compelling content
- **Professional Design**: Clean, modern interface with customizable brand colors
- **Instant PDF Export**: Download ready-to-post LinkedIn carousels (1080x1080px)
- **Smart Content Generation**: AI creates engaging tips, descriptions, and CTAs optimized for LinkedIn

## How It Works

### Manual Mode
1. Enter your carousel topic
2. Add your tips and detailed content
3. Customize colors and call-to-action
4. Generate and download your professional PDF carousel

### AI Mode
1. Describe your carousel idea in plain English
2. Choose number of tips and tone
3. Let AI generate optimized content for you
4. Review, download, and post to LinkedIn

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **PDF Generation**: jsPDF library
- **AI Integration**: Google Gemini 3 Flash API
- **Hosting**: Vercel (serverless functions)

## Local Development

1. Clone this repository
2. Open `linkedin-carousel-generator-ai.html` in your browser for the frontend
3. For AI functionality, you'll need to deploy the backend to Vercel (see Deployment Guide)

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete step-by-step instructions.

Quick version:
1. Get a free Google Gemini API key from https://aistudio.google.com/apikey
2. Push this repository to GitHub
3. Deploy to Vercel and add `GEMINI_API_KEY` as an environment variable

## Costs

- **Free Tier**: 1,500 AI generations per day at no cost
- **Vercel Hosting**: Free for personal projects
- **Scaling**: ~$0.001 per AI generation after free tier

## License

MIT License - feel free to use this for your own projects!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Support

If you encounter any issues, please open an issue in this repository.
